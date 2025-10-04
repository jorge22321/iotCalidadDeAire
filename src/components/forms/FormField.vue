<!-- src/components/forms/FormField.vue -->
<template>
  <div class="form-field">
    <label :for="id" class="form-field__label" :class="{ 'form-field__label--error': error }">
      {{ label }}
    </label>

    <div class="form-field__input-wrapper">
      <span v-if="$slots.icon" class="form-field__icon">
        <slot name="icon" />
      </span>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :required="required"
        :placeholder="placeholder"
        class="form-field__input"
        :class="{
          'form-field__input--error': error,
          'form-field__input--with-icon': $slots.icon,
        }"
      />
    </div>

    <p v-if="error" class="form-field__error-message">{{ error }}</p>
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
/* Contenedor del campo */
.form-field {
  margin-bottom: 0.5rem; /* Espacio reducido para dar cabida al error */
}

/* Label */
.form-field__label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.form-field__label--error {
  color: #f87171; /* Rojo claro para errores */
}

/* Input wrapper */
.form-field__input-wrapper {
  position: relative;
}

/* Icono dentro del input */
.form-field__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary-dark);
  pointer-events: none;
}

/* Input */
.form-field__input {
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-text-main);
  transition: all 0.3s ease;
}

.form-field__input--with-icon {
  padding-left: 40px;
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 171, 0.2);
}

.form-field__input--error {
  border-color: #ef4444;
}

.form-field__input--error:focus {
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3);
}

/* Mensaje de error */
.form-field__error-message {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  height: 1rem; /* Para evitar salto en el layout */
}
</style>
