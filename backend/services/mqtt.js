// backend/services/mqtt.js
import mqtt from 'mqtt'
import { Point } from '@influxdata/influxdb-client'
import { writeClient } from '../database/influxdb.js'
import { broadcast } from './websocket.js' // ✅ usamos broadcast centralizado

// --- Configuración centralizada de MQTT ---
const mqttOptions = {
  clientId: `mqtt_${Math.random().toString(16).substr(2, 8)}`,
  clean: true,
}

const client = mqtt.connect('mqtt://broker.emqx.io:1883', mqttOptions)

// --- Estado compartido ---
let fanStatus = false
let fanMode = 'automatico'
let thresholds = {
  co2: 800,
  temperatura: 25,
}

// --- Event listeners para cambios de estado ---
const eventListeners = {
  fanStatus: [],
  fanMode: [],
  thresholds: [],
}

function notifyListeners(type, value) {
  eventListeners[type].forEach((callback) => callback(value))
}

// --- Conexión y suscripción a topics ---
client.on('connect', () => {
  console.log('✅ Conectado a MQTT')

  const topics = ['iot/sensores', 'iot/status', 'iot/modo', 'iot/umbrales']
  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (!err) console.log(`🔔 Suscrito a ${topic}`)
    })
  })
})

// --- Procesamiento de mensajes MQTT ---
client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString())

    switch (topic) {
      case 'iot/sensores':
        handleSensorData(data)
        break

      case 'iot/status':
        fanStatus = data.status
        notifyListeners('fanStatus', fanStatus)
        console.log(`🔄 Estado del ventilador: ${fanStatus ? 'ENCENDIDO' : 'APAGADO'}`)
        // 🔴 Enviar por WebSocket
        broadcast('fanStatus', { status: fanStatus })
        break

      case 'iot/modo':
        fanMode = data.modo
        notifyListeners('fanMode', fanMode)
        console.log(`🔄 Modo actualizado: ${fanMode}`)
        // 🔴 Enviar por WebSocket
        broadcast('mode', { mode: fanMode })
        break

      case 'iot/umbrales':
        thresholds = { ...thresholds, ...data }
        notifyListeners('thresholds', thresholds)
        console.log('🔄 Umbrales actualizados:', thresholds)
        // 🔴 Enviar por WebSocket
        broadcast('thresholds', thresholds)
        break
    }
  } catch (error) {
    console.error('❌ Error procesando mensaje MQTT:', error)
  }
})

// --- Guardar datos y emitir por WebSocket ---
function handleSensorData(data) {
  const { temperatura, humedad, co2, presion } = data

  // Guardar en InfluxDB
  const point = new Point('sensores')
    .tag('ubicacion', 'sensor1')
    .floatField('temperatura', temperatura)
    .floatField('humedad', humedad)
    .floatField('co2', co2)
    .floatField('presion', presion)
    .timestamp(new Date())

  writeClient.writePoint(point)
  writeClient.flush().catch(console.error)

  console.log('📩 Datos recibidos:', { temperatura, humedad, co2, presion })

  // Emitir en tiempo real por WebSocket
  broadcast('co2', { value: co2, time: new Date().toISOString() })
  broadcast('humidity', { value: humedad, time: new Date().toISOString() })
  broadcast('pressure', { value: presion, time: new Date().toISOString() })
  broadcast('temperature', { value: temperatura, time: new Date().toISOString() })
}

// --- Publicar mensajes a MQTT ---
function publishCommand(topic, data, callback = () => {}) {
  client.publish(topic, JSON.stringify(data), (err) => {
    if (err) {
      console.error(`❌ Error al publicar en ${topic}:`, err)
      callback(err)
      return
    }
    console.log(`📤 Mensaje publicado en ${topic}:`, data)
    callback(null, data)
  })
}

// --- API pública del servicio ---
export const mqttService = {
  // Estado actual
  getFanStatus: () => fanStatus,
  getFanMode: () => fanMode,
  getThresholds: () => thresholds,

  // Suscripción a cambios
  onFanStatusChange: (callback) => eventListeners.fanStatus.push(callback),
  onFanModeChange: (callback) => eventListeners.fanMode.push(callback),
  onThresholdsChange: (callback) => eventListeners.thresholds.push(callback),

  // Comandos
  controlVentilador: (status, callback) =>
    publishCommand('iot/control', { ventilador: status }, callback),

  controlModo: (modo, callback) => publishCommand('iot/modo', { modo }, callback),

  updateThresholds: (co2, temperatura, callback) =>
    publishCommand('iot/umbrales', { co2, temperatura }, callback),

  // Conexión
  isConnected: () => client.connected,
  endConnection: () => client.end(),
}

// --- Manejo de errores MQTT ---
client.on('error', (err) => console.error('❌ Error MQTT:', err))
