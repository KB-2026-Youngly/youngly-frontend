<template>
  <div class="account-settings">
    <header class="account-settings__header">
      <h1>입출금 계좌 설정</h1>
    </header>

    <p class="account-settings__description">
      Youngly에서 사용할 대표 입출금 계좌를 선택해 주세요.
    </p>

    <section v-if="isLoading" class="state-panel yl-mypage-card" aria-live="polite">
      <BaseSpinner size="large" label="계좌를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel yl-mypage-card" role="alert">
      <BaseEmptyState
        title="계좌를 불러오지 못했어요"
        :description="error"
        action-text="다시 불러오기"
        @action="loadAccounts"
      />
    </section>

    <section v-else-if="accounts.length === 0" class="state-panel yl-mypage-card">
      <BaseEmptyState
        title="등록할 수 있는 계좌가 없어요"
        description="사용 가능한 KB 입출금 계좌를 찾지 못했어요."
        action-text="다시 조회하기"
        @action="loadAccounts"
      />
    </section>

    <section v-else class="account-list" aria-label="KB 입출금 계좌 목록">
      <div
        v-for="account in accounts"
        :key="account.kbAccountId"
        class="account-card-shadow yl-stepped-card-shadow"
      >
        <AccountCard
          :account="account"
          :is-primary="isPrimary(account)"
          :is-selected="selectedAccount?.kbAccountId === account.kbAccountId"
          :disabled="isSaving"
          @select="selectAccount"
        />
      </div>
    </section>

    <p v-if="saveError" class="message message--error" role="alert">{{ saveError }}</p>
    <p v-if="successMessage" class="message message--success" role="status">
      {{ successMessage }}
    </p>

    <BaseModal
      v-model="isConfirmOpen"
      title="대표 계좌 변경"
      size="small"
      :close-on-overlay="!isSaving"
      :close-on-esc="!isSaving"
      :show-close-button="!isSaving"
    >
      <p class="confirm-copy">
        <strong>{{ selectedAccount?.bankName || 'KB국민은행' }}</strong>
        <span>{{ maskAccountNumber(selectedAccount?.accountNumber) }}</span>
        계좌를 대표 계좌로 설정할까요?
      </p>

      <p v-if="saveError" class="modal-error" role="alert">{{ saveError }}</p>

      <template #footer>
        <BaseButton variant="ghost" :disabled="isSaving" @click="closeConfirm">취소</BaseButton>
        <BaseButton :loading="isSaving" @click="confirmSelection">
          <template #loading>저장 중...</template>
          변경하기
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AccountCard from '@/components/account/AccountCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useAccountStore } from '@/stores/account'
import { useUserStore } from '@/stores/user'

const accountStore = useAccountStore()
const userStore = useUserStore()
const { accounts, primaryAccount, isLoading, error, isSaving, saveError, successMessage } =
  storeToRefs(accountStore)

const selectedAccount = ref(null)
const isConfirmOpen = ref(false)
let messageTimer = null

function maskAccountNumber(value) {
  const number = String(value || '')
  const digitCount = (number.match(/\d/g) || []).length
  let seenDigits = 0
  return number.replace(/\d/g, (digit) => {
    seenDigits += 1
    return seenDigits <= Math.max(0, digitCount - 4) ? '*' : digit
  })
}

function isPrimary(account) {
  if (primaryAccount.value?.kbAccountId) {
    return primaryAccount.value.kbAccountId === account.kbAccountId
  }
  return Boolean(
    primaryAccount.value?.accountNumber &&
    primaryAccount.value.accountNumber === account.accountNumber,
  )
}

async function loadAccounts() {
  accountStore.clearMessages()
  selectedAccount.value = null
  const user = userStore.user || (await userStore.fetchMyInfo())
  if (!user) {
    accountStore.error = userStore.error || '사용자 정보를 불러오지 못했어요.'
    return
  }
  await accountStore.fetchAccounts(user)
}

function selectAccount(account) {
  if (isSaving.value || isPrimary(account)) return
  accountStore.clearMessages()
  selectedAccount.value = account
  isConfirmOpen.value = true
}

function closeConfirm() {
  if (isSaving.value) return
  isConfirmOpen.value = false
  selectedAccount.value = null
  accountStore.saveError = ''
}

async function confirmSelection() {
  if (!selectedAccount.value || isSaving.value) return
  const saved = await accountStore.savePrimaryAccount(
    selectedAccount.value.kbAccountId,
    userStore.user,
  )
  if (!saved) return

  isConfirmOpen.value = false
  selectedAccount.value = null
  clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    accountStore.successMessage = ''
  }, 3500)
}

onMounted(loadAccounts)
onBeforeUnmount(() => clearTimeout(messageTimer))
</script>

<style scoped>
.account-settings {
  --color-primary: #7156ad;
  --color-primary-dark: #5e4499;
  --color-primary-hover: #604795;
  --color-primary-soft: #f0eafd;
  --color-primary-border: #d8c8ed;

  min-height: calc(100vh - 109px);
  margin: -20px;
  padding: 24px max(20px, calc((100% - 720px) / 2)) 72px;
  color: #33313d;
  background: #e6dcf6;
  box-sizing: border-box;
}

.account-settings__header {
  display: block;
}

.account-settings__header button {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 50%;
  color: var(--color-primary-dark);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 5px 14px rgba(66, 43, 99, 0.07);
  cursor: pointer;
}

.account-back-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 4px;
  width: 40px !important;
}

.account-back-button {
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #ffffff;
}

.account-back-button__surface {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--color-primary-dark);
  background: #ffffff;
}

.account-settings__header button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.24);
  outline-offset: 2px;
}

.account-settings__header h1 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.03em;
  text-align: center;
}

.account-settings__description {
  margin: 14px 0 24px;
  color: #77717f;
  font-size: 13px;
  text-align: center;
}

.account-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.account-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 6px;
}

.state-panel {
  min-height: 300px;
  display: grid;
  place-items: center;
  padding: 24px;
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.message {
  margin: 16px 0 0;
  padding: 13px 16px;
  border: 1px solid transparent;
  border-radius: 13px;
  font-size: 13px;
  text-align: center;
}

.message--error,
.modal-error {
  color: #a84242;
  background: #fff0f0;
  border-color: #f4d8d8;
}

.message--success {
  color: #4f3978;
  background: #eee6f8;
  border-color: #ded0ed;
}

.confirm-copy {
  display: grid;
  gap: 7px;
  margin: 0;
  color: #5d5665;
  font-size: 14px;
  line-height: 1.55;
}

.confirm-copy strong {
  color: #33313d;
  font-size: 16px;
}

.confirm-copy span {
  margin-bottom: 7px;
  color: #77717f;
  font-size: 13px;
}

.modal-error {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
}

@media (max-width: 767px) {
  .account-settings {
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 16px 16px 40px;
  }

  .account-settings__header h1 {
    font-size: 21px;
  }

  .account-list {
    grid-template-columns: 1fr;
  }

  .state-panel {
    min-height: 260px;
  }
}
</style>

<style scoped>
.account-settings {
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;
  padding-inline: max(22px, calc((100% - 760px) / 2));
}

.account-settings__header button {
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  filter: none;
  clip-path: polygon(8px 0, calc(100% - 8px) 0, calc(100% - 8px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 3px) calc(100% - 8px), calc(100% - 3px) calc(100% - 3px), calc(100% - 8px) calc(100% - 3px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 8px), 0 calc(100% - 8px), 0 8px, 3px 8px, 3px 3px, 8px 3px);
}

.account-settings__header button:hover {
  box-shadow: 2px 2px 0 var(--mypage-shadow);
  transform: translate(2px, 2px);
}

.account-settings__header h1 {
  color: var(--mypage-ink);
  font-size: 27px;
}

.state-panel {
  border: 2px solid var(--mypage-ink);
  box-shadow: 7px 7px 0 var(--mypage-shadow);
}

@media (max-width: 767px) {
  .account-settings {
    padding-inline: 16px;
  }
}
</style>
