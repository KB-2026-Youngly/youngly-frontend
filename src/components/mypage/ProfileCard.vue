<template>
  <div class="profile-card-shell yl-stepped-card-shadow">
    <section
      class="profile-card yl-card-frame pixel-step-card pixel-step-solid"
      aria-labelledby="profile-name"
    >
      <div class="profile-card__surface pixel-step-surface">
        <div class="profile-card__top">
          <div class="profile-card__info">
            <h2 id="profile-name">{{ displayName }}님</h2>
            <p>{{ user?.email || '이메일 정보 없음' }}</p>
          </div>

          <button
        class="profile-card__settings pixel-step-button pixel-step-button--compact pixel-step-solid"
            type="button"
            aria-label="내 정보 수정"
            @click="emit('edit')"
          >
            <span class="profile-card__settings-surface pixel-step-surface">
              <Settings :size="17" aria-hidden="true" />
            </span>
          </button>
        </div>

        <ActivitySummary :items="summary" />
      </div>
    </section>
  </div>
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
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #7658b5;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-sizing: border-box;
}

.profile-card-shell {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}

.profile-card__surface {
  position: relative;
  min-height: 100%;
  padding: 26px;
  overflow: hidden;
  color: #ffffff;
  background: #7658b5;
  box-sizing: border-box;
}

.profile-card__surface::before,
.profile-card__surface::after {
  position: absolute;
  background: rgba(255, 255, 255, 0.22);
  content: '';
}

.profile-card__surface::before {
  top: 20px;
  right: 82px;
  width: 10px;
  height: 10px;
  box-shadow:
    16px 0 0 rgba(255, 255, 255, 0.13),
    0 16px 0 rgba(255, 255, 255, 0.13);
}

.profile-card__surface::after {
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
  --pixel-outline-color: rgba(255, 255, 255, 0.78);
  --pixel-fill: #8369bb;
  display: grid;
  width: 38px;
  height: 38px;
  padding: 2px;
  place-items: center;
  border: 0;
  border-radius: 0;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: none;
  filter: drop-shadow(3px 3px 0 rgba(51, 35, 75, 0.28)) !important;
  cursor: pointer;
}

.profile-card__settings-surface {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #ffffff;
  background: #8369bb;
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
    padding: 2px;
  }

  .profile-card__surface {
    padding: 20px 16px 16px;
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
