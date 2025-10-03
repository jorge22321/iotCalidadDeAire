<template>
  <div class="settings-content">
    <div class="form-grid">
      <!-- Selector de métrica -->
      <div>
        <label>Métrica:</label>
        <select v-model="form.metric">
          <option disabled value="">Seleccione métrica</option>
          <option value="temperatura">🌡️ Temperatura</option>
          <option value="humedad">💧 Humedad</option>
          <option value="co2">🟢 CO₂</option>
          <option value="presion">🌬️ Presión</option>
        </select>
      </div>

      <!-- Selector de operación -->
      <div>
        <label>Operación:</label>
        <select v-model="form.operation">
          <option disabled value="">Seleccione operación</option>
          <option value="avg">Promedio</option>
          <option value="max">Máximo</option>
          <option value="min">Mínimo</option>
          <option value="last">Último valor</option>
          <option value="trend">Tendencia (promedio por hora)</option>
        </select>
      </div>

      <!-- Fecha inicio -->
      <div>
        <label>Fecha inicio:</label>
        <input type="datetime-local" v-model="form.start" />
      </div>

      <!-- Fecha fin -->
      <div>
        <label>Fecha fin:</label>
        <input type="datetime-local" v-model="form.end" />
      </div>
    </div>

    <!-- Botón ejecutar -->
    <button class="btn" @click="runQuery">▶ Ejecutar Consulta</button>

    <!-- Resultados -->
    <div v-if="result" class="result-box">
      <div class="grid">
        <!-- Gráfico -->
        <div class="chart">
          <LineChart
            v-if="chartData.labels.length > 0"
            :data="chartData"
            :options="chartOptions"
            :key="chartKey"
          />
        </div>

        <!-- Resumen -->
        <div class="summary">
          <h3>📊 Resultado:</h3>
          <p v-if="summary">{{ summary }}</p>
          <p v-else>No hay datos disponibles en este rango.</p>
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
      chartKey: 0, // 🔑 fuerza el re-render del gráfico
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
        this.result = data

        if (data.data && data.data.length > 0) {
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

          // ⚡ Crear objeto NUEVO (Vue detecta cambios)
          this.chartData = {
            labels,
            datasets: [
              {
                label: `${this.form.operation} de ${this.form.metric}`,
                data: values,
                borderColor: '#00ff88',
                tension: 0.3,
              },
            ],
          }

          // 🔄 forzar re-render del gráfico
          this.chartKey++

          // 📋 resumen textual
          switch (this.form.operation) {
            case 'avg':
              this.summary = `El promedio de ${this.form.metric} es ${(
                values.reduce((a, b) => a + b, 0) / values.length
              ).toFixed(2)}`
              break
            case 'max':
              this.summary = `El valor máximo de ${this.form.metric} fue ${Math.max(...values)}`
              break
            case 'min':
              this.summary = `El valor mínimo de ${this.form.metric} fue ${Math.min(...values)}`
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
          // 🔄 limpiar si no hay resultados
          this.chartData = { labels: [], datasets: [] }
          this.summary = ''
          this.chartKey++
        }
      } catch (error) {
        this.result = null
        this.summary = `❌ Error al ejecutar consulta: ${error.message}`
      }
    },
  },
}
</script>

<style scoped>
.settings-content {
  padding: 20px;
  background: linear-gradient(135deg, var(--color-bg-gradient-start), var(--color-bg-gradient-end));
  min-height: 100vh;
  color: var(--color-text-main);
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
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

select,
input {
  padding: 12px 15px;
  background: var(--color-bg-card);
  border: 1px solid rgba(0, 255, 171, 0.2);
  border-radius: 8px;
  color: var(--color-text-main);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: var(--color-shadow);
}

select:focus,
input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}

select:hover,
input:hover {
  border-color: var(--color-primary-dark);
}

.btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #000;
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
  padding: 15px;
  border: 1px solid rgba(0, 255, 171, 0.1);
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
