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
    if (!chartInstance) return

    try {
      const newLabels = (newConfig.data && newConfig.data.labels) || []
      const oldLabels = chartInstance.data.labels || []

      // Si las nuevas etiquetas contienen las antiguas como prefijo, solo añadimos la diferencia
      const isPrefix =
        newLabels.length >= oldLabels.length && oldLabels.every((v, i) => v === newLabels[i])

      if (isPrefix) {
        const addedLabels = newLabels.slice(oldLabels.length)
        addedLabels.forEach((lbl) => chartInstance.data.labels.push(lbl))

        // Para cada dataset, añadimos los nuevos puntos (si hay)
        const newDatasets = newConfig.data.datasets || []
        newDatasets.forEach((newDs, idx) => {
          const chartDs = chartInstance.data.datasets[idx]
          const newData = (newDs && newDs.data) || []
          const oldData = (chartDs && chartDs.data) || []
          if (chartDs) {
            const addedData = newData.slice(oldData.length)
            addedData.forEach((d) => chartDs.data.push(d))

            // Si por alguna razón el tamaño se redujo (rollover), alineamos exactamente
            if (newData.length < chartDs.data.length) {
              chartDs.data = [...newData]
            }
            // Mantener otras propiedades del dataset (colores, estilos)
          } else {
            // dataset nuevo: clonar
            chartInstance.data.datasets[idx] = { ...newDs }
          }
        })
      } else {
        // Caso no incremental: reemplazo completo (por ejemplo al cambiar tipo o reconfigurar)
        chartInstance.data = JSON.parse(JSON.stringify(newConfig.data))
      }

      // Fusionar opciones (no sobrescribimos por completo para mantener el estado interno)
      chartInstance.options = { ...chartInstance.options, ...(newConfig.options || {}) }

      // Actualización normal para animaciones suaves
      chartInstance.update()
    } catch (err) {
      console.error('Error actualizando chart:', err)
      // Fallback sencillo
      chartInstance.data = newConfig.data
      chartInstance.options = newConfig.options
      chartInstance.update()
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
