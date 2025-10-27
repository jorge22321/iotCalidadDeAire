//src/component/charts/CO2Chart.vue
<template>
  <div class="chart chart--co2">
    <div v-if="isAlertActive" class="chart--co2__alert">ALERTA: Nivel alto de CO2</div>
    <BaseChart :config="chartConfig" />
  </div>
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { connectWebSocket, onWSMessage, offWSMessage } from '@/services/websocket.js'

const co2Levels = ref([])
const labels = ref([])
// Estado de alerta: se activa cuando un valor supera el umbral y
// se desactiva cuando los últimos N valores están por debajo o iguales al umbral
const isAlertActive = ref(false)
const ALERT_THRESHOLD = 800
const ALERT_RESET_WINDOW = 3 // cantidad de lecturas recientes necesarias para resetear

const chartConfig = ref({
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'CO2 (PPM)',
        data: [],
        borderColor: '#00ffab',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderWidth: 2, // ✅ Reducido
        tension: 0.3,
        // ✅ CAMBIO: Puntos de datos más pequeños
        pointBackgroundColor: (ctx) => (ctx.raw > 800 ? '#ff0000' : '#FFA500'),
        pointRadius: (ctx) => (ctx.raw > 800 ? 5 : 3), // Reducido
        pointHoverRadius: 6, // Reducido
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#00ffab',
          // ✅ CAMBIO: Letra de leyenda más pequeña
          font: { size: 10 },
          boxWidth: 0,
        },
      },
      title: {
        display: true,
        text: 'NIVELES DE CO2 ',
        color: '#00ffab',
        // ✅ CAMBIO: Letra de título más pequeña
        font: { size: 14, weight: 'bold' },
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 800,
            yMax: 800,
            borderColor: '#00ffab',
            borderWidth: 1,
            borderDash: [6, 6],
            label: {
              content: 'Límite seguro',
              enabled: true,
              position: 'right',
              // ✅ CAMBIO: Letra de anotación más pequeña
              font: { size: 10 },
            },
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.raw
            return `${label}: ${value} ppm (${context.label})`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#00ffab',
          maxRotation: 45,
          minRotation: 45,
          // ✅ CAMBIO: Letra de eje X más pequeña
          font: { size: 10 },
        },
      },
      y: {
        suggestedMin: 300,
        suggestedMax: 1000,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#00ffab',
          callback: (value) => `${value} ppm`,
          // ✅ CAMBIO: Letra de eje Y más pequeña
          font: { size: 10 },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuad',
    },
  },
})

function updateChart(newValue) {
  const timeLabel = new Date().toLocaleTimeString()

  if (co2Levels.value.length >= 10) {
    co2Levels.value.shift()
    labels.value.shift()
  }

  co2Levels.value.push(newValue)
  labels.value.push(timeLabel)

  // La lógica de actualización del gráfico es correcta, solo actualizamos las opciones de escala en el objeto
  chartConfig.value.data.labels = [...labels.value]
  chartConfig.value.data.datasets[0].data = [...co2Levels.value]
  chartConfig.value.options.scales.y = {
    ...chartConfig.value.options.scales.y, // Mantiene las otras opciones como color y font
    suggestedMin: Math.max(300, Math.min(...co2Levels.value) * 0.9),
    suggestedMax: Math.min(5000, Math.max(...co2Levels.value) * 1.1),
  }
}

let handleCo2 = null

onMounted(() => {
  connectWebSocket()

  handleCo2 = (data) => {
    const val = data.value
    updateChart(val)

    // Si el valor supera el umbral, activamos alerta inmediatamente
    if (val > ALERT_THRESHOLD) {
      isAlertActive.value = true
      return
    }

    // Si el valor está por debajo, verificamos la ventana de lecturas recientes
    const recent = co2Levels.value.slice(-ALERT_RESET_WINDOW)
    const allNormal = recent.length > 0 && recent.every((v) => v <= ALERT_THRESHOLD)
    if (allNormal) {
      isAlertActive.value = false
    }
  }

  onWSMessage('co2', handleCo2)
})

onBeforeUnmount(() => {
  offWSMessage('co2', handleCo2)
})
</script>

<style scoped>
/* ✅ CAMBIO: Contenedor más compacto */
.chart--co2 {
  background: var(--color-bg-header);
  border-radius: 12px; /* Reducido */
  padding: 15px; /* Reducido */
  border-top: 2px solid #00ffab; /* Reducido */
  position: relative;
}

/* ✅ CAMBIO: Alerta más pequeña */
.chart--co2__alert {
  position: absolute;
  top: 10px; /* Ajustado */
  right: 15px;
  background-color: #ff0000; /* Añadido para mejor visibilidad */
  color: #fff; /* Añadido para mejor visibilidad */
  padding: 4px 8px; /* Reducido */
  border-radius: 20px;
  font-size: 0.7rem; /* Reducido */
  font-weight: bold;
  animation: pulse 1.5s infinite;
  z-index: 10;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
