//src/views/DevicesView.vue
<template>
  <div class="devices-content">
    <div class="users-dashboard">
      <!-- Componente de Filtros -->
      <UserFilters
        v-model:search="searchQuery"
        v-model:role="roleFilter"
        v-model:status="statusFilter"
      />

      <!-- Tabla de usuarios -->
      <UserTable
        :users="paginatedUsers"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="sortBy"
        @edit="editUser"
        @delete="confirmDelete"
      />

      <!-- Paginación -->
      <PaginationControls
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :total-pages="totalPages"
      />
    </div>

    <UserEditModal
      :show="showUserModal"
      :user-data="userForm"
      :editing="editingUser"
      @close="showUserModal = false"
      @submit="handleUserSubmit"
    />
    <!-- Modal para agregar/editar usuario -->
    <!-- Modal de confirmación para eliminar -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Confirmar Eliminación"
      :message="`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.name}?`"
      @close="showDeleteModal = false"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserFilters from '@/components/UserFilters.vue'
import UserTable from '@/components/UserTable.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import UserEditModal from '@/components/modals/UserEditModal.vue'
import ConfirmModal from '@/components/modals/ConfirmDeleteModal.vue'

const router = useRouter()
const API_URL = 'http://localhost:3000/api'

// Estado del componente
const users = ref([])
const totalUsers = ref(0)
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const sortColumn = ref('name')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const loading = ref(false)
const showUserModal = ref(false)
const editingUser = ref(false)
const userForm = ref({
  id: null,
  name: '',
  email: '',
  role: 'user',
  status: 'active',
  password: '',
})
const editUser = (user) => {
  userForm.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    password: '',
  }
  editingUser.value = true
  showUserModal.value = true
}
const showDeleteModal = ref(false)
const userToDelete = ref(null)

// Computed
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole =
      !roleFilter.value || user.role.toLowerCase() === roleFilter.value.toLowerCase()
    const matchesStatus = !statusFilter.value || user.status === statusFilter.value
    return matchesSearch && matchesRole && matchesStatus
  })
})

const sortedUsers = computed(() => {
  return [...filteredUsers.value].sort((a, b) => {
    let modifier = 1
    if (sortDirection.value === 'desc') modifier = -1

    if (a[sortColumn.value] < b[sortColumn.value]) return -1 * modifier
    if (a[sortColumn.value] > b[sortColumn.value]) return 1 * modifier
    return 0
  })
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedUsers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
})

// Métodos
async function fetchUsers() {
  loading.value = true
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 401) {
      localStorage.removeItem('authToken')
      router.push('/login')
      return
    }

    if (!response.ok) throw new Error(`Error HTTP! estado: ${response.status}`)

    const data = await response.json()
    users.value = data.items || data
    totalUsers.value = data.total || data.length
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    loading.value = false
  }
}

function sortBy(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const handleUserSubmit = async (formData) => {
  try {
    const token = localStorage.getItem('authToken')
    const url = formData.id ? `${API_URL}/users/${formData.id}` : `${API_URL}/users`
    const method = formData.id ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) throw new Error('Error al guardar usuario')

    await fetchUsers()
    showUserModal.value = false
    showNotification('success', 'Usuario guardado correctamente')
  } catch (error) {
    console.error('Error:', error)
    showNotification('error', error.message || 'Error al guardar usuario')
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function deleteUser() {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_URL}/users/${userToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al eliminar usuario')
    }

    await fetchUsers()
  } catch (error) {
    console.error('Error:', error)
    // Mostrar notificación de error
    showNotification('error', error.message || 'Error al eliminar usuario')
  } finally {
    // Cerrar el modal en cualquier caso
    showDeleteModal.value = false
    userToDelete.value = null
  }
}
function showNotification(type, message) {
  // Aquí puedes integrar con tu sistema de notificaciones (Toast, alerta, etc.)
  console[type](message)
}

// Watchers
watch([currentPage, itemsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
})

// Inicialización
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.devices-content {
  padding: 20px;
  height: 100%;
  width: 100%;
  color: var(--color-text-main);
  background: var(--color-bg-gradient-end);
  display: flex;
  flex-direction: column;
}

.users-dashboard {
  background: rgba(24, 28, 36, 0.8);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid var(--color-primary-dark);
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
@media (max-width: 768px) {
  .devices-content {
    padding: 10px;
  }

  .users-dashboard {
    padding: 15px;
    gap: 15px;
  }

  /* Ajustar tabla en móviles */
  .users-dashboard table {
    font-size: 0.9rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    border-collapse: collapse;
  }

  .users-dashboard th,
  .users-dashboard td {
    padding: 8px 10px;
  }

  /* Filtros en columna */
  .users-dashboard .filters,
  .users-dashboard .user-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  /* Controles de paginación */
  .users-dashboard .pagination-controls {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  /* Modal ocupa toda la pantalla */
  .users-dashboard .modal {
    width: 95% !important;
    max-width: none;
    height: auto;
    top: 5%;
    left: 2.5%;
  }
}
</style>
