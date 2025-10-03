<!-- src/components/charts/CO2Chart.vue -->
<template>
  <div class="chart chart--co2">
    <BaseChart :config="chartConfig" />
  </div>
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { connectWebSocket, onWSMessage, closeWebSocket } from '@/services/websocket.js'

const co2Levels = ref([])
const labels = ref([])
const showAlert = computed(() => co2Levels.value.some((level) => level > 800))

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
        borderWidth: 3,
        tension: 0.3,
        pointBackgroundColor: (ctx) => (ctx.raw > 800 ? '#ff0000' : '#FFA500'),
        pointRadius: (ctx) => (ctx.raw > 800 ? 6 : 4),
        pointHoverRadius: 8,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#00ffab',
          font: { size: 12 },
          boxWidth: 0,
        },
      },
      title: {
        display: true,
        text: 'NIVELES DE CO2 ',
        color: '#00ffab',
        font: { size: 16, weight: 'bold' },
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
        },
      },
      y: {
        suggestedMin: 300,
        suggestedMax: 1000,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#00ffab',
          callback: (value) => `${value} ppm`,
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

  // Guardar máximo 10 registros
  if (co2Levels.value.length >= 10) {
    co2Levels.value.shift()
    labels.value.shift()
  }

  co2Levels.value.push(newValue)
  labels.value.push(timeLabel)

  chartConfig.value = {
    ...chartConfig.value,
    data: {
      labels: [...labels.value],
      datasets: [
        {
          ...chartConfig.value.data.datasets[0],
          data: [...co2Levels.value],
        },
      ],
    },
    options: {
      ...chartConfig.value.options,
      scales: {
        ...chartConfig.value.options.scales,
        y: {
          suggestedMin: Math.max(300, Math.min(...co2Levels.value) * 0.9),
          suggestedMax: Math.min(5000, Math.max(...co2Levels.value) * 1.1),
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#00ffab',
            callback: (value) => `${value} ppm`,
          },
        },
      },
    },
  }
}

onMounted(() => {
  connectWebSocket('ws://localhost:3000')

  onWSMessage('co2', (data) => {
    updateChart(data.value)
  })
})

onBeforeUnmount(() => {
  closeWebSocket()
})
</script>

<style scoped>
.chart--co2 {
  background: var(--color-bg-header);
  border-radius: 16px;
  padding: 20px;
  border-top: 3px solid #00ffab;
  position: relative;
}

.chart--co2__alert {
  position: absolute;
  top: 15px;
  right: 15px;

  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}
</style>
