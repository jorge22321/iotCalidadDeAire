<template>
  <div class="password-reset-container">
    <div class="form-wrapper">
      <h2>Establecer tu Contraseña</h2>
      <p v-if="!token">Token no válido o ausente.</p>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="currentPassword">Contraseña Temporal (enviada a tu correo)</label>
          <input type="password" v-model="form.currentPassword" required />
        </div>
        <div class="form-group">
          <label for="newPassword">Nueva Contraseña</label>
          <input type="password" v-model="form.newPassword" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Nueva Contraseña</label>
          <input type="password" v-model="form.confirmPassword" required />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Actualizando...' : 'Aceptar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const token = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

onMounted(() => {
  token.value = route.query.token || null
})

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (form.newPassword !== form.confirmPassword) {
    error.value = 'Las nuevas contraseñas no coinciden.'
    return
  }

  loading.value = true

  try {
    const res = await fetch('http://localhost:3000/api/users/set-initial-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Error al actualizar la contraseña.')
    }

    success.value = '¡Contraseña actualizada! Serás redirigido en 3 segundos.'
    setTimeout(() => {
      router.push('/') // Redirige a la vista de presentación/login
    }, 3000)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw;
  background-color: #1a1a2e;
}
.form-wrapper {
  background: #16213e;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 400px;
  color: #e0e0e0;
}
h2 {
  color: #00ffab;
  text-align: center;
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
input {
  width: 100%;
  padding: 10px;
  background-color: #1a1a2e;
  border: 1px solid #0f3460;
  border-radius: 5px;
  color: #e0e0e0;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #00ffab;
  border: none;
  border-radius: 5px;
  color: #16213e;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #00e699;
}
.error-message {
  color: #ff4d4d;
  margin-bottom: 1rem;
  text-align: center;
}
.success-message {
  color: #00ffab;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
