<!-- src/components/forms/RoleSelector.vue -->
<template>
  <div class="role-selector">
    <select
      id="role"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="role-selector__input"
    >
      <option value="">Sin rol</option>
      <option v-for="role in roles" :key="role.id" :value="role.id">
        {{ role.name }}
      </option>
    </select>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  modelValue: { type: [String, Number, null], required: true },
})
defineEmits(['update:modelValue'])

const roles = ref([])
const API_URL = 'http://localhost:3000/api'

async function fetchRoles() {
  try {
    const token = localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await fetch(`${API_URL}/roles`, { headers })
    if (!response.ok) throw new Error('Error al obtener roles')
    roles.value = await response.json()
  } catch (error) {
    console.error('No se pudieron cargar los roles:', error)
  }
}

onMounted(fetchRoles)
</script>

<style scoped>
/* Contenedor */
.role-selector {
  margin-bottom: 0;
}

/* Label opcional (si se añade en el futuro) */
.role-selector__label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

/* Input */
.role-selector__input {
  width: 100%;
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  /* ✅ CAMBIO: Letra dentro del selector aún más pequeña */
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.role-selector__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}
</style>
