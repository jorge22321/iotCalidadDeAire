//src/services/websocket.js

/* ============================================================
   CLIENTE WEBSOCKET (Frontend - Comunicación en tiempo real)
   ============================================================ */

let socket = null
let reconnectTimeout = null
const listeners = {}

/**
 * ================================
 * CONECTAR AL WEBSOCKET DEL BACKEND
 * ================================
 * Propósito: Establecer conexión persistente con servidor WebSocket
 * Funcionalidad: Maneja conexión, reconexión automática y eventos
 */
export function connectWebSocket(url) {
  // Evitar crear múltiples conexiones si ya existe una en OPEN or CONNECTING or CLOSING
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    console.warn('⚠️ Ya existe una conexión WebSocket (OPEN/CONNECTING), reusando')
    return
  }

  console.log(`🔌 Conectando a WebSocket: ${url}`)
  socket = new WebSocket(url)

  // Evento: Conexión establecida
  socket.onopen = () => {
    console.log('🟢 Conexión WebSocket establecida')
    clearTimeout(reconnectTimeout)
  }

  // Evento: Mensaje recibido del servidor
  socket.onmessage = (event) => {
    handleIncomingMessage(event)
  }

  // Evento: Conexión cerrada (reconexión automática)
  socket.onclose = () => {
    console.warn('🔴 Conexión WebSocket cerrada, intentando reconectar...')
    scheduleReconnect(url)
  }

  // Evento: Error en la conexión
  socket.onerror = (err) => {
    console.error('❌ Error en WebSocket:', err)
    socket.close()
  }
}

/**
 * ================================
 * ENVIAR MENSAJE AL SERVIDOR
 * ================================
 * Propósito: Enviar datos al backend a través de WebSocket
 * Validación: Verifica que la conexión esté activa antes de enviar
 */
export function sendWSMessage(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }))
  } else {
    console.warn('⚠️ No se puede enviar, WebSocket no está conectado')
  }
}

/**
 * ================================
 * REGISTRAR LISTENER PARA MENSAJES
 * ================================
 * Propósito: Permitir que componentes escuchen tipos específicos de mensajes
 * Mecanismo: Callbacks organizados por tipo de mensaje
 */
export function onWSMessage(type, callback) {
  if (!listeners[type]) {
    listeners[type] = []
  }
  listeners[type].push(callback)
}

// Permite eliminar un listener registrado previamente
export function offWSMessage(type, callback) {
  if (!listeners[type]) return
  listeners[type] = listeners[type].filter((cb) => cb !== callback)
}

/**
 * ================================
 * CERRAR CONEXIÓN MANUALMENTE
 * ================================
 * Propósito: Finalizar conexión WebSocket de forma controlada
 * Uso: Al cerrar la aplicación o cambiar de página
 */
export function closeWebSocket() {
  if (socket) {
    console.log('🔌 Cerrando conexión WebSocket manualmente')
    try {
      socket.close()
    } catch (e) {
      console.warn('Error cerrando socket:', e)
    }
    socket = null
    clearTimeout(reconnectTimeout)
  }
}

/* ============================================================
   FUNCIONES AUXILIARES PRIVADAS
   ============================================================ */

/**
 * Programa reconexión automática con delay exponencial
 */
function scheduleReconnect(url) {
  clearTimeout(reconnectTimeout)
  reconnectTimeout = setTimeout(() => connectWebSocket(url), 3000)
}

/**
 * Procesa mensajes entrantes y distribuye a los listeners
 */
function handleIncomingMessage(event) {
  try {
    const data = JSON.parse(event.data)
    console.log('📩 Mensaje WS recibido:', data)

    // Notificar a todos los listeners registrados para este tipo
    if (data.type && listeners[data.type]) {
      listeners[data.type].forEach((callback) => callback(data))
    }
  } catch (err) {
    console.error('❌ Error procesando mensaje WS:', err)
  }
}
