// backend/server.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'node:url'

// Importar bases de datos y servicios
import './database/mysql.js'
import './database/influxdb.js'

// MQTT (sigue funcionando igual)
import { mqttService } from './services/mqtt.js'

// Rutas API
import routes from './routes/router.js'

// WebSocket centralizado
import { initWebSocket } from './services/websocket.js'

// --- Configuración inicial ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// --- Rutas API ---
app.use('/api', routes)

// --- Servir frontend ---
const frontendDistPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(frontendDistPath))

// --- SPA Fallback ---
app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendDistPath, 'index.html'))
})

// --- Servidor HTTP ---
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`)
})

// --- Inicializar WebSocket centralizado ---
initWebSocket(server)
