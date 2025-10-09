<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <div class="dashboard__grid">
      <PressureChart class="dashboard__chart dashboard__chart--pressure" />
      <TemperatureGauge class="dashboard__chart dashboard__chart--temperature" />
      <HumidityChart class="dashboard__chart dashboard__chart--humidity" />
      <CO2Chart class="dashboard__chart dashboard__chart--co2" />
      <UmbralComponent class="dashboard__chart dashboard__chart--umbral" />
      <FanControl class="dashboard__chart dashboard__chart--fan-control" />
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
.dashboard {
  display: flex;
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 15px;
  background: var(--color-bg-gradient-end);
  align-items: center;
  justify-content: center;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(250px, auto);
  gap: 15px;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  grid-template-areas:
    'G1 G1 G2 G2 G3 G3'
    'G4 G4 G5 G6 G6 G6';
}

.dashboard__chart {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: var(--color-bg-header);
}

/* Áreas */
.dashboard__chart--pressure {
  grid-area: G1;
  height: 250px;
}

.dashboard__chart--temperature {
  grid-area: G2;
  height: 250px;
}

.dashboard__chart--humidity {
  grid-area: G3;
  height: 250px;
}

.dashboard__chart--co2 {
  grid-area: G4;
  height: 250px;
}

.dashboard__chart--umbral {
  grid-area: G5;
  height: 250px;
}

.dashboard__chart--fan-control {
  grid-area: G6;
  height: 250px;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard__grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas:
      'G1 G1 G2 G2'
      'G3 G3 G4 G4'
      'G5 G5 G6 G6';
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 15px;
    height: auto;
    min-height: calc(100vh - 50px);
  }

  .dashboard__grid {
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

  .dashboard__chart {
    border-radius: 10px;
    height: auto !important;
    min-height: 220px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 10px;
  }

  .dashboard__grid {
    gap: 12px;
  }

  .dashboard__chart {
    border-radius: 8px;
    min-height: 200px;
  }
}
</style>
