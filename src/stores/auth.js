// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const userRole = ref(localStorage.getItem('userRole') || 'guest')

  function setUserRole(role) {
    userRole.value = role
    localStorage.setItem('userRole', role)
  }

  function fetchUserRole() {
    userRole.value = localStorage.getItem('userRole') || 'guest'
  }

  function checkAccess(allowedRoles) {
    if (!allowedRoles.includes(userRole.value)) {
      router.push('/app')
      return false
    }
    return true
  }

  return { userRole, setUserRole, fetchUserRole, checkAccess }
})
