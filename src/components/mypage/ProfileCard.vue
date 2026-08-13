<template>
  <section class="profile-card" aria-labelledby="profile-name">
    <div class="profile-card__top">
      <div class="profile-card__info">
        <h2 id="profile-name">{{ displayName }}님</h2>
        <p>{{ user?.email || '이메일 정보 없음' }}</p>
      </div>

      <button
        class="profile-card__settings"
        type="button"
        aria-label="내 정보 수정"
        @click="emit('edit')"
      >
        <Settings :size="17" aria-hidden="true" />
      </button>
    </div>

    <ActivitySummary :items="summary" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
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
const displayName = computed(() => user.value?.nickname || user.value?.name || '이름 없음')
</script>

<style scoped>
.profile-card {
  position: relative;
  padding: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 22px;
  color: #ffffff;
  background:
    radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.18), transparent 24%),
    linear-gradient(135deg, #7156ad 0%, #8d6fc5 100%);
  box-shadow: 0 16px 36px rgba(83, 57, 128, 0.22);
  box-sizing: border-box;
}

.profile-card__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 38px;
  align-items: center;
  gap: 16px;
}

.profile-card__info {
  min-width: 0;
  flex: 1;
}

.profile-card__info h2 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  line-height: 1.35;
}

.profile-card__info p {
  overflow: hidden;
  margin: 3px 0 0;
  color: rgba(255, 255, 255, 0.72);
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
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.13);
  cursor: pointer;
}

.profile-card__settings:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.22);
}

.profile-card__settings:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .profile-card {
    padding: 20px 16px 16px;
    border-radius: 20px;
  }

  .profile-card__top {
    grid-template-columns: minmax(0, 1fr) 34px;
    gap: 10px;
  }

  .profile-card__info h2 {
    font-size: 18px;
  }

  .profile-card__settings {
    width: 34px;
    height: 34px;
  }
}
</style>
