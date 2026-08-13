<template>
  <div class="settings-menu-shell yl-stepped-card-shadow">
    <nav
      class="settings-menu yl-card-frame pixel-step-card pixel-step-solid"
      :aria-label="ariaLabel"
    >
      <div class="settings-menu__surface pixel-step-surface">
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
      </div>
    </nav>
  </div>
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
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #ffffff;
  display: grid;
  grid-auto-rows: 1fr;
  align-self: stretch;
  border: 0;
  border-radius: 0;
  background: #ac99d2;
  box-shadow: none;
  filter: none !important;
}

.settings-menu-shell {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 6px;
  align-self: stretch;
}

.settings-menu__surface {
  display: grid;
  grid-auto-rows: 1fr;
  height: 100%;
  padding: 8px 18px;
  background: var(--color-surface, #ffffff);
  box-sizing: border-box;
}

.settings-menu__item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  gap: 12px;
  align-items: center;
  min-height: 66px;
  padding: 9px 0;
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

.settings-menu__item:hover .settings-menu__icon {
  color: #ffffff;
  background: var(--color-primary, #7156ad);
  transform: translateY(-2px);
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

.settings-menu__item--danger:hover .settings-menu__icon {
  color: #ffffff;
  background: var(--color-danger, #e96363);
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
  border: 1px solid #d8ccea;
  border-radius: 11px;
  color: var(--color-primary-dark, #7156ad);
  background: var(--color-primary-soft, #f0eafd);
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.settings-menu__copy {
  display: grid;
  gap: 4px;
}

.settings-menu__copy strong {
  color: #3b3045;
  font-size: 14px;
  font-weight: 800;
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
    padding: 2px;
  }

  .settings-menu-shell {
    --yl-stepped-shadow-offset: 5px;
  }

  .settings-menu__surface {
    padding: 5px 16px;
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
