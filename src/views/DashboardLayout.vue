<!-- src/views/DashboardLayout.vue -->

<template>
  <div class="layout">
    <SidebarMenu class="layout__sidebar" />

    <div class="layout__main">
      <Header :username="username" :title="currentRouteTitle" />

      <main class="layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SidebarMenu from '@/components/SidebarMenu.vue'
import Header from '@/components/Header.vue'
import { useSidebarStore } from '@/stores/sidebar'

const sidebarStore = useSidebarStore()
const username = ref('Usuario')
const currentRouteTitle = ref('Dashboard')
const route = useRoute()

onMounted(() => {
  username.value = localStorage.getItem('username') || 'Usuario'
  if (route.meta.title) currentRouteTitle.value = route.meta.title
})

watch(
  () => route.meta.title,
  (newTitle) => {
    currentRouteTitle.value = newTitle || 'Dashboard'
  },
)
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.layout__sidebar {
  flex: 0 0 auto;
  height: auto;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
}

.layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.layout__content {
  flex: 1;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-primary-dark);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--color-accent);
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) var(--color-primary-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .layout__sidebar {
    position: fixed;
    height: 100vh;
    transform: translateX(-100%);
  }

  .layout__sidebar--mobile-open {
    transform: translateX(0);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }

  .layout__sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

  .layout__content {
    overflow: auto;
  }
}

@media (max-width: 480px) {
  .layout__content {
    padding: 8px;
  }
}
</style>
