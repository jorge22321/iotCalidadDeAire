<!-- src/components/PaginationControls.vue -->
<template>
  <div class="footer-controls">
    <div class="items-per-page-selector">
      <label for="items-per-page">Mostrar:</label>
      <select
        id="items-per-page"
        v-model="localItemsPerPage"
        class="filter-select"
        @change="emitPaginationChange"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
    </div>
    <div class="pagination-controls">
      <button @click="emit('update:currentPage', currentPage - 1)" :disabled="currentPage === 1">
        <font-awesome-icon :icon="faChevronLeft" />
      </button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        @click="emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        <font-awesome-icon :icon="faChevronRight" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
  itemsPerPage: Number,
})

const emit = defineEmits(['update:itemsPerPage', 'update:currentPage'])

const localItemsPerPage = ref(props.itemsPerPage)

function emitPaginationChange() {
  emit('update:itemsPerPage', localItemsPerPage.value)
  emit('update:currentPage', 1) // Reset to first page when changing items per page
}

watch(
  () => props.itemsPerPage,
  (newVal) => {
    localItemsPerPage.value = newVal
  },
)
</script>

<style scoped>
.footer-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid var(--color-primary-dark);
}

.items-per-page-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination-controls button {
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-primary);
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

.pagination-controls span {
  color: var(--color-text-secondary);
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
