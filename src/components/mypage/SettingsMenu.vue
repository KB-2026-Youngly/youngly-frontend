<template>
  <nav class="settings-menu" :aria-label="ariaLabel">
    <component
      :is="item.href ? 'a' : 'button'"
      v-for="item in items"
      :key="item.id"
      class="settings-menu__item"
      :class="{ 'settings-menu__item--danger': item.danger }"
      :type="item.href ? undefined : 'button'"
      :href="item.href || undefined"
      :target="item.href ? '_blank' : undefined"
      :rel="item.href ? 'noopener noreferrer' : undefined"
      @click="!item.href && emit('select', item.id)"
    >
      <span class="settings-menu__icon" aria-hidden="true">
        <WalletCards v-if="item.icon === 'account'" :size="19" />
        <Headphones v-else-if="item.icon === 'support'" :size="19" />
        <LockKeyhole v-else-if="item.icon === 'password'" :size="19" />
        <UserRoundX v-else-if="item.icon === 'withdrawal'" :size="19" />
        <ChartNoAxesColumnIncreasing v-else :size="19" />
      </span>

      <span class="settings-menu__copy">
        <strong>{{ item.label }}</strong>
        <small v-if="item.description">{{ item.description }}</small>
      </span>

      <ChevronRight class="settings-menu__arrow" :size="18" aria-hidden="true" />
    </component>
  </nav>
</template>

<script setup>
import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Headphones,
  LockKeyhole,
  UserRoundX,
  WalletCards,
} from 'lucide-vue-next'

defineProps({
  ariaLabel: {
    type: String,
    default: '마이페이지 설정',
  },
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
  padding: 6px 20px;
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.settings-menu__item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 24px;
  gap: 12px;
  align-items: center;
  min-height: 62px;
  padding: 8px 0;
  box-sizing: border-box;
  border: 0;
  border-bottom: 1px solid var(--color-border, #ddd9e8);
  color: var(--color-text, #33313d);
  background: transparent;
  font-family: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.settings-menu__item:last-child {
  border-bottom: 0;
}

.settings-menu__item:hover .settings-menu__arrow,
.settings-menu__item:hover strong {
  color: var(--color-primary, #7156ad);
}

.settings-menu__item--danger,
.settings-menu__item--danger:hover strong,
.settings-menu__item--danger:hover .settings-menu__arrow {
  color: var(--color-danger, #e96363);
}

.settings-menu__item--danger .settings-menu__icon {
  color: var(--color-danger, #e96363);
  background: #fff0f1;
}

.settings-menu__item:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.settings-menu__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 12px;
  color: var(--color-primary-dark, #7156ad);
  background: var(--color-primary-soft, #f0eafd);
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
  justify-self: end;
  color: var(--color-text-muted, #77717f);
}

@media (max-width: 480px) {
  .settings-menu {
    padding: 4px 16px;
    border-radius: 18px;
  }

  .settings-menu__item {
    grid-template-columns: 38px minmax(0, 1fr) 22px;
    min-height: 60px;
    gap: 10px;
  }

  .settings-menu__icon {
    width: 36px;
    height: 36px;
  }

  .settings-menu__copy strong {
    font-size: 14px;
  }
}
</style>
