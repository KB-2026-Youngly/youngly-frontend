<template>
  <div class="base-field">
    <label v-if="label" class="base-field__label" :for="inputId">
      {{ label }}
      <span v-if="required" class="base-field__required" aria-hidden="true">*</span>
    </label>

    <input
      v-bind="$attrs"
      :id="inputId"
      class="base-field__control"
      :class="{ 'base-field__control--error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />

    <p v-if="error" :id="errorId" class="base-field__message base-field__message--error">
      {{ error }}
    </p>
    <p v-else-if="helpText" :id="helpId" class="base-field__message">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  helpText: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const fallbackId = `base-input-${Math.random().toString(36).slice(2, 9)}`
const inputId = computed(() => props.id || fallbackId)
const errorId = computed(() => `${inputId.value}-error`)
const helpId = computed(() => `${inputId.value}-help`)

const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.helpText) return helpId.value
  return undefined
})

const handleInput = (event) => {
  const value = event.target.value

  if (props.type === 'number' && value !== '') {
    emit('update:modelValue', Number(value))
    return
  }

  emit('update:modelValue', value)
}
</script>

<style scoped>
.base-field {
  display: grid;
  gap: 7px;
  width: 100%;
}

.base-field__label {
  color: var(--color-text, #33313d);
  font-size: 14px;
  font-weight: 600;
}

.base-field__required {
  color: var(--color-danger, #e96363);
}

.base-field__control {
  width: 100%;
  min-height: 42px;
  padding: 0 13px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 9px;
  box-sizing: border-box;
  color: var(--color-text, #33313d);
  background-color: var(--color-surface, #ffffff);
  font-family: inherit;
  font-size: 15px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.base-field__control::placeholder {
  color: var(--color-placeholder, #aaa5b5);
}

.base-field__control:focus {
  border-color: var(--color-primary, #7c68d7);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-focus, rgba(124, 104, 215, 0.16));
}

.base-field__control--error {
  border-color: var(--color-danger, #e96363);
}

.base-field__control:disabled {
  cursor: not-allowed;
  background-color: var(--color-disabled, #f3f1f6);
  opacity: 0.7;
}

.base-field__message {
  margin: 0;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
}

.base-field__message--error {
  color: var(--color-danger, #e96363);
}
</style>
