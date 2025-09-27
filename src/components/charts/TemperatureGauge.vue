<!-- src/components/charts/TemperatureGauge.vue -->
<template>
  <div class="chart-wrapper temperature">
    <BaseChart :config="chartConfig" />
    <div class="current-value">{{ currentTemp }}°C</div>
  </div>
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { connectWebSocket, onWSMessage, closeWebSocket } from '@/services/websocket.js'

const currentTemp = ref(0)

const chartConfig = ref({
  type: 'doughnut',
  data: {
    labels: ['Temperatura', ''],
    datasets: [
      {
        data: [0, 40],
        backgroundColor: ['#00ffab', 'rgba(0, 0, 0, 0.1)'], // Amarillo neón
        borderWidth: 0,
        cutout: '85%',
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
      title: {
        display: true,
        text: 'TEMPERATURA',
        color: '#00ffab',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
      subtitle: {
        display: true,
        text: 'Esperando datos...',
        color: '#aaa',
        font: { size: 10 },
        position: 'bottom',
      },
    },
    rotation: -90,
    circumference: 180,
    animation: {
      duration: 1000,
      easing: 'easeOutQuad',
    },
  },
})

function updateChart(tempValue) {
  const temp = parseFloat(tempValue).toFixed(1)
  currentTemp.value = temp
  chartConfig.value.data.datasets[0].data = [temp, Math.max(0, 40 - temp)]
  chartConfig.value.options.plugins.subtitle.text = `Actualizado: ${new Date().toLocaleTimeString()}`
}

onMounted(() => {
  connectWebSocket('ws://localhost:3000')

  // Recibir actualizaciones en tiempo real
  onWSMessage('temperature', (data) => {
    updateChart(data.value)
  })
})

onBeforeUnmount(() => {
  closeWebSocket()
})
</script>

<style scoped>
.chart-wrapper.temperature {
  background: var(--color-bg-header); /* Fondo con tono amarillento */
  border-radius: 16px;
  padding: 20px;

  position: relative;
  border-top: 3px solid #00ffab; /* Borde superior amarillo */
}

.current-value {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: #00ffab; /* Amarillo neón */
}

/* Efecto de brillo al pasar el ratón */
</style>
