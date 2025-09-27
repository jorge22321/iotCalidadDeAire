<!-- src/components/forms/FormField.vue -->
<template>
  <div class="form-group">
    <label :for="id" class="form-label" :class="{ 'label-error': error }">{{ label }}</label>
    <div class="input-wrapper">
      <span v-if="$slots.icon" class="icon-slot">
        <slot name="icon" />
      </span>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :required="required"
        :placeholder="placeholder"
        class="form-input"
        :class="{ 'input-error': error, 'has-icon': $slots.icon }"
      />
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Estilos adaptados de UserModal.vue para consistencia */
.form-group {
  margin-bottom: 0.5rem; /* Reducido para dar espacio al mensaje de error */
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}
.label-error {
  color: #f87171; /* Rojo claro para errores */
}
.input-wrapper {
  position: relative;
}
.icon-slot {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary-dark);
  pointer-events: none; /* Para que no interfiera con el click del input */
}
.form-input {
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  transition: all 0.3s ease;
}
.form-input.has-icon {
  padding-left: 40px;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}
.form-input.input-error {
  border-color: #ef4444; /* Rojo más fuerte para el borde */
}
.form-input.input-error:focus {
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3);
}
.error-message {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  height: 1rem; /* Asegura que el layout no salte */
}
</style>
