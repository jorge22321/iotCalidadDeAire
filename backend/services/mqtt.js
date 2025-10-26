import mqtt from 'mqtt'
import { Point } from '@influxdata/influxdb-client'
import { writeClient } from '../database/influxdb.js'
import { broadcast } from './websocket.js'

// ✅ 1. Importa las nuevas funciones para las notificaciones
import { sendCO2AlertEmail } from './notificationService.js'
import { getAllActiveUsersForNotification } from '../controllers/userController.js'

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
// ✅ 2. Añade una variable de estado para controlar las alertas de CO2
let isCo2AlertActive = false

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
        handleSensorData(data) // Esta función ahora tiene la lógica de alerta
        break

      case 'iot/status':
        fanStatus = data.status
        notifyListeners('fanStatus', fanStatus)
        console.log(`🔄 Estado del ventilador: ${fanStatus ? 'ENCENDIDO' : 'APAGADO'}`)
        broadcast('fanStatus', { status: fanStatus })
        break

      case 'iot/modo':
        fanMode = data.modo
        notifyListeners('fanMode', fanMode)
        console.log(`🔄 Modo actualizado: ${fanMode}`)
        broadcast('mode', { mode: fanMode })
        break

      case 'iot/umbrales':
        thresholds = { ...thresholds, ...data }
        notifyListeners('thresholds', thresholds)
        console.log('🔄 Umbrales actualizados:', thresholds)
        broadcast('thresholds', thresholds)
        break
    }
  } catch (error) {
    console.error('❌ Error procesando mensaje MQTT:', error)
  }
})

// --- ✅ 3. MODIFICACIÓN: Guardar datos, emitir por WS y gestionar alertas ---
function handleSensorData(data) {
  const { temperatura, humedad, co2, presion } = data

  // --- Parte 1: Guardar en InfluxDB (sin cambios) ---
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

  // --- Parte 2: Emitir en tiempo real por WebSocket (sin cambios) ---
  broadcast('co2', { value: co2, time: new Date().toISOString() })
  broadcast('humidity', { value: humedad, time: new Date().toISOString() })
  broadcast('pressure', { value: presion, time: new Date().toISOString() })
  broadcast('temperature', { value: temperatura, time: new Date().toISOString() })

  // --- Parte 3: Lógica de Alerta Inteligente (nueva) ---
  // Condición 1: El nivel supera el umbral y la alerta NO estaba activa
  if (co2 > thresholds.co2 && !isCo2AlertActive) {
    isCo2AlertActive = true // Activa la bandera para no enviar más correos
    console.log(`🔴 ALERTA DE CO2 ACTIVADA | Valor: ${co2} PPM. Enviando notificaciones...`)

    // Llama al servicio para enviar correos a todos los usuarios
    notifyAllUsersAboutCO2(co2)
  }
  // Condición 2: El nivel vuelve a la normalidad y la alerta SÍ estaba activa
  else if (co2 <= thresholds.co2 && isCo2AlertActive) {
    isCo2AlertActive = false // Reinicia la bandera
    console.log(`🟢 Nivel de CO2 normalizado | Valor: ${co2} PPM.`)
    // Opcional: Podrías llamar a otra función para notificar que el nivel se ha normalizado.
  }
}

// ✅ 4. AÑADIDO: Nueva función auxiliar para manejar el envío de notificaciones
async function notifyAllUsersAboutCO2(co2Value) {
  try {
    const usersToNotify = await getAllActiveUsersForNotification()
    if (usersToNotify.length > 0) {
      console.log(`Enviando alerta de CO2 a ${usersToNotify.length} usuarios.`)
      // Enviamos el correo a cada uno de forma asíncrona
      for (const user of usersToNotify) {
        sendCO2AlertEmail(user, co2Value)
      }
    }
  } catch (error) {
    console.error('❌ Error en el proceso de notificación de CO2:', error)
  }
}

// --- Publicar mensajes a MQTT (sin cambios) ---
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

// --- API pública del servicio (sin cambios) ---
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

// --- Manejo de errores MQTT (sin cambios) ---
client.on('error', (err) => console.error('❌ Error MQTT:', err))
client.on('reconnect', () => console.log('🔄 Reintentando conexión MQTT...'))
