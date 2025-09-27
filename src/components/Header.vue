<!-- src/components/Header.vue -->
<template>
  <header class="main-header">
    <div class="header-content">
      <!-- Botón Hamburguesa solo en móvil -->
      <button class="menu" @click="sidebarStore.toggleCollapse">☰</button>

      <div class="header-actions">
        <ProfileDropdown :username="username" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import ProfileDropdown from '@/components/ProfileDropdown.vue'

defineProps({
  username: {
    type: String,
    default: 'Usuario',
  },
  // Eliminamos la prop title ya que no se usará
})

const sidebarStore = useSidebarStore()
</script>

<style scoped>
.main-header {
  height: 50px;
  background: var(--color-bg-header);
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-content {
  height: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end; /* Cambiamos a flex-end para alinear a la derecha */
  align-items: center;
}

.page-title h2 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.menu {
  display: none; /* Oculto por defecto, se muestra en móvil */
}

@media (max-width: 768px) {
  .main-header {
    display: flex;
    height: 50px;
    padding: 0;
  }

  .header-content {
    flex: 1;
    display: flex;
    justify-content: space-between; /* Toggle a la izq, perfil a la der */
    align-items: center;
    padding: 0 15px 0 25px;
  }

  .menu {
    display: block; /* Visible en móvil */
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
    transition: all 0.3s ease;
  }

  .username {
    display: none; /* Ocultar nombre en móviles */
  }
}
</style>
html
<!-- src/components/ProfileDropdown.vue - Parte responsive -->
<style scoped>
/* ... (estilos anteriores se mantienen) ... */

/* Media queries para responsividad */
@media (max-width: 768px) {
  .profile-trigger {
    padding: 6px 10px;
  }

  .dropdown-menu {
    position: fixed;
    top: 50px;
    right: 10px;
    left: 10px;
    min-width: auto;
    z-index: 1000;
  }
}
</style>
