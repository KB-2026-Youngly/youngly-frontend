<template>
  <section class="profile-card" aria-labelledby="profile-name">
    <div class="profile-card__top">
      <span class="profile-card__avatar" aria-hidden="true">
        <img
          v-if="user?.profileImageUrl && !profileImageFailed"
          :src="user?.profileImageUrl"
          alt=""
          @error="profileImageFailed = true"
        />
        <span v-else>{{ avatarInitial }}</span>
      </span>

      <div class="profile-card__info">
        <h2 id="profile-name">{{ user?.name || '이름 없음' }}</h2>
        <p>{{ user?.email || '이메일 정보 없음' }}</p>
        <span class="profile-card__badge">{{ user?.nickname || '닉네임 없음' }}</span>
      </div>

      <button class="profile-card__settings" type="button" aria-label="내 정보 수정" @click="emit('edit')">
        <Settings :size="18" aria-hidden="true" />
      </button>
    </div>

    <ActivitySummary :items="summary" />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Settings } from 'lucide-vue-next'
import ActivitySummary from '@/components/mypage/ActivitySummary.vue'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  summary: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['edit'])
const profileImageFailed = ref(false)
const avatarInitial = computed(() =>
  String(props.user?.nickname || props.user?.name || '회').trim().charAt(0) || '회',
)

watch(
  () => props.user?.profileImageUrl,
  () => {
    profileImageFailed.value = false
  },
)
</script>

<style scoped>
.profile-card {
  padding: 24px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
  box-sizing: border-box;
}

.profile-card__top {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-card__avatar {
  display: grid;
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  place-items: center;
  border: 2px solid var(--color-primary-dark, #7156ad);
  border-radius: 50%;
  color: #ffffff;
  background: var(--color-primary, #7156ad);
  font-size: 20px;
  font-weight: 800;
}

.profile-card__avatar:has(img) {
  background: var(--color-primary-soft, #e6dcf6);
}

.profile-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-card__info {
  min-width: 0;
  flex: 1;
}

.profile-card__info h2 {
  margin: 0;
  color: var(--color-text, #33313d);
  font-size: 20px;
}

.profile-card__info p {
  margin: 5px 0 8px;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
}

.profile-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid var(--color-primary-border, #e6dcf6);
  border-radius: 999px;
  color: var(--color-primary-dark, #7156ad);
  background: var(--color-primary-soft, #e6dcf6);
  font-size: 11px;
  font-weight: 700;
}

.profile-card__settings {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 4px;
  color: var(--color-text-muted, #77717f);
  background: var(--color-surface, #ffffff);
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
    padding: 16px;
    border-radius: 8px;
  }

  .profile-card__top {
    gap: 12px;
  }

  .profile-card__avatar {
    width: 54px;
    height: 54px;
    flex-basis: 54px;
    font-size: 17px;
  }

  .profile-card__info h2 {
    font-size: 17px;
  }
}
</style>
