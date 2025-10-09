<template>
  <div class="chart chart--pressure">
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
        borderWidth: 2, // ✅ Reducido
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
        // ✅ CAMBIO: Título más pequeño
        font: { size: 14, weight: 'bold' },
      },
      subtitle: {
        display: true,
        text: '',
        color: '#00ffab',
        // ✅ CAMBIO: Subtítulo más pequeño
        font: { size: 9 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        // ✅ CAMBIO: Letra de eje X más pequeña
        ticks: { color: '#00ffab', font: { size: 10 } },
      },
      y: {
        min: 1000,
        max: 1020,
        grid: { color: 'rgba(255,255,255,0.05)' },
        // ✅ CAMBIO: Letra de eje Y más pequeña
        ticks: { color: '#00ffab', font: { size: 10 } },
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

  if (pressureValues.value.length >= 10) {
    pressureValues.value.shift()
    labels.value.shift()
  }

  pressureValues.value.push(newValue)
  labels.value.push(timeLabel)

  chartConfig.value.data.labels = [...labels.value]
  chartConfig.value.data.datasets[0].data = [...pressureValues.value]

  const maxVal = Math.max(...pressureValues.value)
  const minVal = Math.min(...pressureValues.value)

  // ✅ CAMBIO: Se asegura de mantener la fuente pequeña en las actualizaciones
  chartConfig.value.options.scales.y = {
    min: Math.floor(minVal * 0.995),
    max: Math.ceil(maxVal * 1.005),
    grid: { color: 'rgba(255,255,255,0.05)' },
    ticks: { color: '#00ffab', font: { size: 10 } },
  }

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
/* ✅ CAMBIO: Contenedor más compacto */
.chart--pressure {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: 12px; /* Reducido */
  padding: 15px; /* Reducido */
  box-shadow: 0 0 15px rgba(0, 255, 171, 0.2);
  border-top: 2px solid #00ffab; /* Reducido */
  height: 100%;
}
</style>
