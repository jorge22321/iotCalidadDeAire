<!-- src/components/RegistroForm.vue -->
<template>
  <form class="registro-form" @submit.prevent="handleSubmit">
    <h3 class="registro-form__title">Registro de Usuario</h3>

    <div class="registro-form__grid">
      <!-- Columna 1 -->
      <LoginInput id="nombre" v-model="formData.nombre" placeholder="Nombre" required />
      <LoginInput id="apellido" v-model="formData.apellido" placeholder="Apellido" required />
      <LoginInput id="telefono" v-model="formData.telefono" placeholder="+51 987654321" required />

      <!-- Columna 2 -->
      <LoginInput id="pais" v-model="formData.pais" placeholder="País" required />
      <LoginInput id="provincia" v-model="formData.provincia" placeholder="Provincia" required />
      <LoginInput id="distrito" v-model="formData.distrito" placeholder="Distrito" required />

      <!-- Columna 3 -->
      <LoginInput id="edad" type="number" v-model="formData.edad" placeholder="Edad" required />
      <LoginInput id="dni" v-model="formData.dni" placeholder="Número de DNI" required />
      <LoginInput
        id="usuario"
        v-model="formData.usuario"
        placeholder="Nombre de usuario"
        required
      />

      <!-- Fila completa -->
      <div class="registro-form__correo">
        <LoginInput
          id="correo"
          type="email"
          v-model="formData.correo"
          placeholder="Correo electrónico"
          required
        />
      </div>
    </div>

    <!-- 🪄 Botón dinámico -->
    <button type="submit" class="registro-form__submit" :disabled="isSubmitting || isSubmitted">
      <span v-if="isSubmitting">Enviando...</span>
      <span v-else-if="isSubmitted"> Solicitud enviada</span>
      <span v-else>Solicitar Acceso</span>
    </button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import LoginInput from './forms/LoginInput.vue'

const formData = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  pais: '',
  provincia: '',
  distrito: '',
  edad: '',
  dni: '',
  usuario: '',
  correo: '',
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)

const validateForm = () => {
  return Object.values(formData).every((value) => value.trim() !== '')
}

const handleSubmit = async () => {
  if (!validateForm()) {
    alert('Por favor completa todos los campos correctamente.')
    return
  }

  try {
    isSubmitting.value = true
    const response = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) throw new Error('Error al enviar el registro.')

    const data = await response.json()
    console.log('✅ Respuesta del servidor:', data)

    Object.keys(formData).forEach((key) => (formData[key] = ''))
    // Mostrar mensaje visual
    isSubmitted.value = true
    // ⏱️ Después de 4 segundos vuelve al estado inicial
    setTimeout(() => {
      isSubmitted.value = false
    }, 4000)
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err)
    alert('Hubo un problema al enviar el formulario. Inténtalo de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 🌿 Contenedor elegante */
.registro-form {
  max-width: 950px;
  margin: 2rem auto;
  padding: 2.5rem;
  border-radius: 18px;
  background: var(--color-bg-header);
  box-shadow: 0 0 20px rgba(0, 255, 171, 0.15);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.registro-form:hover {
  box-shadow: 0 0 30px rgba(0, 255, 171, 0.25);
}

/* ✨ Título */
.registro-form__title {
  text-align: center;
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.6rem;
  margin-bottom: 2rem;
  letter-spacing: 0.5px;
}

/* 🧩 Grid 3 columnas con buena respiración */
.registro-form__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.8rem 2rem;
}

/* 📬 Correo ocupa fila completa */
.registro-form__correo {
  grid-column: 1 / 4;
}

/* 🪄 Botón */
.registro-form__submit {
  margin-top: 2.5rem;
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: var(--color-link-hover);
  border: none;
  border-radius: 10px;
  font-weight: 200;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;

  letter-spacing: 0.5px;
  box-shadow: 0 4px 14px rgba(0, 255, 171, 0.25);
}

.registro-form__submit:hover {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 171, 0.35);
}

/* 🕊️ Mensaje de éxito */
.registro-form__success {
  color: #10b981;
  text-align: center;
  margin-top: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
}

/* 📱 Responsive */
@media (max-width: 1024px) {
  .registro-form__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .registro-form__correo {
    grid-column: 1 / 3;
  }
}

@media (max-width: 768px) {
  .registro-form {
    width: 100%;
    padding: 40px;
  }
  .registro-form__grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    margin-top: 120px;
  }
  .registro-form__correo {
    grid-column: 1 / 2;
  }
  .registro-form__title {
    font-size: 1.35rem;
  }
}
</style>
