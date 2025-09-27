<!-- src/components/modals/ConfirmationModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="close" class="modal-close-btn" aria-label="Cerrar modal">
          <slot name="close-icon">
            <font-awesome-icon :icon="faTimes" />
          </slot>
        </button>
      </div>
      <div class="modal-body">
        <slot name="body">
          <p>{{ message }}</p>
        </slot>
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button @click="close" class="btn btn-secondary">Cancelar</button>
          <button @click="confirm" class="btn btn-primary">Confirmar</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Estás seguro de realizar esta acción?' },
})

const emit = defineEmits(['confirm', 'close'])

const close = () => emit('close')
const confirm = () => emit('confirm')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: linear-gradient(to bottom right, var(--color-bg-header), var(--color-bg-card));
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px var(--color-shadow);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-primary-dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
  padding: 0.25rem;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: var(--color-text-main);
}

.modal-body {
  padding: 1.5rem;
  color: var(--color-text-main);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn.btn-secondary,
.btn.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.btn-secondary {
  background: linear-gradient(90deg, #f44336 0%, #ff5252 100%);
  border: none;
  color: white;
}

.btn.btn-secondary:hover {
  background: linear-gradient(90deg, #ff5252 0%, #f44336 100%);
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

.btn.btn-primary {
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-text-secondary);
}

.btn.btn-primary:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}
</style>
