<template>
  <div class="base-field">
    <label v-if="label" class="base-field__label" :for="textareaId">
      {{ label }}
      <span v-if="required" class="base-field__required" aria-hidden="true">*</span>
    </label>

    <textarea
      v-bind="$attrs"
      :id="textareaId"
      class="base-field__control"
      :class="{ 'base-field__control--error': error }"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxLength || undefined"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      @input="emit('update:modelValue', $event.target.value)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    ></textarea>

    <div v-if="error || helpText || (showCount && maxLength)" class="base-field__bottom">
      <p v-if="error" :id="errorId" class="base-field__message base-field__message--error">
        {{ error }}
      </p>
      <p v-else-if="helpText" :id="helpId" class="base-field__message">
        {{ helpText }}
      </p>
      <span v-else></span>

      <span v-if="showCount && maxLength" class="base-field__count">
        {{ textLength }} / {{ maxLength }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: String,
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
  rows: {
    type: Number,
    default: 4,
  },
  maxLength: {
    type: Number,
    default: 0,
  },
  showCount: {
    type: Boolean,
    default: false,
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

const fallbackId = `base-textarea-${Math.random().toString(36).slice(2, 9)}`
const textareaId = computed(() => props.id || fallbackId)
const errorId = computed(() => `${textareaId.value}-error`)
const helpId = computed(() => `${textareaId.value}-help`)
const textLength = computed(() => props.modelValue.length)

const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.helpText) return helpId.value
  return undefined
})
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
  min-height: 104px;
  padding: 12px 13px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 9px;
  box-sizing: border-box;
  resize: vertical;
  color: var(--color-text, #33313d);
  background-color: var(--color-surface, #ffffff);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
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

.base-field__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.base-field__message,
.base-field__count {
  margin: 0;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
}

.base-field__message--error {
  color: var(--color-danger, #e96363);
}

.base-field__count {
  flex: 0 0 auto;
}
</style>
