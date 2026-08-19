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
          </div>
        </div>

        <ActivitySummary :items="summary" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ActivitySummary from '@/components/mypage/ActivitySummary.vue'
import { useUserStore } from '@/stores/user'

defineProps({
  summary: {
    type: Array,
    required: true,
  },
})

const { user } = storeToRefs(useUserStore())
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

.profile-card__top {
  display: block;
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

@media (max-width: 480px) {
  .profile-card {
    padding: 2px;
  }

  .profile-card__surface {
    padding: 20px 16px 16px;
  }

  .profile-card__info h2 {
    font-size: 20px;
  }
}
</style>
