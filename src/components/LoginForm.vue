<!-- src/components/LoginForm.vue -->
<template>
  <form class="login-form" @submit.prevent="login">
    <div v-if="error" class="login-form__error">{{ error }}</div>
    <h3 class="login-form__title">Iniciar sesión</h3>

    <!-- Reutilizamos el nuevo componente -->
    <LoginInput
      id="usuario"
      v-model="usuario"
      placeholder="Usuario"
      autocomplete="username"
      required
    />

    <LoginInput
      id="contrasena"
      v-model="contrasena"
      type="password"
      placeholder="Contraseña"
      autocomplete="current-password"
      required
    />

    <button type="submit" class="login-form__button" :disabled="isLoading">
      {{ isLoading ? 'Iniciando...' : 'Entrar' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { getApiUrl } from '@/services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginInput from './forms/LoginInput.vue'

const authStore = useAuthStore()
const router = useRouter()

const usuario = ref('')
const contrasena = ref('')
const error = ref(null)
const isLoading = ref(false)

async function login() {
  isLoading.value = true
  error.value = null
  try {
    const response = await fetch(`${getApiUrl()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usuario.value,
        password: contrasena.value,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Error en la solicitud')

    localStorage.setItem('authToken', data.token)
    localStorage.setItem('username', data.user?.name || usuario.value)
    const userRole = data.user?.role || 'guest'
    authStore.setUserRole(userRole)
    localStorage.setItem('userRole', userRole)
    router.push('/app')
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  background: var(--color-bg-header);
  border-radius: 18px;
  box-shadow: 0 0 10px var(--color-primary);
  padding: 32px 28px;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.login-form__title {
  color: var(--color-primary);
  margin-bottom: 33px;
  text-align: center;
  font-weight: 700;
  font-size: 1.6rem;
}

.login-form__error {
  background-color: #ffdddd;
  border: 1px solid #f44336;
  color: #f44336;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.login-form__button {
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: var(--color-link-hover);
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;
  transition: all 0.2s ease;
}

.login-form__button:hover:not(:disabled) {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%);
  box-shadow: 0 0 16px var(--color-accent);
}

.login-form__button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
