<template>
  <div class="activity-summary" role="list" aria-label="활동 요약">
    <component
      :is="item.to ? RouterLink : 'div'"
      v-for="item in items"
      :key="item.label"
      :to="item.to || undefined"
      class="activity-summary__item"
      :class="{ 'activity-summary__item--link': item.to }"
      role="listitem"
      :aria-label="item.to ? `${item.label} ${item.value}, 포인트 내역 보기` : undefined"
    >
      <span class="activity-summary__label">{{ item.label }}</span>
      <strong :class="{ 'activity-summary__value--point': item.isPoint }">{{ item.value }}</strong>
      <ChevronRight v-if="item.to" class="activity-summary__arrow" :size="17" aria-hidden="true" />
    </component>
  </div>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.activity-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 20px 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--color-border, #ddd9e8);
}

.activity-summary__item {
  position: relative;
  display: grid;
  gap: 6px;
  align-content: center;
  min-width: 0;
  margin: 0;
  padding: 10px 18px;
  border: 1px solid transparent;
  border-right: 1px solid var(--color-border, #ddd9e8);
  border-radius: 6px;
  color: inherit;
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
}

.activity-summary__item:first-child {
  padding-left: 0;
}

.activity-summary__item:last-child {
  padding-right: 0;
  border-right: 0;
}

.activity-summary__label {
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
}

.activity-summary__item > strong {
  color: var(--color-text, #33313d);
  font-size: 22px;
  font-weight: 800;
}

.activity-summary .activity-summary__value--point {
  color: var(--color-primary-dark, #7156ad);
}

.activity-summary__item--link {
  padding-right: 30px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.activity-summary__item--link:last-child {
  padding-right: 30px;
  border-right: 1px solid transparent;
}

.activity-summary__item--link:hover {
  border-color: var(--color-primary, #7156ad);
  background: var(--color-primary-soft, #e6dcf6);
}

.activity-summary__item--link:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.activity-summary__arrow {
  position: absolute;
  top: 50%;
  right: 8px;
  color: var(--color-primary-dark, #7156ad);
  transform: translateY(-50%);
  transition: transform 0.18s ease;
}

.activity-summary__item--link:hover .activity-summary__arrow {
  transform: translate(2px, -50%);
}

@media (max-width: 480px) {
  .activity-summary {
    margin-top: 16px;
    padding-top: 14px;
  }

  .activity-summary__item {
    padding: 0 8px;
  }

  .activity-summary__label {
    font-size: 11px;
  }

  .activity-summary__item > strong {
    font-size: 18px;
  }

  .activity-summary__item--link {
    padding-right: 24px;
  }

  .activity-summary__item--link:last-child {
    padding-right: 24px;
  }

  .activity-summary__arrow {
    right: 4px;
  }
}
</style>
