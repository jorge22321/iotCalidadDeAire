<!-- src/components/SidebarMenu.vue -->
<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar__top" :class="{ collapsed: isCollapsed }">
      <div class="sidebar__logo-container" :class="{ collapsed: isCollapsed }">
        <img src="@/assets/logo.svg" alt="Logo" class="sidebar__logo" />
        <span v-if="!isCollapsed" class="sidebar__app-name">IoT-App</span>
      </div>
      <button class="sidebar__toggle" :class="{ collapsed: isCollapsed }" @click="toggleCollapse">
        ☰
      </button>
    </div>

    <nav class="sidebar__menu">
      <div
        v-for="item in filteredMenuItems"
        :key="item.name"
        class="sidebar__menu-item"
        @mouseover="hoverItem = item.name"
        @mouseleave="hoverItem = null"
      >
        <router-link :to="item.path" @click="handleMenuClick">
          <span class="sidebar__icon">
            <font-awesome-icon :icon="item.icon" />
          </span>
          <transition name="fade">
            <span class="sidebar__text" v-if="!isCollapsed">{{ item.name }}</span>
          </transition>
          <span class="sidebar__tooltip" v-if="isCollapsed && hoverItem === item.name">
            {{ item.name }}
          </span>
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
/* Sidebar base */
.sidebar {
  width: 160px;
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

/* Top container */
.sidebar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  transition: all 0.3s ease;
}

.sidebar__top.collapsed {
  flex-direction: column;
  justify-content: center;
  gap: 15px;
  padding: 10px 0;
}

/* Logo + Nombre */
.sidebar__logo-container {
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.sidebar__logo-container.collapsed {
  flex-direction: column;
  gap: 5px;
  margin: 0;
}

.sidebar__logo {
  width: 20px;
  height: 20px;
  min-width: 30px;
  margin-top: 8px;
}

.sidebar__app-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-primary);
  white-space: nowrap;
}

/* Toggle */
.sidebar__toggle {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
  margin: 0;
}

.sidebar__toggle:hover {
  color: var(--color-accent);
}

.sidebar__top:not(.collapsed) .sidebar__toggle {
  margin-left: auto;
}

/* Menu */
.sidebar__menu {
  padding: 10px 0;
  flex-grow: 1;
}

.sidebar__menu-item {
  padding: 7px 15px;
  transition: background 0.3s;
  cursor: pointer;
}

.sidebar__menu-item:hover {
  background: var(--color-primary-dark);
  color: var(--color-bg-header);
}

.sidebar__menu-item a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary);
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
}

.sidebar__menu-item:hover a {
  color: var(--color-bg-header);
}

/* Icon */
.sidebar__icon {
  font-size: 0.9rem;
  min-width: 30px;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.sidebar__menu-item:hover .sidebar__icon {
  color: var(--color-bg-header);
  transform: scale(1.1);
}

/* Texto */
.sidebar__text {
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 400;
  text-shadow: none;
  font-size: 0.8rem;
}

.sidebar__menu-item:hover .sidebar__text {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Tooltip */
.sidebar__tooltip {
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

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive (mobile) */
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
    width: 100%;
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .sidebar__toggle {
    display: none;
  }

  .sidebar__top {
    padding-top: 20px;
    justify-content: center;
  }

  .sidebar__logo-container {
    justify-content: center;
  }

  .sidebar__menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
  }

  .sidebar__menu-item {
    width: 100%;
    text-align: center;
  }

  .sidebar__menu-item a {
    justify-content: center;
  }

  .sidebar__logo {
    width: 40px;
    height: 40px;
  }

  .sidebar__app-name {
    font-size: 1.3rem;
    text-align: center;
  }
}
</style>
