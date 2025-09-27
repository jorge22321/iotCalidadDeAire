// backend/database/mysql.js
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test de conexión
pool
  .getConnection()
  .then((connection) => {
    console.log('✅ Conexión a MySQL establecida correctamente.')
    connection.release()
  })
  .catch((err) => {
    console.error('❌ Error al conectar con MySQL:', err.stack)
    process.exit(1)
  })

export default pool
