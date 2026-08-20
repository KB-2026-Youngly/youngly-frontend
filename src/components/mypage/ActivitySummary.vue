<template>
  <div class="activity-summary" role="list" aria-label="활동 요약">
    <div v-for="item in items" :key="item.label" class="activity-summary__shadow">
      <component
        :is="item.to ? RouterLink : 'div'"
        :to="item.to || undefined"
        class="activity-summary__item"
        :class="{
          'activity-summary__item--link': item.to,
          'activity-summary__item--point': item.isPoint,
        }"
        role="listitem"
        :aria-label="item.to ? `${item.label} ${item.value}, 포인트 내역 보기` : undefined"
      >
        <span class="activity-summary__surface">
          <span class="activity-summary__label">{{ item.label }}</span>
          <strong :class="{ 'activity-summary__value--point': item.isPoint }">{{
            item.value
          }}</strong>
          <ChevronRight
            v-if="item.to"
            class="activity-summary__arrow"
            :size="17"
            aria-hidden="true"
          />
        </span>
      </component>
    </div>
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
  gap: 11px;
  overflow: visible;
  margin: 24px 0 0;
  padding: 0;
  border: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
}

.activity-summary__item {
  position: relative;
  display: block;
  min-width: 0;
  margin: 0;
  min-height: 76px;
  padding: 1px;
  border: 1px solid #ffffff;
  border-radius: 14px;
  color: inherit;
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
  background: #ffffff;
}

.activity-summary__shadow {
  min-width: 0;
  border-radius: 14px;
  box-shadow: 0 3px 6px rgba(64, 42, 94, 0.24);
}

.activity-summary__surface {
  position: relative;
  display: grid;
  gap: 5px;
  align-content: center;
  min-height: 72px;
  padding: 10px 14px;
  border-radius: 12px;
  background: transparent;
  box-sizing: border-box;
}

.activity-summary__label {
  color: #51367f;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  white-space: nowrap;
}

.activity-summary__item strong {
  color: #51367f;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.15;
}

.activity-summary .activity-summary__value--point {
  color: #60418f;
}

.activity-summary__item--link {
  cursor: pointer;
}

.activity-summary__item--link .activity-summary__surface {
  padding-right: 24px;
}

.activity-summary__item--link:last-child {
  padding-right: 2px;
}

.activity-summary__item--link:hover {
  background: #ffffff;
}

.activity-summary__item--link:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.activity-summary__arrow {
  position: absolute;
  top: 50%;
  right: 8px;
  color: #60418f;
  transform: translateY(-50%);
  transition: transform 0.18s ease;
}

.activity-summary__item--link:hover .activity-summary__arrow {
  transform: translate(2px, -50%);
}

@media (max-width: 767px) {
  .activity-summary {
    gap: 7px;
    margin-top: 15px;
    padding: 0;
    border-radius: 12px;
  }

  .activity-summary__item {
    min-height: 62px;
    padding: 1px;
    border-radius: 12px;
  }

  .activity-summary__surface {
    min-height: 58px;
    padding: 7px 4px;
    border-radius: 10px;
  }

  .activity-summary__label {
    font-size: 11px;
  }

  .activity-summary__item strong {
    font-size: 17px;
  }

  .activity-summary__item--link {
    padding-right: 2px;
  }

  .activity-summary__item--link:last-child {
    padding-right: 2px;
  }

  .activity-summary__arrow {
    right: 1px;
  }
}
</style>
