<!-- src/components/UserFilters.vue -->
<template>
  <div class="user-filters">
    <div class="user-filters__search">
      <div class="user-filters__search-box">
        <font-awesome-icon :icon="faMagnifyingGlass" class="user-filters__icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar usuarios..."
          class="user-filters__input"
        />
      </div>
      <router-link to="/app/users/create" class="user-filters__add-btn">
        <font-awesome-icon :icon="faPlus" />
        <span>Agregar Usuario</span>
      </router-link>
    </div>

    <div class="user-filters__controls">
      <select
        v-model="roleFilter"
        class="user-filters__select"
        @change="emit('update:role', roleFilter)"
      >
        <option value="">Todos los roles</option>
        <option value="administrador">Administrador</option>
        <option value="usuario">Usuario</option>
        <option value="invitado">Invitado</option>
      </select>
      <select
        v-model="statusFilter"
        class="user-filters__select"
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
/* Bloque principal */
.user-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

/* Search */
.user-filters__search {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
}

.user-filters__search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.user-filters__icon {
  position: absolute;
  left: 12px;
  color: var(--color-primary);
}

.user-filters__input {
  padding: 7px 15px 7px 40px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  width: 250px;
  transition: all 0.3s ease;
}

.user-filters__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}

/* Add button */
.user-filters__add-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: var(--color-link-hover);
  border: none;
  border-radius: 8px;
  padding: 5px 15px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 255, 171, 0.3);
  white-space: nowrap;
}

.user-filters__add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 224, 255, 0.4);
}

/* Filters */
.user-filters__controls {
  display: flex;
  gap: 10px;
}

.user-filters__select {
  padding: 5px 15px;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.user-filters__select:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
