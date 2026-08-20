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
          <span class="activity-summary__icon" aria-hidden="true">
            <BriefcaseBusiness
              v-if="item.label === '승인 횟수'"
              :size="19"
              :stroke-width="2.2"
            />
            <ClipboardX
              v-else-if="item.label === '반려 횟수'"
              :size="20"
              :stroke-width="2.2"
            />
            <span v-else class="activity-summary__point-icon">P</span>
          </span>
          <span class="activity-summary__label">{{ item.label }}</span>
          <strong :class="{ 'activity-summary__value--point': item.isPoint }">{{
            item.value
          }}</strong>
        </span>
      </component>
    </div>
  </div>
</template>

<script setup>
import { BriefcaseBusiness, ClipboardX } from 'lucide-vue-next'
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
  min-height: 92px;
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
  justify-items: center;
  gap: 4px;
  align-content: center;
  min-height: 88px;
  padding: 8px 12px;
  border-radius: 12px;
  background: transparent;
  box-sizing: border-box;
}

.activity-summary__icon {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  color: #7651b5;
}

.activity-summary__point-icon {
  display: grid;
  width: 23px;
  height: 16px;
  place-items: center;
  color: #ffffff;
  background: #7651b5;
  font-size: 9px;
  font-weight: 900;
  line-height: 1;
  clip-path: polygon(24% 0, 76% 0, 100% 50%, 76% 100%, 24% 100%, 0 50%);
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

@media (max-width: 767px) {
  .activity-summary {
    gap: 7px;
    margin-top: 15px;
    padding: 0;
    border-radius: 12px;
  }

  .activity-summary__item {
    min-height: 84px;
    padding: 1px;
    border-radius: 12px;
  }

  .activity-summary__surface {
    min-height: 80px;
    padding: 6px 4px;
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

}
</style>
