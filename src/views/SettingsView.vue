<template>
  <div class="settings">
    <div class="setting-contenedor">
      <div class="form-container">
        <div class="form-grid">
          <div class="input-with-icon">
            <select v-model="form.metric" required>
              <option disabled value="">Métrica</option>
              <option value="temperatura">Temperatura</option>
              <option value="humedad">Humedad</option>
              <option value="co2">CO₂</option>
              <option value="presion">Presión</option>
            </select>
            <font-awesome-icon icon="chevron-down" class="input-icon icon-chevron" />
          </div>
          <div class="input-with-icon">
            <select v-model="form.operation" required>
              <option disabled value="">Operación</option>
              <option value="avg">Promedio</option>
              <option value="max">Máximo</option>
              <option value="min">Mínimo</option>
              <option value="last">Último valor</option>
            </select>
            <font-awesome-icon icon="chevron-down" class="input-icon icon-chevron" />
          </div>
          <div class="input-with-icon">
            <input
              type="datetime-local"
              v-model="form.start"
              placeholder="Fecha de inicio"
              ref="startDateInput"
            />
            <font-awesome-icon
              icon="calendar-days"
              class="input-icon"
              @click="openStartDatePicker"
            />
          </div>
          <div class="input-with-icon">
            <input
              type="datetime-local"
              v-model="form.end"
              placeholder="Fecha de fin"
              ref="endDateInput"
            />
            <font-awesome-icon icon="calendar-days" class="input-icon" @click="openEndDatePicker" />
          </div>
          <button class="btn" @click="runQuery">▶ Ejecutar Consulta</button>
        </div>
      </div>

      <div class="results-grid">
        <div class="visualization-container">
          <div class="chart">
            <LineChart
              v-if="chartData.labels.length > 0"
              :data="chartData"
              :options="chartOptions"
              :key="chartKey"
            />
            <div v-else class="chart-placeholder">
              <p>Esperando datos para mostrar el gráfico...</p>
            </div>
          </div>
        </div>

        <div class="results-right-stack">
          <div class="data-table-section">
            <div class="table-header">
              <h5>Datos</h5>
              <button
                v-if="result && result.data && result.data.length > 0"
                class="btn-export"
                @click="exportToCSV"
              >
                <span class="icon">📄</span> Exportar a CSV
              </button>
            </div>
            <div class="table-wrapper">
              <table v-if="result && result.data && result.data.length > 0">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Valor ({{ getUnitForMetric(form.metric) }})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedData" :key="item._time">
                    <td>{{ new Date(item._time).toLocaleString('es-ES') }}</td>
                    <td>{{ item._value.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="chart-placeholder table-placeholder">
                <p>Los datos de la consulta aparecerán aquí.</p>
              </div>
            </div>
            <div class="pagination-controls" v-if="totalPages > 1">
              <div class="pagination">
                <button v-if="currentPage > 1" class="btn-page" @click="prevPage">&laquo;</button>

                <span>Página {{ currentPage }} de {{ totalPages }}</span>

                <button v-if="currentPage < totalPages" class="btn-page" @click="nextPage">
                  &raquo;
                </button>
              </div>
            </div>
          </div>
          <div class="summary">
            <h3>
              <font-awesome-icon icon="info-circle" class="summary-icon" />
              Resultado:
            </h3>
            <p v-if="summary">{{ summary }}</p>
            <p v-else>Ejecute una consulta para ver los resultados.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

export default {
  name: 'SettingsView',
  components: { LineChart: Line },
  data() {
    return {
      form: {
        metric: '',
        operation: '',
        start: '',
        end: '',
      },
      result: null,
      chartData: { labels: [], datasets: [] },
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: true } },
      },
      summary: '',
      chartKey: 0,

      // ✅ --- INICIO: NUEVOS DATOS PARA PAGINACIÓN --- ✅
      currentPage: 1, // Página actual
      pageSize: 20, // Cantidad de items por página (puedes ajustar esto)
    }
  },

  computed: {
    totalPages() {
      if (!this.result || !this.result.data || this.result.data.length === 0) {
        return 0
      }
      return Math.ceil(this.result.data.length / this.pageSize)
    },

    paginatedData() {
      if (!this.result || !this.result.data) {
        return []
      }

      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize

      return this.result.data.slice(start, end)
    },
  },

  methods: {
    async runQuery() {
      try {
        const payload = {
          metric: this.form.metric,
          operation: this.form.operation,
          start: this.form.start ? new Date(this.form.start).toISOString() : null,
          end: this.form.end ? new Date(this.form.end).toISOString() : null,
        }

        const res = await fetch('/api/queries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`)
        }

        const data = await res.json()
        this.result = data // Guardamos el resultado completo

        if (data.data && data.data.length > 0) {
          // ... (el resto de tu lógica de runQuery no cambia)
          const startDate = this.form.start ? new Date(this.form.start) : null
          const endDate = this.form.end ? new Date(this.form.end) : null
          let diffHours = 0
          if (startDate && endDate) {
            diffHours = (endDate - startDate) / (1000 * 60 * 60)
          }

          const labels = data.data.map((d) => {
            const date = new Date(d._time)
            if (diffHours <= 6) {
              return date.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })
            } else if (diffHours <= 24 * 7) {
              return date.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
              })
            } else {
              return date.toLocaleDateString('es-ES')
            }
          })
          const values = data.data.map((d) => d._value)

          let referenceValue = null
          let referenceLabel = ''
          switch (this.form.operation) {
            case 'avg':
              referenceValue = parseFloat(
                (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
              )
              referenceLabel = 'Promedio'
              break
            case 'max':
              referenceValue = Math.max(...values)
              referenceLabel = 'Máximo'
              break
            case 'min':
              referenceValue = Math.min(...values)
              referenceLabel = 'Mínimo'
              break
          }

          const datasets = [
            {
              label: `${this.form.operation} de ${this.form.metric}`,
              data: values,
              borderColor: '#00ff88',
              tension: 0.3,
              fill: false,

              pointRadius: (ctx) => {
                const data = ctx.chart.data.datasets[0].data
                const index = ctx.dataIndex
                const currentValue = data[index]
                const previousValue = data[index - 1] // Obtener el valor anterior

                // Si es el primer punto, siempre mostrarlo
                if (index === 0) {
                  return 3
                }
                // Mostrar punto si el valor actual es diferente al anterior
                if (currentValue !== previousValue) {
                  return 3
                }
                // Ocultar los demás puntos
                return 0
              },
              pointBackgroundColor: '#00ff88', // Color de los puntos visibles
              pointHoverRadius: 5, // Un radio al pasar el mouse, un poco más pequeño para ser sutil
            },
          ]

          if (referenceValue !== null) {
            datasets.push({
              label: referenceLabel,
              data: Array(values.length).fill(referenceValue),
              borderColor: '#ff4d4d',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0,
              fill: false,
            })
          }

          this.chartData = {
            labels,
            datasets,
          }

          this.chartKey++

          switch (this.form.operation) {
            case 'avg':
              this.summary = `El promedio de ${this.form.metric} es ${referenceValue}`
              break
            case 'max':
              this.summary = `El valor máximo de ${this.form.metric} fue ${referenceValue}`
              break
            case 'min':
              this.summary = `El valor mínimo de ${this.form.metric} fue ${referenceValue}`
              break
            case 'last':
              this.summary = `El último valor registrado de ${this.form.metric} fue ${
                values[values.length - 1]
              }`
              break
            case 'trend':
              this.summary = `Se muestra la tendencia por hora de ${this.form.metric}`
              break
            default:
              this.summary = 'Consulta realizada correctamente.'
          }
        } else {
          this.chartData = { labels: [], datasets: [] }
          this.summary = ''
          this.result = null // Limpiamos el resultado si no hay datos
          this.chartKey++
        }
      } catch (error) {
        this.result = null
        this.summary = `❌ Error al ejecutar consulta: ${error.message}`
      }
    },

    getUnitForMetric(metric) {
      const units = {
        temperatura: '°C',
        humedad: '%',
        co2: 'ppm',
        presion: 'hPa',
      }
      return units[metric] || ''
    },

    /**
     * Exporta los datos crudos actuales a un archivo CSV.
     */
    exportToCSV() {
      if (!this.result || !this.result.data || this.result.data.length === 0) {
        alert('No hay datos para exportar.')
        return
      }

      // 1. Definir las cabeceras del CSV
      const headers = ['"Timestamp"', `"Valor (${this.getUnitForMetric(this.form.metric)})"`]

      // 2. Mapear los datos a filas de CSV
      const rows = this.result.data.map((item) => {
        const timestamp = `"${new Date(item._time).toLocaleString('es-ES')}"`
        const value = item._value.toFixed(2)
        return [timestamp, value].join(',')
      })

      // 3. Unir cabeceras y filas
      const csvContent = [headers.join(','), ...rows].join('\n')

      // 4. Crear un Blob y forzar la descarga
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      const filename = `export_${this.form.metric}_${new Date().toISOString().split('T')[0]}.csv`
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    // ✅ --- FIN: NUEVOS MÉTODOS DE PAGINACIÓN --- ✅

    openStartDatePicker() {
      this.$refs.startDateInput.showPicker()
    },
    openEndDatePicker() {
      this.$refs.endDateInput.showPicker()
    },
  },
}
</script>
<style scoped>
.settings {
  min-height: calc(100vh - 50px);
  padding: 10px;
  color: var(--color-text-main);
  background: var(--color-bg-gradient-end);
  display: flex;
  justify-content: center;
}
.setting-contenedor {
  width: 100%;
  max-width: 1400px;
  background: var(--color-bg-header);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid var(--color-primary-dark);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  align-items: end;
}

.form-container {
  background: var(--color-bg-header);
  border-radius: 12px;
  padding: 15px;
}

label {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

/* ✅ CAMBIO CLAVE: Inputs y selects con letra y padding más pequeños */
select,
input {
  padding: 0.45rem 0.7rem; /* Reducido */
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  border-radius: 8px;
  color: var(--color-text-main);
  font-size: 0.8rem; /* Reducido significativamente */
  transition: all 0.3s ease;
}

select:focus,
input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}

.input-with-icon {
  position: relative;
  display: flex;
}
.input-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: var(--color-primary-dark);
  cursor: pointer;
}
.icon-chevron {
  pointer-events: none;
}
.input-with-icon select,
.input-with-icon input {
  width: 100%;
  box-sizing: border-box;
}
select:required:invalid {
  color: var(--color-text-secondary);
}
select option {
  color: var(--color-text-main);
}
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input[type='datetime-local']::-webkit-calendar-picker-indicator {
  opacity: 0;
}

/* ✅ CAMBIO: Botón con letra más pequeña */
.btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.8rem; /* Reducido */
  transition: all 0.3s ease;
  box-shadow: var(--color-shadow);
  width: 100%;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(0, 255, 171, 0.25);
}

.results-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
  flex-grow: 1;
  min-height: 0;
}
.results-right-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.visualization-container {
  height: 90%;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 0 30px;
}

.chart {
  min-height: 300px;
  background: var(--color-bg-header);
  border-radius: 10px;
  padding: 20px 0 0 10px;
  border: var(--color-primary-dark);
  flex-grow: 1;
}
.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 250px;
  color: var(--color-text-secondary);
  font-style: italic;
  text-align: center;
}
.table-placeholder {
  min-height: 150px;
}

.summary {
  margin-left: 13px;
  background: var(--color-bg-header);
  border-radius: 8px;
  border: none;
  border-left: 3px solid var(--color-primary-dark);
  padding: 5px 15px;
}

.summary h3 {
  color: var(--color-primary-dark);
  margin-top: 0;

  /* 5. Corregimos la jerarquía: el título debe ser más grande */
  font-size: 0.95rem;
  font-weight: 600; /* Le damos más peso */

  /* 6. Hacemos el diseño más limpio quitando el borde inferior */
  margin-bottom: 8px; /* Un poco menos de espacio que 10px */
  border-bottom: none;
  padding-bottom: 0;
}

.summary p {
  color: var(--color-text-main);
  margin: 0;

  /* 7. Definimos el tamaño del texto principal (el que tenías) */
  font-size: 0.85rem;
  line-height: 1.4; /* Un poco más compacto que 1.5 */
}

.data-table-section {
  background: var(--color-bg-header);
  border-radius: 10px;
  padding: 10px 15px 2px 15px;

  display: flex;
  flex-direction: column;
  min-height: 0;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}
.table-header h4 {
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.95rem; /* Reducido */
}
.btn-export {
  background-color: var(--color-primary-dark);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 255, 171, 0.1);
}
.btn-export .icon {
  font-size: 0.9rem;
}

.table-wrapper {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--color-primary-dark);
  border-radius: 8px;
}
.table-wrapper::-webkit-scrollbar {
  width: 8px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: var(--color-bg-header);
  border-radius: 8px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-dark);
  border-radius: 10px;
  border: 2px solid var(--color-bg-header);
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-primary);
}

table {
  width: 100%;
  border-collapse: collapse;
}

/* ✅ CAMBIO: Texto de la tabla más pequeño */
th,
td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-primary-dark);
  font-size: 0.75rem; /* Reducido */
}

thead th {
  background-color: var(--color-primary-dark);
  color: var(--color-text-main);
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 700;
}
tbody tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.1);
}
tbody tr:hover {
  background-color: var(--color-primary-dark);
}
tbody tr:last-child td {
  border-bottom: none;
}

.pagination-controls {
  width: auto;
  display: flex;
  justify-content: end;
}
.pagination {
  width: 45%;
  display: flex;
  justify-content: center; /* Centra los elementos */
  gap: 16px; /* Añade un espacio entre los botones y el texto */
  align-items: center;
  padding: 4px;
  margin-top: 10px;
  background-color: var(--color-bg-header); /* Un fondo sutil */
  border-radius: 8px;
}

.pagination span {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.btn-page {
  background-color: var(--color-primary-dark); /* Color primario (ajusta a tu paleta) */
  color: white;
  border: none;
  padding: 2px 5px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.3rem;
  transition: background-color 0.2s ease;
}

.btn-page:hover {
  background-color: var(--color-primary-dark); /* Un poco más oscuro al pasar el mouse */
}

.btn-page:disabled {
  color: var(--color-primary-dark);
  cursor: not-allowed;
}
/* Responsive */
@media (max-width: 1024px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .settings {
    padding: 10px;
  }
  .setting-contenedor {
    padding: 15px;
  }
  .visualization-container {
    height: auto;
    padding: 0px;
  }
  .chart {
    height: 100%;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
