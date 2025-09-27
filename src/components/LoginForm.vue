<!-- src/components/LoginForm.vue -->
<template>
  <form class="login-form" @submit.prevent="login">
    <div v-if="error" class="error-message">{{ error }}</div>
    <h2>Iniciar sesión</h2>
    <div class="form-group">
      <input v-model="usuario" required autocomplete="username" placeholder="Usuario" />
    </div>
    <div class="form-group">
      <input
        type="password"
        v-model="contrasena"
        required
        autocomplete="current-password"
        placeholder="Contraseña"
      />
    </div>
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Iniciando...' : 'Entrar' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Importa el store de autenticación

const authStore = useAuthStore() // Crea la instancia del store
const router = useRouter()

const usuario = ref('')
const contrasena = ref('')
const error = ref(null)
const isLoading = ref(false)

async function login() {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usuario.value,
        password: contrasena.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud')
    }

    localStorage.setItem('authToken', data.token)
    localStorage.setItem('username', data.user?.name || usuario.value)

    // Guarda el rol del usuario en el store y localStorage
    const userRole = data.user?.role || 'guest'
    authStore.setUserRole(userRole)
    localStorage.setItem('userRole', userRole)

    // Redirige al dashboard
    router.push('/app')
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
    console.error('Error en login:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.error-message {
  background-color: #ffdddd;
  border: 1px solid #f44336;
  color: #f44336;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}
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
.login-form h2 {
  color: var(--color-primary);
  margin-bottom: 33px;
  text-align: center;
  font-weight: 700;
  font-size: 1.6rem;
}
.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.form-group input {
  padding: 8px 12px;
  border-bottom: 2px solid var(--color-primary-dark);
  border-left: none;
  border-top: none;
  border-right: none;
  font-size: 0.8rem;

  background: var(--color-bg-header);
  color: var(--color-primary);
  transition:
    border-bottom-color 0.2s,
    box-shadow 0.2s;
  font-weight: 700;
}
.form-group input:focus {
  border-bottom-color: var(--color-primary);
  outline: none;
  color: var(--color-primary);
  font-weight: 700;
}
.form-group input::placeholder {
  color: var(--color-primary);
  opacity: 1;

  font-weight: 700;
}

button[type='submit'] {
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: var(--color-link-hover);
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;

  transition:
    background 0.2s,
    box-shadow 0.2s;
}
button[type='submit']:disabled {
  background: #ccc;
  cursor: not-allowed;
}
button[type='submit']:hover:not(:disabled) {
  transition:
    background 0.2s,
    box-shadow 0.2s;
}
button[type='submit']:hover {
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%);
  box-shadow: 0 0 16px var(--color-accent);
}
</style>
