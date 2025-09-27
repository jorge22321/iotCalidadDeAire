<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="edit-modal">
      <div class="modal-header">
        <h3>{{ editing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
        <button class="close-modal" @click="closeModal" aria-label="Cerrar modal">
          <font-awesome-icon :icon="faXmark" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="role">Rol</label>
            <select id="role" v-model="formData.role" required class="form-input">
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="guest">Invitado</option>
            </select>
          </div>

          <div v-if="!editing" class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              :required="!editing"
              class="form-input"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">Cancelar</button>
            <button type="submit" class="save-btn">
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
.edit-modal {
  background: linear-gradient(to bottom right, var(--color-bg-header), var(--color-bg-card));
  border: 1px solid var(--color-primary);
  box-shadow: 0 8px 32px var(--color-shadow);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--color-primary) 0%, #4a90e2 100%);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: linear-gradient(90deg, #4a90e2 0%, var(--color-primary) 100%);
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
}
</style>
