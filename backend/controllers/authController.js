// backend/controllers/authController.js
import bcrypt from 'bcrypt'
import pool from '../database/mysql.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { broadcast } from '../services/websocket.js'

/* ============================================================
   CONTROLADOR DE AUTENTICACIÓN (Login - Logout - Middleware)
   ============================================================ */

/**
 * ================================
 * LOGIN DE USUARIO
 * ================================
 */
export const login = async (req, res) => {
  const { username, password } = req.body

  // Validación básica
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Usuario y contraseña son requeridos',
    })
  }

  let connection
  try {
    connection = await pool.getConnection()

    // 1. Buscar usuario
    const [rows] = await connection.execute(
      `SELECT id, username, email, password, first_name, last_name, role_id, is_active
       FROM users WHERE username = ?`,
      [username],
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    const user = rows[0]

    // 2. Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    // 3. Crear sesión
    const sessionId = crypto.randomUUID()
    const token = generateJWTToken(user, sessionId)
    await createSession(connection, user.id, sessionId, req)

    // 4. Preparar respuesta (sin contraseña)
    const { password: _, ...userData } = user

    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        ...userData,
        role: user.role_id === 1 ? 'admin' : 'user',
      },
      token,
    })
  } catch (error) {
    console.error('Error en el login:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    })
  } finally {
    if (connection) connection.release()
  }
}

/**
 * ================================
 * LOGOUT DE USUARIO
 * ================================
 */
export const logout = async (req, res) => {
  let connection
  try {
    const token = extractTokenFromHeader(req)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      })
    }

    // Decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretodefault')

    // Eliminar sesión de la BD
    connection = await pool.getConnection()
    await connection.execute('DELETE FROM sessions WHERE user_id = ? AND token = ?', [
      decoded.id,
      decoded.sessionId,
    ])

    res.json({
      success: true,
      message: 'Logout exitoso',
    })
  } catch (error) {
    console.error('Error en el logout:', error)

    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    })
  } finally {
    if (connection) connection.release()
  }
}

/**
 * ================================
 * MIDDLEWARE: VERIFICAR SESIÓN
 * ================================

 */
export const verifySession = async (req, res, next) => {
  try {
    // Validar token
    const token = extractAndValidateToken(req)
    if (!token.valid) {
      return res.status(401).json(token.error)
    }

    // Decodificar token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'secretodefault')

    // Verificar en BD
    const sessionValid = await verifyDatabaseSession(decoded.id, decoded.sessionId)
    if (!sessionValid) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada',
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error('Error al verificar sesión:', error)

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido: ' + error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error al verificar sesión',
    })
  }
}

/* ============================================================
   FUNCIONES AUXILIARES PRIVADAS
   ============================================================ */

/**
 * Genera un JWT para el usuario
 */
function generateJWTToken(user, sessionId) {
  return jwt.sign(
    { id: user.id, username: user.username, sessionId },
    process.env.JWT_SECRET || 'secretodefault',
    { expiresIn: '1h' },
  )
}

/**
 * Crea una sesión en la base de datos
 */
async function createSession(connection, userId, sessionId, req) {
  await connection.execute(
    `INSERT INTO sessions (user_id, token, expires_at, device_info)
     VALUES (?, ?, ?, ?)`,
    [
      userId,
      sessionId,
      new Date(Date.now() + 60 * 60 * 1000), // Expira en 1h
      JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] }),
    ],
  )
}

/**
 * Extrae y valida token del header
 */
function extractAndValidateToken(req) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return { valid: false, error: { success: false, message: 'Token no proporcionado' } }
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { valid: false, error: { success: false, message: 'Formato inválido (Bearer [token])' } }
  }

  const token = parts[1]
  if (!token || token.split('.').length !== 3) {
    return { valid: false, error: { success: false, message: 'Token JWT mal formado' } }
  }

  return { valid: true, value: token }
}

/**
 * Verifica en BD si la sesión está activa
 */
async function verifyDatabaseSession(userId, sessionId) {
  const connection = await pool.getConnection()
  const [sessions] = await connection.execute(
    `SELECT * FROM sessions WHERE user_id = ? AND token = ? AND expires_at > NOW()`,
    [userId, sessionId],
  )
  connection.release()
  return sessions.length > 0
}

/**
 * Extrae token (sin validaciones)
 */
function extractTokenFromHeader(req) {
  const authHeader = req.headers['authorization']
  return authHeader ? authHeader.split(' ')[1] : null
}
