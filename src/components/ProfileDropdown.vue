<!-- src/components/ProfileDropdown.vue -->
<template>
  <div class="profile-dropdown">
    <div class="profile-trigger" @click="toggleDropdown">
      <span class="username">{{ username }}</span>
      <img :src="avatar" alt="User Avatar" class="avatar" />
      <span class="dropdown-icon">▼</span>
    </div>

    <div v-if="isOpen" class="dropdown-menu">
      <div class="dropdown-item" @click="navigateToProfile">
        <span>Mi perfil</span>
      </div>
      <div class="dropdown-item" @click="navigateToSettings">
        <span>Configuración</span>
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-item logout" @click="logout">
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

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: var(--color-bg-header);
  cursor: pointer;
  transition: all 0.3s ease;
}

.username {
  font-weight: 600;
  color: var(--color-primary);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-accent);
}

.dropdown-icon {
  font-size: 10px;
  color: var(--color-primary);
  margin-left: 4px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  min-width: 200px;
  background-color: var(--color-bg-header);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid var(--color-primary-dark);
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: var(--color-primary-dark);
  color: var(--color-text-main);
}

.dropdown-item.logout:hover {
  background-color: #ff4444;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-primary-dark);
  margin: 4px 0;
}
</style>
