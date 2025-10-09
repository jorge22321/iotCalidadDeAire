import { queryClient } from '../database/influxdb.js'

export const runQuery = async (req, res) => {
  try {
    const { metric, start, end } = req.body

    if (!metric) {
      return res.status(400).json({ success: false, error: 'Debe indicar métrica' })
    }

    // Construcción del rango temporal
    const timeRange = `|> range(start: ${start ? start : '-24h'}, stop: ${end ? end : 'now()'})`

    // 🔹 Query sin agregación (valores exactos)
    const query = `from(bucket: "iot")
      ${timeRange}
      |> filter(fn: (r) => r._measurement == "sensores" and r._field == "${metric}")
      |> yield(name: "raw")`

    const result = await queryClient.collectRows(query)

    res.json({
      success: true,
      query,
      data: result,
      windowApplied: 'none',
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
