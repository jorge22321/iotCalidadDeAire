<template>
  <div class="user-create">
    <div class="user-create__panel">
      <form @submit.prevent="showConfirmationModal" class="user-create__form">
        <div class="user-create__section">
          <h3 class="user-create__section-title">
            <font-awesome-icon :icon="faUser" />
            Información Básica
          </h3>
          <div class="user-create__grid">
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

        <div class="user-create__section">
          <h3 class="user-create__section-title">
            <font-awesome-icon :icon="faIdCard" />
            Detalles Personales
          </h3>
          <div class="user-create__grid">
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

        <div class="user-create__section">
          <h3 class="user-create__section-title">
            <font-awesome-icon :icon="faShieldAlt" />
            Seguridad y Permisos
          </h3>
          <div class="user-create__grid">
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

            <div class="user-create__group">
              <label class="user-create__label">Rol del Usuario *</label>
              <RoleSelector v-model="formData.role_id" />
              <small class="user-create__hint">Seleccione el nivel de acceso del usuario</small>
            </div>

            <div class="user-create__group user-create__group--notification">
              <label class="user-create__label">Notificar al usuario</label>
              <label class="user-create__switch">
                <input type="checkbox" v-model="formData.send_notification" />
                <span class="user-create__slider user-create__slider--round"></span>
              </label>
              <small class="user-create__hint" v-if="formData.send_notification">
                Se enviará un correo con las credenciales al usuario
              </small>
            </div>
          </div>
        </div>

        <div class="user-create__actions">
          <button
            type="button"
            class="user-create__btn user-create__btn--secondary"
            @click="cancel"
          >
            <font-awesome-icon :icon="faTimes" />
            Cancelar
          </button>
          <button type="submit" class="user-create__btn user-create__btn--primary">
            <font-awesome-icon :icon="faSave" />
            Guardar Usuario
          </button>
        </div>
      </form>
    </div>

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
.user-create {
  padding: 10px; /* ✅ Aumentado para dar más aire exterior */
  height: 100%;
  background: var(--color-bg-gradient-end);
  color: var(--color-text-main);
  overflow-y: auto;
}

.user-create__panel {
  background: var(--color-bg-header);
  border-radius: 8px;
  padding: 10px; /* ✅ Aumentado para dar más aire interior */
  border: 1px solid var(--color-primary-dark);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* ✅ CAMBIO: Espaciado entre secciones reducido */
.user-create__section {
  padding-bottom: 15px;
}

.user-create__section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* ✅ CAMBIO: Título de sección más pequeño y con menos margen */
.user-create__section-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ✅ CAMBIO CLAVE: Grid más compacto */
.user-create__grid {
  display: grid;
  /* El ancho mínimo ahora es más pequeño, permite más columnas */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px; /* Espacio entre campos reducido */
}

.user-create__group {
  margin-top: -1.6px;
  margin-bottom: 15px;
}

.user-create__group--notification {
  /* Ajustado para el nuevo tamaño del switch */
  margin-top: -36px;
}

/* ✅ CAMBIO: Etiqueta de campo más pequeña */
.user-create__label {
  display: block;
  margin-bottom: 6px; /* Reducido */
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-primary);
}

/* ✅ CAMBIO: Texto de ayuda más pequeño */
.user-create__hint {
  display: block;
  margin-top: 0px; /* Reducido */
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.user-create__permissions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.user-create__option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  padding-left: 25px;
}

.user-create__option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.user-create__checkmark {
  position: absolute;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  border-radius: 4px;
}

.user-create__option:hover input ~ .user-create__checkmark {
  border-color: var(--color-primary);
}

.user-create__option input:checked ~ .user-create__checkmark {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.user-create__checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.user-create__option input:checked ~ .user-create__checkmark:after {
  display: block;
}

.user-create__checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid var(--color-bg-header);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.user-create__radio-group {
  display: flex;
  gap: 15px;
}

.user-create__radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  padding-left: 25px;
}

.user-create__radio-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.user-create__radiomark {
  position: absolute;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  border-radius: 50%;
}

.user-create__radio-option:hover input ~ .user-create__radiomark {
  border-color: var(--color-primary);
}

.user-create__radio-option input:checked ~ .user-create__radiomark {
  border-color: var(--color-accent);
}

.user-create__radiomark:after {
  content: '';
  position: absolute;
  display: none;
}

.user-create__radio-option input:checked ~ .user-create__radiomark:after {
  display: block;
}

.user-create__radiomark:after {
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
}

/* ✅ CAMBIO: Switch más pequeño */
.user-create__switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.user-create__switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.user-create__slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-primary-dark);
  transition: 0.4s;
}

.user-create__slider:before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 4px;
  bottom: 4px;
  background-color: var(--color-bg-header);
  transition: 0.4s;
}

.user-create__switch input:checked + .user-create__slider {
  background-color: var(--color-accent);
}

.user-create__switch input:focus + .user-create__slider {
  box-shadow: 0 0 1px var(--color-accent);
}

.user-create__switch input:checked + .user-create__slider:before {
  transform: translateX(22px);
}

.user-create__slider--round {
  border-radius: 22px;
}

.user-create__slider--round:before {
  border-radius: 50%;
}

/* ✅ CAMBIO: Espaciado de acciones reducido */
.user-create__actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 0px;
  padding-top: 10px;
  border-top: 1px solid var(--color-primary-dark);
}

/* ✅ CAMBIO: Botones más pequeños (padding y font-size) */
.user-create__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.user-create__btn--secondary {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary-dark);
}

.user-create__btn--secondary:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--color-primary);
}

.user-create__btn--primary {
  background-color: var(--color-accent);
  color: var(--color-bg-header);
  font-weight: 600;
}

.user-create__btn--primary:hover {
  background-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 224, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .user-create__grid {
    grid-template-columns: 1fr;
  }
  .user-create__panel {
    padding: 15px;
  }
  .user-create__permissions {
    grid-template-columns: 1fr;
  }
  .user-create__radio-group {
    flex-direction: column;
    gap: 10px;
  }
  .user-create__actions {
    flex-direction: column-reverse;
  }
  .user-create__btn {
    width: 100%;
  }
}
</style>
