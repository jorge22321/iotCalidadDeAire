// src/components/UserTable.vue
<template>
  <div class="users-table-container">
    <table class="users-table">
      <thead>
        <tr>
          <th @click="$emit('sort', 'name')" class="sortable">
            Nombre
            <font-awesome-icon
              :icon="
                sortColumn === 'name'
                  ? sortDirection === 'asc'
                    ? faArrowUp
                    : faArrowDown
                  : faArrowsUpDown
              "
            />
          </th>
          <th @click="$emit('sort', 'email')" class="sortable">
            Email
            <font-awesome-icon
              :icon="
                sortColumn === 'email'
                  ? sortDirection === 'asc'
                    ? faArrowUp
                    : faArrowDown
                  : faArrowsUpDown
              "
            />
          </th>
          <th @click="$emit('sort', 'role')" class="sortable">
            Rol
            <font-awesome-icon
              :icon="
                sortColumn === 'role'
                  ? sortDirection === 'asc'
                    ? faArrowUp
                    : faArrowDown
                  : faArrowsUpDown
              "
            />
          </th>
          <th @click="$emit('sort', 'status')" class="sortable">
            Estado
            <font-awesome-icon
              :icon="
                sortColumn === 'status'
                  ? sortDirection === 'asc'
                    ? faArrowUp
                    : faArrowDown
                  : faArrowsUpDown
              "
            />
          </th>
          <th>Dispositivos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>
            <div class="user-info">
              <div class="user-avatar-placeholder"></div>
              <span>{{ user.name }}</span>
            </div>
          </td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="['role-badge', user.role.toLowerCase()]">{{
              formatRole(user.role)
            }}</span>
          </td>
          <td>
            <span :class="['status-badge', user.status]">{{ formatStatus(user.status) }}</span>
          </td>
          <td>
            <div class="devices-count">
              <font-awesome-icon :icon="faMicrochip" />
              <span>{{ user.devices_count || 0 }}</span>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              <button class="edit-btn" @click="$emit('edit', user)">
                <font-awesome-icon :icon="faPenToSquare" />
              </button>
              <button class="delete-btn" @click="$emit('delete', user)">
                <font-awesome-icon :icon="faTrash" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowUp,
  faArrowDown,
  faArrowsUpDown,
  faMicrochip,
  faPenToSquare,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'

defineProps({
  users: Array,
  sortColumn: String,
  sortDirection: String,
})

defineEmits(['sort', 'edit', 'delete'])

function formatRole(role) {
  const roles = {
    admin: 'Administrador',
    user: 'Usuario',
    guest: 'Invitado',
  }
  return roles[role] || role
}

function formatStatus(status) {
  const statuses = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  }
  return statuses[status] || status
}
</script>

<style scoped>
.users-table-container {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.users-table th,
.users-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-primary-dark);
  vertical-align: middle;
}

.users-table th {
  background: linear-gradient(to bottom, var(--color-bg-header), var(--color-primary-dark));
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
}

.users-table th:hover {
  background-color: var(--color-primary-dark);
}

.users-table tr:nth-child(even) {
  background-color: rgba(35, 41, 70, 0.4);
}

.users-table tr:hover {
  background: linear-gradient(to right, rgba(0, 255, 171, 0.1), rgba(0, 224, 255, 0.1));
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--color-primary-dark);
}

.role-badge,
.status-badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.role-badge.administrador,
.role-badge.admin {
  background-color: rgba(0, 224, 255, 0.2);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.role-badge.usuario,
.role-badge.user {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.role-badge.invitado,
.role-badge.guest {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
  border: 1px solid #9e9e9e;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status-badge.inactive {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.status-badge.pending {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid #ff9800;
}

.devices-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.edit-btn {
  background-color: rgba(0, 224, 255, 0.2);
  color: var(--color-accent);
}

.edit-btn:hover {
  background-color: var(--color-accent);
  color: var(--color-link-hover);
}

.delete-btn {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.delete-btn:hover {
  background-color: #f44336;
  color: white;
}

/* Scrollbar */
.users-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.users-table-container::-webkit-scrollbar-track {
  background: var(--color-bg-header);
  border-radius: 10px;
}

.users-table-container::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-dark);
  border-radius: 10px;
  border: 2px solid var(--color-bg-header);
}
</style>
