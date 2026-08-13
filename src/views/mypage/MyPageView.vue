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

    <SettingsMenu
      aria-label="계정 관리"
      :items="accountManagementItems"
      @select="handleAccountManagementSelect"
    />

    <BaseButton class="logout-button" variant="ghost" block @click="logout">
      <LogOut :size="16" aria-hidden="true" />
      로그아웃
    </BaseButton>

    <BaseModal
      v-model="isWithdrawalOpen"
      :title="withdrawalModalTitle"
      size="small"
      modal-class="withdrawal-modal"
      :close-on-overlay="!isWithdrawing"
      :close-on-esc="!isWithdrawing"
      :show-close-button="!isWithdrawing"
      @close="resetWithdrawalModal"
    >
      <div class="withdrawal-content">
        <span class="withdrawal-content__icon" aria-hidden="true">
          <TriangleAlert :size="26" />
        </span>

        <template v-if="withdrawalStep === 'warning'">
          <strong>회원 탈퇴 전 꼭 확인해 주세요.</strong>
          <ul>
            <li>탈퇴 후 다시 로그인할 수 없습니다.</li>
            <li>계정은 비활성화 처리됩니다.</li>
          </ul>
        </template>

        <template v-else>
          <strong>정말 회원 탈퇴를 진행할까요?</strong>
          <p>이 작업을 완료하면 현재 계정으로 다시 로그인할 수 없습니다.</p>
        </template>

        <p v-if="withdrawalError" class="withdrawal-content__error" role="alert">
          {{ withdrawalError }}
        </p>
      </div>

      <template #footer>
        <BaseButton variant="ghost" :disabled="isWithdrawing" @click="closeWithdrawalModal">
          취소
        </BaseButton>
        <BaseButton
          v-if="withdrawalStep === 'warning'"
          variant="danger"
          @click="withdrawalStep = 'final'"
        >
          계속
        </BaseButton>
        <BaseButton v-else variant="danger" :loading="isWithdrawing" @click="confirmWithdrawal">
          <template #loading>탈퇴 처리 중...</template>
          회원 탈퇴
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronRight, LogOut, TriangleAlert } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { deactivateMyAccount } from '@/api/user'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import ProfileCard from '@/components/mypage/ProfileCard.vue'
import SettingsMenu from '@/components/mypage/SettingsMenu.vue'
import { useAccountStore } from '@/stores/account'
import { useCollectibleStore } from '@/stores/collectible'
import { usePointStore } from '@/stores/point'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const pointStore = usePointStore()
const collectibleStore = useCollectibleStore()
const userStore = useUserStore()
const accountStore = useAccountStore()
const { balance, isLoading: isPointLoading, error: pointError } = storeToRefs(pointStore)
const { user, isLoading: isUserLoading, error: userError } = storeToRefs(userStore)
const { equippedCharacter, isLoading: isCharacterLoading } = storeToRefs(collectibleStore)
const isWithdrawalOpen = ref(false)
const withdrawalStep = ref('warning')
const isWithdrawing = ref(false)
const withdrawalError = ref('')
const withdrawalModalTitle = computed(() =>
  withdrawalStep.value === 'warning' ? '회원 탈퇴 안내' : '회원 탈퇴 최종 확인',
)

const activitySummary = computed(() => [
  { label: '승인 횟수', value: '—' },
  { label: '반려 횟수', value: '—' },
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
    id: 'customer-support',
    icon: 'support',
    label: '고객센터',
    href: 'https://obank.kbstar.com/quics?page=osupp#loading',
  },
]

const accountManagementItems = [
  {
    id: 'password',
    icon: 'password',
    label: '비밀번호 변경',
  },
  {
    id: 'withdrawal',
    icon: 'withdrawal',
    label: '회원 탈퇴',
    danger: true,
  },
]

const goToProfileEdit = () => {
  router.push('/mypage/profile')
}

const handleSettingSelect = (settingId) => {
  if (settingId === 'account') router.push('/mypage/accounts')
  if (settingId === 'settlements') router.push('/mypage/settlements')
}

const handleAccountManagementSelect = (settingId) => {
  if (settingId === 'password') router.push('/mypage/password')
  if (settingId === 'withdrawal') openWithdrawalModal()
}

const openWithdrawalModal = () => {
  withdrawalStep.value = 'warning'
  withdrawalError.value = ''
  isWithdrawalOpen.value = true
}

const resetWithdrawalModal = () => {
  if (isWithdrawing.value) return
  withdrawalStep.value = 'warning'
  withdrawalError.value = ''
}

const closeWithdrawalModal = () => {
  if (isWithdrawing.value) return
  isWithdrawalOpen.value = false
  resetWithdrawalModal()
}

const clearAuthentication = () => {
  accountStore.$reset()
  collectibleStore.$reset()
  pointStore.$reset()
  userStore.$reset()
  localStorage.removeItem('youngly_access_token')
  localStorage.removeItem('youngly_user')
}

const confirmWithdrawal = async () => {
  if (isWithdrawing.value) return

  isWithdrawing.value = true
  withdrawalError.value = ''

  try {
    await deactivateMyAccount()
    clearAuthentication()
    isWithdrawalOpen.value = false
    await router.replace({ name: 'Login', query: { notice: 'account-deactivated' } })
  } catch (error) {
    withdrawalError.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      '회원 탈퇴를 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isWithdrawing.value = false
  }
}

const logout = () => {
  clearAuthentication()
  router.replace('/login')
}

onMounted(() => {
  pointStore.fetchPointBalance()
  collectibleStore.ensureOwnedCharacters()
})
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
  padding: 32px max(24px, calc((100% - 860px) / 2)) 84px;
  color: var(--color-text, #33313d);
  background: #e6dcf6;
  box-sizing: border-box;
}

.mypage > :first-child,
.character-card,
.logout-button {
  grid-column: 1 / -1;
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
  display: grid;
  grid-template-columns: 106px minmax(0, 1fr) 48px;
  gap: 22px;
  align-items: center;
  min-height: 156px;
  padding: 38px 28px 24px;
  overflow: hidden;
  border: 2px solid var(--mypage-ink);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 8px 8px 0 var(--mypage-shadow);
  box-sizing: border-box;
}

.character-card::after {
  position: absolute;
  top: 18px;
  right: 82px;
  width: 8px;
  height: 8px;
  background: #d9c9ef;
  box-shadow:
    14px 0 0 #a98bd3,
    28px 0 0 #7658b5;
  content: '';
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
  border: 2px solid var(--mypage-ink);
  border-radius: 12px;
  color: var(--color-primary-dark, #7156ad);
  background: #eee7fb;
  box-shadow: 3px 3px 0 #cbbbe4;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.character-card__button:hover {
  color: #ffffff;
  background: var(--color-primary-hover, #7156ad);
  box-shadow: 1px 1px 0 #cbbbe4;
  transform: translate(2px, 2px);
}

.character-card__button:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.logout-button {
  min-height: 54px;
  margin-top: 2px;
  border: 2px solid rgba(52, 40, 67, 0.18);
  border-radius: 16px;
  color: #655b6d;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 5px 5px 0 rgba(114, 84, 165, 0.12);
  font-weight: 800;
}

.logout-button:hover:not(:disabled) {
  color: var(--color-danger, #e96363);
}

.withdrawal-content {
  display: grid;
  justify-items: center;
  text-align: center;
}

.withdrawal-content__icon {
  display: grid;
  width: 52px;
  height: 52px;
  margin-bottom: 14px;
  place-items: center;
  border-radius: 16px;
  color: #d85353;
  background: #fff0f1;
}

.withdrawal-content > strong {
  color: #493f50;
  font-size: 16px;
}

.withdrawal-content ul {
  display: grid;
  gap: 7px;
  width: 100%;
  margin: 16px 0 0;
  padding: 14px 16px 14px 34px;
  border-radius: 12px;
  color: #766d7d;
  background: #faf7fb;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  box-sizing: border-box;
}

.withdrawal-content > p:not(.withdrawal-content__error) {
  margin: 12px 0 0;
  color: #766d7d;
  font-size: 13px;
  line-height: 1.55;
}

.withdrawal-content__error {
  width: 100%;
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: #a84242;
  background: #fff0f0;
  font-size: 12px;
  box-sizing: border-box;
}

:global(.withdrawal-modal .base-modal__title) {
  color: #c64d4d;
}

@media (max-width: 420px) {
  :global(.withdrawal-modal) {
    width: calc(100vw - 32px);
  }
}

@media (max-width: 767px) {
  .mypage {
    grid-template-columns: 1fr;
    gap: 17px;
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 18px 16px 44px;
  }

  .mypage > * {
    grid-column: 1;
  }

  .character-card {
    grid-template-columns: 76px minmax(0, 1fr) 36px;
    gap: 14px;
    min-height: 126px;
    padding: 34px 18px 18px;
    border-radius: 20px;
    box-shadow: 5px 5px 0 var(--mypage-shadow);
  }

  .character-card__badge {
    top: 13px;
    left: 18px;
  }

  .character-card__preview {
    width: 74px;
    height: 74px;
    border-radius: 14px;
  }

  .character-card__copy h2 {
    font-size: 17px;
  }

  .character-card__copy p {
    overflow: hidden;
    margin: 4px 0 7px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .character-card__button {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .logout-button {
    min-height: 48px;
    border-radius: 14px;
  }
}

@media (max-width: 390px) {
  .character-card {
    grid-template-columns: 64px minmax(0, 1fr) 32px;
    gap: 11px;
    padding-inline: 14px;
  }

  .character-card__preview {
    width: 62px;
    height: 62px;
  }

  .character-card__action {
    padding-inline: 7px;
    font-size: 10px;
  }
}
</style>
