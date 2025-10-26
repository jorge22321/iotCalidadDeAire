// backend/controllers/userController.js
import pool from '../database/mysql.js'
import bcrypt from 'bcrypt'
import { sendWelcomeEmail } from '../services/notificationService.js'
import jwt from 'jsonwebtoken'

/* ============================================================
   1. CREAR UN NUEVO USUARIO
============================================================ */
/**
 * Crea un usuario, le asigna una contraseña temporal y envía un
 * correo con un enlace seguro para que establezca su contraseña definitiva.
 */
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      first_name,
      last_name,
      phone_number,
      country,
      province,
      district,
      age,
      dni,
      password, // Esta es la contraseña temporal
      role_id,
      send_notification,
    } = req.body

    // --- 1. Validación de campos obligatorios ---
    if (!username || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: username, email, password, role_id',
      })
    }

    // --- 2. Validar duplicados (username o email) ---
    const [exists] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email],
    )
    if (exists.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El nombre de usuario o correo ya existe.',
      })
    }

    // --- 3. Encriptar la contraseña temporal ---
    const hashedPassword = await bcrypt.hash(password, 10)

    // --- 4. Insertar en la base de datos ---
    const [result] = await pool.query(
      `INSERT INTO users (
         username, email, password, first_name, last_name,
         phone_number, country, province, district, age, dni, role_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        hashedPassword,
        first_name || null,
        last_name || null,
        phone_number || null,
        country || null,
        province || null,
        district || null,
        age || null,
        dni || null,
        role_id,
      ],
    )

    const newUserId = result.insertId

    // --- 5. Enviar correo de notificación usando el servicio centralizado ---
    if (send_notification) {
      // Generar un token JWT seguro que expira en 24 horas
      const passwordSetupToken = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      })

      // Construir la URL del frontend (todo se sirve desde el puerto 3000)
      const setupUrl = `http://localhost:3000/set-initial-password?token=${passwordSetupToken}`

      // Llamar al servicio centralizado para enviar el correo
      await sendWelcomeEmail(
        { email, first_name, username }, // Datos del usuario
        password, // Contraseña temporal
        setupUrl, // Enlace de configuración
      )
    }

    // --- 6. Respuesta final ---
    res.status(201).json({
      success: true,
      message: 'Usuario creado con éxito. Se ha enviado un correo para configurar la contraseña.',
      user_id: newUserId,
    })
  } catch (error) {
    console.error('❌ Error en createUser:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor.' })
  }
}

/* ============================================================
   2. ESTABLECER CONTRASEÑA INICIAL (vía enlace de correo)
============================================================ */
/**
 * Verifica el token del correo, valida la contraseña temporal
 * y actualiza la contraseña del usuario a una definitiva.
 */
export const setInitialPassword = async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body

    if (!token || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' })
    }

    // --- Verificar el token JWT ---
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: 'El enlace es inválido o ha expirado.' })
    }

    const userId = decoded.id

    // --- Obtener usuario y contraseña actual de la BD ---
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId])
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' })
    }
    const user = users[0]

    // --- Verificar que la contraseña temporal sea correcta ---
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'La contraseña temporal es incorrecta.' })
    }

    // --- Hashear y guardar la nueva contraseña definitiva ---
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId])

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.',
    })
  } catch (error) {
    console.error('❌ Error en setInitialPassword:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor.' })
  }
}

/* ============================================================
   3. OBTENER TODOS LOS USUARIOS (para tablas, etc.)
============================================================ */
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.status,
              r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id`,
    )
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    console.error('❌ Error en getAllUsers:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor.' })
  }
}

/* ============================================================
   FUNCIÓN DE UTILIDAD: OBTENER ADMINS PARA NOTIFICACIONES
============================================================ */
/**
 * Obtiene los datos de los usuarios administradores activos
 * para ser usados por otros servicios de notificación (ej: alertas de CO2).
 * @returns {Promise<Array>} Lista de usuarios administradores.
 */
export const getAdminUsersForNotification = async () => {
  try {
    // Asume que el rol de admin tiene role_id = 1
    const [admins] = await pool.query(
      `SELECT email, first_name, username 
       FROM users 
       WHERE role_id = 1 AND status = 'active'`,
    )
    return admins
  } catch (error) {
    console.error('❌ Error al obtener usuarios admin para notificaciones:', error)
    return [] // Devolver vacío para no interrumpir el flujo de alertas
  }
}

/* ============================================================
   FUNCIÓN DE UTILIDAD: OBTENER TODOS LOS USUARIOS PARA NOTIFICACIONES
============================================================ */
/**
 * Obtiene los datos de todos los usuarios registrados
 * para ser usados en servicios de notificación masiva.
 * @returns {Promise<Array>} Lista de todos los usuarios.
 */
export const getAllActiveUsersForNotification = async () => {
  try {
    const [users] = await pool.query(
      `SELECT email, first_name, username 
       FROM users`,
    )
    return users
  } catch (error) {
    console.error('❌ Error al obtener todos los usuarios para notificación:', error)
    return []
  }
}
