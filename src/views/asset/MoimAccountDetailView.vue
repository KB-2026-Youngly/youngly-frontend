<template>
  <section class="detail-page">
    <div v-if="loading" class="detail-state">모임통장 정보를 불러오고 있어요.</div>
    <div v-else-if="error" class="detail-state error">{{ error }}</div>
    <template v-else-if="account">
      <div class="account-sync-row">
        <span>{{ formatSyncedAt(account.syncedAt) }}</span>
        <div class="account-sync-button-shadow">
          <button
            class="account-sync-button pixel-step-button pixel-step-button--compact pixel-step-solid"
            type="button"
            :disabled="syncingAccount"
            @click="refreshAccount"
          >
            <span class="account-sync-button-surface pixel-step-surface">
              <span aria-hidden="true" :class="{ spinning: syncingAccount }">↻</span>
              <span>새로고침</span>
            </span>
          </button>
        </div>
      </div>
      <div class="detail-card-shadow yl-stepped-card-shadow">
      <article class="account-summary yl-card-frame pixel-step-card pixel-step-solid">
        <div class="account-summary-surface pixel-step-surface">
        <div class="summary-main-row">
          <img class="kb-icon" :src="kbIcon" alt="KB국민은행" />
          <div class="account-heading">
            <h1>{{ account.accountName || 'KB 모임통장' }}</h1>
            <p>{{ account.accountNumber }}</p>
          </div>
        </div>
        <strong class="account-balance yl-money">{{ formatCurrency(account.balance) }}원</strong>
        </div>
      </article>
      </div>

      <div v-if="group" class="detail-card-shadow yl-stepped-card-shadow">
      <section class="deposit-status-section yl-card-frame pixel-step-card pixel-step-solid">
        <div class="deposit-status-surface pixel-step-surface">
        <div class="section-heading">
          <div><small>{{ group.groupName }}</small><h2>예치금 현황</h2></div>
          <strong>{{ members.length }}명 참여</strong>
        </div>

        <div v-if="membersLoading" class="member-state">예치금 현황을 불러오고 있어요.</div>
        <div v-else-if="membersError" class="member-state error">{{ membersError }}</div>
        <template v-else>
          <div class="deposit-overview">
            <div class="my-deposit-summary">
              <div>
                <small>내 예치금</small>
                <strong class="yl-money">{{ formatCurrency(myDeposit?.depositedAmount) }}원</strong>
              </div>
              <span :class="{ complete: myDepositComplete }">
                <template v-if="myDepositComplete">예치 완료</template>
                <template v-else><span class="yl-money">{{ formatCurrency(myDeposit?.remainingAmount) }}원</span> 부족</template>
              </span>
              <div class="my-deposit-progress" aria-hidden="true">
                <span :style="{ width: `${myDepositProgress}%` }"></span>
              </div>
              <p>최소 예치금 <span class="yl-money">{{ formatCurrency(myDeposit?.requiredAmount) }}원</span></p>
            </div>

            <div class="deposit-visualization">
              <div class="completion-copy">
                <span>예치 완료</span>
                <strong>{{ completedMemberCount }}<small>/{{ members.length }}명</small></strong>
              </div>
              <div class="completion-bar" role="progressbar" aria-label="예치 완료 인원" :aria-valuenow="completionRate" aria-valuemin="0" aria-valuemax="100">
                <span :style="{ width: `${completionRate}%` }"></span>
              </div>
              <p>참여자의 {{ completionRate }}%가 최소 예치금을 채웠어요.</p>
            </div>
          </div>

          <ul class="member-list">
            <li
              v-for="member in members"
              :key="member.userId"
              :class="{ 'is-me': member.userId === myDeposit?.userId }"
            >
              <div class="member-profile">
                <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="`${member.nickname} 프로필`" />
                <span v-else>{{ member.nickname?.slice(0, 1) || '?' }}</span>
                <div>
                  <div class="member-name-row">
                    <strong>{{ member.nickname }}</strong>
                    <small v-if="member.userId === myDeposit?.userId" class="me-badge">나</small>
                  </div>
                  <small class="status-badge" :class="statusClass(member)">{{ depositStatusLabel(member) }}</small>
                </div>
              </div>
              <div class="member-deposit">
                <strong class="yl-money">{{ formatCurrency(member.currentDepositAmount) }}원</strong>
                <span class="yl-money">/ {{ formatCurrency(member.requiredAmount) }}원</span>
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
        </div>
      </section>
      </div>

      <div v-if="group && account.owner" class="detail-card-shadow yl-stepped-card-shadow">
        <section class="settlement-result-section yl-card-frame pixel-step-card pixel-step-solid">
          <div class="settlement-result-surface pixel-step-surface">
            <div class="section-heading settlement-heading">
              <div>
                <small>{{ latestSettlementRound ? `${latestSettlementRound.roundNo}라운드` : '최근 라운드' }}</small>
                <h2>최근 라운드 정산 결과</h2>
              </div>
              <strong v-if="settlementRequests.length">{{ successfulSettlementCount }}/{{ settlementRequests.length }} 완료</strong>
            </div>

            <div v-if="settlementLoading" class="settlement-state">정산 결과를 확인하고 있어요.</div>
            <div v-else-if="settlementError" class="settlement-state error">
              <span>{{ settlementError }}</span>
              <button type="button" @click="loadLatestSettlementResults">다시 조회</button>
            </div>
            <div v-else-if="!latestSettlementRound" class="settlement-state">확인할 지난 라운드가 없습니다.</div>
            <div v-else-if="!settlementRequests.length" class="settlement-state">아직 생성된 정산 요청이 없습니다.</div>
            <ul v-else class="settlement-request-list">
              <li v-for="request in settlementRequests" :key="request.transferRequestId">
                <div class="settlement-user">
                  <span>{{ settlementReceiverName(request.settlementReceiverId).slice(0, 1) }}</span>
                  <div>
                    <strong>{{ settlementReceiverName(request.settlementReceiverId) }}</strong>
                    <small>{{ formatDateTime(request.completedAt || request.updatedAt || request.requestedAt) }}</small>
                  </div>
                </div>
                <div class="settlement-amount">
                  <strong class="yl-money">{{ formatCurrency(request.amount) }}원</strong>
                  <span class="transfer-status" :class="transferStatusClass(request.transferStatus)">
                    {{ transferStatusLabel(request.transferStatus) }}
                  </span>
                </div>
                <p v-if="request.transferStatus === 'FAILED' && request.failureMessage" class="settlement-failure-message">
                  {{ request.failureMessage }}
                </p>
                <button
                  v-if="request.transferStatus === 'FAILED'"
                  class="retry-transfer-button"
                  type="button"
                  :disabled="retryingTransferId === request.transferRequestId"
                  @click="retrySettlementTransfer(request)"
                >
                  {{ retryingTransferId === request.transferRequestId ? '재전송 중...' : '재전송' }}
                </button>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div class="detail-card-shadow yl-stepped-card-shadow">
        <TransactionHistory
          :key="historyRefreshKey"
          account-type="MOIM"
          :account-id="account.moimAccountId"
          :initial-limit="6"
        />
      </div>
    </template>

    <BaseModal v-model="depositModalOpen" title="예치금 채우기" size="medium">
      <div v-if="depositLoading" class="modal-state">계좌와 예치금 정보를 확인하고 있어요.</div>
      <div v-else-if="depositError && !personalAccount" class="modal-state error">{{ depositError }}</div>
      <div v-else class="deposit-modal-content">
        <div class="transfer-account-card">
          <span>내 입출금 통장</span>
          <strong>{{ personalAccount?.bankName }} {{ personalAccount?.accountNumber }}</strong>
          <b class="yl-money">{{ formatCurrency(personalAccount?.balance) }}원</b>
        </div>
        <div class="transfer-arrow" aria-hidden="true">↓</div>
        <div class="transfer-account-card destination">
          <span>{{ group?.groupName || '모임통장' }}</span>
          <strong>{{ account?.bankName }} {{ account?.accountNumber }}</strong>
          <b class="yl-money">{{ formatCurrency(account?.balance) }}원</b>
        </div>

        <div class="deposit-guide">
          <span>현재 내 예치금</span><b class="yl-money">{{ formatCurrency(myDeposit?.depositedAmount) }}원</b>
          <span>최소 예치금</span><b class="yl-money">{{ formatCurrency(myDeposit?.requiredAmount) }}원</b>
        </div>

        <div class="amount-action-row">
          <label class="amount-field">
            <span>채울 금액</span>
            <div class="yl-money">
              <input
                :value="formattedDepositAmount"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                @input="handleDepositAmountInput"
              />
              <em>원</em>
            </div>
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
        <p><strong class="yl-money">{{ formatCurrency(depositAmount) }}원</strong>을<br /><b>{{ group?.groupName }}</b> 모임통장에 채우시겠습니까?</p>
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
import { useRoute } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import TransactionHistory from '@/components/asset/TransactionHistory.vue'
import kbIcon from '@/assets/icons/kb_icon.png'
import { getAccount, getMoimAccounts, syncMoimAccount } from '@/api/account'
import { depositToGroup, getGroups, getMemberDepositStatuses, getMyDepositStatus } from '@/api/group'
import {
  getGroupRounds,
  getRoundTransferRequests,
  retryRoundTransferRequest,
} from '@/api/round'

const route = useRoute()
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
const syncingAccount = ref(false)
const historyRefreshKey = ref(0)
const toast = ref('')
const latestSettlementRound = ref(null)
const settlementRequests = ref([])
const settlementLoading = ref(false)
const settlementError = ref('')
const retryingTransferId = ref(null)
let toastTimer

const completedMemberCount = computed(() => members.value.filter(isDepositComplete).length)
const completionRate = computed(() =>
  members.value.length ? Math.round((completedMemberCount.value / members.value.length) * 100) : 0,
)
const myDepositComplete = computed(
  () => Number(myDeposit.value?.remainingAmount || 0) <= 0,
)
const myDepositProgress = computed(() => {
  const required = Number(myDeposit.value?.requiredAmount || 0)
  if (required <= 0) return 100
  return Math.min(100, (Number(myDeposit.value?.depositedAmount || 0) / required) * 100)
})
const canRequestDeposit = computed(() =>
  Boolean(personalAccount.value?.accountId) && Number(depositAmount.value) > 0 && !depositSubmitting.value,
)
const formattedDepositAmount = computed(() =>
  Number(depositAmount.value || 0).toLocaleString('ko-KR'),
)
const successfulSettlementCount = computed(
  () => settlementRequests.value.filter((request) => request.transferStatus === 'SUCCESS').length,
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

async function refreshAccount() {
  if (!account.value?.moimAccountId || syncingAccount.value) return
  syncingAccount.value = true
  try {
    const { data } = await syncMoimAccount(account.value.moimAccountId)
    account.value = {
      ...account.value,
      balance: data?.balance ?? account.value.balance,
      syncedAt: data?.syncedAt ?? account.value.syncedAt,
    }
    historyRefreshKey.value += 1
    showToast('계좌 정보를 새로고침했습니다.')
  } catch (requestError) {
    showToast(apiError(requestError, '계좌 정보를 새로고침하지 못했습니다.'))
  } finally {
    syncingAccount.value = false
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
    const [membersResponse, myDepositResponse] = await Promise.all([
      getMemberDepositStatuses(group.value.groupId),
      getMyDepositStatus(group.value.groupId),
    ])
    members.value = Array.isArray(membersResponse.data) ? membersResponse.data : []
    myDeposit.value = myDepositResponse.data
    if (account.value?.owner) {
      await loadLatestSettlementResults()
    }
  } catch (requestError) {
    members.value = []
    membersError.value = apiError(requestError, '예치금 현황을 불러오지 못했습니다.')
  } finally {
    membersLoading.value = false
  }
}

async function loadLatestSettlementResults() {
  if (!group.value?.groupId) return
  settlementLoading.value = true
  settlementError.value = ''
  try {
    const { data: roundsData } = await getGroupRounds(group.value.groupId)
    const rounds = Array.isArray(roundsData) ? roundsData : []
    latestSettlementRound.value = [...rounds]
      .filter((round) => round.roundStatus !== 'ONGOING')
      .sort((a, b) => Number(b.roundNo || 0) - Number(a.roundNo || 0))[0] || null

    if (!latestSettlementRound.value) {
      settlementRequests.value = []
      return
    }

    const { data } = await getRoundTransferRequests(latestSettlementRound.value.roundId)
    settlementRequests.value = Array.isArray(data) ? data : []
  } catch (requestError) {
    settlementRequests.value = []
    settlementError.value = apiError(requestError, '최근 라운드 정산 결과를 불러오지 못했습니다.')
  } finally {
    settlementLoading.value = false
  }
}

async function retrySettlementTransfer(request) {
  if (!latestSettlementRound.value?.roundId || request.transferStatus !== 'FAILED') return
  retryingTransferId.value = request.transferRequestId
  settlementError.value = ''
  try {
    const { data } = await retryRoundTransferRequest(
      latestSettlementRound.value.roundId,
      request.transferRequestId,
    )
    const index = settlementRequests.value.findIndex(
      (item) => item.transferRequestId === request.transferRequestId,
    )
    if (index >= 0) settlementRequests.value.splice(index, 1, data)
    showToast('정산 재전송 요청이 처리되었습니다.')
  } catch (requestError) {
    showToast(apiError(requestError, '정산을 재전송하지 못했습니다.'))
  } finally {
    retryingTransferId.value = null
  }
}

function settlementReceiverName(userId) {
  const member = members.value.find((item) => item.userId === userId)
  return member?.nickname || userId || '참여자'
}

function transferStatusLabel(status) {
  return ({
    SUCCESS: '정산 완료',
    FAILED: '정산 실패',
    PENDING: '요청 중',
    UNKNOWN: '처리 중',
  })[status] || '상태 확인 중'
}

function transferStatusClass(status) {
  return String(status || 'UNKNOWN').toLowerCase()
}

function formatDateTime(value) {
  if (!value) return '처리 시각 확인 중'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ')
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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

function handleDepositAmountInput(event) {
  const digits = event.target.value.replace(/[^\d]/g, '')
  depositAmount.value = digits ? Number(digits) : 0
  event.target.value = formattedDepositAmount.value
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

function formatSyncedAt(value) {
  if (!value) return '아직 새로고침하지 않았어요'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '최근 업데이트 시각을 확인할 수 없어요'
  return `${new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)} 기준`
}
</script>

<style scoped>
.detail-page { width: calc(100% + 40px); min-height: calc(100vh - 80px); margin: -20px; padding: 12px 20px 70px; background: #e6dcf6; box-sizing: border-box; }
.detail-page * { box-sizing: border-box; }
.detail-page > * { width: 100%; margin-left: auto; margin-right: auto; }
.account-sync-row { min-height: 34px; margin-bottom: 8px; display: flex; align-items: center; justify-content: flex-end; gap: 10px; color: #746b7d; font-size: 11px; }
.account-sync-button-shadow { width: 76px; height: 29px; position: relative; flex: 0 0 76px; }
.account-sync-button-shadow::before { content: ''; position: absolute; inset: 0; z-index: 0; background: #c8b7e5; transform: translate(3px, 3px); clip-path: polygon(7px 0, calc(100% - 7px) 0, calc(100% - 7px) 2px, calc(100% - 3px) 2px, calc(100% - 3px) 7px, 100% 7px, 100% calc(100% - 7px), calc(100% - 3px) calc(100% - 7px), calc(100% - 3px) calc(100% - 2px), calc(100% - 7px) calc(100% - 2px), calc(100% - 7px) 100%, 7px 100%, 7px calc(100% - 2px), 3px calc(100% - 2px), 3px calc(100% - 7px), 0 calc(100% - 7px), 0 7px, 3px 7px, 3px 2px, 7px 2px); }
.account-sync-row .account-sync-button { width: 76px; min-height: 29px; position: relative; z-index: 1; padding: 2px !important; --pixel-outline-width: 2px; --pixel-outline-color: #ac99d2; --pixel-fill: #fff; color: #5e428c; font: inherit; font-weight: 800; cursor: pointer; filter: none !important; }
.account-sync-button-surface { width: 100%; min-height: 25px; padding: 0 5px; display: inline-flex; align-items: center; justify-content: center; gap: 3px; }
.account-sync-row button:disabled { cursor: wait; opacity: .6; }
.account-sync-button-surface > span:first-child { font-size: 15px; line-height: 1; }
.account-sync-button-surface > span:last-child { transform: translateX(-2px); }
.account-sync-button-surface > span.spinning { animation: account-sync-spin .75s linear infinite; }
.account-summary, .deposit-status-section, .settlement-result-section { border: 1px solid rgba(105,82,159,.14); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(49,37,72,.07); }
.detail-card-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 5px; margin-bottom: 20px; }
.account-summary.pixel-step-solid,.deposit-status-section.pixel-step-solid,.settlement-result-section.pixel-step-solid { width: 100%; margin: 0; --pixel-outline-width: 2px; --pixel-outline-color: #ac99d2; filter: none !important; }
.account-summary-surface { padding: 22px 26px; }
.summary-main-row { display: flex; align-items: center; gap: 13px; }
.kb-icon { width: 48px; height: 48px; flex: 0 0 48px; object-fit: contain; }
.account-heading { min-width: 0; }
.account-heading h1 { margin: 0; overflow: hidden; color: #30293a; font-size: 21px; text-overflow: ellipsis; white-space: nowrap; }
.account-heading p { margin: 6px 0 0; color: #8b8195; font-size: 13px; }
.account-balance { display: block; margin-top: 25px; color: #30293a; font-size: 30px; letter-spacing: -.7px; }
.deposit-status-section { margin-top: 0; padding: 0; }
.deposit-status-surface { padding: 22px 26px; }
.settlement-result-surface { padding: 22px 26px; }
.settlement-heading { margin-bottom: 16px; }
.settlement-state { display: grid; justify-items: center; gap: 10px; padding: 30px 16px; color: #8b8195; text-align: center; }
.settlement-state button { min-height: 36px; padding: 0 13px; border: 1px solid #cfc4dd; border-radius: 9px; color: #60418f; background: #fff; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.settlement-request-list { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; }
.settlement-request-list li { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 9px 14px; padding: 14px; border: 1px solid #e8e1ee; border-radius: 14px; background: #fbf9fd; }
.settlement-user { display: flex; align-items: center; gap: 10px; min-width: 0; }
.settlement-user > span { width: 38px; height: 38px; display: grid; place-items: center; flex: 0 0 38px; border-radius: 50%; color: #fff; background: #755a9c; font-weight: 800; }
.settlement-user > div { min-width: 0; display: grid; gap: 4px; }
.settlement-user strong { overflow: hidden; color: #393141; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.settlement-user small { color: #958c9d; font-size: 10px; }
.settlement-amount { display: grid; justify-items: end; gap: 6px; }
.settlement-amount > strong { color: #49366d; font-size: 14px; }
.transfer-status { padding: 4px 8px; border: 1px solid; border-radius: 999px; font-size: 10px; font-weight: 800; }
.transfer-status.success { border-color: #b9dfce; color: #28745a; background: #effaf5; }
.transfer-status.failed { border-color: #e7b8b8; color: #a94444; background: #fff1f1; }
.transfer-status.pending { border-color: #efd19f; color: #9a641d; background: #fff8eb; }
.transfer-status.unknown { border-color: #cfc5de; color: #675779; background: #f4f0f8; }
.settlement-failure-message { grid-column: 1 / -1; margin: 0; padding: 9px 10px; border-radius: 8px; color: #a14f4f; background: #fff3f3; font-size: 10px; line-height: 1.5; }
.retry-transfer-button { grid-column: 1 / -1; min-height: 40px; border: 0; border-radius: 10px; color: #fff; background: #69529f; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.retry-transfer-button:disabled { cursor: wait; opacity: .55; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.section-heading small { color: #8b8195; }
.section-heading h2 { margin: 3px 0 0; color: #30293a; font-size: 19px; }
.section-heading > strong { padding: 7px 11px; border-radius: 999px; color: #64498e; background: #f2ecfa; font-size: 12px; }
.deposit-overview { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
.my-deposit-summary,.deposit-visualization { min-width: 0; padding: 17px; border-radius: 14px; background: #f8f5fc; }
.my-deposit-summary { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: start; gap: 7px 12px; }
.my-deposit-summary > div:first-child { display: grid; gap: 5px; }
.my-deposit-summary small,.completion-copy > span { color: #8b8195; font-size: 11px; }
.my-deposit-summary strong { color: #3d3349; font-size: 20px; }
.my-deposit-summary > span { padding: 5px 8px; border-radius: 999px; color: #9a5e16; background: #fff1d9; font-size: 10px; font-weight: 800; white-space: nowrap; }
.my-deposit-summary > span.complete { color: #28745a; background: #e5f6ee; }
.my-deposit-progress,.completion-bar { grid-column: 1 / -1; height: 7px; overflow: hidden; border-radius: 999px; background: #e7e0ec; }
.my-deposit-progress span,.completion-bar span { height: 100%; display: block; border-radius: inherit; background: linear-gradient(90deg,#8b6ab8,#60418f); }
.my-deposit-summary p,.deposit-visualization p { grid-column: 1 / -1; margin: 0; color: #8b8195; font-size: 11px; }
.deposit-visualization { display: grid; gap: 10px; }
.completion-copy { display: flex; align-items: center; justify-content: space-between; }
.completion-copy strong { color: #5d4189; font-size: 23px; }
.completion-copy strong small { margin-left: 2px; color: #8b8195; font-size: 11px; }
.member-list { margin: 15px 0 0; padding: 0; list-style: none; }
.member-list li { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 10px 16px; padding: 15px 12px; border-top: 1px solid #f0ebf3; border-radius: 12px; }
.member-list li.is-me { margin: 5px 0; border: 1px solid #9d84c4; background: #f8f4fd; }
.member-profile { display: flex; align-items: center; gap: 11px; min-width: 0; }
.member-profile > img, .member-profile > span { width: 40px; height: 40px; display: grid; place-items: center; flex: 0 0 40px; border-radius: 50%; object-fit: cover; color: #fff; background: #755a9c; font-weight: 800; }
.member-profile > div { display: grid; justify-items: start; gap: 5px; }
.member-name-row { display: flex; align-items: center; gap: 6px; }
.member-profile strong { color: #3b3443; font-size: 14px; }
.me-badge { min-width: 22px; padding: 3px 6px; border: 1px solid #8065aa; border-radius: 999px; color: #60418f; background: #fff; font-size: 9px; font-weight: 900; line-height: 1; text-align: center; }
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
.account-balance,
.my-deposit-summary strong,
.member-deposit strong,
.member-deposit span,
.transfer-account-card b,
.deposit-guide b,
.amount-field input,
.amount-field em,
.confirm-copy strong {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
}
.settlement-amount > strong {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
}
.toast { position: fixed; left: 50%; bottom: 30px; z-index: 20; width: auto; padding: 13px 20px; border-radius: 10px; color: #fff; background: rgba(35,32,40,.94); text-align: center; transform: translateX(-50%); }
.toast-enter-active,.toast-leave-active { transition: .2s; }.toast-enter-from,.toast-leave-to { opacity: 0; transform: translate(-50%,8px); }
@keyframes account-sync-spin { to { transform: rotate(360deg); } }
@media (max-width: 767px) {
  .detail-page { width: 100%; min-height: calc(100dvh - 68px); margin: 0; padding: 8px 14px 110px; }
  .account-summary-surface { padding: 18px 16px; }
  .kb-icon { width: 44px; height: 44px; flex-basis: 44px; }
  .account-heading h1 { font-size: 17px; }
  .account-heading p { font-size: 12px; }
  .account-balance { margin-top: 22px; font-size: 27px; }
  .deposit-status-surface { padding: 18px 14px; }
  .settlement-result-surface { padding: 18px 14px; }
  .deposit-overview { grid-template-columns: 1fr; }
  .member-list li { gap: 10px; }
  .member-deposit strong,.member-deposit span { display: block; }
  .deposit-actions { grid-template-columns: 1fr; }
  .settlement-request-list li { grid-template-columns: minmax(0,1fr) auto; padding: 13px 11px; }
  .primary-action { grid-row: 1; }
  .toast { bottom: 92px; width: calc(100% - 40px); }
}
</style>
