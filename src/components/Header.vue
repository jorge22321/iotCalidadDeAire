<!-- src/components/Header.vue -->
<template>
  <header class="header">
    <div class="header__content">
      <!-- Botón Hamburguesa solo en móvil -->
      <button class="header__menu" @click="sidebarStore.toggleCollapse">☰</button>

      <div class="header__actions">
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
.header {
  height: 50px;
  background: var(--color-bg-header);
  position: sticky;
  top: 0;
  z-index: 90;
}

.header__content {
  height: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.header__menu {
  display: none;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .header {
    display: flex;
    height: 50px;
    padding: 0;
  }

  .header__content {
    flex: 1;
    display: flex;
    justify-content: space-between; /* Toggle a la izq, perfil a la der */
    align-items: center;
    padding: 0 15px 0 25px;
  }

  .header__menu {
    display: block;
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
    transition: all 0.3s ease;
  }

  .header__menu:hover {
    color: var(--color-accent);
    transform: scale(1.1);
  }

  .username {
    display: none; /* Ocultar nombre en móviles */
  }
}
@media (max-width: 768px) {
  .profile-trigger {
    padding: 6px 10px;
    font-size: 0.9rem;
  }

  .dropdown-menu {
    position: fixed;
    top: 50px;
    right: 10px;
    left: 10px;
    width: auto;
    min-width: unset;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 255, 171, 0.25);
    z-index: 1000;
  }

  .dropdown-item {
    padding: 12px 15px;
    font-size: 0.95rem;
  }
}
</style>
