<template>
  <div class="account-settings">
    <header class="account-settings__header">
      <button type="button" aria-label="마이페이지로 돌아가기" @click="goBack">
        <ArrowLeft :size="22" aria-hidden="true" />
      </button>
      <h1>입출금 계좌 설정</h1>
    </header>

    <p class="account-settings__description">
      Youngly에서 사용할 대표 입출금 계좌를 선택해 주세요.
    </p>

    <section v-if="isLoading" class="state-panel" aria-live="polite">
      <BaseSpinner size="large" label="계좌를 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel" role="alert">
      <BaseEmptyState
        title="계좌를 불러오지 못했어요"
        :description="error"
        action-text="다시 불러오기"
        @action="loadAccounts"
      />
    </section>

    <section v-else-if="accounts.length === 0" class="state-panel">
      <BaseEmptyState
        title="등록할 수 있는 계좌가 없어요"
        description="사용 가능한 KB 입출금 계좌를 찾지 못했어요."
        action-text="다시 조회하기"
        @action="loadAccounts"
      />
    </section>

    <section v-else class="account-list" aria-label="KB 입출금 계좌 목록">
      <AccountCard
        v-for="account in accounts"
        :key="account.kbAccountId"
        :account="account"
        :is-primary="isPrimary(account)"
        :is-selected="selectedAccount?.kbAccountId === account.kbAccountId"
        :disabled="isSaving"
        @select="selectAccount"
      />
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
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import AccountCard from '@/components/account/AccountCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useAccountStore } from '@/stores/account'
import { useUserStore } from '@/stores/user'

const router = useRouter()
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

function goBack() {
  router.push('/mypage')
}

onMounted(loadAccounts)
onBeforeUnmount(() => clearTimeout(messageTimer))
</script>

<style scoped>
.account-settings {
  --color-primary: #7156ad;
  --color-primary-dark: #7156ad;
  --color-primary-hover: #604795;
  --color-primary-soft: #e6dcf6;
  --color-primary-border: #d8c8ed;

  min-height: calc(100vh - 109px);
  margin: -20px;
  padding: 32px max(20px, calc((100% - 780px) / 2)) 60px;
  color: #33313d;
  background: #e6dcf6;
  box-sizing: border-box;
}

.account-settings__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-settings__header button {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 0;
  place-items: center;
  border: 1px solid #ddd9e8;
  border-radius: 10px;
  color: #4a4452;
  background: #ffffff;
  cursor: pointer;
}

.account-settings__header button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.24);
  outline-offset: 2px;
}

.account-settings__header h1 {
  margin: 0;
  font-size: 25px;
}

.account-settings__description {
  margin: 14px 0 24px 52px;
  color: #77717f;
  font-size: 13px;
}

.account-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.state-panel {
  min-height: 300px;
  display: grid;
  place-items: center;
  padding: 24px;
  border: 1px solid #e8e3ed;
  border-radius: 14px;
  background: #ffffff;
}

.message {
  margin: 16px 0 0;
  padding: 13px 16px;
  border-radius: 10px;
  font-size: 13px;
  text-align: center;
}

.message--error,
.modal-error {
  color: #a84242;
  background: #fff0f0;
}

.message--success {
  color: #4f3978;
  background: #eee6f8;
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
    padding: 20px 20px 36px;
  }

  .account-settings__header h1 {
    font-size: 21px;
  }

  .account-settings__description {
    margin-left: 0;
  }

  .account-list {
    grid-template-columns: 1fr;
  }

  .state-panel {
    min-height: 260px;
  }
}
</style>
