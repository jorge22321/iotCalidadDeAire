import { queryClient } from '../database/influxdb.js'

// Funciones de consulta predefinidas
const queries = {
  avgTemp: `from(bucket: "iot")
    |> range(start: -24h)
    |> filter(fn: (r) => r._measurement == "sensores" and r._field == "temperatura")
    |> mean()`,

  maxHumidity: `from(bucket: "iot")
    |> range(start: -7d)
    |> filter(fn: (r) => r._measurement == "sensores" and r._field == "humedad")
    |> max()`,

  maxCO2: `from(bucket: "iot")
    |> range(start: -7d)
    |> filter(fn: (r) => r._measurement == "sensores" and r._field == "co2")
    |> max()`,
}

// Controlador genérico
export const runQuery = async (req, res) => {
  try {
    const { type } = req.body
    if (!queries[type]) {
      return res.status(400).json({ success: false, error: 'Consulta no válida' })
    }

    const result = await queryClient.collectRows(queries[type])
    res.json({ success: true, type, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
