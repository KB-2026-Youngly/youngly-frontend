<template>
  <nav class="settings-menu" aria-label="마이페이지 설정">
    <button
      v-for="item in items"
      :key="item.id"
      class="settings-menu__item"
      type="button"
      @click="emit('select', item.id)"
    >
      <span class="settings-menu__icon" aria-hidden="true">
        <WalletCards v-if="item.icon === 'account'" :size="20" />
        <ChartNoAxesColumnIncreasing v-else :size="20" />
      </span>

      <span class="settings-menu__copy">
        <strong>{{ item.label }}</strong>
        <small v-if="item.description">{{ item.description }}</small>
      </span>

      <ChevronRight class="settings-menu__arrow" :size="20" aria-hidden="true" />
    </button>
  </nav>
</template>

<script setup>
import { ChartNoAxesColumnIncreasing, ChevronRight, WalletCards } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.settings-menu {
  display: grid;
  padding: 0 20px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
}

.settings-menu__item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-height: 70px;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--color-border, #ddd9e8);
  color: var(--color-text, #33313d);
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.settings-menu__item:last-child {
  border-bottom: 0;
}

.settings-menu__item:hover .settings-menu__arrow,
.settings-menu__item:hover strong {
  color: var(--color-primary, #7156ad);
}

.settings-menu__item:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.settings-menu__icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--color-primary-border, #e6dcf6);
  border-radius: 50%;
  color: var(--color-primary-dark, #7156ad);
  background: var(--color-primary-soft, #e6dcf6);
}

.settings-menu__copy {
  display: grid;
  gap: 4px;
}

.settings-menu__copy strong {
  font-size: 14px;
}

.settings-menu__copy small {
  color: var(--color-text-muted, #77717f);
  font-size: 11px;
}

.settings-menu__arrow {
  color: var(--color-text-muted, #77717f);
}

@media (max-width: 480px) {
  .settings-menu {
    padding: 0 14px;
    border-radius: 8px;
  }

  .settings-menu__item {
    grid-template-columns: 34px minmax(0, 1fr) auto;
    min-height: 64px;
    gap: 10px;
  }

  .settings-menu__icon {
    width: 32px;
    height: 32px;
  }

  .settings-menu__copy strong {
    font-size: 13px;
  }
}
</style>
