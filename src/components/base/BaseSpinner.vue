<template>
  <div
    class="base-spinner"
    :class="[`base-spinner--${size}`, { 'base-spinner--centered': centered }]"
    role="status"
    aria-live="polite"
  >
    <span class="base-spinner__circle" aria-hidden="true"></span>
    <span v-if="showLabel" class="base-spinner__label">
      {{ label }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  label: {
    type: String,
    default: '불러오는 중...',
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  centered: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.base-spinner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary, #7c68d7);
}

.base-spinner--centered {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 120px;
}

.base-spinner__circle {
  flex: 0 0 auto;
  border: 3px solid var(--color-primary-soft, #e6e0ff);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: base-spinner-rotate 0.75s linear infinite;
}

.base-spinner--small .base-spinner__circle {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.base-spinner--medium .base-spinner__circle {
  width: 24px;
  height: 24px;
}

.base-spinner--large .base-spinner__circle {
  width: 36px;
  height: 36px;
  border-width: 4px;
}

.base-spinner__label {
  color: var(--color-text-muted, #77717f);
  font-size: 14px;
}

@keyframes base-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-spinner__circle {
    animation: none;
  }
}
</style>
