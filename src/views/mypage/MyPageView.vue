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
  --color-primary: #7156ad;
  --color-primary-dark: #5e4499;
  --color-primary-hover: #6448a3;
  --color-primary-soft: #f0eafd;
  --color-primary-border: #ded2f1;
  --color-surface-hover: #f7f3fc;

  display: grid;
  gap: 16px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 24px max(20px, calc((100% - 680px) / 2)) 72px;
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
  position: relative;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) 40px;
  gap: 18px;
  align-items: center;
  min-height: 132px;
  padding: 34px 22px 20px;
  overflow: hidden;
  border: 1px solid rgba(113, 86, 173, 0.1);
  border-radius: 22px;
  background:
    radial-gradient(circle at 12% 100%, rgba(218, 202, 240, 0.7), transparent 34%),
    var(--color-surface, #ffffff);
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
  box-sizing: border-box;
}

.character-card__badge {
  position: absolute;
  top: 15px;
  left: 22px;
  color: var(--color-primary, #7156ad);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.character-card__preview {
  display: grid;
  width: 82px;
  height: 82px;
  padding: 0;
  place-items: center;
  overflow: hidden;
  border: 0;
  border-radius: 14px;
  background: transparent;
  box-sizing: border-box;
}

.character-card__copy {
  min-width: 0;
}

.character-card__copy h2 {
  margin: 0;
  font-size: 18px;
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
  margin-top: 8px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--color-primary-dark, #7156ad);
  background: var(--color-primary-soft, #f0eafd);
  font-size: 11px;
  font-weight: 700;
}

.character-card__button {
  display: grid;
  width: 38px;
  height: 38px;
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
  min-height: 48px;
  margin-top: 2px;
  border: 1px solid rgba(113, 86, 173, 0.1);
  border-radius: 14px;
  color: var(--color-text-muted, #77717f);
  background: rgba(255, 255, 255, 0.62);
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
    gap: 14px;
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 16px 16px 36px;
  }

  .character-card {
    grid-template-columns: 68px minmax(0, 1fr) 34px;
    gap: 12px;
    min-height: 116px;
    padding: 32px 16px 16px;
    border-radius: 20px;
  }

  .character-card__badge {
    top: 13px;
    left: 16px;
  }

  .character-card__preview {
    width: 66px;
    height: 66px;
    border-radius: 18px;
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
  }

  .logout-button {
    min-height: 48px;
    border-radius: 14px;
  }
}
</style>
