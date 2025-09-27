<!-- src/components/UserFilters.vue -->
<template>
  <div class="users-controls">
    <div class="search-container">
      <div class="search-box">
        <font-awesome-icon :icon="faMagnifyingGlass" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar usuarios..."
          class="search-input"
        />
      </div>
      <router-link to="/app/users/create" class="add-user-btn">
        <font-awesome-icon :icon="faPlus" />
        <span>Agregar Usuario</span>
      </router-link>
    </div>

    <div class="filter-controls">
      <select v-model="roleFilter" class="filter-select" @change="emit('update:role', roleFilter)">
        <option value="">Todos los roles</option>
        <option value="administrador">Administrador</option>
        <option value="usuario">Usuario</option>
        <option value="invitado">Invitado</option>
      </select>
      <select
        v-model="statusFilter"
        class="filter-select"
        @change="emit('update:status', statusFilter)"
      >
        <option value="">Todos los estados</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
        <option value="pending">Pendiente</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
const emit = defineEmits(['update:search', 'update:role', 'update:status'])

const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

watch(searchQuery, (newValue) => {
  emit('update:search', newValue)
})

// No es necesario un watch para roleFilter y statusFilter porque el @change ya emite el evento.
</script>

<style scoped>
/* Copiar los estilos relevantes del original */
.users-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-primary);
}

.search-input {
  padding: 10px 15px 10px 40px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  width: 250px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}

.add-user-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: var(--color-link-hover);
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 255, 171, 0.3);
  white-space: nowrap;
}

.add-user-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 224, 255, 0.4);
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
