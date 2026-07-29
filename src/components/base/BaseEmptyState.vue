<template>
  <div class="base-empty-state">
    <div class="base-empty-state__icon" aria-hidden="true">
      <slot name="icon">
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M9 14.5C9 12.567 10.567 11 12.5 11h23C37.433 11 39 12.567 39 14.5v22C39 38.433 37.433 40 35.5 40h-23C10.567 40 9 38.433 9 36.5v-22Z"
            stroke="currentColor"
            stroke-width="2.5"
          />
          <path
            d="M9 29h8l3 4h8l3-4h8M17 19h14M17 24h10"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
    </div>

    <h3 class="base-empty-state__title">
      {{ title }}
    </h3>

    <p v-if="description" class="base-empty-state__description">
      {{ description }}
    </p>

    <div v-if="$slots.action || actionText" class="base-empty-state__action">
      <slot name="action">
        <BaseButton @click="emit('action')">
          {{ actionText }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'

defineProps({
  title: {
    type: String,
    default: '표시할 내용이 없어요',
  },
  description: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['action'])
</script>

<style scoped>
.base-empty-state {
  display: grid;
  justify-items: center;
  width: 100%;
  padding: 44px 20px;
  box-sizing: border-box;
  text-align: center;
}

.base-empty-state__icon {
  width: 48px;
  height: 48px;
  margin-bottom: 15px;
  color: var(--color-primary, #7c68d7);
}

.base-empty-state__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.base-empty-state__title {
  margin: 0;
  color: var(--color-text, #33313d);
  font-size: 18px;
}

.base-empty-state__description {
  max-width: 360px;
  margin: 9px 0 0;
  color: var(--color-text-muted, #77717f);
  font-size: 14px;
  line-height: 1.5;
}

.base-empty-state__action {
  margin-top: 20px;
}
</style>
