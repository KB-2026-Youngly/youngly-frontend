<template>
  <section class="detail-page">
    <button class="back-button" type="button" @click="router.push('/asset')">← 자산으로</button>

    <div v-if="loading" class="detail-state">모임통장 정보를 불러오고 있어요.</div>
    <div v-else-if="error" class="detail-state error">{{ error }}</div>
    <template v-else-if="account">
      <article class="account-summary">
        <div class="summary-main-row">
          <span class="kb-badge">KB</span>
          <h1>{{ account.accountName || 'KB 모임통장' }}</h1>
        </div>
        <dl class="account-meta-row">
          <div><dt>계좌번호</dt><dd>{{ account.accountNumber }}</dd></div>
          <div><dt>잔액</dt><dd class="balance">{{ formatCurrency(account.balance) }}원</dd></div>
          <div><dt>은행</dt><dd>{{ account.bankName }}</dd></div>
        </dl>
      </article>

      <section v-if="group" class="deposit-status-section">
        <div class="section-heading">
          <div><small>{{ group.groupName }}</small><h2>예치금 현황</h2></div>
          <strong>{{ members.length }}명 참여</strong>
        </div>

        <div v-if="membersLoading" class="member-state">예치금 현황을 불러오고 있어요.</div>
        <div v-else-if="membersError" class="member-state error">{{ membersError }}</div>
        <template v-else>
          <ul class="member-list">
            <li v-for="member in members" :key="member.userId">
              <div class="member-profile">
                <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="`${member.nickname} 프로필`" />
                <span v-else>{{ member.nickname?.slice(0, 1) || '?' }}</span>
                <div>
                  <strong>{{ member.nickname }}</strong>
                  <small class="status-badge" :class="statusClass(member)">{{ depositStatusLabel(member) }}</small>
                </div>
              </div>
              <div class="member-deposit">
                <strong>{{ formatCurrency(member.currentDepositAmount) }}원</strong>
                <span>/ {{ formatCurrency(member.requiredAmount) }}원</span>
              </div>
              <div class="deposit-progress" aria-hidden="true">
                <span :style="{ width: `${depositProgress(member)}%` }"></span>
              </div>
            </li>
          </ul>
          <div class="deposit-actions">
            <button class="secondary-action" type="button" disabled>그룹으로 이동</button>
            <button class="primary-action" type="button" @click="openDepositModal">예치금 채우기</button>
          </div>
        </template>
      </section>

      <TransactionHistory account-type="MOIM" :account-id="account.moimAccountId" :initial-limit="6" />
    </template>

    <BaseModal v-model="depositModalOpen" title="예치금 채우기" size="medium">
      <div v-if="depositLoading" class="modal-state">계좌와 예치금 정보를 확인하고 있어요.</div>
      <div v-else-if="depositError && !personalAccount" class="modal-state error">{{ depositError }}</div>
      <div v-else class="deposit-modal-content">
        <div class="transfer-account-card">
          <span>내 입출금 통장</span>
          <strong>{{ personalAccount?.bankName }} {{ personalAccount?.accountNumber }}</strong>
          <b>{{ formatCurrency(personalAccount?.balance) }}원</b>
        </div>
        <div class="transfer-arrow" aria-hidden="true">↓</div>
        <div class="transfer-account-card destination">
          <span>{{ group?.groupName || '모임통장' }}</span>
          <strong>{{ account?.bankName }} {{ account?.accountNumber }}</strong>
          <b>{{ formatCurrency(account?.balance) }}원</b>
        </div>

        <div class="deposit-guide">
          <span>현재 내 예치금</span><b>{{ formatCurrency(myDeposit?.depositedAmount) }}원</b>
          <span>최소 예치금</span><b>{{ formatCurrency(myDeposit?.requiredAmount) }}원</b>
        </div>

        <div class="amount-action-row">
          <label class="amount-field">
            <span>채울 금액</span>
            <div><input v-model.number="depositAmount" type="number" min="0" step="1000" /><em>원</em></div>
          </label>
          <button class="modal-primary" type="button" :disabled="!canRequestDeposit" @click="openDepositConfirm">
            채우기
          </button>
        </div>
        <p v-if="depositError" class="inline-error">{{ depositError }}</p>
      </div>
    </BaseModal>

    <BaseModal v-model="confirmModalOpen" title="예치금 이체 확인" size="small" :close-on-overlay="!depositSubmitting">
      <div class="confirm-copy">
        <span class="confirm-icon">↗</span>
        <p><strong>{{ formatCurrency(depositAmount) }}원</strong>을<br /><b>{{ group?.groupName }}</b> 모임통장에 채우시겠습니까?</p>
      </div>
      <p v-if="depositError" class="inline-error">{{ depositError }}</p>
      <div class="confirm-actions">
        <button type="button" :disabled="depositSubmitting" @click="confirmModalOpen = false">취소</button>
        <button type="button" :disabled="depositSubmitting" @click="submitDeposit">
          {{ depositSubmitting ? '이체 중...' : '확인' }}
        </button>
      </div>
    </BaseModal>

    <transition name="toast"><div v-if="toast" class="toast">{{ toast }}</div></transition>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import TransactionHistory from '@/components/asset/TransactionHistory.vue'
import { getAccount, getMoimAccounts } from '@/api/account'
import { depositToGroup, getGroups, getMemberDepositStatuses, getMyDepositStatus } from '@/api/group'

const route = useRoute()
const router = useRouter()
const account = ref(null)
const loading = ref(true)
const error = ref('')
const group = ref(null)
const members = ref([])
const membersLoading = ref(false)
const membersError = ref('')
const depositModalOpen = ref(false)
const confirmModalOpen = ref(false)
const depositLoading = ref(false)
const depositSubmitting = ref(false)
const depositError = ref('')
const personalAccount = ref(null)
const myDeposit = ref(null)
const depositAmount = ref(0)
const toast = ref('')
let toastTimer

const canRequestDeposit = computed(() =>
  Boolean(personalAccount.value?.accountId) && Number(depositAmount.value) > 0 && !depositSubmitting.value,
)

onMounted(loadDetail)

async function loadDetail() {
  loading.value = true
  try {
    const { data } = await getMoimAccounts()
    account.value = (Array.isArray(data) ? data : []).find(
      (item) => item.moimAccountId === route.params.moimAccountId,
    )
    if (!account.value) error.value = '모임통장 정보를 찾을 수 없습니다.'
    else await loadMemberDeposits()
  } catch (requestError) {
    error.value = apiError(requestError, '모임통장 정보를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

async function loadMemberDeposits() {
  membersLoading.value = true
  membersError.value = ''
  try {
    const { data: groups } = await getGroups()
    group.value = (Array.isArray(groups) ? groups : []).find(
      (item) => item.moimAccountId === account.value.moimAccountId,
    )
    if (!group.value) return
    const { data } = await getMemberDepositStatuses(group.value.groupId)
    members.value = Array.isArray(data) ? data : []
  } catch (requestError) {
    members.value = []
    membersError.value = apiError(requestError, '예치금 현황을 불러오지 못했습니다.')
  } finally {
    membersLoading.value = false
  }
}

async function openDepositModal() {
  depositModalOpen.value = true
  depositLoading.value = true
  depositError.value = ''
  try {
    const [accountResponse, depositResponse] = await Promise.all([
      getAccount('DEPOSIT'),
      getMyDepositStatus(group.value.groupId),
    ])
    personalAccount.value = accountResponse.data
    myDeposit.value = depositResponse.data
    depositAmount.value = Math.max(0, Number(myDeposit.value?.remainingAmount || 0))
  } catch (requestError) {
    personalAccount.value = null
    depositError.value = apiError(requestError, '예치금 정보를 불러오지 못했습니다.')
  } finally {
    depositLoading.value = false
  }
}

function openDepositConfirm() {
  depositError.value = ''
  if (!canRequestDeposit.value) return
  if (Number(depositAmount.value) > Number(personalAccount.value.balance || 0)) {
    depositError.value = '출금 계좌의 잔액보다 큰 금액은 채울 수 없습니다.'
    return
  }
  confirmModalOpen.value = true
}

async function submitDeposit() {
  depositSubmitting.value = true
  depositError.value = ''
  try {
    await depositToGroup(group.value.groupId, {
      sourceAccountId: personalAccount.value.accountId,
      amount: Number(depositAmount.value),
      idempotencyKey: createIdempotencyKey(),
    })
    confirmModalOpen.value = false
    depositModalOpen.value = false
    showToast(`${formatCurrency(depositAmount.value)}원이 예치되었습니다.`)
    await loadDetail()
  } catch (requestError) {
    depositError.value = apiError(requestError, '예치금을 이체하지 못했습니다.')
  } finally {
    depositSubmitting.value = false
  }
}

function createIdempotencyKey() {
  return `deposit-${group.value.groupId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function depositProgress(member) {
  const required = Number(member.requiredAmount || 0)
  if (required <= 0) return 100
  return Math.min(100, (Number(member.currentDepositAmount || 0) / required) * 100)
}

function isDepositComplete(member) {
  return Number(member.currentDepositAmount || 0) >= Number(member.requiredAmount || 0)
}

function depositStatusLabel(member) {
  if (isDepositComplete(member)) return '예치 완료'
  if (member.groupUserStatus === 'PENDING_DEPOSIT') return '예치금 납부 대기'
  return statusLabel(member.groupUserStatus)
}

function statusClass(member) {
  return isDepositComplete(member) ? 'complete' : 'pending'
}

function statusLabel(status) {
  return ({ PENDING_APPROVAL: '참여 승인 대기', WITHDRAWN: '참여 종료', REJECTED: '참여 거절' }[status] || '상태 확인 중')
}

function apiError(requestError, fallback) {
  return requestError.response?.data?.message || requestError.response?.data?.error || fallback
}

function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2400)
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}
</script>

<style scoped>
.detail-page { width: calc(100% + 40px); min-height: calc(100vh - 80px); margin: -20px; padding: 28px 40px 70px; background: #e6dcf6; box-sizing: border-box; }
.detail-page * { box-sizing: border-box; }
.detail-page > * { width: min(920px, 100%); margin-left: auto; margin-right: auto; }
.back-button { display: block; margin-bottom: 16px; padding: 0; border: 0; background: transparent; color: #594775; font-weight: 800; text-align: left; cursor: pointer; }
.account-summary, .deposit-status-section { border: 1px solid rgba(105,82,159,.14); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(49,37,72,.07); }
.account-summary { padding: 24px 28px; }
.summary-main-row { display: flex; align-items: center; gap: 13px; }
.kb-badge { width: 44px; height: 44px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 14px; color: #fff; background: #69529f; font-weight: 900; }
.summary-main-row h1 { margin: 0; color: #30293a; font-size: 21px; }
.account-meta-row { display: grid; grid-template-columns: 1.3fr 1fr .7fr; gap: 12px; margin: 18px 0 0; padding-top: 18px; border-top: 1px solid #eee9f3; }
.account-meta-row div { min-width: 0; }
.account-meta-row dt { color: #92899a; font-size: 11px; }
.account-meta-row dd { margin: 6px 0 0; overflow: hidden; color: #383140; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.account-meta-row .balance { color: #60438e; font-size: 17px; }
.deposit-status-section { margin-top: 18px; padding: 24px 28px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.section-heading small { color: #8b8195; }
.section-heading h2 { margin: 3px 0 0; color: #30293a; font-size: 19px; }
.section-heading > strong { padding: 7px 11px; border-radius: 999px; color: #64498e; background: #f2ecfa; font-size: 12px; }
.member-list { margin: 15px 0 0; padding: 0; list-style: none; }
.member-list li { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 10px 16px; padding: 15px 0; border-top: 1px solid #f0ebf3; }
.member-profile { display: flex; align-items: center; gap: 11px; min-width: 0; }
.member-profile > img, .member-profile > span { width: 40px; height: 40px; display: grid; place-items: center; flex: 0 0 40px; border-radius: 50%; object-fit: cover; color: #fff; background: #755a9c; font-weight: 800; }
.member-profile > div { display: grid; justify-items: start; gap: 5px; }
.member-profile strong { color: #3b3443; font-size: 14px; }
.status-badge { padding: 4px 8px; border: 1px solid; border-radius: 999px; font-size: 10px; font-weight: 800; }
.status-badge.complete { border-color: #b9dfce; color: #28745a; background: #effaf5; }
.status-badge.pending { border-color: #f0cf9d; color: #9a5e16; background: #fff8ec; }
.member-deposit { text-align: right; }
.member-deposit strong { color: #4f397e; font-size: 14px; }
.member-deposit span { color: #948b9b; font-size: 12px; }
.deposit-progress { grid-column: 1 / -1; height: 6px; overflow: hidden; border-radius: 999px; background: #eee9f1; }
.deposit-progress span { height: 100%; display: block; border-radius: inherit; background: linear-gradient(90deg,#8061aa,#5d4385); }
.deposit-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
.deposit-actions button, .modal-primary, .confirm-actions button { min-height: 46px; border-radius: 12px; font-weight: 800; cursor: pointer; }
.secondary-action { border: 1px solid #d8cfe5; color: #776a84; background: #fff; }
.secondary-action:disabled { cursor: not-allowed; opacity: .72; }
.primary-action, .modal-primary, .confirm-actions button:last-child { border: 0; color: #fff; background: #69529f; }
.detail-state, .member-state, .modal-state { padding: 54px 20px; color: #8b8195; text-align: center; }
.error, .inline-error { color: #b55757; }
.deposit-modal-content { display: grid; gap: 13px; }
.transfer-account-card { display: grid; gap: 5px; padding: 16px; border: 1px solid #e7e0ef; border-radius: 14px; background: #faf8fd; }
.transfer-account-card.destination { background: #f2edfa; }
.transfer-account-card span { color: #8b8195; font-size: 11px; }
.transfer-account-card strong { color: #393141; font-size: 14px; }
.transfer-account-card b { color: #5d4189; font-size: 18px; }
.transfer-arrow { height: 24px; display: grid; place-items: center; color: #7558a2; font-size: 22px; }
.deposit-guide { display: grid; grid-template-columns: 1fr auto; gap: 8px 16px; padding: 14px 4px; color: #84798c; font-size: 12px; }
.deposit-guide b { color: #42394c; }
.amount-field { display: grid; gap: 8px; color: #5d5365; font-size: 12px; font-weight: 800; }
.amount-action-row { display: grid; grid-template-columns: minmax(0,1fr) 92px; align-items: end; gap: 9px; }
.amount-field > div { display: flex; align-items: center; border: 1px solid #dcd3e7; border-radius: 12px; background: #fff; }
.amount-field input { width: 100%; min-width: 0; padding: 14px; border: 0; outline: 0; background: transparent; color: #382e43; font-size: 18px; font-weight: 900; text-align: right; }
.amount-field em { padding-right: 14px; font-style: normal; }
.modal-primary { width: 100%; }
.modal-primary:disabled { opacity: .45; cursor: default; }
.confirm-copy { display: grid; justify-items: center; gap: 12px; padding: 10px 0 18px; text-align: center; }
.confirm-copy p { margin: 0; color: #62586a; line-height: 1.7; }
.confirm-copy strong { color: #60428f; font-size: 20px; }
.confirm-icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: #69529f; font-size: 22px; }
.confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 10px; }
.confirm-actions button:first-child { border: 1px solid #ddd4e7; background: #fff; color: #6c6175; }
.toast { position: fixed; left: 50%; bottom: 30px; z-index: 20; width: auto; padding: 13px 20px; border-radius: 10px; color: #fff; background: rgba(35,32,40,.94); text-align: center; transform: translateX(-50%); }
.toast-enter-active,.toast-leave-active { transition: .2s; }.toast-enter-from,.toast-leave-to { opacity: 0; transform: translate(-50%,8px); }
@media (max-width: 767px) {
  .detail-page { width: 100%; min-height: calc(100dvh - 68px); margin: 0; padding: 22px 20px 110px; }
  .account-summary { padding: 20px 18px; border-radius: 16px; }
  .summary-main-row h1 { font-size: 17px; }
  .account-meta-row { grid-template-columns: 1.35fr 1fr .55fr; gap: 8px; }
  .account-meta-row dd { font-size: 11px; }
  .account-meta-row .balance { font-size: 14px; }
  .deposit-status-section { padding: 20px 16px; border-radius: 16px; }
  .member-list li { gap: 10px; }
  .member-deposit strong,.member-deposit span { display: block; }
  .deposit-actions { grid-template-columns: 1fr; }
  .primary-action { grid-row: 1; }
  .toast { bottom: 92px; width: calc(100% - 40px); }
}
</style>
