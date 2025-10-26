<!-- src/views/HomeView.vue -->

<template>
  <div class="home">
    <header class="home__header">
      <div class="home__logo">
        <img alt="Vue logo" class="home__logo-img" src="@/assets/logo.svg" width="36" height="36" />
        <span class="home__brand">IoT App</span>
      </div>

      <nav class="home__nav">
        <a
          href="#"
          @click.prevent="setVista('presentacion')"
          class="home__link home__link--primary"
        >
          Home
        </a>
        <a href="#" @click.prevent="setVista('registro')" class="home__link home__link--primary">
          Registro
        </a>
        <a href="#" @click.prevent="setVista('login')" class="home__link home__link--secondary">
          Iniciar sesión
        </a>
      </nav>
    </header>

    <main class="home__content">
      <Presentacion v-if="vista === 'presentacion'" />
      <LoginForm v-if="vista === 'login'" />
      <RegistroForm v-if="vista === 'registro'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Presentacion from '@/components/Presentacion.vue'
import LoginForm from '@/components/LoginForm.vue'
import RegistroForm from '@/components/RegistroForm.vue'
const vista = ref('presentacion')

function setVista(nuevaVista) {
  vista.value = nuevaVista
}
</script>
<style scoped>
.home {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  width: 100vw;
  background: var(--color-bg-card);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* --- HEADER --- */
.home__header {
  width: 100%;
  height: 64px;
  background-color: var(--color-bg-header);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.home__logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.home__logo-img {
  width: 32px;
  height: 32px;
}

.home__brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 1px;
  text-shadow: 0 0 2px var(--color-primary-dark);
}

/* --- NAVIGATION --- */
.home__nav {
  display: flex;
  gap: 24px;
}

.home__link {
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 4px 18px;
  border-radius: 6px;
  transition:
    background 0.18s,
    color 0.18s,
    box-shadow 0.18s;
}

.home__link--primary {
  color: var(--color-text-main);
}

.home__link--primary:hover {
  background-color: var(--color-bg-header);
  color: var(--color-primary);
}

.home__link--secondary {
  background: var(--color-primary);
  color: var(--color-link-hover);
  box-shadow: 0 0 3px var(--color-primary);
}

.home__link--secondary:hover {
  box-shadow: 0 0 23px var(--color-primary);
}

/* --- CONTENT --- */
.home__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 50px);
  width: 100%;
  max-width: 1365px;
  margin: 0 auto;
  padding: 36px 20px;
  background: var(--color-bg-card);

  color: var(--color-text-main);
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .home__content {
    padding: 0px;
  }
  .home__brand {
    display: none;
  }
}
</style>
