<template>
  <div class="activity-summary" role="list" aria-label="활동 요약">
    <component
      :is="item.to ? RouterLink : 'div'"
      v-for="item in items"
      :key="item.label"
      :to="item.to || undefined"
      class="activity-summary__item"
      :class="{
        'activity-summary__item--link': item.to,
        'activity-summary__item--point': item.isPoint,
      }"
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
  gap: 7px;
  overflow: hidden;
  margin: 24px 0 0;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
}

.activity-summary__item {
  position: relative;
  display: grid;
  gap: 5px;
  align-content: center;
  min-width: 0;
  margin: 0;
  min-height: 76px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  color: inherit;
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.11);
}

.activity-summary__item:last-child {
  border-right: 1px solid rgba(255, 255, 255, 0.24);
}

.activity-summary__label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  white-space: nowrap;
}

.activity-summary__item > strong {
  color: #ffffff;
  font-size: 21px;
  font-weight: 800;
}

.activity-summary .activity-summary__value--point {
  color: #ffffff;
}

.activity-summary__item--point {
  background: transparent;
}

.activity-summary__item--link {
  padding-right: 26px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.activity-summary__item--link:last-child {
  padding-right: 26px;
}

.activity-summary__item--link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.activity-summary__item--link:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.activity-summary__arrow {
  position: absolute;
  top: 50%;
  right: 8px;
  color: #ffffff;
  transform: translateY(-50%);
  transition: transform 0.18s ease;
}

.activity-summary__item--link:hover .activity-summary__arrow {
  transform: translate(2px, -50%);
}

@media (max-width: 480px) {
  .activity-summary {
    gap: 5px;
    margin-top: 18px;
    padding: 0;
    border-radius: 12px;
  }

  .activity-summary__item {
    min-height: 68px;
    padding: 8px 5px;
  }

  .activity-summary__label {
    font-size: 11px;
  }

  .activity-summary__item > strong {
    font-size: clamp(16px, 5vw, 18px);
  }

  .activity-summary__item--link {
    padding-right: 18px;
  }

  .activity-summary__item--link:last-child {
    padding-right: 18px;
  }

  .activity-summary__arrow {
    right: 2px;
  }
}
</style>
