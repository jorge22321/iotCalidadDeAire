<!-- src/components/charts/HumidityChart.vue -->
<template>
  <div class="chart chart--humidity">
    <BaseChart :config="chartConfig" />
  </div>
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { connectWebSocket, onWSMessage, closeWebSocket } from '@/services/websocket.js'

const humidityLevels = ref([])
const labels = ref([])

const chartConfig = ref({
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'HUMEDAD (%)',
        data: [],
        backgroundColor: (ctx) => {
          const value = ctx.raw
          return value > 80
            ? 'rgba(255, 0, 0, 0.7)' // Rojo para humedad alta
            : value < 30
              ? 'rgba(0, 100, 255, 0.7)' // Azul para humedad baja
              : '#00ffab' // Morado para rango normal
        },
        borderColor: '#00ffab',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'HUMEDAD RELATIVA ',
        color: '#00ffab',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}% a las ${ctx.label}`,
        },
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
        ticks: {
          color: '#00ffab',
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#00ffab',
          callback: (value) => `${value}%`,
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

  // Mantener solo las últimas 8 mediciones
  if (humidityLevels.value.length >= 8) {
    humidityLevels.value.shift()
    labels.value.shift()
  }

  humidityLevels.value.push(newValue)
  labels.value.push(timeLabel)

  chartConfig.value.data.labels = [...labels.value]
  chartConfig.value.data.datasets[0].data = [...humidityLevels.value]

  // Actualizar subtítulo con hora
  chartConfig.value.options.plugins.subtitle.text = `Actualizado: ${timeLabel}`
}

onMounted(() => {
  connectWebSocket('ws://localhost:3000')

  onWSMessage('humidity', (data) => {
    updateChart(data.value)
  })
})

onBeforeUnmount(() => {
  closeWebSocket()
})
</script>

<style scoped>
.chart--humidity {
  background: var(--color-bg-header);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(5px);
  border-top: 3px solid #00ffab;
}
</style>
