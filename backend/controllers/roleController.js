//backend/controllers/roleController.js

import pool from '../database/mysql.js'

// Listar roles
export const getRoles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM roles')
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener roles:', error)
    res.status(500).json({ message: 'Error al obtener roles' })
  }
}
