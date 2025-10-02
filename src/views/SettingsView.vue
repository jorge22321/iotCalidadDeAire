<template>
  <div class="settings-content">
    <h2>Consultas de Sensores</h2>

    <!-- Selección de consulta -->
    <select v-model="selectedQuery">
      <option disabled value="">Seleccione una consulta...</option>
      <option value="avgTemp">Promedio de temperatura (24h)</option>
      <option value="maxHumidity">Máxima humedad (últimos 7 días)</option>
      <option value="maxCO2">Máximo CO₂ (últimos 7 días)</option>
    </select>

    <button @click="runQuery">Ejecutar Consulta</button>

    <!-- Resultados -->
    <div v-if="result" class="result-box">
      <h3>Resultado:</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SettingsView',
  data() {
    return {
      selectedQuery: '',
      result: null,
    }
  },
  methods: {
    async runQuery() {
      if (!this.selectedQuery) return
      try {
        const res = await axios.post('/api/queries', { type: this.selectedQuery })
        this.result = res.data
      } catch (error) {
        this.result = { error: error.message }
      }
    },
  },
}
</script>

<style scoped>
.settings-content {
  padding: 20px;
  background: var(--color-bg-card);
  height: 100%;
}
select,
button {
  margin: 10px 0;
  padding: 8px;
}
.result-box {
  margin-top: 20px;
  background: #111;
  color: #0f0;
  padding: 15px;
  border-radius: 6px;
}
</style>
