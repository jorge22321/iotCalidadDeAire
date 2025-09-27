<!-- src/views/DevicesView.vue -->
<template>
  <div class="dashboard-content">
    <div class="grid-container">
      <PressureChart class="chart-item pressure" />
      <TemperatureGauge class="chart-item temperature" />
      <HumidityChart class="chart-item humidity" />
      <CO2Chart class="chart-item co2" />
      <UmbralComponent class="chart-item umbral" />
      <FanControl class="chart-item fan-control" />
    </div>
  </div>
</template>

<script setup>
import PressureChart from '@/components/charts/PressureChart.vue'
import TemperatureGauge from '@/components/charts/TemperatureGauge.vue'
import HumidityChart from '@/components/charts/HumidityChart.vue'
import CO2Chart from '@/components/charts/CO2Chart.vue'
import FanControl from '@/components/charts/FanControl.vue'
import UmbralComponent from '@/components/charts/UmbralComponent.vue'
</script>

<style scoped>
.dashboard-content {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 10px;
  background: var(--color-bg-gradient-end);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(250px, auto);
  gap: 10px;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  grid-template-areas:
    'G1 G1 G2 G2 G3 G3'
    'G4 G4 G5 G6 G6 G6';
}

.chart-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: var(--color-bg-header);
}

/* Asignación de áreas */
.pressure {
  grid-area: G1;
  height: 257px;
}

.temperature {
  grid-area: G2;
  height: 257px;
}

.humidity {
  grid-area: G3;
  height: 257px;
}

.co2 {
  grid-area: G4;
  height: 257px;
}

.umbral {
  grid-area: G5;
  height: 257px;
}

.fan-control {
  grid-area: G6;
  height: 257px;
  /* 1.5 celdas */
}

/* Ajustes responsivos */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas:
      'G1 G1 G2 G2'
      'G3 G3 G4 G4'
      'G5 G5 G6 G6';
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 15px;
    height: auto;
    min-height: calc(100vh - 50px);
  }

  .grid-container {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(200px, auto);
    gap: 15px;
    grid-template-areas:
      'G1'
      'G2'
      'G3'
      'G4'
      'G5'
      'G6';
  }

  .chart-item {
    border-radius: 10px;
    height: auto !important;
    min-height: 220px;
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    padding: 10px;
  }

  .grid-container {
    gap: 12px;
  }

  .chart-item {
    border-radius: 8px;
    min-height: 200px;
  }
}
</style>
