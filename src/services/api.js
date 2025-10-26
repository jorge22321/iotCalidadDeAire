// src/services/api.js
// Centraliza la construcción de URLs para API REST y WebSocket

export function getApiUrl() {
  const host = import.meta.env.VITE_API_HOST || window.location.hostname
  const port = import.meta.env.VITE_API_PORT || '3000'
  const protocol =
    import.meta.env.VITE_API_PROTOCOL || (window.location.protocol === 'https:' ? 'https' : 'http')
  return `${protocol}://${host}:${port}/api`
}

export function getWsUrl() {
  const host = import.meta.env.VITE_API_HOST || window.location.hostname
  const port = import.meta.env.VITE_API_PORT || '3000'
  const protocol =
    import.meta.env.VITE_WS_PROTOCOL || (window.location.protocol === 'https:' ? 'wss' : 'ws')
  return `${protocol}://${host}:${port}`
}

export default { getApiUrl, getWsUrl }
