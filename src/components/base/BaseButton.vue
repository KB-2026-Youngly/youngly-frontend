<template>
  <button
    :type="type"
    class="base-button"
    :class="[`base-button--${variant}`, `base-button--${size}`, { 'base-button--block': block }]"
    :disabled="isDisabled"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__loading">
      <span class="base-button__spinner" aria-hidden="true"></span>
      <slot name="loading">처리 중...</slot>
    </span>

    <slot v-else />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const isDisabled = computed(() => props.disabled || props.loading)

const handleClick = (event) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.1s ease;
}

.base-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.base-button:active:not(:disabled) {
  transform: translateY(0);
}

.base-button:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.base-button--primary {
  color: #ffffff;
  background-color: var(--color-primary, #7c68d7);
}

.base-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover, #6955c4);
}

.base-button--secondary {
  color: var(--color-primary-dark, #5f4db4);
  background-color: var(--color-primary-soft, #eeeaff);
  border-color: var(--color-primary-border, #d1c8f7);
}

.base-button--secondary:hover:not(:disabled) {
  background-color: var(--color-primary-soft-hover, #e3ddff);
}

.base-button--danger {
  color: #ffffff;
  background-color: var(--color-danger, #e96363);
}

.base-button--danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover, #d85353);
}

.base-button--ghost {
  color: var(--color-text, #33313d);
  background-color: transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background-color: var(--color-surface-hover, #f4f2f8);
}

.base-button--small {
  min-height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.base-button--medium {
  min-height: 40px;
  padding: 0 18px;
  font-size: 15px;
}

.base-button--large {
  min-height: 48px;
  padding: 0 24px;
  font-size: 16px;
}

.base-button--block {
  width: 100%;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.base-button__loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.base-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: base-button-spin 0.7s linear infinite;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-button,
  .base-button__spinner {
    transition: none;
    animation: none;
  }
}
</style>
