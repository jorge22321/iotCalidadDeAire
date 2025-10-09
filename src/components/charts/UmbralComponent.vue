<!-- src/components/charts/UmbralComponent.vue -->
<template>
  <div class="umbral">
    <div class="umbral__content">
      <div class="umbral__item" v-for="(item, index) in umbrales" :key="index">
        <div class="umbral__header">
          <span class="umbral__label">{{ item.label }}</span>
          <div class="umbral__display">
            {{ item.value }}
            <span class="umbral__unit">{{ item.unit }}</span>
          </div>
        </div>

        <div class="umbral__controls">
          <button @click="adjustValue(index, -1)" class="umbral__btn umbral__btn--minus">
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
              <path d="M0 1H12" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>

          <input type="number" v-model.number="item.tempValue" class="umbral__input" />

          <button @click="adjustValue(index, 1)" class="umbral__btn umbral__btn--plus">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M1 6H11M6 1V11" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div
          class="umbral__progress"
          :style="{ width: calculatePercentage(item) + '%', backgroundColor: item.color }"
        ></div>
      </div>

      <button @click="saveAllThresholds" class="umbral__save">Guardar Umbrales</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'UmbralComponent',
  setup() {
    const umbrales = ref([
      {
        label: 'CO2 Máx',
        value: 800,
        tempValue: 800,
        unit: 'ppm',
        max: 2000,
        min: 300,
        color: 'var(--color-accent)',
      },
      {
        label: 'Temp Máx',
        value: 30,
        tempValue: 30,
        unit: '°C',
        max: 50,
        min: 10,
        color: 'var(--color-accent)',
      },
    ])

    let ws = null
    let reconnectInterval = null

    // Conectar al WebSocket
    const connectWebSocket = () => {
      const wsUrl = `ws://${window.location.host}`
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('🔌 Conectado al WebSocket para umbrales')
        clearInterval(reconnectInterval)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'thresholds') {
            // Actualizar valores cuando lleguen del servidor
            umbrales.value[0].value = data.co2
            umbrales.value[0].tempValue = data.co2
            umbrales.value[1].value = data.temperatura
            umbrales.value[1].tempValue = data.temperatura
          }
        } catch (error) {
          console.error('Error procesando mensaje WS:', error)
        }
      }

      ws.onclose = () => {
        console.warn('Conexión WS cerrada, reconectando...')
        reconnectInterval = setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error)
        ws.close()
      }
    }

    onMounted(() => {
      // Obtener valores iniciales
      fetch('/api/umbrales')
        .then((response) => response.json())
        .then((data) => {
          if (data.co2 !== undefined && data.temperatura !== undefined) {
            umbrales.value[0].value = data.co2
            umbrales.value[0].tempValue = data.co2
            umbrales.value[1].value = data.temperatura
            umbrales.value[1].tempValue = data.temperatura
          }
        })
        .catch((error) => console.error('Error obteniendo umbrales:', error))

      // Conectar al WebSocket
      connectWebSocket()
    })

    onUnmounted(() => {
      if (ws) ws.close()
      clearInterval(reconnectInterval)
    })

    const calculatePercentage = (item) => {
      return ((item.value - item.min) / (item.max - item.min)) * 100
    }

    const adjustValue = (index, amount) => {
      const newValue = umbrales.value[index].tempValue + amount
      if (newValue >= umbrales.value[index].min && newValue <= umbrales.value[index].max) {
        umbrales.value[index].tempValue = newValue
      }
    }

    const saveAllThresholds = async () => {
      // Actualizar valores visuales
      umbrales.value.forEach((item) => {
        item.value = item.tempValue
      })

      try {
        const response = await fetch('/api/umbrales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            co2: umbrales.value[0].value,
            temperatura: umbrales.value[1].value,
          }),
        })

        if (!response.ok) throw new Error('Error al guardar umbrales')

        const data = await response.json()
        console.log('Umbrales guardados:', data)

        // El servidor se encargará de broadcastear a todos los clientes
      } catch (error) {
        console.error('Error:', error)
      }
    }

    return {
      umbrales,
      calculatePercentage,
      adjustValue,
      saveAllThresholds,
    }
  },
}
</script>
<style scoped>
.umbral {
  background: var(--color-bg-header);
  border-radius: 14px;
  padding: 12px;
  border-top: 3px solid var(--color-primary-dark);
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-width: 190px;
  display: flex;
  flex-direction: column;
}

.umbral::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--color-shadow) 0%, transparent 70%);
  z-index: 0;
}

.umbral__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
  height: 100%;
}

.umbral__item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 10px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
  height: 100px;
  width: 100%;
}

.umbral__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -10px;
  margin-bottom: 16px;
}

.umbral__label {
  font-size: 0.7rem;
  color: var(--color-primary);
  font-weight: 500;
}

.umbral__display {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-primary-dark);
}

.umbral__unit {
  font-size: 0.8rem;
  color: var(--color-primary);
  margin-left: 2px;
}

.umbral__controls {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin: -10px;
}

.umbral__input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-primary-dark);
  border-radius: 6px;
  color: white;
  padding: 5px 8px;
  text-align: center;
  flex-grow: 1;
  max-width: 70px;
  font-size: 0.75rem;
}

.umbral__input:focus {
  outline: none;
}

.umbral__btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  border: none;
  background: var(--color-primary-dark);
  border: 1px solid var(--color-primary);
}

.umbral__btn:hover {
  background: var(--color-primary);
  transform: scale(1.1);
}

.umbral__btn:active {
  transform: scale(0.95);
}

.umbral__btn svg {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
}

.umbral__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 0 0 10px 10px;
  transition: width 0.5s ease;
}

.umbral__save {
  background: var(--color-primary-dark);
  border: 1px solid var(--color-primary-dark);
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  margin-top: auto;
}

.umbral__save:hover {
  background: var(--color-primary);
  transform: scale(1.02);
}

/* --- Responsive --- */
@media (max-width: 1200px) {
  .umbral {
    min-width: 160px;
  }

  .umbral__item {
    height: 90px;
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .umbral {
    width: 100%;
    height: auto;
    min-height: 220px;
  }

  .umbral__content {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .umbral__item {
    width: calc(50% - 5px);
    height: 100px;
  }

  .umbral__save {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
