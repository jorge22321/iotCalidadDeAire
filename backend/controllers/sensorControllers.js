import { queryClient } from '../database/influxdb.js'

/* ============================================================
   CONTROLADORES DE DATOS DE SENSORES (CO2 - Humedad - Presión - Temperatura)
   ============================================================ */

/**
 * ================================
 * FUNCIÓN AUXILIAR: MANEJO DE ERRORES
 * ================================
 * Propósito: Centralizar el manejo de errores en todas las consultas
 */
const handleError = (res, error, context) => {
  console.error(`Error fetching ${context} data:`, error)
  res.status(500).json({
    success: false,
    error: error.message,
  })
}

/**
 * ================================
 * FUNCIÓN AUXILIAR: FORMATEO DE DATOS
 * ================================
 * Propósito: Formatear datos de InfluxDB para gráficos
 */
const formatChartData = (data, timeFormatOptions = null, limit = null) => {
  const limitedData = limit ? data.slice(-limit) : data

  return {
    labels: limitedData.map((item) =>
      new Date(item._time).toLocaleTimeString(
        'es-ES',
        timeFormatOptions || {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
    ),
    values: limitedData.map((item) => item._value),
  }
}

/**
 * ================================
 * CONTROLADOR: DATOS DE CO2
 * ================================
 */
export const getCO2Data = async (req, res) => {
  try {
    const query = `from(bucket: "iot")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "sensores" and r._field == "co2")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 10)`

    const result = await queryClient.collectRows(query)
    const sortedData = [...result].sort((a, b) => new Date(a._time) - new Date(b._time))

    const chartData = formatChartData(sortedData, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    res.json({
      success: true,
      data: {
        ...chartData,
        showAlert: sortedData.some((item) => item._value > 800),
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    handleError(res, error, 'CO2')
  }
}

/**
 * ================================
 * CONTROLADOR: DATOS DE HUMEDAD
 * ================================
 */
export const getHumidityData = async (req, res) => {
  try {
    const query = `from(bucket: "iot")
      |> range(start: -24h)
      |> filter(fn: (r) => r._measurement == "sensores" and r._field == "humedad")
      |> sort(columns: ["_time"], desc: false)`

    const result = await queryClient.collectRows(query)
    res.json({
      success: true,
      data: formatChartData(result, null, 8),
    })
  } catch (error) {
    handleError(res, error, 'humidity')
  }
}

/**
 * ================================
 * CONTROLADOR: DATOS DE PRESIÓN
 * ================================
 */
export const getPressureData = async (req, res) => {
  try {
    const query = `from(bucket: "iot")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "sensores" and r._field == "presion")
      |> sort(columns: ["_time"], desc: false)`

    const result = await queryClient.collectRows(query)
    res.json({
      success: true,
      data: formatChartData(result, null, 10),
    })
  } catch (error) {
    handleError(res, error, 'pressure')
  }
}

/**
 * ================================
 * CONTROLADOR: DATOS DE TEMPERATURA
 * ================================
 */
export const getTemperatureData = async (req, res) => {
  try {
    const query = `from(bucket: "iot")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "sensores" and r._field == "temperatura")
      |> last()`

    const result = await queryClient.collectRows(query)
    const latestData = result[0] || { _value: 0, ubicacion: 'sensor1' }

    res.json({
      success: true,
      data: {
        currentTemp: latestData._value,
        location: latestData.ubicacion,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    handleError(res, error, 'temperature')
  }
}
