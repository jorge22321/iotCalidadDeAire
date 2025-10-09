<!-- src/components/charts/BaseChart.vue -->
<template>
  <div class="chart">
    <canvas class="chart__canvas" ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  config: Object,
})

const canvas = ref(null)
let chartInstance = null

// Función para destruir el gráfico correctamente
const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

onMounted(() => {
  // Configuración responsive modificada
  const chartConfig = {
    ...props.config,
    options: {
      ...props.config.options,
      responsive: true,
      maintainAspectRatio: false, // Esto permite que el gráfico llene el contenedor
      devicePixelRatio: 2, // Mejor calidad en pantallas HiDPI
    },
  }

  chartInstance = new Chart(canvas.value, chartConfig)

  // Forzar redimensionamiento inicial
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }, 100)
})

// Actualizar gráfico cuando cambian las props
watch(
  () => props.config,
  (newConfig) => {
    if (chartInstance) {
      chartInstance.data = newConfig.data
      chartInstance.options = {
        ...newConfig.options,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000, // Animación suave al actualizar
          easing: 'easeOutQuart',
        },
      }
      chartInstance.update('resize') // Forzar redimensionamiento
    }
  },
  { deep: true },
)
// Limpieza al desmontar
onBeforeUnmount(() => {
  destroyChart()
})
</script>

<style scoped>
.chart {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  align-items: center;
  justify-content: center;
}

.chart__canvas {
  display: block; /* Elimina espacio extra debajo del canvas */
  width: 90% !important;
  height: 90% !important;
}
</style>
