<template>
  <div v-if="show" class="modal" @click.self="closeModal">
    <div class="modal__container modal__container--edit">
      <div class="modal__header">
        <h3 class="modal__title">
          {{ editing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h3>
        <button class="modal__close" @click="closeModal" aria-label="Cerrar modal">
          <font-awesome-icon :icon="faXmark" />
        </button>
      </div>

      <div class="modal__body">
        <form @submit.prevent="handleSubmit" class="modal__form">
          <div class="modal__form-group">
            <label for="role" class="modal__label">Rol</label>
            <select id="role" v-model="formData.role" required class="modal__input">
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="guest">Invitado</option>
            </select>
          </div>

          <div v-if="!editing" class="modal__form-group">
            <label for="password" class="modal__label">Contraseña</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              :required="!editing"
              class="modal__input"
            />
          </div>

          <div class="modal__actions">
            <button type="button" class="modal__btn modal__btn--secondary" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="modal__btn modal__btn--primary">
              {{ editing ? 'Guardar Cambios' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  show: Boolean,
  userData: Object,
  editing: Boolean,
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  id: null,
  name: '',
  email: '',
  role: 'user',

  password: '',
})

watch(
  () => props.userData,
  (newVal) => {
    if (newVal) {
      formData.value = {
        id: newVal.id,
        name: newVal.name,
        email: newVal.email,
        role: newVal.role,

        password: '',
      }
    }
  },
  { immediate: true },
)

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', formData.value)
}
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
}

/* Header */
.modal__header {
  padding: 20px;
  border-bottom: 1px solid var(--color-primary-dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal__title {
  color: var(--color-primary);
  margin: 0;
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
  padding: 20px;
}

/* Form */
.modal__form-group {
  margin-bottom: 20px;
}

.modal__label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.modal__input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
  transition: all 0.3s ease;
}

.modal__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* Actions */
.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Botones */
.modal__btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Cancelar */
.modal__btn--secondary {
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-text-secondary);
}

.modal__btn--secondary:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

/* Guardar */
.modal__btn--primary {
  background: linear-gradient(90deg, var(--color-primary) 0%, #4a90e2 100%);
  border: none;
  color: white;
}

.modal__btn--primary:hover {
  background: linear-gradient(90deg, #4a90e2 0%, var(--color-primary) 100%);
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
}
</style>
