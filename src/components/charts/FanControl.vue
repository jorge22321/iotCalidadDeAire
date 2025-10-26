<!-- src/components/charts/FanControl.vue -->
<template>
  <div class="fan-control-container">
    <!-- 🧩 CONTENEDOR IZQUIERDO -->
    <div class="left-column">
      <!-- 🔹 Parte superior: lecturas -->
      <div class="sensor-readings">
        <div class="reading temperature">
          <font-awesome-icon icon="thermometer-half" />
          <span>Temperatura alta detectada: {{ temperature }}°C</span>
        </div>
        <div class="reading co2">
          <font-awesome-icon icon="smog" />
          <span>CO₂ alto detectado: {{ co2 }}ppm</span>
        </div>
      </div>

      <!-- 🔹 Parte inferior: controles -->
      <div class="controls-section">
        <!-- 🔸 Controles de encendido / apagado -->
        <div class="control-buttons">
          <button @click="turnOnFan" class="power-btn on" :class="{ active: buttonOnActive }">
            <font-awesome-icon icon="power-off" />
          </button>
          <button
            @click="turnOffFan"
            class="power-btn off"
            :class="{ active: buttonOffActive }"
            title="Apagar"
          >
            <font-awesome-icon icon="power-off" />
          </button>
        </div>

        <!-- 🔸 Toggle de modo -->
        <div class="mode-toggle">
          <div class="vertical-toggle">
            <input type="checkbox" id="mode-toggle" v-model="isAutoMode" class="toggle-input" />
            <label for="mode-toggle" class="toggle-slider">
              <span class="toggle-text top">Manual</span>
              <span class="toggle-text bottom">Auto</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 🧩 CONTENEDOR DERECHO -->
    <div class="right-column">
      <div class="fan-icon">
        <div class="fan-container">
          <font-awesome-icon
            :icon="['fas', 'fan']"
            class="fan-icon-main"
            :class="{ spinning: fanPhysicalStatus }"
          />
          <div class="fan-ring" :class="{ spinning: fanPhysicalStatus }"></div>
          <div class="fan-stand"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getWsUrl, getApiUrl } from '@/services/api'

export default {
  name: 'FanControl',
  data() {
    return {
      fanPhysicalStatus: false, // Estado real del ventilador (MQTT)
      buttonOnActive: false, // Estado visual del botón ON
      buttonOffActive: false, // Estado visual del botón OFF
      isAutoMode: false,
      temperature: 0,
      co2: 0,
      updateInterval: null,
      ws: null, // Conexión WebSocket
    }
  },

  async mounted() {
    // Cargar estado inicial desde backend (solo ventilador real)
    await this.checkFanStatus()
    // Iniciar WebSocket para sincronización en tiempo real
    this.initWebSocket()

    // Fallback: polling cada 5s si WS falla
    this.updateInterval = setInterval(this.checkFanStatus, 5000)
  },

  beforeUnmount() {
    clearInterval(this.updateInterval)
    if (this.ws) this.ws.close()
  },

  methods: {
    /**
     * ================================
     * INICIALIZAR WEBSOCKET
     * ================================
     */
    initWebSocket() {
      const wsUrl = getWsUrl()
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('📡 WebSocket conectado')
      }

      // 📩 Mensajes que llegan del servidor
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          switch (msg.type) {
            case 'fanStatus': // Estado real del ventilador (MQTT)
              this.fanPhysicalStatus = msg.status
              break
            case 'buttonStatus': // Estado de botones compartido
              this.buttonOnActive = msg.onStatus
              this.buttonOffActive = msg.offStatus
              break
            case 'mode': // Modo de operación
              this.isAutoMode = msg.mode === 'manual'
              break
            case 'thresholds': // Umbrales (CO2 y temp)
              if (msg.co2 !== undefined) this.co2 = msg.co2
              if (msg.temperatura !== undefined) this.temperature = msg.temperatura
              break
          }
        } catch (err) {
          console.error('❌ Error procesando WS:', err)
        }
      }

      this.ws.onclose = () => {
        console.warn('⚠️ WebSocket cerrado. Reintentando en 3s...')
        setTimeout(this.initWebSocket, 3000)
      }
    },

    /**
     * ================================
     * ENVIAR ESTADO DE BOTONES POR WS
     * ================================
     */
    async sendFanCommand(command) {
      try {
        const response = await fetch(`${getApiUrl()}/control-ventilador`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ventilador: command }),
        })

        if (!response.ok) throw new Error('Error al enviar comando')

        // 🔹 Actualizar botones en el frontend
        this.buttonOnActive = command
        this.buttonOffActive = !command
      } catch (err) {
        console.error('❌ Error enviando comando:', err)
      }
    },

    // Alias para botones
    turnOnFan() {
      this.sendFanCommand(true)
    },
    turnOffFan() {
      this.sendFanCommand(false)
    },

    // Estado real del ventilador (MQTT)
    async checkFanStatus() {
      try {
        const response = await fetch(`${getApiUrl()}/status`)
        if (!response.ok) throw new Error('Error al obtener estado')
        const { status } = await response.json()
        this.fanPhysicalStatus = status
      } catch (error) {
        console.error('Error obteniendo estado:', error)
      }
    },

    // Cambiar modo (esto lo dejamos igual)
    async toggleMode() {
      try {
        const mode = this.isAutoMode ? 'manual' : 'automatico'
        const response = await fetch(`${getApiUrl()}/mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modo: mode }),
        })

        if (!response.ok) throw new Error('Error al cambiar modo')
        console.log('Modo cambiado a:', mode)
      } catch (error) {
        console.error('Error al cambiar modo:', error)
        this.isAutoMode = !this.isAutoMode // revertir en caso de fallo
      }
    },
  },

  watch: {
    isAutoMode(newVal, oldVal) {
      if (newVal !== oldVal) this.toggleMode()
    },
  },
}
</script>
<style scoped>
.fan-control-container {
  display: grid;

  align-items: stretch;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 30px;
  background: var(--color-bg-header);
  border-radius: 10px;

  font-family: 'Segoe UI', sans-serif;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: auto 1fr;
  gap: 20px;
  overflow: hidden;
  /* Efectos de neón intensificados */
  border-top: 3px solid #00ffab;
}
.left-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.right-column {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sensor-readings {
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.reading {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  font-size: 0.75rem;
}

.reading :deep(svg) {
  margin-right: 10px;
  width: 20px;
  height: 20px;
}

.temperature :deep(svg) {
  color: #00ffab;
}

.co2 :deep(svg) {
  color: #00ffab;
}

.reading.temperature span {
  color: #00ffab;
}

.reading.co2 span {
  color: #00ffab;
}
.controls-section {
  display: grid;
  grid-template-columns: 1fr auto; /* izquierda botones / derecha toggle */
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-right: 20px;
}
.control-buttons {
  display: flex;
  flex-direction: row;
  gap: 25px;
  align-items: center;
  justify-content: center;
}

.power-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.power-btn :deep(svg) {
  font-size: 20px;
}

.power-btn.on {
  background-color: rgba(0, 180, 255, 0.2);
  color: var(--color-azul);
}

.power-btn.on.active {
  background-color: var(--color-azul);
  color: white;
}

.power-btn.off {
  background-color: rgba(255, 75, 75, 0.2);
  color: var(--color-danger);
}

.power-btn.off.active {
  background-color: var(--color-danger);
  color: white;
}

/* Estilos para el toggle vertical */
.mode-toggle {
  margin-left: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vertical-toggle {
  position: relative;
  width: 50px;
  height: 100px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-toggle);
  border-radius: 30px;
  transition: 0.4s;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 40px;
  width: 45px;
  left: 3px;
  bottom: 5px;
  background-color: #00ffab;
  transition: 0.4s;
  border-radius: 25px;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateY(-50px);
  background-color: #00ffab;
}

.toggle-text {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 0.6rem;
  font-weight: bold;
  transition: all 0.3s;
}

.toggle-text.top {
  top: 15px;
  color: #00ffab;
}

.toggle-text.bottom {
  bottom: 15px;
  color: #00ffab;
}

.fan-icon {
  right: 30px;
  bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fan-container {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fan-icon-main {
  font-size: 120px;
  color: var(--color-muted);
  transition: all 0.5s ease;

  z-index: 2;
}

.fan-icon-main.spinning {
  color: var(--color-primary);
  text-shadow:
    0 0 8px var(--color-primary),
    0 0 15px var(--color-primary);
  animation: spin 0.8s linear infinite;
}

.fan-icon-main:not(.spinning) {
  color: var(--color-primary-dark);
  text-shadow:
    0 0 8px var(--color-primary-dark),
    0 0 15px var(--color-primary-dark);
  animation: none;
}
.fan-ring {
  position: absolute;
  width: 160px;
  height: 160px;
  border: 12px solid var(--color-muted);
  border-radius: 50%;
  z-index: 1;
  transition: all 0.5s ease;
  box-sizing: border-box;
}

.fan-ring.spinning {
  border-color: var(--color-primary);
  box-shadow:
    0 0 5px var(--color-primary),
    inset 0 0 5px var(--color-primary); /* Reduje de 10px a 8px */
  animation:
    spin 0.8s linear infinite,
    pulse-border-blue 1.2s ease-in-out infinite;
}

.fan-ring:not(.spinning) {
  border-color: var(--color-primary-dark);
  box-shadow:
    0 0 5px var(--color-primary-dark),
    inset 0 0 5px var(--color-primary-dark);
  animation: pulse-border-red 1.5s ease-in-out infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Efecto de flotación cuando está estático */
.fan-container:not(.spinning) {
  animation: floatFan 3s ease-in-out infinite;
}

@keyframes floatFan {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .fan-control-container {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 🔹 Ahora solo una columna */
    grid-template-rows: auto auto;
    gap: 20px;
    padding: 10px;
    border-top: 3px solid #00ffab;
  }

  .left-column,
  .right-column {
    justify-content: center;
    align-items: center;
  }

  .fan-container {
    width: 120px; /* 🔹 Más pequeño para pantallas chicas */
    height: 120px;
  }

  .fan-icon-main {
    font-size: 80px; /* 🔹 Reduce el ícono */
  }

  .fan-ring {
    width: 100px;
    height: 100px;
    border: 8px solid var(--color-muted);
  }
}
</style>
