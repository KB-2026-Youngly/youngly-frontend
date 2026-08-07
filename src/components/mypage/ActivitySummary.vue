<template>
  <dl class="activity-summary" aria-label="활동 요약">
    <div v-for="item in items" :key="item.label" class="activity-summary__item">
      <dt>{{ item.label }}</dt>
      <dd :class="{ 'activity-summary__value--point': item.isPoint }">{{ item.value }}</dd>
    </div>
  </dl>
</template>

<script setup>
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
  margin: 0;
  padding: 0 18px;
  border-right: 1px solid var(--color-border, #ddd9e8);
  text-align: center;
}

.activity-summary__item:first-child {
  padding-left: 0;
}

.activity-summary__item:last-child {
  padding-right: 0;
  border-right: 0;
}

.activity-summary dt {
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
}

.activity-summary dd {
  margin: 6px 0 0;
  color: var(--color-text, #33313d);
  font-size: 22px;
  font-weight: 800;
}

.activity-summary .activity-summary__value--point {
  color: var(--color-primary-dark, #7156ad);
}

@media (max-width: 480px) {
  .activity-summary {
    margin-top: 16px;
    padding-top: 14px;
  }

  .activity-summary__item {
    padding: 0 8px;
  }

  .activity-summary dt {
    font-size: 11px;
  }

  .activity-summary dd {
    font-size: 18px;
  }
}
</style>
