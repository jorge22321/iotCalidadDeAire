<template>
  <div class="settings">
    <div class="setting-contenedor">
      <div class="main-layout-grid">
        <div class="left-column">
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
                <font-awesome-icon
                  icon="calendar-days"
                  class="input-icon"
                  @click="openEndDatePicker"
                />
              </div>
            </div>
            <button class="btn" @click="runQuery">▶ Ejecutar Consulta</button>
          </div>

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
        </div>

        <div class="right-column">
          <div class="data-table-section">
            <div class="table-header">
              <h4>Datos Crudos</h4>
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
                  <tr v-for="item in result.data" :key="item._time">
                    <td>{{ new Date(item._time).toLocaleString('es-ES') }}</td>
                    <td>{{ item._value.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="chart-placeholder">
                <p>Los datos de la consulta aparecerán aquí.</p>
              </div>
            </div>
          </div>
          <div class="summary">
            <h3>Resultado:</h3>
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
        operation: 'raw',
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
    }
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
  padding: 20px;
  color: var(--color-text-main);
  background: var(--color-bg-gradient-end);

  /* ✅ AÑADIDO: Centra el contenedor principal en la pantalla */
  display: flex;

  justify-content: center;
}
.setting-contenedor {
  height: auto;
  background: var(--color-bg-header);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid var(--color-primary-dark);
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  margin-bottom: 25px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 255, 171, 0.3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.form-grid > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

select,
input {
  padding: 12px 15px;
  background: var(--color-bg-header);
  border-color: var(--color-primary-dark);
  border-radius: 8px;
  color: var(--color-text-main);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

select:focus,
input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}

.input-with-icon {
  position: relative; /* Base para posicionar el ícono */
  display: flex; /* Asegura que los elementos internos se alineen bien */
}

/* 2. Estilo y posición del ícono Font Awesome */
.input-icon {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%); /* Centrado vertical perfecto */

  color: var(--color-primary-dark); /* ✅ ¡EL COLOR QUE PEDISTE! */
  cursor: pointer;
}
.icon-chevron {
  pointer-events: none;
  cursor: default;
}

/* 3. Ajustes en los inputs para que todo encaje */
.input-with-icon select,
.input-with-icon input {
  padding-right: 40px; /* Espacio a la derecha para que el texto no se tape */
  width: 100%; /* Ocupa todo el ancho del contenedor */
  box-sizing: border-box;
}

/* 4. Estilo de placeholder para los SELECT */
/* Cuando no se ha seleccionado nada, el texto se verá más claro */
select:required:invalid {
  color: var(--color-text-secondary);
}
select option {
  color: var(--color-text-main);
}

/* Oculta la flecha/calendario por defecto que algunos navegadores aún podrían mostrar */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input[type='datetime-local']::-webkit-calendar-picker-indicator {
  background: none;
  display: block;
  opacity: 0; /* Lo hacemos totalmente transparente */
}
.btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: var(--color-shadow);
  display: block;
  margin: 0 auto;
  min-width: 200px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(0, 255, 171, 0.25);
}

.btn:active {
  transform: translateY(0);
}

.result-box {
  margin-top: 30px;
  padding: 20px;
  background: var(--color-bg-card);
  border: 1px solid rgba(0, 255, 171, 0.1);
  border-radius: 12px;
  box-shadow: var(--color-shadow);
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  align-items: start;
}

.chart {
  min-height: 350px;
  background: var(--color-bg-header);
  border-radius: 10px;
  padding: 50px 0 0 27px;
}

.summary {
  padding: 20px;
  background: var(--color-bg-header);
  border-radius: 10px;
  font-size: 0.95rem;
  border: 1px solid rgba(0, 255, 171, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.summary h3 {
  color: var(--color-accent);
  margin-bottom: 15px;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(0, 224, 255, 0.3);
  padding-bottom: 8px;
}

.summary p {
  color: var(--color-text-main);
  line-height: 1.5;
  margin: 0;
}

.main-layout-grid {
  display: grid;
  /* Divide el espacio: 1 parte para el form, 2 para el gráfico */
  grid-template-columns: 1fr 2fr;
  gap: 25px;
  align-items: start; /* Alinea los contenedores en la parte superior */
}

/* Contenedores para cada columna */
.form-container,
.result-container {
  background: var(--color-bg-header);
  border-radius: 12px;
  padding: 20px;

  height: 100%; /* Ocupa toda la altura disponible en la fila del grid */
}

/* Estilo para el mensaje de "esperando datos" en el gráfico */
.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 350px; /* Misma altura que el gráfico */
  color: var(--color-text-secondary);
  font-style: italic;
  text-align: center;
}
.grid {
  margin-top: 0;
  padding: 0;
}

.data-table-section {
  margin-top: 25px; /* Espacio entre el gráfico y la tabla */
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 5px;
}

.table-header h4 {
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 1rem;
}

.btn-export {
  background-color: var(--color-primary-dark);

  color: #fff;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
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
  font-size: 1rem;
}

.table-wrapper {
  max-height: 450px; /* ALTURA MÁXIMA ANTES DE MOSTRAR SCROLL */
  overflow-y: auto; /* Scroll vertical cuando el contenido excede la altura */
  border: 1px solid var(--color-primary-dark);
  border-radius: 8px;
  background-color: var(--color-bg-header);
}

/* Estilo para la barra de scroll */
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

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--color-primary-dark);
  font-size: 0.9rem;
}

thead th {
  background-color: var(--color-primary-dark); /* ✅ CAMBIO: Usamos un color sólido */
  color: var(--color-text-main);
  position: sticky;
  top: 0;
  z-index: 1;
  /* Opcional: añade un borde inferior sutil para separar el header del contenido */
  border-bottom: 1px solid var(--color-primary-dark);
  font-weight: 700;
}

tbody tr {
  transition: background-color 0.2s ease;
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
/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .settings-content {
    padding: 15px;
  }
}
</style>
