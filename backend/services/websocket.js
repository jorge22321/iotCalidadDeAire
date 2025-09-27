// backend/services/websocket.js
import WebSocket, { WebSocketServer } from 'ws'
import { mqttService } from './mqtt.js'

/* ============================================================
   SERVICIO WEBSOCKET (Único gestor de comunicación en tiempo real)
   ============================================================ */

let wssInstance = null

let lastButtonStatus = {
  onStatus: false,
  offStatus: true,
}
/**
 * ================================
 * INICIALIZAR SERVIDOR WEBSOCKET
 * ================================
 * - Se monta sobre el servidor HTTP existente
 * - Maneja conexiones, mensajes y desconexiones
 */
export function initWebSocket(server) {
  wssInstance = new WebSocketServer({ server, path: '' })

  console.log('📡 Servidor WebSocket inicializado en /ws')

  wssInstance.on('connection', (ws) => {
    console.log('🔌 Cliente WebSocket conectado')

    // Enviar estado inicial al cliente nuevo
    sendInitialState(ws)

    // 📩 Manejo de mensajes entrantes
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
 * ENVIAR ESTADO INICIAL
 * ================================
 * - Proporciona el estado actual al cliente recién conectado
 * - Incluye: modo, umbrales y estado del ventilador
 */
export function sendInitialState(ws) {
  try {
    ws.send(
      JSON.stringify({
        type: 'mode',
        mode: mqttService.getFanMode(),
      }),
    )

    ws.send(
      JSON.stringify({
        type: 'thresholds',
        ...mqttService.getThresholds(),
      }),
    )

    ws.send(
      JSON.stringify({
        type: 'fanStatus',
        status: mqttService.getFanStatus(),
      }),
    )
    ws.send(
      JSON.stringify({
        type: 'buttonStatus',
        ...lastButtonStatus,
      }),
    )
  } catch (err) {
    console.error('❌ Error enviando estado inicial:', err)
  }
}

/**
 * ================================
 * BROADCAST (a todos los clientes)
 * ================================
 * - Para transmitir información en tiempo real
 * - Ej: sensores, cambios de modo, estado de ventilador
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

/* ============================================================
   FUNCIONES AUXILIARES PRIVADAS
   ============================================================ */

/**
 * Maneja mensajes entrantes desde clientes WebSocket
 * - Caso actual: "buttonStatus" (para sincronizar botones)
 * - El resto se maneja vía API REST
 */
function handleWebSocketMessage(ws, message) {
  try {
    const data = JSON.parse(message)

    if (data.type === 'buttonStatus') {
      console.log('📩 Estado de botones recibido:', data)

      lastButtonStatus = {
        onStatus: data.onStatus,
        offStatus: data.offStatus,
      }
      // Reenviar a TODOS los clientes conectados
      broadcast('buttonStatus', lastButtonStatus)
    } else {
      console.log('📩 Mensaje recibido (sin acción):', data)
    }
  } catch (err) {
    console.error('❌ Error procesando mensaje WS:', err)
  }
}
