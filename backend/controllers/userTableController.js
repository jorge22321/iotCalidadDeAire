// backend/controllers/userTableController.js

import pool from '../database/mysql.js'

/* ============================================================
   CONTROLADORES DE GESTIÓN DE USUARIOS (Obtener - Actualizar - Eliminar)
   ============================================================ */

/**
 * ================================
 * OBTENER LISTA DE USUARIOS
 * ================================
 * Propósito: Recuperar lista completa de usuarios con información detallada
 * Incluye: datos básicos, rol, estado de sesión y conteo de dispositivos
 */
export const getUsers = async (req, res) => {
  let connection
  try {
    connection = await pool.getConnection()

    const [users] = await connection.execute(
      `SELECT
        u.id,
        u.username,
        u.email,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name,
        r.name AS role,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM sessions s
            WHERE s.user_id = u.id AND s.expires_at > NOW()
          ) THEN 'active'
          ELSE 'inactive'
        END AS status,
        (SELECT COUNT(DISTINCT s.device_info) 
         FROM sessions s 
         WHERE s.user_id = u.id AND s.expires_at > NOW()
        ) AS devices_count
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.username ASC`,
    )

    res.json({
      success: true,
      items: formatUsersResponse(users),
      total: users.length,
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
    })
  } finally {
    if (connection) connection.release()
  }
}

/**
 * ================================
 * ELIMINAR USUARIO
 * ================================
 * Propósito: Eliminar usuario del sistema de forma segura
 * Incluye: Eliminación de sesiones activas antes de remover al usuario
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params
  let connection

  try {
    connection = await pool.getConnection()

    const [user] = await connection.execute('SELECT id FROM users WHERE id = ?', [id])
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    await connection.execute('DELETE FROM sessions WHERE user_id = ?', [id])
    await connection.execute('DELETE FROM users WHERE id = ?', [id])

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
    })
  } finally {
    if (connection) connection.release()
  }
}

/**
 * ================================
 * ACTUALIZAR USUARIO
 * ================================
 * Propósito: Modificar información de usuario existente
 * Principalmente: Actualización de roles y permisos del usuario
 */
export const updateUser = async (req, res) => {
  const { id } = req.params
  const { role } = req.body
  let connection

  try {
    connection = await pool.getConnection()

    const [user] = await connection.execute('SELECT id FROM users WHERE id = ?', [id])
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    const roleId = getRoleId(role)
    await connection.execute(`UPDATE users SET role_id = ? WHERE id = ?`, [roleId, id])

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
    })
  } finally {
    if (connection) connection.release()
  }
}

/* ============================================================
   FUNCIONES AUXILIARES PRIVADAS
   ============================================================ */

/**
 * Formatea la respuesta de usuarios para el frontend
 */
function formatUsersResponse(users) {
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    devices: Array(user.devices_count).fill({}),
  }))
}

/**
 * Obtiene el ID de rol basado en el nombre del rol
 */
function getRoleId(role) {
  switch (role) {
    case 'admin':
      return 1
    case 'user':
      return 2
    case 'guest':
      return 3
    default:
      return 2
  }
}
