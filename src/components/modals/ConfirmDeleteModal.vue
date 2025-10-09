<template>
  <div v-if="show" class="modal" @click.self="closeModal">
    <div class="modal__container modal__container--confirm">
      <div class="modal__header">
        <h4 class="modal__title">{{ title }}</h4>
        <button class="modal__close" @click="closeModal" aria-label="Cerrar modal">
          <font-awesome-icon :icon="faXmark" />
        </button>
      </div>
      <div class="modal__body">
        <p class="modal__message">{{ message }}</p>
        <div class="modal__actions">
          <button class="modal__btn modal__btn--secondary" @click="closeModal">Cancelar</button>
          <button class="modal__btn modal__btn--danger" @click="confirmDelete">Eliminar</button>
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
/* Overlay */
.modal {
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

/* Container */
.modal__container {
  background: linear-gradient(to bottom right, var(--color-bg-header), var(--color-bg-card));
  border: 1px solid var(--color-primary);
  box-shadow: 0 8px 32px var(--color-shadow);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Header */
.modal__header {
  padding: 10px 20px 10px 20px;
  border-bottom: 1px solid var(--color-primary-dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal__title {
  color: var(--color-primary);
  margin: 0;
  font-weight: 600;
}

.modal__close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal__close:hover {
  color: var(--color-primary);
}

/* Body */
.modal__body {
  padding: 12px 20px 12px 20px;
}

.modal__message {
  margin-bottom: 15px;
  color: var(--color-text-main);
  font-size: 0.8rem;
}

/* Actions */
.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Botones */
.modal__btn {
  padding: 7px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Botón cancelar */
.modal__btn--secondary {
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-text-secondary);
}

.modal__btn--secondary:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

/* Botón eliminar */
.modal__btn--danger {
  background: linear-gradient(90deg, #f44336 0%, #ff5252 100%);
  border: none;
  color: white;
}

.modal__btn--danger:hover {
  background: linear-gradient(90deg, #ff5252 0%, #f44336 100%);
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}
</style>
