import WebSocket, { WebSocketServer } from 'ws'
import { mqttService } from './mqtt.js'

let wssInstance = null

// --- Estado compartido (como fanStatus, fanMode, etc.) ---
let lastButtonStatus = {
  onStatus: false,
  offStatus: true,
}

// --- Lista de suscriptores (si algún servicio quiere escuchar cambios)
const eventListeners = {
  buttonStatus: [],
}

function notifyListeners(type, value) {
  if (eventListeners[type]) {
    eventListeners[type].forEach((cb) => cb(value))
  }
}

/**
 * ================================
 * INICIALIZAR SERVIDOR WEBSOCKET
 * ================================
 */
export function initWebSocket(server) {
  wssInstance = new WebSocketServer({ server, path: '' })

  console.log('📡 Servidor WebSocket inicializado en /ws')

  wssInstance.on('connection', (ws) => {
    console.log('🔌 Cliente WebSocket conectado')

    // Enviar estado inicial al cliente nuevo
    sendInitialState(ws)

    ws.on('message', (message) => {
      handleWebSocketMessage(ws, message)
    })

    ws.on('close', () => {
      console.log('❌ Cliente WebSocket desconectado')
    })
  })
}

/**
 * ================================
 * ESTADOS INICIALES
 * ================================
 */
export function sendInitialState(ws) {
  try {
    ws.send(JSON.stringify({ type: 'mode', mode: mqttService.getFanMode() }))
    ws.send(JSON.stringify({ type: 'thresholds', ...mqttService.getThresholds() }))
    ws.send(JSON.stringify({ type: 'fanStatus', status: mqttService.getFanStatus() }))
    ws.send(JSON.stringify({ type: 'buttonStatus', ...lastButtonStatus }))
  } catch (err) {
    console.error('❌ Error enviando estado inicial:', err)
  }
}

/**
 * ================================
 * BROADCAST GLOBAL
 * ================================
 */
export function broadcast(type, payload) {
  if (!wssInstance) return

  const message = JSON.stringify({ type, ...payload })

  wssInstance.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

/**
 * ================================
 * ESTADO DE BOTONES (API pública)
 * ================================
 */
export function updateButtonStatus(status) {
  lastButtonStatus = status
  broadcast('buttonStatus', lastButtonStatus)
  notifyListeners('buttonStatus', lastButtonStatus)
}

export function getButtonStatus() {
  return lastButtonStatus
}

export function onButtonStatusChange(callback) {
  eventListeners.buttonStatus.push(callback)
}

/**
 * ================================
 * MANEJO DE MENSAJES CLIENTE
 * ================================
 */
function handleWebSocketMessage(ws, message) {
  try {
    const data = JSON.parse(message)

    if (data.type === 'buttonStatus') {
      console.log('📩 Estado de botones recibido:', data)
      updateButtonStatus({
        onStatus: data.onStatus,
        offStatus: data.offStatus,
      })
    } else {
      console.log('📩 Mensaje recibido (sin acción):', data)
    }
  } catch (err) {
    console.error('❌ Error procesando mensaje WS:', err)
  }
}
