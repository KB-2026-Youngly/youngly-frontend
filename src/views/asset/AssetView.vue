<template>
  <section class="asset-page">
    <div class="tabs" role="tablist" aria-label="자산 종류">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span
          ><b>{{ tab.label }}</b
          ><small>{{ tab.caption }}</small></span
        >
      </button>
    </div>

    <article v-if="activeTab === 'pension' && connectedPension" class="linked-account-card">
      <button
        class="edit-account-button"
        type="button"
        aria-label="개인연금 계좌 변경"
        @click="openEditModal"
      >
        ✎
      </button>
      <div class="linked-card-heading">
        <span class="linked-icon">KB</span>
        <div>
          <small>연결된 개인연금</small>
          <h2>{{ connectedPension.bankName }} 개인연금</h2>
        </div>
      </div>
      <dl class="account-details">
        <div>
          <dt>계좌번호</dt>
          <dd>{{ connectedPension.accountNumber }}</dd>
        </div>
        <div>
          <dt>잔액</dt>
          <dd class="balance-value">{{ formatCurrency(connectedPension.balance) }}원</dd>
        </div>
        <div>
          <dt>미래 적립금</dt>
          <dd>
            {{ connectedPension.accountStatus === 'INCOME' ? '적립 계좌로 사용 중' : '사용 안 함' }}
          </dd>
        </div>
      </dl>
    </article>

    <article v-else-if="loadingConnectedAccount && activeTab === 'pension'" class="asset-card">
      <div class="modal-state">연결된 개인연금을 확인하고 있습니다.</div>
    </article>

    <section
      v-else-if="activeTab === 'group' && connectedMoimAccounts.length"
      class="moim-card-grid"
    >
      <article
        v-for="account in connectedMoimAccounts"
        :key="account.moimAccountId"
        class="moim-account-card"
        :class="{ 'is-dragging': draggingMoimId === account.moimAccountId }"
        :data-moim-id="account.moimAccountId"
        draggable="true"
        @dragstart="handleDesktopDragStart(account.moimAccountId, $event)"
        @dragover.prevent
        @drop="handleDesktopDrop(account.moimAccountId)"
        @dragend="finishMoimDrag"
      >
        <span
          class="drag-handle"
          role="button"
          aria-label="길게 눌러 순서 변경"
          @pointerdown.stop="handleMoimPointerDown(account.moimAccountId, $event)"
          @contextmenu.prevent
        >≡</span>
        <button
          v-if="account.owner"
          class="moim-edit-button"
          type="button"
          aria-label="모임통장 관리"
          @pointerdown.stop
          @click.stop="openMoimEditModal(account)"
        >
          ✎
        </button>
        <div class="moim-card-bank">
          <span>KB</span><small>{{ account.bankName }} 모임통장</small>
        </div>
        <div v-if="!account.owner" class="ownership-row">
          <span class="ownership-badge participant">참여 중</span>
          <small class="account-owner-name">
            소유주 {{ account.ownerName || '정보 확인 중' }}
          </small>
        </div>
        <strong>{{ formatCurrency(account.balance) }}원</strong>
        <p>{{ account.accountNumber }}</p>
        <small class="moim-account-name">{{ account.accountName }}</small>
        <div class="group-link-status">
          <template v-if="account.groupName">
            <b>{{ account.groupName }}</b>
            <span>{{ account.groupCount }}명 참여</span>
          </template>
          <template v-else-if="account.groupLinked === false">
            <span>아직 연결된 그룹이 없어요</span>
          </template>
          <template v-else>
            <span>그룹 연결 정보 준비 중</span>
          </template>
        </div>
      </article>
    </section>

    <article v-else class="asset-card">
      <div class="card-decoration"></div>
      <div class="empty-icon" aria-hidden="true">{{ content.icon }}</div>
      <h2>{{ content.title }}</h2>
      <p>{{ content.description }}</p>
      <button
        class="connect-button"
        :class="{ 'group-connect-button': activeTab === 'group' }"
        type="button"
        @click="handleConnectClick"
      >
        {{ content.button }}
        <span>→</span>
      </button>
    </article>

    <div v-if="activeTab === 'group' && connectedMoimAccounts.length" class="floating-add">
      <transition name="floating-menu">
        <div v-if="floatingMenuOpen" class="floating-options">
          <button type="button" @click="openMoimList">KB 모임통장 연결하기</button>
          <a
            href="https://obank.kbstar.com/quics?page=C112911"
            target="_blank"
            rel="noopener noreferrer"
            >KB 모임통장 개설하러 가기</a
          >
        </div>
      </transition>
      <button
        class="floating-add-button"
        type="button"
        :aria-expanded="floatingMenuOpen"
        @click="floatingMenuOpen = !floatingMenuOpen"
      >
        {{ floatingMenuOpen ? '×' : '+' }}
      </button>
    </div>

    <BaseModal
      v-model="pensionModalOpen"
      :title="
        modalStep === 'choice'
          ? '개인연금 연결하기'
          : isEditing
            ? '개인연금 변경하기'
            : '보유 개인연금 선택'
      "
      :close-on-overlay="!submitting"
      :close-on-esc="!submitting"
      size="medium"
      @close="resetModal"
    >
      <div v-if="modalStep === 'choice'" class="connection-options">
        <button type="button" @click="openPensionList">
          <span class="option-icon">KB</span>
          <span
            ><b>보유중인 KB 개인연금 연결하기</b><small>내 계좌를 조회해 연결합니다.</small></span
          >
          <strong>→</strong>
        </button>
        <a
          href="https://www.kbsec.com/go.able?linkcd=m06010001"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="option-icon new">＋</span>
          <span
            ><b>KB 개인연금 개설하러 가기</b
            ><small>KB증권 페이지가 새 창에서 열립니다.</small></span
          >
          <strong>→</strong>
        </a>
      </div>

      <div v-else class="pension-selection">
        <p class="selection-guide">연결할 개인연금 계좌를 선택해 주세요.</p>
        <div v-if="loadingAccounts" class="modal-state">개인연금 계좌를 조회하고 있습니다.</div>
        <div v-else-if="modalError" class="modal-state error-state" role="alert">
          {{ modalError }}
          <button type="button" @click="loadPensionAccounts">다시 조회</button>
        </div>
        <div v-else-if="!pensionAccounts.length" class="modal-state">
          보유중인 KB 개인연금 계좌가 없습니다.
        </div>
        <div v-else class="pension-list">
          <label v-for="account in pensionAccounts" :key="account.kbAccountId">
            <input v-model="selectedPensionId" type="radio" :value="account.kbAccountId" />
            <span class="radio-mark"></span>
            <span class="pension-info">
              <b>{{ account.bankName }} 개인연금</b>
              <small>{{ account.accountNumber }}</small>
            </span>
            <strong>{{ formatCurrency(account.balance) }}원</strong>
          </label>
        </div>

        <div class="future-saving-row">
          <span class="future-saving-label">
            미래 적립금 적립 계좌로 사용
            <span class="help-tooltip" tabindex="0" aria-label="미래 적립금 안내">
              ?
              <span class="tooltip-content" role="tooltip">
                <b>미래 적립금이란?</b>
                챌린지 결과에 따라 산정되어 개인연금 계좌(또는 사용자가 선택한 개인 계좌)에 이체되는
                금액으로, 미래 자산 형성을 위한 저축금
              </span>
            </span>
          </span>
          <label class="toggle">
            <input v-model="useForFutureSavings" type="checkbox" />
            <span></span>
          </label>
        </div>
      </div>

      <template v-if="modalStep === 'select'" #footer>
        <button class="modal-cancel" type="button" :disabled="submitting" @click="closeModal">
          취소
        </button>
        <button
          class="modal-submit"
          type="button"
          :disabled="!selectedPensionId || loadingAccounts || submitting"
          @click="connectPension"
        >
          {{
            submitting
              ? isEditing
                ? '변경 중...'
                : '연결 중...'
              : isEditing
                ? '변경하기'
                : '연결하기'
          }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      v-model="moimEditModalOpen"
      title="모임통장 관리"
      size="small"
      :close-on-overlay="!deactivatingMoim"
      :close-on-esc="!deactivatingMoim"
      @close="resetMoimEditModal"
    >
      <div v-if="editingMoimAccount" class="moim-edit-content">
        <small>선택한 모임통장</small>
        <strong>{{ editingMoimAccount.accountName }}</strong>
        <span>{{ editingMoimAccount.accountNumber }}</span>
        <button type="button" disabled>모임통장 이름 변경 <em>추후 구현 예정</em></button>
        <button
          class="deactivate-button"
          type="button"
          :disabled="deactivatingMoim"
          @click="deactivateSelectedMoim"
        >
          {{ deactivatingMoim ? '비활성화 중...' : '모임통장 연동 비활성화' }}
        </button>
        <p v-if="moimEditError" class="edit-error" role="alert">{{ moimEditError }}</p>
      </div>
    </BaseModal>

    <BaseModal
      v-model="moimModalOpen"
      :title="moimModalStep === 'choice' ? '모임통장 연결하기' : '보유 모임통장 선택'"
      :close-on-overlay="!moimSubmitting"
      :close-on-esc="!moimSubmitting"
      size="medium"
      @close="resetMoimModal"
    >
      <div v-if="moimModalStep === 'choice'" class="connection-options">
        <button type="button" @click="openMoimList">
          <span class="option-icon">KB</span>
          <span
            ><b>KB 모임통장 연결하기</b
            ><small>보유중인 모임통장을 여러 개 연결할 수 있습니다.</small></span
          >
          <strong>→</strong>
        </button>
        <a
          href="https://obank.kbstar.com/quics?page=C112911"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="option-icon new">＋</span>
          <span
            ><b>KB 모임통장 개설하러 가기</b
            ><small>KB국민은행 페이지가 새 창에서 열립니다.</small></span
          >
          <strong>→</strong>
        </a>
      </div>

      <div v-else>
        <p class="selection-guide">연결할 모임통장을 모두 선택해 주세요.</p>
        <div v-if="loadingMoimCandidates" class="modal-state">모임통장을 조회하고 있습니다.</div>
        <div v-else-if="moimModalError" class="modal-state error-state" role="alert">
          {{ moimModalError }}<button type="button" @click="loadMoimCandidates">다시 조회</button>
        </div>
        <div v-else-if="!moimCandidates.length" class="modal-state">
          추가로 연결할 수 있는 KB 모임통장이 없습니다.
        </div>
        <div v-else class="pension-list moim-selection-list">
          <label v-for="account in moimCandidates" :key="account.kbAccountId">
            <input v-model="selectedMoimIds" type="checkbox" :value="account.kbAccountId" />
            <span class="radio-mark"></span>
            <span class="pension-info"
              ><b>{{ account.bankName }} 모임통장</b
              ><small>{{ account.accountNumber }}</small></span
            >
            <strong>{{ formatCurrency(account.balance) }}원</strong>
          </label>
        </div>
      </div>

      <template v-if="moimModalStep === 'select'" #footer>
        <button
          class="modal-cancel"
          type="button"
          :disabled="moimSubmitting"
          @click="closeMoimModal"
        >
          취소
        </button>
        <button
          class="modal-submit"
          type="button"
          :disabled="!selectedMoimIds.length || loadingMoimCandidates || moimSubmitting"
          @click="connectSelectedMoimAccounts"
        >
          {{ moimSubmitting ? '연결 중...' : '연결하기' }}
        </button>
      </template>
    </BaseModal>

    <transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import {
  deactivateMoimAccount,
  getAccount,
  getMoimAccounts,
  registerAccount,
  registerMoimAccount,
  searchAccounts,
  searchMoimAccounts,
  updateAccount,
  updatePensionStatus,
} from '@/api/account'
import { getMyInfo } from '@/api/user'
import { getGroups } from '@/api/group'

const tabs = [
  { id: 'pension', icon: '₩', label: '개인연금', caption: '나의 노후 자산' },
  { id: 'group', icon: '♟', label: '모임통장', caption: '함께 관리하는 자산' },
]
const states = {
  pension: {
    icon: '₩',
    title: '연결된 개인연금 계좌가 없습니다',
    description: '개인연금 계좌를 연결하고 노후 자산을 편리하게 관리해 보세요.',
    button: '개인연금 연결하기',
  },
  group: {
    icon: '♟',
    title: '연결된 모임통장이 없습니다',
    description: '모임통장을 연결하고 함께 쓰는 자산과 내역을 확인해 보세요.',
    button: '모임통장 연결하기',
  },
}
const activeTab = ref('pension')
const content = computed(() => states[activeTab.value])
const toast = ref('')
const pensionModalOpen = ref(false)
const modalStep = ref('choice')
const pensionAccounts = ref([])
const selectedPensionId = ref('')
const useForFutureSavings = ref(false)
const loadingAccounts = ref(false)
const submitting = ref(false)
const modalError = ref('')
const connectedPension = ref(null)
const loadingConnectedAccount = ref(true)
const isEditing = ref(false)
const connectedMoimAccounts = ref([])
const moimModalOpen = ref(false)
const moimModalStep = ref('choice')
const moimCandidates = ref([])
const selectedMoimIds = ref([])
const loadingMoimCandidates = ref(false)
const moimSubmitting = ref(false)
const moimModalError = ref('')
const floatingMenuOpen = ref(false)
const draggingMoimId = ref('')
const moimEditModalOpen = ref(false)
const editingMoimAccount = ref(null)
const deactivatingMoim = ref(false)
const moimEditError = ref('')
let longPressTimer
let mobileDragActive = false
let mobileDragPointerId = null
let timer

onMounted(() => {
  loadConnectedPension()
  loadConnectedMoimAccounts()
})
onBeforeUnmount(() => {
  clearTimeout(longPressTimer)
  removeMobileDragListeners()
})

function showToast(message) {
  toast.value = message
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 2400)
}

function handleConnectClick() {
  if (activeTab.value === 'group') {
    moimModalStep.value = 'choice'
    moimModalOpen.value = true
    return
  }
  isEditing.value = false
  pensionModalOpen.value = true
}

function applySavedMoimOrder(accounts) {
  const savedOrder = JSON.parse(localStorage.getItem('youngly_moim_order') || '[]')
  return [...accounts].sort((a, b) => {
    const aIndex = savedOrder.indexOf(a.moimAccountId)
    const bIndex = savedOrder.indexOf(b.moimAccountId)
    return (
      (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex)
    )
  })
}

async function loadConnectedMoimAccounts() {
  try {
    const { data: accounts } = await getMoimAccounts()
    let groups = []
    let groupsLoaded = false
    try {
      const response = await getGroups()
      groups = response.data
      groupsLoaded = true
    } catch {
      groups = []
    }
    const groupByMoimAccountId = new Map(
      (Array.isArray(groups) ? groups : [])
        .filter((group) => group.moimAccountId)
        .map((group) => [group.moimAccountId, group]),
    )
    const accountsWithGroup = (Array.isArray(accounts) ? accounts : []).map((account) => {
      const group = groupByMoimAccountId.get(account.moimAccountId)
      return {
        ...account,
        groupLinked: groupsLoaded ? Boolean(group) : null,
        groupId: group?.groupId || null,
        groupName: group?.groupName || null,
        groupCount: group?.groupCount ?? null,
      }
    })
    connectedMoimAccounts.value = applySavedMoimOrder(accountsWithGroup)
  } catch {
    connectedMoimAccounts.value = []
  }
}

async function openMoimList() {
  floatingMenuOpen.value = false
  moimModalOpen.value = true
  moimModalStep.value = 'select'
  await loadMoimCandidates()
}

async function loadMoimCandidates() {
  loadingMoimCandidates.value = true
  moimModalError.value = ''
  selectedMoimIds.value = []
  try {
    const { data: user } = await getMyInfo()
    const { data } = await searchMoimAccounts({ name: user.name, birthday: user.birthday })
    moimCandidates.value = (Array.isArray(data) ? data : []).filter(
      (account) => account.accountType === 'MOIM',
    )
  } catch (error) {
    moimCandidates.value = []
    moimModalError.value = apiErrorMessage(error, '모임통장을 조회하지 못했습니다.')
  } finally {
    loadingMoimCandidates.value = false
  }
}

async function connectSelectedMoimAccounts() {
  if (!selectedMoimIds.value.length || moimSubmitting.value) return
  moimSubmitting.value = true
  moimModalError.value = ''
  try {
    for (const kbAccountId of selectedMoimIds.value) {
      await registerMoimAccount(kbAccountId)
    }
    await loadConnectedMoimAccounts()
    closeMoimModal()
    showToast('선택한 모임통장이 연결되었습니다.')
  } catch (error) {
    await loadConnectedMoimAccounts()
    moimModalError.value = apiErrorMessage(error, '일부 모임통장을 연결하지 못했습니다.')
  } finally {
    moimSubmitting.value = false
  }
}

function closeMoimModal() {
  moimModalOpen.value = false
  resetMoimModal()
}

function resetMoimModal() {
  if (moimSubmitting.value) return
  moimModalStep.value = 'choice'
  moimCandidates.value = []
  selectedMoimIds.value = []
  moimModalError.value = ''
}

function openMoimEditModal(account) {
  editingMoimAccount.value = account
  moimEditError.value = ''
  moimEditModalOpen.value = true
}

async function deactivateSelectedMoim() {
  if (!editingMoimAccount.value || deactivatingMoim.value) return
  deactivatingMoim.value = true
  moimEditError.value = ''
  try {
    await deactivateMoimAccount(editingMoimAccount.value.moimAccountId)
    moimEditModalOpen.value = false
    editingMoimAccount.value = null
    await loadConnectedMoimAccounts()
    showToast('모임통장 연동이 비활성화되었습니다.')
  } catch (error) {
    moimEditError.value = apiErrorMessage(error, '모임통장을 비활성화하지 못했습니다.')
  } finally {
    deactivatingMoim.value = false
  }
}

function resetMoimEditModal() {
  if (deactivatingMoim.value) return
  editingMoimAccount.value = null
  moimEditError.value = ''
}

function moveMoimAccount(targetId) {
  const fromIndex = connectedMoimAccounts.value.findIndex(
    (account) => account.moimAccountId === draggingMoimId.value,
  )
  const toIndex = connectedMoimAccounts.value.findIndex(
    (account) => account.moimAccountId === targetId,
  )
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
  const reordered = [...connectedMoimAccounts.value]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  connectedMoimAccounts.value = reordered
}

function saveMoimOrder() {
  localStorage.setItem(
    'youngly_moim_order',
    JSON.stringify(connectedMoimAccounts.value.map((account) => account.moimAccountId)),
  )
}

function handleDesktopDragStart(accountId, event) {
  if (window.matchMedia('(max-width: 767px)').matches) {
    event.preventDefault()
    return
  }
  draggingMoimId.value = accountId
  event.dataTransfer.effectAllowed = 'move'
}

function handleDesktopDrop(targetId) {
  moveMoimAccount(targetId)
  finishMoimDrag()
}

function finishMoimDrag() {
  if (draggingMoimId.value) saveMoimOrder()
  draggingMoimId.value = ''
}

function handleMoimPointerDown(accountId, event) {
  if (!window.matchMedia('(max-width: 767px)').matches) return
  if (event.pointerType === 'mouse' || !event.isPrimary) return
  event.preventDefault()
  clearTimeout(longPressTimer)
  const startX = event.clientX
  const startY = event.clientY
  const cancelLongPress = (moveEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return
    if (Math.abs(moveEvent.clientX - startX) > 14 || Math.abs(moveEvent.clientY - startY) > 14) {
      clearTimeout(longPressTimer)
      removePendingMobileDragListeners()
    }
  }
  const cancelPendingDrag = (endEvent) => {
    if (endEvent.pointerId !== event.pointerId) return
    clearTimeout(longPressTimer)
    removePendingMobileDragListeners()
  }
  const removePendingMobileDragListeners = () => {
    window.removeEventListener('pointermove', cancelLongPress)
    window.removeEventListener('pointerup', cancelPendingDrag)
    window.removeEventListener('pointercancel', cancelPendingDrag)
  }
  longPressTimer = setTimeout(() => {
    removePendingMobileDragListeners()
    draggingMoimId.value = accountId
    mobileDragActive = true
    mobileDragPointerId = event.pointerId
    navigator.vibrate?.(25)
    window.addEventListener('pointermove', handleMobileDragMove, { passive: false })
    window.addEventListener('pointerup', finishMobileDrag)
    window.addEventListener('pointercancel', finishMobileDrag)
  }, 450)
  window.addEventListener('pointermove', cancelLongPress, { passive: false })
  window.addEventListener('pointerup', cancelPendingDrag)
  window.addEventListener('pointercancel', cancelPendingDrag)
}

function handleMobileDragMove(event) {
  if (!mobileDragActive || event.pointerId !== mobileDragPointerId) return
  event.preventDefault()
  const edgeSize = 72
  if (event.clientY < edgeSize) window.scrollBy({ top: -12, behavior: 'auto' })
  if (event.clientY > window.innerHeight - edgeSize) window.scrollBy({ top: 12, behavior: 'auto' })
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-moim-id]')
  if (target?.dataset.moimId) moveMoimAccount(target.dataset.moimId)
}

function finishMobileDrag(event) {
  if (event?.pointerId != null && event.pointerId !== mobileDragPointerId) return
  clearTimeout(longPressTimer)
  if (mobileDragActive) saveMoimOrder()
  mobileDragActive = false
  mobileDragPointerId = null
  draggingMoimId.value = ''
  removeMobileDragListeners()
}

function removeMobileDragListeners() {
  window.removeEventListener('pointermove', handleMobileDragMove)
  window.removeEventListener('pointerup', finishMobileDrag)
  window.removeEventListener('pointercancel', finishMobileDrag)
}

async function loadConnectedPension() {
  loadingConnectedAccount.value = true
  try {
    const { data } = await getAccount('PENSION')
    connectedPension.value = data
  } catch {
    connectedPension.value = null
  } finally {
    loadingConnectedAccount.value = false
  }
}

async function openEditModal() {
  isEditing.value = true
  modalStep.value = 'select'
  useForFutureSavings.value = connectedPension.value?.accountStatus === 'INCOME'
  pensionModalOpen.value = true
  await loadPensionAccounts()
}

function apiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback
}

async function openPensionList() {
  modalStep.value = 'select'
  await loadPensionAccounts()
}

async function loadPensionAccounts() {
  loadingAccounts.value = true
  modalError.value = ''
  selectedPensionId.value = ''
  try {
    const { data: user } = await getMyInfo()
    const { data: accounts } = await searchAccounts({ name: user.name, birthday: user.birthday })
    pensionAccounts.value = (Array.isArray(accounts) ? accounts : []).filter(
      (account) => account.accountType === 'PENSION',
    )
    if (isEditing.value && connectedPension.value) {
      const currentAccount = pensionAccounts.value.find(
        (account) => account.accountNumber === connectedPension.value.accountNumber,
      )
      selectedPensionId.value = currentAccount?.kbAccountId || ''
    }
  } catch (error) {
    pensionAccounts.value = []
    modalError.value = apiErrorMessage(error, '개인연금 계좌를 조회하지 못했습니다.')
  } finally {
    loadingAccounts.value = false
  }
}

async function connectPension() {
  if (!selectedPensionId.value || submitting.value) return
  submitting.value = true
  modalError.value = ''
  try {
    let accountId
    if (isEditing.value) {
      accountId = connectedPension.value.accountId
      await updateAccount(accountId, selectedPensionId.value)
      const nextStatus = useForFutureSavings.value ? 'INCOME' : 'NONE'
      if (nextStatus !== connectedPension.value.accountStatus) {
        await updatePensionStatus(accountId, nextStatus)
      }
    } else {
      const { data } = await registerAccount(selectedPensionId.value)
      accountId = data.accountId
      if (useForFutureSavings.value) {
        await updatePensionStatus(accountId, 'INCOME')
      }
    }
    await loadConnectedPension()
    const successMessage = isEditing.value
      ? '개인연금 계좌가 변경되었습니다.'
      : '개인연금 계좌가 연결되었습니다.'
    closeModal()
    showToast(successMessage)
  } catch (error) {
    modalError.value = apiErrorMessage(error, '개인연금 계좌를 연결하지 못했습니다.')
  } finally {
    submitting.value = false
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}

function closeModal() {
  pensionModalOpen.value = false
  resetModal()
}

function resetModal() {
  if (submitting.value) return
  modalStep.value = 'choice'
  pensionAccounts.value = []
  selectedPensionId.value = ''
  useForFutureSavings.value = false
  modalError.value = ''
  isEditing.value = false
}
</script>

<style scoped>
.asset-page {
  --purple: #69529f;
  --purple-light: #f1edfa;
  min-height: calc(100vh - 80px);
  margin: -20px;
  padding: 32px 40px 72px;
  background: #e6dcf6;
  color: #242329;
  box-sizing: border-box;
}
.asset-page * {
  box-sizing: border-box;
}
.tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 230px));
  gap: 12px;
  margin-bottom: 18px;
}
.tabs button {
  min-height: 68px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid #e2e0e6;
  border-radius: 14px;
  background: #fff;
  color: #77737e;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}
.tabs button:hover {
  border-color: #bcb3d3;
  transform: translateY(-1px);
}
.tabs button.active {
  border-color: var(--purple);
  background: var(--purple);
  color: #fff;
  box-shadow: 0 8px 20px rgba(105, 82, 159, 0.18);
}
.tab-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #f1eff4;
  color: #5d5864;
  font-size: 17px;
  font-weight: 800;
}
.tabs button.active .tab-icon {
  background: rgba(255, 255, 255, 0.17);
  color: #fff;
}
.tabs b,
.tabs small {
  display: block;
}
.tabs b {
  font-size: 14px;
}
.tabs small {
  margin-top: 4px;
  color: #a09ca6;
  font-size: 10px;
}
.tabs button.active small {
  color: rgba(255, 255, 255, 0.68);
}
.asset-card {
  min-height: 390px;
  padding: 55px 30px 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 1px solid #e7e5e9;
  border-radius: 20px;
  background: #fff;
  text-align: center;
  box-shadow: 0 10px 32px rgba(34, 28, 47, 0.055);
}
.linked-account-card {
  min-height: 350px;
  padding: 34px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e1dbe9;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #faf8fe 100%);
  box-shadow: 0 10px 32px rgba(34, 28, 47, 0.055);
}
.linked-account-card::after {
  content: '';
  width: 210px;
  height: 210px;
  position: absolute;
  right: -80px;
  bottom: -120px;
  border-radius: 50%;
  background: #eee8fa;
}
.edit-account-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 2;
  border: 1px solid #dad3e4;
  border-radius: 10px;
  background: #fff;
  color: #69529f;
  font-size: 20px;
  cursor: pointer;
  transition: 0.18s;
}
.edit-account-button:hover {
  border-color: #69529f;
  background: #f5f1fb;
}
.linked-card-heading {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-right: 55px;
}
.linked-icon {
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #69529f;
  color: #fff;
  font-size: 14px;
  font-weight: 900;
}
.linked-card-heading small {
  color: #918a99;
  font-size: 11px;
}
.linked-card-heading h2 {
  margin: 5px 0 0;
  font-size: 20px;
}
.account-details {
  width: min(620px, 100%);
  margin: 32px 0 0;
  position: relative;
  z-index: 1;
  border-top: 1px solid #e7e1ed;
}
.account-details > div {
  min-height: 65px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #eee9f2;
}
.account-details dt {
  color: #8b8492;
  font-size: 12px;
}
.account-details dd {
  margin: 0;
  color: #403a48;
  font-size: 13px;
  font-weight: 700;
}
.account-details .balance-value {
  color: #4f397e;
  font-size: 19px;
}
.moim-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.moim-account-card {
  min-height: 205px;
  padding: 24px;
  position: relative;
  border: 1px solid #ded7e8;
  border-radius: 18px;
  background: linear-gradient(145deg, #fff, #f8f4fd);
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
  box-shadow: 0 8px 24px rgba(49, 37, 72, 0.06);
  transition:
    opacity 0.18s,
    transform 0.18s;
}
.moim-account-card:active {
  cursor: grabbing;
}
.moim-account-card.is-dragging {
  opacity: 0.62;
  transform: scale(0.98);
  box-shadow: 0 12px 30px rgba(79, 57, 126, 0.2);
}
.drag-handle {
  position: absolute;
  top: 14px;
  left: 17px;
  color: #8d839c;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  cursor: grab;
  touch-action: none;
  -webkit-touch-callout: none;
}
.drag-handle:active {
  cursor: grabbing;
}
.moim-edit-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  position: absolute;
  top: 13px;
  right: 14px;
  border: 1px solid #d8d0e2;
  border-radius: 9px;
  background: #fff;
  color: #69529f;
  font-size: 18px;
  cursor: pointer;
}
.moim-edit-button:hover {
  border-color: #69529f;
  background: #f4f0fa;
}
.moim-card-bank {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 28px 0 12px;
}
.ownership-row {
  min-height: 24px;
  margin-bottom: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ownership-badge {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}
.ownership-badge.participant {
  background: #e9f4ef;
  color: #39725a;
}
.account-owner-name {
  overflow: hidden;
  color: #817989;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.moim-card-bank span {
  width: 36px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #ffcc00;
  font-size: 10px;
  font-weight: 900;
}
.moim-card-bank small {
  color: #777080;
  font-size: 12px;
  font-weight: 700;
}
.moim-account-card > strong {
  display: block;
  color: #33294a;
  font-size: 25px;
}
.moim-account-card > p {
  margin: 10px 0 4px;
  color: #665e70;
  font-size: 13px;
}
.moim-account-name {
  color: #9b95a2;
  font-size: 11px;
}
.group-link-status {
  min-height: 39px;
  margin-top: 18px;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid #e8e2ed;
  color: #8c8495;
  font-size: 11px;
}
.group-link-status b {
  overflow: hidden;
  color: #4c405e;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-link-status span {
  flex: 0 0 auto;
}
.moim-edit-content > small,
.moim-edit-content > strong,
.moim-edit-content > span {
  display: block;
}
.moim-edit-content > small {
  color: #8c8593;
  font-size: 11px;
}
.moim-edit-content > strong {
  margin-top: 7px;
  color: #352e3e;
  font-size: 17px;
}
.moim-edit-content > span {
  margin: 5px 0 20px;
  color: #8d8794;
  font-size: 12px;
}
.moim-edit-content > button {
  width: 100%;
  min-height: 48px;
  margin-top: 9px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e0dbe5;
  border-radius: 10px;
  background: #fff;
  color: #574e62;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.moim-edit-content > button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}
.moim-edit-content button em {
  color: #99929f;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
}
.moim-edit-content .deactivate-button {
  border-color: #f0c8c5;
  color: #b72e27;
  justify-content: center;
}
.edit-error {
  margin: 13px 0 0;
  color: #b3261e;
  font-size: 12px;
  text-align: center;
}
.floating-add {
  position: fixed;
  right: 34px;
  bottom: 34px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 11px;
}
.floating-add-button {
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #69529f;
  color: #fff;
  font-size: 29px;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 9px 24px rgba(70, 49, 115, 0.3);
}
.floating-options {
  display: grid;
  gap: 8px;
}
.floating-options button,
.floating-options a {
  min-width: 205px;
  min-height: 42px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid #ddd5e8;
  border-radius: 10px;
  background: #fff;
  color: #4d425e;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 5px 18px rgba(37, 28, 53, 0.13);
}
.floating-menu-enter-active,
.floating-menu-leave-active {
  transition: 0.18s;
}
.floating-menu-enter-from,
.floating-menu-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.checkbox-mark {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border: 1px solid #bbb4c5;
  border-radius: 5px;
  background: #fff;
  color: transparent;
  font-size: 12px;
  font-weight: 900;
}
.moim-selection-list input:checked + .checkbox-mark {
  border-color: #69529f;
  background: #69529f;
  color: #fff;
}
.card-decoration {
  position: absolute;
  width: 220px;
  height: 220px;
  right: -80px;
  top: -100px;
  border-radius: 50%;
  background: var(--purple-light);
}
.empty-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: var(--purple-light);
  color: var(--purple);
  font-size: 28px;
  font-weight: 900;
}
.asset-card h2 {
  margin: 24px 0 9px;
  font-size: 20px;
  letter-spacing: -0.5px;
}
.asset-card > p {
  margin: 0;
  color: #85818c;
  font-size: 13px;
}
.connect-button {
  min-width: 210px;
  height: 50px;
  margin-top: 27px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  border: 0;
  border-radius: 12px;
  background: var(--purple);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 7px 16px rgba(105, 82, 159, 0.22);
  transition: 0.2s;
}
.connect-button:hover {
  background: #594287;
  transform: translateY(-1px);
}
.group-connect-button {
  background: #7156ad;
}
.group-connect-button:hover {
  background: #62499a;
}
.connect-button span {
  font-size: 18px;
  font-weight: 400;
}
.connection-options {
  display: grid;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}
.connection-options button,
.connection-options a {
  box-sizing: border-box;
  width: 100%;
  min-height: 84px;
  padding: 15px 16px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 13px;
  border: 1px solid #e5e0ed;
  border-radius: 13px;
  background: #fff;
  color: #302a3b;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: 0.18s;
}
.connection-options button:hover,
.connection-options a:hover {
  border-color: var(--purple, #69529f);
  background: #faf8fe;
  transform: translateY(-1px);
}
.connection-options > * > span:nth-child(2) {
  min-width: 0;
}
.connection-options b,
.connection-options small {
  display: block;
}
.connection-options b {
  font-size: 14px;
}
.connection-options small {
  margin-top: 5px;
  color: #8e8996;
  font-size: 11px;
}
.connection-options strong {
  justify-self: end;
  color: var(--purple, #69529f);
  font-size: 18px;
}
.option-icon {
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #eee8fa;
  color: var(--purple, #69529f);
  font-size: 12px;
  font-weight: 900;
}
.option-icon.new {
  background: #fff2c7;
  color: #856900;
  font-size: 20px;
}
.selection-guide {
  margin: 0 0 14px;
  color: #716b7a;
  font-size: 13px;
}
.modal-state {
  padding: 30px 15px;
  border-radius: 12px;
  background: #f7f5fa;
  color: #827c8a;
  text-align: center;
  font-size: 13px;
}
.modal-state button {
  display: block;
  margin: 12px auto 0;
  padding: 7px 12px;
  border: 1px solid #cfc7dc;
  border-radius: 7px;
  background: #fff;
  cursor: pointer;
}
.error-state {
  color: #b3261e;
  background: #fff4f3;
}
.pension-list {
  display: grid;
  gap: 9px;
  max-height: 260px;
  overflow-y: auto;
}
.pension-list label {
  min-height: 76px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e3dfe8;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: background-color 0.16s ease;
}
.pension-list label:has(input:checked) {
  background: #f4f0fa;
}
.pension-list input {
  position: absolute;
  opacity: 0;
}
.radio-mark {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border: 1px solid #bbb4c5;
  border-radius: 50%;
  background: #fff;
}
.radio-mark::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--purple, #69529f);
  opacity: 0;
  transform: scale(0.5);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.pension-list input:checked + .radio-mark::after {
  opacity: 1;
  transform: scale(1);
}
.pension-info {
  min-width: 0;
}
.pension-info b,
.pension-info small {
  display: block;
}
.pension-info b {
  font-size: 13px;
}
.pension-info small {
  margin-top: 5px;
  color: #8c8792;
  font-size: 11px;
}
.pension-list label > strong {
  margin-left: auto;
  white-space: nowrap;
  font-size: 13px;
}
.future-saving-row {
  min-height: 64px;
  margin-top: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  position: relative;
  border-top: 1px solid #ebe7ef;
}
.future-saving-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #4b4652;
  font-size: 13px;
  font-weight: 700;
}
.help-tooltip {
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  position: relative;
  border: 1px solid #b8b1c3;
  border-radius: 5px;
  color: #777080;
  font-size: 11px;
  cursor: help;
  outline: none;
}
.tooltip-content {
  width: 280px;
  padding: 13px 14px;
  position: absolute;
  left: 50%;
  bottom: calc(100% + 9px);
  z-index: 4;
  border-radius: 9px;
  background: #2f2939;
  color: #fff;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.55;
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, 5px);
  transition: 0.16s;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}
.tooltip-content b {
  display: block;
  margin-bottom: 4px;
}
.help-tooltip:hover .tooltip-content,
.help-tooltip:focus .tooltip-content {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}
.toggle {
  flex: 0 0 auto;
  cursor: pointer;
}
.toggle input {
  position: absolute;
  opacity: 0;
}
.toggle > span {
  width: 44px;
  height: 24px;
  display: block;
  position: relative;
  border-radius: 14px;
  background: #cbc6d1;
  transition: 0.2s;
}
.toggle > span::after {
  content: '';
  width: 18px;
  height: 18px;
  position: absolute;
  left: 3px;
  top: 3px;
  border-radius: 50%;
  background: #fff;
  transition: 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.toggle input:checked + span {
  background: var(--purple, #69529f);
}
.toggle input:checked + span::after {
  transform: translateX(20px);
}
.modal-cancel,
.modal-submit {
  min-width: 92px;
  height: 42px;
  padding: 0 17px;
  border-radius: 9px;
  font-weight: 800;
  cursor: pointer;
}
.modal-cancel {
  border: 1px solid #d8d2df;
  background: #fff;
  color: #5f5967;
}
.modal-submit {
  border: 0;
  background: var(--purple, #69529f);
  color: #fff;
}
.modal-submit:disabled,
.modal-cancel:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
:global(.base-modal),
:global(.base-modal__body) {
  overflow: visible;
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  padding: 13px 20px;
  border-radius: 10px;
  background: rgba(35, 32, 40, 0.94);
  color: #fff;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  z-index: 20;
}
.toast-enter-active,
.toast-leave-active {
  transition: 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
@media (max-width: 767px) {
  .asset-page {
    width: 100%;
    max-width: 100%;
    min-height: calc(100dvh - 68px);
    margin: 0;
    padding: 24px 20px 110px;
    overflow-x: hidden;
  }
  .tabs {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 9px;
  }
  .tabs button {
    width: 100%;
    min-width: 0;
    min-height: 62px;
    padding: 0 10px;
    border-radius: 12px;
  }
  .tab-icon {
    width: 30px;
    height: 30px;
  }
  .tabs small {
    display: none;
  }
  .asset-card {
    width: 100%;
    max-width: 100%;
    min-height: 340px;
    padding: 42px 16px 35px;
    border-radius: 16px;
  }
  .linked-account-card {
    min-height: 330px;
    padding: 26px 20px;
    border-radius: 16px;
  }
  .edit-account-button {
    top: 18px;
    right: 18px;
  }
  .linked-card-heading h2 {
    font-size: 17px;
  }
  .account-details {
    margin-top: 25px;
  }
  .account-details > div {
    min-height: 58px;
  }
  .moim-card-grid {
    grid-template-columns: 1fr;
  }
  .moim-account-card {
    min-height: 190px;
    touch-action: pan-y;
  }
  .moim-account-card.is-dragging {
    touch-action: none;
  }
  .floating-add {
    right: 20px;
    bottom: 94px;
  }
  .asset-card h2 {
    font-size: 17px;
  }
  .asset-card > p {
    max-width: 270px;
    line-height: 1.6;
  }
  .connect-button {
    min-width: 0;
    width: min(100%, 230px);
  }
  .connection-options button,
  .connection-options a {
    min-height: 88px;
    padding: 14px;
    grid-template-columns: 42px minmax(0, 1fr) 18px;
    gap: 11px;
  }
  .connection-options b,
  .connection-options small {
    line-height: 1.45;
    word-break: keep-all;
  }
  .tooltip-content {
    width: auto;
    left: 0;
    right: 0;
    bottom: calc(100% + 10px);
    transform: translateY(5px);
  }
  .help-tooltip {
    position: static;
  }
  .help-tooltip:hover .tooltip-content,
  .help-tooltip:focus .tooltip-content {
    transform: translateY(0);
  }
  .pension-list label {
    flex-wrap: wrap;
  }
  .pension-list label > strong {
    width: calc(100% - 32px);
    margin-left: 32px;
    text-align: left;
  }
  .toast {
    bottom: 92px;
    width: calc(100% - 40px);
    text-align: center;
  }
}
:global(.mobile-bottom-nav) {
  position: fixed !important;
  right: 0;
  bottom: 0 !important;
  left: 0;
  z-index: 9999 !important;
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
