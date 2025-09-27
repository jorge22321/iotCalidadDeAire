//backend/database/influxdb.jd
import { InfluxDB } from '@influxdata/influxdb-client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'
// Configuración inicial
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const config = {
  url: process.env.INFLUX_URL || 'http://localhost:8086',
  token: process.env.INFLUX_TOKEN || '',
  org: process.env.INFLUX_ORG || 'iot',
  bucket: process.env.INFLUX_BUCKET || 'iot',
}

// Cliente InfluxDB
const influxDB = new InfluxDB({ url: config.url, token: config.token })
const writeClient = influxDB.getWriteApi(config.org, config.bucket, 'ns')
const queryClient = influxDB.getQueryApi(config.org)

// Test de conexión
async function testConnection() {
  const query = `from(bucket: "${config.bucket}")
    |> range(start: -1m)
    |> filter(fn: (r) => r._measurement == "sensores")
    |> limit(n: 1)`

  try {
    await new Promise((resolve, reject) => {
      queryClient.queryRows(query, {
        next: () => resolve(),
        error: (error) => (error.message.includes('not found') ? resolve() : reject(error)),
        complete: () => resolve(),
      })
    })
    console.log('✅ Conexión a InfluxDB establecida')
  } catch (error) {
    console.error('❌ Error al conectar con InfluxDB:', error.message)
    process.exit(1)
  }
}

testConnection()

export { influxDB, writeClient, queryClient }
