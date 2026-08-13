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
  padding: 28px;
  overflow: hidden;
  border: 2px solid #342843;
  border-radius: 24px;
  color: #ffffff;
  background: #7658b5;
  box-shadow: 9px 9px 0 #bca7dc;
  box-sizing: border-box;
}

.profile-card::before,
.profile-card::after {
  position: absolute;
  background: rgba(255, 255, 255, 0.22);
  content: '';
}

.profile-card::before {
  top: 20px;
  right: 82px;
  width: 10px;
  height: 10px;
  box-shadow:
    16px 0 0 rgba(255, 255, 255, 0.13),
    0 16px 0 rgba(255, 255, 255, 0.13);
}

.profile-card::after {
  right: 0;
  bottom: 22px;
  width: 5px;
  height: 38px;
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
  font-size: 23px;
  line-height: 1.35;
}

.profile-card__info p {
  overflow: hidden;
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-card__settings {
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 11px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 3px 3px 0 rgba(51, 35, 75, 0.28);
  cursor: pointer;
}

.profile-card__settings:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.22);
  box-shadow: 1px 1px 0 rgba(51, 35, 75, 0.28);
  transform: translate(2px, 2px);
}

.profile-card__settings:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .profile-card {
    padding: 22px 18px 18px;
    border-radius: 20px;
    box-shadow: 6px 6px 0 #bca7dc;
  }

  .profile-card__top {
    grid-template-columns: minmax(0, 1fr) 34px;
    gap: 10px;
  }

  .profile-card__info h2 {
    font-size: 20px;
  }

  .profile-card__settings {
    width: 34px;
    height: 34px;
  }
}
</style>
