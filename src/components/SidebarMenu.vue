<!-- src/components/SidebarMenu.vue -->
<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="top-container" :class="{ collapsed: isCollapsed }">
      <div class="logo-container" :class="{ collapsed: isCollapsed }">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span v-if="!isCollapsed" class="app-name">IoT-App</span>
      </div>
      <button class="menu-toggle" :class="{ collapsed: isCollapsed }" @click="toggleCollapse">
        ☰
      </button>
    </div>

    <nav class="menu">
      <div
        v-for="item in filteredMenuItems"
        :key="item.name"
        class="menu-item"
        @mouseover="hoverItem = item.name"
        @mouseleave="hoverItem = null"
      >
        <router-link :to="item.path" @click="handleMenuClick">
          <span class="icon">
            <font-awesome-icon :icon="item.icon" />
          </span>
          <transition name="fade">
            <span class="text" v-if="!isCollapsed">{{ item.name }}</span>
          </transition>
          <span class="tooltip" v-if="isCollapsed && hoverItem === item.name">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChartLine, // Icono para Dashboard
  faMobileScreen, // Icono para Dispositivos
  faUserPlus,
  faGear, // Icono para Configuración
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const isCollapsed = ref(sidebarStore.isCollapsed)
const hoverItem = ref(null)

const menuItems = [
  { name: 'Dashboard', path: '/app', icon: faChartLine, roles: ['admin', 'user', 'guest'] },
  { name: 'Users', path: '/app/devices', icon: faUsers, roles: ['admin'] },
  { name: 'Management', path: '/app/users/create', icon: faUserPlus, roles: ['admin'] },
  { name: 'Profile', path: '/app/settings', icon: faGear, roles: ['admin', 'user'] },
]
const filteredMenuItems = computed(() => {
  const userRole = authStore.userRole || 'guest'
  return menuItems.filter((item) => item.roles.includes(userRole))
})

watch(
  () => sidebarStore.isCollapsed,
  (val) => (isCollapsed.value = val),
)

function toggleCollapse() {
  sidebarStore.toggleCollapse()
}
function handleMenuClick() {
  if (window.innerWidth <= 768) {
    sidebarStore.isCollapsed = true
    isCollapsed.value = true
  }
}
onMounted(() => {
  authStore.fetchUserRole()
})
</script>

<style scoped>
/* TODOS LOS ESTILOS SE MANTIENEN EXACTAMENTE IGUAL */
.sidebar {
  width: 200px;
  height: 100%;
  background: var(--color-bg-header);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
  transition: width 0.3s ease;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 60px;
}

.top-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  transition: all 0.3s ease;
}

.top-container.collapsed {
  flex-direction: column;
  justify-content: center;
  gap: 15px;
  padding: 10px 0;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
  margin: 0;
}

.menu-toggle:hover {
  color: var(--color-accent);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.logo-container.collapsed {
  flex-direction: column;
  gap: 5px;
  margin: 0;
}
.top-container:not(.collapsed) .menu-toggle {
  margin-left: auto;
}

.logo {
  width: 30px;
  height: 30px;
  min-width: 30px;
  margin-top: 8px;
}

.app-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
  white-space: nowrap;
}

.menu {
  padding: 10px 0;
  flex-grow: 1;
}

.menu-item {
  padding: 12px 15px;
  transition: background 0.3s;
  cursor: pointer;
}

.menu-item:hover {
  background: var(--color-primary-dark);
  color: var(--color-bg-header);
}

.menu-item a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary);
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease; /* Cambiamos a 'all' para animar múltiples propiedades */
}

.menu-item:hover a {
  color: var(--color-bg-header);
}

.menu-item:hover .icon {
  color: var(--color-bg-header);
  transform: scale(1.1); /* Aumenta ligeramente el tamaño del icono */
}

.menu-item:hover .text {
  font-weight: 600; /* Texto más grueso */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* Sombra sutil */
}
.icon {
  font-size: 1.2rem;
  min-width: 30px;
  color: var(--color-primary);
  transition: all 0.3s ease; /* Cambiamos a 'all' para animar tamaño y color */
}
.text {
  white-space: nowrap;
  transition: all 0.3s ease; /* Añadimos transición para el texto */
  font-weight: 400; /* Peso normal por defecto */
  text-shadow: none; /* Sin sombra por defecto */
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-bg-header);
  padding: 5px 10px;
  border-radius: 4px;
  margin-left: 10px;
  white-space: nowrap;
  border: 1px solid var(--color-primary-dark);
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    width: 100%;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 100%; /* aseguramos que siga ocupando el 100% */
  }

  /* Cuando el sidebar está activo en móvil */
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .menu-toggle {
    display: none;
  }

  .top-container {
    padding-top: 20px;
    justify-content: center; /* centramos el logo */
  }

  .logo-container {
    justify-content: center;
  }

  .menu {
    display: flex;
    flex-direction: column;
    align-items: center; /* centramos horizontalmente */
    padding: 20px 0;
  }

  .menu-item {
    width: 100%;
    text-align: center; /* centramos el texto */
  }

  .menu-item a {
    justify-content: center; /* centramos ícono + texto */
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .app-name {
    font-size: 1.3rem;
    text-align: center;
  }
}
/* Para tablets más pequeñas */
</style>
