import { queryClient } from '../database/influxdb.js'

// Determina ventana dinámica según rango de fechas
function getWindowInterval(start, end) {
  if (!start || !end) return '1m'

  const diffMs = new Date(end) - new Date(start)
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours <= 6) return '30s' // hasta 6 horas → cada 30s
  if (diffHours <= 24) return '1m' // hasta 1 día → cada 1m
  if (diffHours <= 24 * 7) return '15m' // hasta 1 semana → cada 15m
  if (diffHours <= 24 * 30) return '1h' // hasta 1 mes → cada 1h
  return '1d' // más de 1 mes → por día
}

export const runQuery = async (req, res) => {
  try {
    const { metric, start, end } = req.body

    if (!metric) {
      return res.status(400).json({ success: false, error: 'Debe indicar métrica' })
    }

    // Intervalo dinámico
    const window = getWindowInterval(start, end)

    // Construcción del rango temporal
    const timeRange = `|> range(start: ${start ? start : '-24h'}, stop: ${end ? end : 'now()'})`

    // Query principal → siempre devolvemos datos para gráfico
    const query = `from(bucket: "iot")
      ${timeRange}
      |> filter(fn: (r) => r._measurement == "sensores" and r._field == "${metric}")
      |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
      |> yield(name: "mean")`

    const result = await queryClient.collectRows(query)

    res.json({
      success: true,
      query,
      data: result,
      windowApplied: window,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
