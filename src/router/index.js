import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardLayout from '@/views/DashboardLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import DevicesView from '@/views/DevicesView.vue'
import SettingsView from '@/views/SettingsView.vue'
import CreateUserView from '@/views/CreateUserView.vue'

const routes = [
  {
    path: '/',
    component: HomeView,
    meta: { hideWhenAuth: true },
  },
  {
    path: '/set-initial-password',
    name: 'SetInitialPassword',
    // La importación dinámica es buena práctica para vistas que no se cargan siempre
    component: () => import('../views/SetInitialPasswordView.vue'),
  },
  {
    path: '/app', // Vista raíz del layout
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // /app
        component: DashboardView,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'devices', // /app/devices
        component: DevicesView,
        meta: { title: 'Dispositivos' },
      },
      {
        path: 'users/create', // /app/users/create
        component: CreateUserView,
        meta: { title: 'Crear Usuario' },
      },
      {
        path: 'settings', // /app/settings
        component: SettingsView,
        meta: { title: 'Configuración' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.fetchUserRole()

  const token = localStorage.getItem('authToken')

  // Verificar autenticación
  if (to.meta.requiresAuth && !token) {
    return next('/')
  }

  if (to.meta.hideWhenAuth && token) {
    return next('/app')
  }

  // Verificar roles
  if (to.meta.allowedRoles) {
    if (!authStore.checkAccess(to.meta.allowedRoles)) {
      return next('/app') // Redirigir al dashboard si no tiene permiso
    }
  }

  next()
})

export default router
