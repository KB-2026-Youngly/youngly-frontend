<template>
  <div class="mypage">
    <section v-if="userError" class="state-panel yl-mypage-card" role="alert">
      <BaseEmptyState
        title="사용자 정보를 불러오지 못했어요"
        :description="userError"
        action-text="다시 불러오기"
        @action="userStore.fetchMyInfo"
      />
    </section>

    <section v-else-if="isUserLoading || !user" class="state-panel yl-mypage-card">
      <BaseSpinner size="large" label="사용자 정보를 불러오는 중..." centered />
    </section>

    <ProfileCard v-else :summary="activitySummary" />

    <div class="character-card-shadow yl-stepped-card-shadow">
      <RouterLink
        to="/characters"
        class="character-card yl-stepped-card-shape"
        aria-labelledby="character-title"
      >
        <div class="character-card__surface yl-stepped-card-shape">
          <span class="character-card__badge">MY CHARACTER</span>
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
            <span class="character-card__action">캐릭터 뽑기 · 선택 및 장착</span>
          </div>
          <span
            class="character-card__button"
            aria-hidden="true"
          >
            <span class="character-card__button-surface"
              ><ChevronRight :size="20" aria-hidden="true"
            /></span>
          </span>
        </div>
      </RouterLink>
    </div>

    <SettingsMenu :items="settingsItems" @select="handleSettingSelect" />

    <div class="account-exit-bar" role="group" aria-label="계정 및 지원 메뉴">
      <button type="button" @click="logout">로그아웃</button>
      <span class="account-exit-bar__divider" aria-hidden="true"></span>
      <a
        href="https://obank.kbstar.com/quics?page=osupp#loading"
        target="_blank"
        rel="noopener noreferrer"
      >
        고객센터
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import ProfileCard from '@/components/mypage/ProfileCard.vue'
import SettingsMenu from '@/components/mypage/SettingsMenu.vue'
import { useAccountStore } from '@/stores/account'
import { useCollectibleStore } from '@/stores/collectible'
import { useMyPageStore } from '@/stores/mypage'
import { usePointStore } from '@/stores/point'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const pointStore = usePointStore()
const collectibleStore = useCollectibleStore()
const userStore = useUserStore()
const accountStore = useAccountStore()
const myPageStore = useMyPageStore()
const { balance, isLoading: isPointLoading, error: pointError } = storeToRefs(pointStore)
const { user, isLoading: isUserLoading, error: userError } = storeToRefs(userStore)
const { equippedCharacter, isLoading: isCharacterLoading } = storeToRefs(collectibleStore)
const { approvedCount, rejectedCount, isActivityLoading, activityError } = storeToRefs(myPageStore)

const formatActivityCount = (count) => {
  if (isActivityLoading.value) return '...'
  if (activityError.value || count == null) return '—'
  return new Intl.NumberFormat('ko-KR').format(count)
}

const activitySummary = computed(() => [
  { label: '승인 횟수', value: formatActivityCount(approvedCount.value) },
  { label: '반려 횟수', value: formatActivityCount(rejectedCount.value) },
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

const settingsItems = [
  {
    id: 'account',
    icon: 'account',
    label: '입출금 계좌 설정',
  },
  {
    id: 'settlements',
    icon: 'history',
    label: '정산 내역',
  },
  {
    id: 'password',
    icon: 'password',
    label: '비밀번호 변경',
  },
]

const handleSettingSelect = (settingId) => {
  if (settingId === 'account') router.push('/mypage/accounts')
  if (settingId === 'settlements') router.push('/mypage/settlements')
  if (settingId === 'password') router.push('/mypage/password')
}

const clearAuthentication = () => {
  accountStore.$reset()
  collectibleStore.$reset()
  myPageStore.$reset()
  pointStore.$reset()
  userStore.$reset()
  localStorage.removeItem('youngly_access_token')
  localStorage.removeItem('youngly_user')
}

const logout = () => {
  clearAuthentication()
  router.replace('/login')
}

onMounted(() => {
  pointStore.fetchPointBalance()
  collectibleStore.ensureOwnedCharacters()
})

watch(
  () => user.value?.userId,
  (userId) => {
    if (userId) myPageStore.fetchActivitySummary()
  },
  { immediate: true },
)
</script>

<style scoped>
.mypage {
  --color-primary: #7658b5;
  --color-primary-dark: #51367f;
  --color-primary-hover: #60429a;
  --color-primary-soft: #eee7fb;
  --color-primary-border: #cdbfe6;
  --color-surface-hover: #f7f3fc;
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 12px 20px 84px;
  color: var(--color-text, #33313d);
  background: #e6dcf6;
  box-sizing: border-box;
}

.mypage > :first-child,
.character-card-shadow,
.settings-menu-shell,
.account-exit-bar {
  grid-column: 1 / -1;
}

.account-exit-bar {
  position: relative;
  isolation: isolate;
  display: flex;
  width: 100%;
  min-height: 46px;
  padding: 6px 18px;
  align-items: center;
  justify-content: center;
  border: 0;
  color: rgba(80, 69, 91, 0.5);
  background: rgba(172, 153, 210, 0.2);
  filter: drop-shadow(5px 5px 0 rgba(200, 183, 229, 0.18));
  clip-path: polygon(
    9px 0,
    calc(100% - 9px) 0,
    calc(100% - 9px) 3px,
    calc(100% - 3px) 3px,
    calc(100% - 3px) 9px,
    100% 9px,
    100% calc(100% - 9px),
    calc(100% - 3px) calc(100% - 9px),
    calc(100% - 3px) calc(100% - 3px),
    calc(100% - 9px) calc(100% - 3px),
    calc(100% - 9px) 100%,
    9px 100%,
    9px calc(100% - 3px),
    3px calc(100% - 3px),
    3px calc(100% - 9px),
    0 calc(100% - 9px),
    0 9px,
    3px 9px,
    3px 3px,
    9px 3px
  );
  box-sizing: border-box;
}

.account-exit-bar::before {
  content: '';
  position: absolute;
  inset: 2px;
  z-index: 0;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  clip-path: inherit;
  pointer-events: none;
}

.account-exit-bar :is(button, a) {
  position: relative;
  z-index: 1;
  min-width: 112px;
  padding: 9px 18px;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 0.16s ease,
    background-color 0.16s ease;
}

.account-exit-bar :is(button, a):hover {
  color: #655b6d;
  background: rgba(255, 255, 255, 0.48);
}

.account-exit-bar :is(button, a):focus-visible {
  outline: 2px solid rgba(113, 86, 173, 0.28);
  outline-offset: 1px;
}

.account-exit-bar__divider {
  position: relative;
  z-index: 1;
  width: 1px;
  height: 16px;
  flex: 0 0 1px;
  background: rgba(101, 91, 109, 0.12);
}

.state-panel {
  min-height: 260px;
  display: grid;
  place-items: center;
  padding: 24px;
  border: 2px solid var(--mypage-ink);
  border-radius: 20px;
  background: var(--color-surface, #ffffff);
  box-shadow: 7px 7px 0 var(--mypage-shadow);
}

.character-card {
  position: relative;
  display: block;
  min-height: 156px;
  padding: 2px;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #ac99d2;
  box-shadow: none;
  box-sizing: border-box;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}

.character-card__surface {
  position: relative;
  display: grid;
  grid-template-columns: 106px minmax(0, 1fr) 48px;
  gap: 22px;
  align-items: center;
  min-height: 152px;
  padding: 36px 26px 22px;
  overflow: hidden;
  background: #ffffff;
  box-sizing: border-box;
}

.character-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 6px;
}

.character-card__badge {
  position: absolute;
  top: 17px;
  left: 28px;
  color: var(--color-primary, #7156ad);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.character-card__preview {
  display: grid;
  width: 104px;
  height: 104px;
  padding: 0;
  place-items: center;
  overflow: hidden;
  border: 0;
  border-radius: 18px;
  background: transparent;
  box-sizing: border-box;
}

.character-card__copy {
  min-width: 0;
}

.character-card__copy h2 {
  margin: 0;
  color: var(--mypage-ink);
  font-size: 21px;
  line-height: 1.3;
}

.character-card__copy p {
  overflow: hidden;
  margin: 6px 0 8px;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-card__action {
  display: inline-flex;
  margin-top: 10px;
  padding: 6px 10px;
  border: 1px solid #d8ccea;
  border-radius: 8px;
  color: var(--color-primary-dark, #7156ad);
  background: var(--color-primary-soft, #f0eafd);
  font-size: 11px;
  font-weight: 800;
}

.character-card__button {
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  border: 1px solid #d8ccea;
  border-radius: 13px;
  color: var(--color-primary-dark, #7156ad);
  background: #f5f0fc;
  box-shadow: 0 4px 10px rgba(81, 54, 127, 0.12);
  filter: none !important;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.character-card__button-surface {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--color-primary-dark, #7156ad);
  background: transparent;
}

.character-card:hover .character-card__button {
  color: #ffffff;
  background: var(--color-primary-hover, #7156ad);
  box-shadow: 0 6px 14px rgba(81, 54, 127, 0.2);
  transform: translateX(2px);
}

.character-card:hover .character-card__button-surface {
  color: #ffffff;
}

.character-card:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .mypage {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto minmax(56px, 1fr);
    gap: 14px;
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 10px clamp(12px, 4vw, 20px) 12px;
  }

  .mypage > * {
    grid-column: 1;
  }

  .character-card {
    min-height: 116px;
    padding: 2px;
    border-radius: 0;
    box-shadow: none;
  }

  .character-card__surface {
    grid-template-columns: 68px minmax(0, 1fr) 32px;
    gap: 12px;
    min-height: 112px;
    padding: 29px 14px 13px;
  }

  .character-card-shadow {
    --yl-stepped-shadow-offset: 4px;
  }

  .character-card__badge {
    top: 11px;
    left: 16px;
    font-size: 8px;
  }

  .character-card__preview {
    width: 66px;
    height: 66px;
    border-radius: 12px;
  }

  .character-card__copy h2 {
    font-size: 16px;
  }

  .character-card__copy p {
    overflow: hidden;
    margin: 4px 0 7px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .character-card__button {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(81, 54, 127, 0.12);
  }

  .character-card__action {
    margin-top: 7px;
    padding: 5px 8px;
    font-size: 10px;
    line-height: 1.2;
  }

  .account-exit-bar {
    align-self: end;
    min-height: 42px;
    margin-top: 4px;
    padding-inline: 10px;
    filter: drop-shadow(3px 3px 0 rgba(200, 183, 229, 0.16));
  }

  .account-exit-bar :is(button, a) {
    min-width: 0;
    flex: 1;
    padding-inline: 10px;
  }
}

@media (max-width: 390px) {
  .character-card {
    padding: 2px;
  }

  .character-card__surface {
    grid-template-columns: 60px minmax(0, 1fr) 30px;
    gap: 9px;
    padding-inline: 11px;
  }

  .character-card__preview {
    width: 58px;
    height: 58px;
  }

  .character-card__action {
    padding-inline: 7px;
    font-size: 10px;
  }
}
</style>
