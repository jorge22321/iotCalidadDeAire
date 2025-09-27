<!-- src/components/ConfirmModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="confirm-modal">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-modal" @click="closeModal" aria-label="Cerrar modal">
          <font-awesome-icon :icon="faXmark" />
        </button>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">Cancelar</button>
          <button class="delete-confirm-btn" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirmar Eliminación',
  },
  message: String,
})

const emit = defineEmits(['close', 'confirm'])

const closeModal = () => emit('close')
const confirmDelete = () => emit('confirm')
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: linear-gradient(to bottom right, var(--color-bg-header), var(--color-bg-card));
  border: 1px solid var(--color-primary);
  box-shadow: 0 8px 32px var(--color-shadow);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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

.close-modal {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-modal:hover {
  color: var(--color-primary);
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin-bottom: 20px;
  color: var(--color-text-main);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.delete-confirm-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-text-secondary);
}

.cancel-btn:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

.delete-confirm-btn {
  background: linear-gradient(90deg, #f44336 0%, #ff5252 100%);
  border: none;
  color: white;
}

.delete-confirm-btn:hover {
  background: linear-gradient(90deg, #ff5252 0%, #f44336 100%);
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}
</style>
