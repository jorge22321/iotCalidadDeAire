<!-- src/components/forms/LoginInput.vue -->
<template>
  <div class="login-input">
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      class="login-input__field"
    />
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.login-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.login-input__field {
  padding: 5px 10px;
  border: none;
  border-bottom: 2px solid var(--color-primary-dark);
  background: var(--color-bg-header);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.8rem;
  transition:
    border-bottom-color 0.25s ease,
    box-shadow 0.25s ease;
  border-radius: 4px 4px 0 0;
}

.login-input__field:focus {
  outline: none;
  border-bottom-color: var(--color-primary);
}

.login-input__field::placeholder {
  color: var(--color-primary);
  opacity: 0.8;
  font-weight: 600;
}
</style>
