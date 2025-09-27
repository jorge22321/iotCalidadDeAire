<!-- src/components/Presentacion.vue -->

<template>
  <div class="presentacion">
    <h2>Bienvenido a la aplicación IoT</h2>
    <p>
      Gestiona tus dispositivos inteligentes de forma sencilla y segura.<br />
      ¡Explora todas las funcionalidades que tenemos para ti!
    </p>
  </div>
</template>

<style scoped>
.presentacion {
  text-align: center;
  color: var(--color-text-main);
  padding: 24px 0;
}
.presentacion h2 {
  font-size: 2.2rem;
  color: var(--color-primary);
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 3px var(--color-primary-dark);
}
.presentacion p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-top: 0;
  line-height: 1.6;
}
</style>
