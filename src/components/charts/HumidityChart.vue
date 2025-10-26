<template>
  <div class="chart chart--humidity">
    <BaseChart :config="chartConfig" />
  </div>
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { connectWebSocket, onWSMessage, offWSMessage } from '@/services/websocket.js'

const humidityLevels = ref([])
const labels = ref([])
let handleHumidity = null

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
              : '#00ffab' // Color normal
        },
        borderColor: '#00ffab',
        borderWidth: 1,
        borderRadius: 4, // ✅ Reducido
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
        text: 'HUMEDAD RELATIVA',
        color: '#00ffab',
        // ✅ CAMBIO: Título más pequeño
        font: { size: 14, weight: 'bold' },
        padding: { bottom: 5 }, // Reducido
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
        // ✅ CAMBIO: Subtítulo más pequeño
        font: { size: 9 },
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
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#00ffab',
          callback: (value) => `${value}%`,
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

  if (humidityLevels.value.length >= 8) {
    humidityLevels.value.shift()
    labels.value.shift()
  }

  humidityLevels.value.push(newValue)
  labels.value.push(timeLabel)

  chartConfig.value.data.labels = [...labels.value]
  chartConfig.value.data.datasets[0].data = [...humidityLevels.value]
  chartConfig.value.options.plugins.subtitle.text = `Actualizado: ${timeLabel}`
}

onMounted(() => {
  const API_HOST = import.meta.env.VITE_API_HOST || window.location.hostname
  const API_PORT = import.meta.env.VITE_API_PORT || '3000'
  const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const WS_URL = `${WS_PROTOCOL}//${API_HOST}:${API_PORT}`
  connectWebSocket(WS_URL)

  handleHumidity = (data) => {
    updateChart(data.value)
  }

  onWSMessage('humidity', handleHumidity)
})

onBeforeUnmount(() => {
  offWSMessage('humidity', handleHumidity)
})
</script>

<style scoped>
/* ✅ CAMBIO: Contenedor más compacto */
.chart--humidity {
  background: var(--color-bg-header);
  border-radius: 12px; /* Reducido */
  padding: 15px; /* Reducido */
  backdrop-filter: blur(5px);
  border-top: 2px solid #00ffab; /* Reducido */
}
</style>
