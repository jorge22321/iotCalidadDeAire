<!-- src/components/PaginationControls.vue -->
<template>
  <div class="pagination">
    <div class="pagination__selector">
      <label for="items-per-page">Mostrar:</label>
      <select
        id="items-per-page"
        v-model="localItemsPerPage"
        class="pagination__select"
        @change="emitPaginationChange"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
    </div>

    <div class="pagination__controls">
      <button
        class="pagination__btn"
        @click="emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage === 1"
      >
        <font-awesome-icon :icon="faChevronLeft" />
      </button>

      <span class="pagination__info">Página {{ currentPage }} de {{ totalPages }}</span>

      <button
        class="pagination__btn"
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
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid var(--color-primary-dark);
}

.pagination__selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.pagination__select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.pagination__select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 6px rgba(0, 224, 255, 0.3);
}

.pagination__controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.pagination__btn {
  background: var(--color-bg-header);
  border: 1px solid var(--color-primary-dark);
  color: var(--color-primary);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  color: var(--color-text-main);
}

.pagination__info {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
