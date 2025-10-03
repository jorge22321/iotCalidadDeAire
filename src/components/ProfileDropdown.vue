<!-- src/components/ProfileDropdown.vue -->
<template>
  <div class="profile-dropdown">
    <div class="profile-dropdown__trigger" @click="toggleDropdown">
      <span class="profile-dropdown__username">{{ username }}</span>
      <img :src="avatar" alt="User Avatar" class="profile-dropdown__avatar" />
      <span class="profile-dropdown__icon">▼</span>
    </div>

    <div v-if="isOpen" class="profile-dropdown__menu">
      <div class="profile-dropdown__item" @click="navigateToProfile">
        <span>Mi perfil</span>
      </div>
      <div class="profile-dropdown__item" @click="navigateToSettings">
        <span>Configuración</span>
      </div>
      <div class="profile-dropdown__divider"></div>
      <div class="profile-dropdown__item profile-dropdown__item--logout" @click="logout">
        <span>Cerrar sesión</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  username: {
    type: String,
    default: 'Usuario',
  },
  avatar: {
    type: String,
    default: '@/assets/default-avatar.png', // Asegúrate de tener esta imagen o cambia la ruta
  },
})

const router = useRouter()
const isOpen = ref(false)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function navigateToProfile() {
  router.push('/profile')
  isOpen.value = false
}

function navigateToSettings() {
  router.push('/settings')
  isOpen.value = false
}

function logout() {
  localStorage.removeItem('authToken')
  router.push('/')
}
</script>

<style scoped>
.profile-dropdown {
  position: relative;
  display: inline-block;
}

/* Trigger principal */
.profile-dropdown__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: var(--color-bg-header);
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-dropdown__trigger:hover {
  background: var(--color-primary-dark);
}

/* Nombre de usuario */
.profile-dropdown__username {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-primary);
}

/* Avatar */
.profile-dropdown__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-accent);
}

/* Flecha */
.profile-dropdown__icon {
  font-size: 10px;
  color: var(--color-primary);
  margin-left: 4px;
}

/* Menú desplegable */
.profile-dropdown__menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  min-width: 200px;
  background: var(--color-bg-header);
  border-radius: 10px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid var(--color-primary-dark);
  animation: fadeIn 0.25s ease;
  z-index: 1000;
}

/* Items */
.profile-dropdown__item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.profile-dropdown__item:hover {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

/* Item logout */
.profile-dropdown__item--logout:hover {
  background: #ff4444;
  color: #fff;
}

/* Separador */
.profile-dropdown__divider {
  height: 1px;
  background: var(--color-primary-dark);
  margin: 4px 0;
}

/* Animación de aparición */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
