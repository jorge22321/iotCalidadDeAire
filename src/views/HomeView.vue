<!-- src/views/HomeView.vue -->
<template>
  <div class="home-full-bg">
    <header class="main-header">
      <div class="logo-area">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="36" height="36" />
        <span class="brand">IoT App</span>
      </div>

      <nav class="nav-links">
        <a href="#" @click.prevent="setVista('presentacion')" class="home-link">Home</a>
        <a href="#" @click.prevent="setVista('login')" class="login-link">Iniciar sesión</a>
      </nav>
    </header>

    <main class="home-content">
      <Presentacion v-if="vista === 'presentacion'" />
      <LoginForm v-if="vista === 'login'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Presentacion from '@/components/Presentacion.vue'
import LoginForm from '@/components/LoginForm.vue'

const vista = ref('presentacion')

function setVista(nuevaVista) {
  vista.value = nuevaVista
}
</script>
<style scoped>
.home-full-bg {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(
    135deg,
    var(--color-bg-gradient-start) 0%,
    var(--color-bg-gradient-end) 100%
  );
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.main-header {
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
  box-sizing: border-box;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  display: block;
  width: 32px;
  height: 32px;
}

.brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 1px;
  text-shadow: 0 0 2px var(--color-primary-dark);
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: var(--color-text-main);
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
.nav-links .login-link {
  background: var(--color-primary);
  color: var(--color-link-hover);
  box-shadow: 0 0 3px var(--color-primary);
}
.nav-links .home-link:hover {
  background-color: var(--color-bg-header);
  color: var(--color-primary);
}
.nav-links .login-link:hover {
  background: var(--color-primary);
  color: var(--color-link-hover);
  box-shadow: 0 0 23px var(--color-primary);
}

.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 50px);
  width: 100%;
  max-width: 1365px;
  margin: 0 auto 0 auto;
  padding: 36px 20px;
  box-shadow: var(--color-shadow);
  background: var(--color-bg-card);
  box-sizing: border-box;
  color: var(--color-text-main);
}
</style>
