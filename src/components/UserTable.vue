<template>
  <div class="user-table">
    <table class="user-table__table">
      <thead>
        <tr>
          <th
            @click="$emit('sort', 'name')"
            class="user-table__header user-table__header--sortable"
          >
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
          <th
            @click="$emit('sort', 'email')"
            class="user-table__header user-table__header--sortable"
          >
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
          <th
            @click="$emit('sort', 'role')"
            class="user-table__header user-table__header--sortable"
          >
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
          <th
            @click="$emit('sort', 'status')"
            class="user-table__header user-table__header--sortable"
          >
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
          <th class="user-table__header">Dispositivos</th>
          <th class="user-table__header">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="user-table__row">
          <td>
            <div class="user-table__info">
              <div class="user-table__avatar"></div>
              <span>{{ user.name }}</span>
            </div>
          </td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="['user-table__role-badge', user.role.toLowerCase()]">{{
              formatRole(user.role)
            }}</span>
          </td>
          <td>
            <span :class="['user-table__status-badge', user.status]">{{
              formatStatus(user.status)
            }}</span>
          </td>
          <td>
            <div class="user-table__devices">
              <font-awesome-icon :icon="faMicrochip" />
              <span>{{ user.devices_count || 0 }}</span>
            </div>
          </td>
          <td>
            <div class="user-table__actions">
              <button class="user-table__btn user-table__btn--edit" @click="$emit('edit', user)">
                <font-awesome-icon :icon="faPenToSquare" />
              </button>
              <button
                class="user-table__btn user-table__btn--delete"
                @click="$emit('delete', user)"
              >
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
.user-table {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
}

.user-table__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.user-table__header,
.user-table__table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-primary-dark);
  vertical-align: middle;
}

.user-table__header {
  background: linear-gradient(to bottom, var(--color-bg-header), var(--color-primary-dark));
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
}

.user-table__header:hover {
  background-color: var(--color-primary-dark);
}

.user-table__row:nth-child(even) {
  background-color: rgba(35, 41, 70, 0.4);
}

.user-table__row:hover {
  background: linear-gradient(to right, rgba(0, 255, 171, 0.1), rgba(0, 224, 255, 0.1));
}

.user-table__info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-table__avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--color-primary-dark);
}

/* Badges */
.user-table__role-badge,
.user-table__status-badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Roles */
.user-table__role-badge.administrador,
.user-table__role-badge.admin {
  background-color: rgba(0, 224, 255, 0.2);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.user-table__role-badge.usuario,
.user-table__role-badge.user {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.user-table__role-badge.invitado,
.user-table__role-badge.guest {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
  border: 1px solid #9e9e9e;
}

/* Status */
.user-table__status-badge.active {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.user-table__status-badge.inactive {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.user-table__status-badge.pending {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid #ff9800;
}

/* Devices */
.user-table__devices {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-primary);
}

/* Actions */
.user-table__actions {
  display: flex;
  gap: 8px;
}

.user-table__btn {
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

.user-table__btn--edit {
  background-color: rgba(0, 224, 255, 0.2);
  color: var(--color-accent);
}

.user-table__btn--edit:hover {
  background-color: var(--color-accent);
  color: var(--color-link-hover);
}

.user-table__btn--delete {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.user-table__btn--delete:hover {
  background-color: #f44336;
  color: white;
}

/* Scrollbar */
.user-table::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.user-table::-webkit-scrollbar-track {
  background: var(--color-bg-header);
  border-radius: 10px;
}

.user-table::-webkit-scrollbar-thumb {
  background-color: var(--color-primary-dark);
  border-radius: 10px;
  border: 2px solid var(--color-bg-header);
}
</style>
