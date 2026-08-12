<template>
  <div class="mypage">
    <section v-if="userError" class="state-panel" role="alert">
      <BaseEmptyState
        title="사용자 정보를 불러오지 못했어요"
        :description="userError"
        action-text="다시 불러오기"
        @action="userStore.fetchMyInfo"
      />
    </section>

    <section v-else-if="isUserLoading || !user" class="state-panel">
      <BaseSpinner size="large" label="사용자 정보를 불러오는 중..." centered />
    </section>

    <ProfileCard v-else :summary="activitySummary" @edit="goToProfileEdit" />

    <section class="character-card" aria-labelledby="character-title">
      <div class="character-card__preview">
        <BaseSpinner
          v-if="isCharacterLoading"
          size="small"
          :show-label="false"
          aria-label="캐릭터를 불러오는 중"
        />
        <CharacterPreview v-else :character="equippedCharacter" />
      </div>
      <div class="character-card__copy">
        <h2 id="character-title">내 캐릭터</h2>
        <p>{{ characterDescription }}</p>
        <span>캐릭터 선택 및 장착</span>
      </div>
      <button
        class="character-card__button"
        type="button"
        aria-label="내 캐릭터 선택 화면으로 이동"
        @click="router.push('/characters')"
      >
        <ChevronRight :size="20" aria-hidden="true" />
      </button>
    </section>

    <SettingsMenu :items="settingsItems" @select="handleSettingSelect" />

    <BaseButton class="logout-button" variant="ghost" block @click="logout">
      <LogOut :size="16" aria-hidden="true" />
      로그아웃
    </BaseButton>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronRight, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import ProfileCard from '@/components/mypage/ProfileCard.vue'
import SettingsMenu from '@/components/mypage/SettingsMenu.vue'
import { useCollectibleStore } from '@/stores/collectible'
import { usePointStore } from '@/stores/point'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const pointStore = usePointStore()
const collectibleStore = useCollectibleStore()
const userStore = useUserStore()
const { balance, isLoading: isPointLoading, error: pointError } = storeToRefs(pointStore)
const { user, isLoading: isUserLoading, error: userError } = storeToRefs(userStore)
const {
  equippedCharacter,
  isLoading: isCharacterLoading,
  error: characterError,
} = storeToRefs(collectibleStore)

const activitySummary = computed(() => [
  { label: '완료 횟수', value: '—' },
  { label: '평균 달성률', value: '—' },
  {
    label: '보유 포인트',
    value: isPointLoading.value
      ? '...'
      : pointError.value
        ? '—'
        : `${new Intl.NumberFormat('ko-KR').format(balance.value)}P`,
    isPoint: true,
    to: '/point',
  },
])

const characterDescription = computed(() => {
  if (isCharacterLoading.value) return '현재 장착 캐릭터를 불러오는 중이에요.'
  if (characterError.value) return '현재 캐릭터를 불러오지 못했어요.'
  if (equippedCharacter.value) return `${equippedCharacter.value.name} 캐릭터를 장착 중이에요.`
  return '장착 중인 캐릭터가 없어요.'
})

const settingsItems = [
  {
    id: 'account',
    icon: 'account',
    label: '입출금 계좌 설정',
  },
  {
    id: 'challenge-history',
    icon: 'history',
    label: '챌린지 기록',
  },
]

const goToProfileEdit = () => {
  router.push('/mypage/profile')
}

const handleSettingSelect = (settingId) => {
  if (settingId === 'account') router.push('/mypage/accounts')
}

const logout = () => {
  collectibleStore.$reset()
  pointStore.$reset()
  userStore.$reset()
  localStorage.removeItem('youngly_access_token')
  localStorage.removeItem('youngly_user')
  router.replace('/login')
}

onMounted(() => {
  pointStore.fetchPointBalance()
  collectibleStore.ensureOwnedCharacters()
})
</script>

<style scoped>
.mypage {
  --color-primary: #7156ad;
  --color-primary-dark: #7156ad;
  --color-primary-hover: #7156ad;
  --color-primary-soft: #e6dcf6;
  --color-primary-border: #e6dcf6;
  --color-surface-hover: #e6dcf6;

  display: grid;
  gap: 14px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 24px max(20px, calc((100% - 760px) / 2)) 72px;
  color: var(--color-text, #33313d);
  background: #e6dcf6;
  box-sizing: border-box;
}

.state-panel {
  min-height: 260px;
  display: grid;
  place-items: center;
  padding: 24px;
  border-radius: 18px;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 8px 24px rgba(62, 45, 92, 0.08);
}

.character-card {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 40px;
  gap: 16px;
  align-items: center;
  min-height: 96px;
  padding: 18px 20px;
  border: 1px solid rgba(113, 86, 173, 0.08);
  border-radius: 18px;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 8px 24px rgba(62, 45, 92, 0.08);
  box-sizing: border-box;
}

.character-card__preview {
  display: grid;
  width: 58px;
  height: 58px;
  padding: 6px;
  place-items: center;
  border-radius: 16px;
  background: #f2ecf9;
  box-sizing: border-box;
}

.character-card__copy {
  min-width: 0;
}

.character-card__copy h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
}

.character-card__copy p {
  overflow: hidden;
  margin: 5px 0 4px;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-card__copy span {
  color: var(--color-primary-dark, #7156ad);
  font-size: 11px;
  font-weight: 700;
}

.character-card__button {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--color-primary-dark, #7156ad);
  background: #f0e9f8;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.character-card__button:hover {
  color: #ffffff;
  background: var(--color-primary-hover, #7156ad);
  transform: translateX(2px);
}

.character-card__button:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.logout-button {
  min-height: 54px;
  border: 0;
  border-radius: 16px;
  color: var(--color-text-muted, #77717f);
  background: var(--color-surface, #ffffff);
  box-shadow: 0 8px 24px rgba(62, 45, 92, 0.07);
}

@media (max-width: 767px) {
  .mypage {
    gap: 12px;
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 16px 16px 36px;
  }

  .character-card {
    grid-template-columns: 52px minmax(0, 1fr) 34px;
    gap: 12px;
    min-height: 84px;
    padding: 14px;
    border-radius: 16px;
  }

  .character-card__preview {
    width: 50px;
    height: 50px;
    border-radius: 14px;
  }

  .character-card__copy h2 {
    font-size: 15px;
  }

  .character-card__copy p {
    overflow: hidden;
    margin: 4px 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .character-card__button {
    width: 32px;
    height: 32px;
  }

  .logout-button {
    min-height: 52px;
    border-radius: 16px;
  }
}
</style>
