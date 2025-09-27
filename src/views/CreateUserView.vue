//src/components/modals/ConfirmationModal.vue
<template>
  <div class="create-user-container">
    <!-- Panel principal del formulario -->
    <div class="form-panel">
      <form @submit.prevent="showConfirmationModal" class="user-form">
        <!-- Sección de información básica -->
        <div class="form-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="faUser" />
            Información Básica
          </h3>
          <div class="form-grid">
            <FormField
              id="username"
              v-model="formData.username"
              label="Nombre de Usuario *"
              placeholder="juan.perez"
              :error="errors.username"
              required
            >
              <template #icon><font-awesome-icon :icon="faUserTag" /></template>
            </FormField>

            <FormField
              id="email"
              v-model="formData.email"
              label="Correo Electrónico *"
              type="email"
              placeholder="usuario@empresa.com"
              :error="errors.email"
              required
            >
              <template #icon><font-awesome-icon :icon="faEnvelope" /></template>
            </FormField>
          </div>
        </div>

        <!-- Sección de detalles personales -->
        <div class="form-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="faIdCard" />
            Detalles Personales
          </h3>
          <div class="form-grid">
            <FormField
              id="first_name"
              v-model="formData.first_name"
              label="Nombres"
              placeholder="Juan Carlos"
            >
              <template #icon><font-awesome-icon :icon="faUserEdit" /></template>
            </FormField>

            <FormField
              id="last_name"
              v-model="formData.last_name"
              label="Apellidos"
              placeholder="Pérez López"
            >
              <template #icon><font-awesome-icon :icon="faUserEdit" /></template>
            </FormField>

            <FormField
              id="phone_number"
              v-model="formData.phone_number"
              label="Teléfono"
              placeholder="+51 999 999 999"
              :error="errors.phone_number"
            >
              <template #icon><font-awesome-icon :icon="faPhone" /></template>
            </FormField>

            <FormField
              id="country"
              v-model="formData.country"
              label="País *"
              placeholder="Perú"
              :error="errors.country"
              required
            >
              <template #icon><font-awesome-icon :icon="faGlobeAmericas" /></template>
            </FormField>

            <FormField
              id="province"
              v-model="formData.province"
              label="Provincia"
              placeholder="Lima"
              :error="errors.province"
            >
              <template #icon><font-awesome-icon :icon="faMapMarkerAlt" /></template>
            </FormField>

            <FormField
              id="district"
              v-model="formData.district"
              label="Distrito"
              placeholder="Miraflores"
              :error="errors.district"
            >
              <template #icon><font-awesome-icon :icon="faMapMarkerAlt" /></template>
            </FormField>

            <FormField
              id="age"
              v-model="formData.age"
              label="Edad *"
              type="number"
              placeholder="30"
              :error="errors.age"
              required
            >
              <template #icon><font-awesome-icon :icon="faBirthdayCake" /></template>
            </FormField>

            <FormField
              id="dni"
              v-model="formData.dni"
              label="Número de DNI"
              placeholder="12345678"
              :error="errors.dni"
            >
              <template #icon><font-awesome-icon :icon="faIdCard" /></template>
            </FormField>
          </div>
        </div>

        <!-- Sección de seguridad -->
        <div class="form-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="faShieldAlt" />
            Seguridad y Permisos
          </h3>
          <div class="form-grid">
            <FormField
              id="password"
              v-model="formData.password"
              label="Contraseña *"
              type="password"
              placeholder="••••••••"
              :error="errors.password"
              required
            >
              <template #icon><font-awesome-icon :icon="faLock" /></template>
            </FormField>

            <FormField
              id="password_confirmation"
              v-model="formData.password_confirmation"
              label="Confirmar Contraseña *"
              type="password"
              placeholder="••••••••"
              :error="errors.password_confirmation"
              required
            >
              <template #icon><font-awesome-icon :icon="faLock" /></template>
            </FormField>

            <div class="form-group">
              <label class="form-label">Rol del Usuario *</label>
              <RoleSelector v-model="formData.role_id" />
              <small class="form-hint">Seleccione el nivel de acceso del usuario</small>
            </div>

            <div class="form-group notification-group">
              <label class="form-label">Notificar al usuario</label>
              <label class="switch">
                <input type="checkbox" v-model="formData.send_notification" />
                <span class="slider round"></span>
              </label>
              <small class="form-hint" v-if="formData.send_notification">
                Se enviará un correo con las credenciales al usuario
              </small>
            </div>
          </div>
        </div>

        <!-- Acciones del formulario -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="cancel">
            <font-awesome-icon :icon="faTimes" />
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            <font-awesome-icon :icon="faSave" />
            Guardar Usuario
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de confirmación -->
    <ConfirmationModal
      v-if="showModal"
      :show="showModal"
      title="Confirmar creación de usuario"
      :message="confirmationMessage"
      @confirm="handleSubmit"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUser,
  faUserTag,
  faEnvelope,
  faIdCard,
  faUserEdit,
  faPhone,
  faGlobeAmericas,
  faMapMarkerAlt,
  faBirthdayCake,
  faShieldAlt,
  faLock,
  faSave,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import FormField from '@/components/forms/FormField.vue'
import RoleSelector from '@/components/forms/RoleSelector.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

const router = useRouter()
const showModal = ref(false)

// Datos del formulario
const formData = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  country: '',
  province: '',
  district: '',
  age: '',
  dni: '',
  password: '',
  password_confirmation: '',
  role_id: null,
  send_notification: false,
})

// Errores de validación
const errors = ref({})

// Mensaje de confirmación dinámico
const confirmationMessage = computed(() => {
  return `¿Estás seguro de crear el usuario ${formData.value.username}?`
})

// Mostrar modal de confirmación
const showConfirmationModal = () => {
  if (validateForm()) {
    showModal.value = true
  }
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
}

// Validar formulario
const validateForm = () => {
  errors.value = {}
  let isValid = true

  // Validaciones básicas
  if (!formData.value.username) {
    errors.value.username = 'El nombre de usuario es requerido'
    isValid = false
  }

  if (!formData.value.email) {
    errors.value.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    errors.value.email = 'El correo electrónico no es válido'
    isValid = false
  }

  if (!formData.value.password) {
    errors.value.password = 'La contraseña es requerida'
    isValid = false
  } else if (formData.value.password.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  if (formData.value.password !== formData.value.password_confirmation) {
    errors.value.password_confirmation = 'Las contraseñas no coinciden'
    isValid = false
  }

  if (!formData.value.role_id) {
    errors.value.role_id = 'Debe seleccionar un rol'
    isValid = false
  }

  return isValid
}

// Enviar formulario
const handleSubmit = async () => {
  try {
    // Mostrar loading (puedes implementar esto)
    // loading.value = true

    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(formData.value),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al crear usuario')
    }

    const data = await response.json()
    console.log('Usuario creado:', data)

    // Cerrar modal
    closeModal()

    // Mostrar notificación de éxito (puedes implementar esto)
    alert('Usuario creado con éxito')

    // Redirigir o resetear el formulario
    // resetForm()
    router.push('/app/devices') // Redirige a la lista de dispositivos
  } catch (error) {
    console.error('Error al crear usuario:', error)
    errors.value.general = error.message
  } finally {
    // loading.value = false
  }
}

// Cancelar y volver atrás
const cancel = () => {
  router.go(-1)
}

// Resetear formulario (opcional)
const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    country: '',
    province: '',
    district: '',
    age: '',
    dni: '',
    password: '',
    password_confirmation: '',
    role_id: null,
    send_notification: false,
  }
  errors.value = {}
}
</script>

<style scoped>
.create-user-container {
  padding: 20px;
  height: 100%;
  background: var(--color-bg-gradient-end);
  color: var(--color-text-main);
  overflow-y: auto;
}

.page-header {
  margin-bottom: 25px;
  border-bottom: 1px solid var(--color-primary-dark);
  padding-bottom: 15px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  margin-bottom: 10px;
  color: var(--color-text-secondary);
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--color-primary-dark);
}

.breadcrumb-current {
  color: var(--color-text-secondary);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  color: var(--color-accent);
}

.form-panel {
  background: var(--color-bg-header);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--color-primary-dark);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-section {
  padding-bottom: 20px;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-primary);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  margin-top: -1.6px;
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-primary);
}

.form-hint {
  display: block;
  margin-top: 5px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.permission-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  padding-left: 25px;
}

.permission-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  border-radius: 4px;
}

.permission-option:hover input ~ .checkmark {
  border-color: var(--color-primary);
}

.permission-option input:checked ~ .checkmark {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.permission-option input:checked ~ .checkmark:after {
  display: block;
}

.permission-option .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid var(--color-bg-header);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.radio-group {
  display: flex;
  gap: 15px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  padding-left: 25px;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radiomark {
  position: absolute;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  border-radius: 50%;
}

.radio-option:hover input ~ .radiomark {
  border-color: var(--color-primary);
}

.radio-option input:checked ~ .radiomark {
  border-color: var(--color-accent);
}

.radiomark:after {
  content: '';
  position: absolute;
  display: none;
}

.radio-option input:checked ~ .radiomark:after {
  display: block;
}

.radio-option .radiomark:after {
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-primary-dark);
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: var(--color-bg-header);
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--color-accent);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--color-accent);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--color-primary-dark);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary-dark);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--color-primary);
}

.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-bg-header);
  font-weight: 600;
}

.btn-primary:hover {
  background-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 224, 255, 0.3);
}

.notification-group {
  margin-top: -40px;
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
    gap: 10px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
