// backend/routes/router.js
import express from 'express'
import {
  getCO2Data,
  getHumidityData,
  getTemperatureData,
  getPressureData,
} from '../controllers/sensorControllers.js'
import { registrarUsuario } from '../controllers/registroController.js'
import { getUsers, deleteUser, updateUser } from '../controllers/userTableController.js'
import { login, logout, verifySession } from '../controllers/authController.js'
import {
  controlVentilador,
  getFanStatus,
  controlModo,
  updateThresholds,
} from '../controllers/iotController.js'

import { createUser, setInitialPassword } from '../controllers/userController.js'
import { getRoles } from '../controllers/roleController.js'
import { runQuery } from '../controllers/queryController.js'

const router = express.Router()

// Auth
router.post('/login', login)
router.post('/logout', verifySession, logout)

// Sensores
router.get('/co2', getCO2Data)
router.get('/humidity', getHumidityData)
router.get('/temperature', getTemperatureData)
router.get('/pressure', getPressureData)

// IoT Control
router.post('/control-ventilador', controlVentilador)
router.get('/status', getFanStatus)
router.post('/mode', controlModo)
router.post('/umbrales', updateThresholds)

// Users
router.get('/users', verifySession, getUsers)
router.post('/users', createUser)
router.post('/users/set-initial-password', setInitialPassword)
router.get('/roles', getRoles)
router.delete('/users/:id', verifySession, deleteUser)
router.put('/users/:id', verifySession, updateUser)

router.post('/queries', runQuery)
router.post('/registro', registrarUsuario)

export default router
