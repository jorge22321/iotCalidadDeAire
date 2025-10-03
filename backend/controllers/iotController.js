// backend/controllers/iotController.js
import { mqttService } from '../services/mqtt.js'
import { broadcast, updateButtonStatus } from '../services/websocket.js'

/* ============================================================
   CONTROLADOR IoT: Maneja ventilador, modo y umbrales
   ============================================================ */

/* ============================================================
   CONTROL DE VENTILADOR
   ============================================================ */

/**
 * Enciende o apaga el ventilador
 * @body {boolean} ventilador - true = encendido, false = apagado
 */
export const controlVentilador = (req, res) => {
  try {
    const { ventilador } = req.body

    if (typeof ventilador !== 'boolean') {
      return res.status(400).json({ error: 'Parámetro inválido: ventilador debe ser true/false' })
    }

    mqttService.controlVentilador(ventilador, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar comando al ventilador' })
      }

      // 🔹 Actualizar estado de los botones mediante WebSocket
      updateButtonStatus({
        onStatus: ventilador,
        offStatus: !ventilador,
      })

      // 🔹 Avisar a todos los clientes sobre el ventilador
      broadcast('fanStatus', { status: ventilador })

      res.status(200).json({
        message: 'Comando enviado correctamente',
        ventilador,
      })
    })
  } catch (error) {
    console.error('❌ Error en controlVentilador:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * Devuelve el estado actual del ventilador
 */
export const getFanStatus = (req, res) => {
  res.json({ status: mqttService.getFanStatus() })
}

/* ============================================================
   CONTROL DE MODO
   ============================================================ */

/**
 * Cambia el modo de funcionamiento
 * @body {string} modo - "automatico" o "manual"
 */
export const controlModo = (req, res) => {
  try {
    const { modo } = req.body

    if (modo !== 'manual' && modo !== 'automatico') {
      return res.status(400).json({ error: 'Modo inválido. Use "automatico" o "manual"' })
    }

    mqttService.controlModo(modo, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar modo' })
      }

      // Avisar a todos los clientes
      broadcast('mode', { mode: modo })

      res.status(200).json({
        message: 'Modo actualizado correctamente',
        modo,
      })
    })
  } catch (error) {
    console.error('❌ Error en controlModo:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/* ============================================================
   CONTROL DE UMBRALES
   ============================================================ */

/**
 * Actualiza los umbrales de CO₂ y temperatura
 * @body {number} co2
 * @body {number} temperatura
 */
export const updateThresholds = (req, res) => {
  try {
    const { co2, temperatura } = req.body

    if (typeof co2 !== 'number' || typeof temperatura !== 'number') {
      return res
        .status(400)
        .json({ error: 'Parámetros inválidos: co2 y temperatura deben ser numéricos' })
    }

    mqttService.updateThresholds(co2, temperatura, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar umbrales' })
      }

      // Avisar a todos los clientes
      broadcast('thresholds', { co2, temperatura })

      res.status(200).json({
        message: 'Umbrales actualizados correctamente',
        co2,
        temperatura,
      })
    })
  } catch (error) {
    console.error('❌ Error en updateThresholds:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
