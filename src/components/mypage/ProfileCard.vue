<template>
  <section class="profile-card" aria-labelledby="profile-name">
    <div class="profile-card__top">
      <div class="profile-card__info">
        <h2 id="profile-name">{{ user?.name || '이름 없음' }}</h2>
        <p>{{ user?.email || '이메일 정보 없음' }}</p>
      </div>

      <button
        class="profile-card__settings"
        type="button"
        aria-label="내 정보 수정"
        @click="emit('edit')"
      >
        <Settings :size="18" aria-hidden="true" />
      </button>
    </div>

    <ActivitySummary :items="summary" />
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { Settings } from 'lucide-vue-next'
import ActivitySummary from '@/components/mypage/ActivitySummary.vue'
import { useUserStore } from '@/stores/user'

defineProps({
  summary: {
    type: Array,
    required: true,
  },
})

const { user } = storeToRefs(useUserStore())
const emit = defineEmits(['edit'])
</script>

<style scoped>
.profile-card {
  padding: 20px;
  border: 1px solid rgba(113, 86, 173, 0.08);
  border-radius: 18px;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 8px 24px rgba(62, 45, 92, 0.08);
  box-sizing: border-box;
}

.profile-card__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px;
  align-items: center;
  gap: 16px;
}

.profile-card__info {
  min-width: 0;
  flex: 1;
}

.profile-card__info h2 {
  margin: 0;
  color: var(--color-text, #33313d);
  font-size: 19px;
  line-height: 1.35;
}

.profile-card__info p {
  overflow: hidden;
  margin: 4px 0 0;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-card__settings {
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--color-primary-dark, #7156ad);
  background: #f2ecf9;
  cursor: pointer;
}

.profile-card__settings:hover {
  color: var(--color-primary, #7156ad);
  background: var(--color-surface-hover, #f4f2f8);
}

.profile-card__settings:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .profile-card {
    padding: 16px 14px 14px;
    border-radius: 16px;
  }

  .profile-card__top {
    grid-template-columns: minmax(0, 1fr) 36px;
    gap: 10px;
  }

  .profile-card__info h2 {
    font-size: 17px;
  }

  .profile-card__settings {
    width: 36px;
    height: 36px;
  }
}
</style>
