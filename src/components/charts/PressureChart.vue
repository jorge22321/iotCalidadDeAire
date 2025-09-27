<!-- src/components/charts/PressureChart.vue -->
<template>
  <div class="chart-container">
    <BaseChart :config="chartConfig" />
  </div>
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { connectWebSocket, onWSMessage, closeWebSocket } from '@/services/websocket.js'

const pressureValues = ref([])
const labels = ref([])

const chartConfig = ref({
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'PRESIÓN (hPa)',
        data: [],
        borderColor: '#00ffab',
        backgroundColor: 'rgba(0, 255, 171, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'PRESIÓN ATMOSFÉRICA',
        color: '#00ffab',
        font: { size: 16, weight: 'bold' },
      },
      subtitle: {
        display: true,
        text: '',
        color: '#00ffab',
        font: { size: 10 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#00ffab' },
      },
      y: {
        min: 1000,
        max: 1020,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#00ffab' },
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

  // Mantener solo las últimas 10 mediciones
  if (pressureValues.value.length >= 10) {
    pressureValues.value.shift()
    labels.value.shift()
  }

  pressureValues.value.push(newValue)
  labels.value.push(timeLabel)

  // Actualizar datos
  chartConfig.value.data.labels = [...labels.value]
  chartConfig.value.data.datasets[0].data = [...pressureValues.value]

  // Calcular límites dinámicos de Y
  const maxVal = Math.max(...pressureValues.value)
  const minVal = Math.min(...pressureValues.value)

  chartConfig.value.options.scales.y = {
    min: Math.floor(minVal * 0.995),
    max: Math.ceil(maxVal * 1.005),
    grid: { color: 'rgba(255,255,255,0.05)' },
    ticks: { color: '#00ffab' },
  }

  // Actualizar subtítulo
  chartConfig.value.options.plugins.subtitle.text = `Actualizado: ${timeLabel}`
}

onMounted(() => {
  connectWebSocket('ws://localhost:3000')

  onWSMessage('pressure', (data) => {
    updateChart(data.value)
  })
})

onBeforeUnmount(() => {
  closeWebSocket()
})
</script>

<style scoped>
.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 255, 171, 0.2);
  border-top: 3px solid #00ffab;
  height: 100%;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
  min-height: 250px;
}
</style>
