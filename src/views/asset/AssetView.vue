<template>
  <section class="asset-page">
    <div class="tabs" role="tablist" aria-label="자산 종류">
      <div v-for="tab in tabs" :key="tab.id" class="asset-tab-shadow yl-stepped-card-shadow">
        <button
          class="yl-card-frame pixel-step-card pixel-step-solid"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="selectAssetTab(tab.id)"
        >
          <span class="asset-tab-surface pixel-step-surface">
            <span class="tab-icon"><img :src="tab.icon" alt="" /></span>
            <span
              ><b>{{ tab.label }}</b
              ><small>{{ tab.caption }}</small></span
            >
          </span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'pension' && connectedPension" class="asset-account-shadow yl-stepped-card-shadow">
    <article class="linked-account-card yl-card-frame pixel-step-card pixel-step-solid">
      <div class="linked-account-card-surface pixel-step-surface">
      <button
        class="edit-account-button"
        type="button"
        aria-label="개인연금 계좌 변경"
        @click="openEditModal"
      >
        ✎
      </button>
      <div class="linked-card-heading">
        <img class="linked-icon" :src="kbIcon" alt="KB" />
        <div>
          <small>연결된 개인연금</small>
          <h2>{{ connectedPension.bankName }} 개인연금</h2>
        </div>
      </div>
      <div class="pension-sync-row">
        <button type="button" :disabled="syncingPension" @click="refreshPensionAccount">
          <span aria-hidden="true" :class="{ spinning: syncingPension }">↻</span>
          {{ syncingPension ? '갱신 중' : '새로고침' }}
        </button>
        <span>{{ formatSyncedAt(connectedPension.syncedAt) }}</span>
      </div>
      <dl class="account-details">
        <div>
          <dt>계좌번호</dt>
          <dd class="account-number-value">{{ connectedPension.accountNumber }}</dd>
        </div>
        <div>
          <dt>잔액</dt>
          <dd class="balance-value yl-money">{{ formatCurrency(connectedPension.balance) }}원</dd>
        </div>
        <div>
          <dt>미래 적립금</dt>
          <dd>
            {{ connectedPension.accountStatus === 'INCOME' ? '적립 계좌로 사용 중' : '사용 안 함' }}
          </dd>
        </div>
      </dl>
      <button class="ai-insight-button" type="button" @click="router.push({ name: 'PensionInsight' })">
        <span aria-hidden="true">✦</span>
        AI 개인연금 인사이트
        <b aria-hidden="true">→</b>
      </button>
      <TransactionHistory
        :key="pensionHistoryRefreshKey"
        account-type="PENSION"
        :account-id="connectedPension.accountId"
        :account-number="connectedPension.accountNumber"
        :bank-name="connectedPension.bankName"
        :account-name="`${connectedPension.bankName} 개인연금`"
        is-account-owner
      />
      </div>
    </article>
    </div>

    <article v-else-if="loadingConnectedAccount && activeTab === 'pension'" class="asset-card">
      <div class="modal-state">연결된 개인연금을 확인하고 있습니다.</div>
    </article>

    <section
      v-else-if="activeTab === 'group' && connectedMoimAccounts.length"
      class="moim-card-grid"
    >
      <div
        v-for="account in connectedMoimAccounts"
        :key="account.moimAccountId"
        class="asset-account-shadow moim-account-shadow yl-stepped-card-shadow"
      >
        <article
          class="moim-account-card yl-card-frame pixel-step-card pixel-step-solid"
          :class="{ 'is-dragging': draggingMoimId === account.moimAccountId }"
          :data-moim-id="account.moimAccountId"
          draggable="true"
          @dragstart="handleDesktopDragStart(account.moimAccountId, $event)"
          @dragover.prevent
          @drop="handleDesktopDrop(account.moimAccountId)"
          @dragend="finishMoimDrag"
          @click="openMoimDetail(account)"
        >
          <div class="moim-account-card-surface pixel-step-surface">
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
          <img :src="kbIcon" alt="KB" /><small>{{ account.bankName }} 모임통장</small>
        </div>
        <div v-if="!account.owner" class="ownership-row">
          <span class="ownership-badge participant">참여 중</span>
          <small class="account-owner-name">
            소유주 {{ account.ownerName || '정보 확인 중' }}
          </small>
        </div>
        <strong class="yl-money">{{ formatCurrency(account.balance) }}원</strong>
        <p>{{ account.accountNumber }}</p>
        <small class="moim-account-name">{{ account.accountName }}</small>
        <div class="group-link-status">
          <template v-if="account.groupName">
            <b>{{ account.groupName }}</b>
            <span class="group-member-count">{{ account.groupCount }}명 참여</span>
          </template>
          <template v-else-if="account.groupLinked === false">
            <span>아직 연결된 그룹이 없어요</span>
          </template>
          <template v-else>
            <span>그룹 연결 정보 준비 중</span>
          </template>
          <span
            class="drag-handle"
            role="button"
            aria-label="길게 눌러 순서 변경"
            @pointerdown.stop="handleMoimPointerDown(account.moimAccountId, $event)"
            @click.stop
            @contextmenu.prevent
            ><span aria-hidden="true">⠿</span></span
          >
        </div>
          </div>
        </article>
      </div>
    </section>

    <div v-else class="empty-asset-shadow yl-stepped-card-shadow">
    <article class="asset-card empty-asset-card pixel-step-card pixel-step-solid">
      <div class="empty-asset-surface pixel-step-surface">
      <h2>{{ content.title }}</h2>
      <button
        class="connect-button"
        :class="{ 'group-connect-button': activeTab === 'group' }"
        type="button"
        @click="handleConnectClick"
      >
        {{ content.button }}
        <span>→</span>
      </button>
      </div>
    </article>
    </div>

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
      :show-close-button="false"
      :modal-class="[
        'pension-connect-modal',
        modalStep === 'choice' ? 'pension-connect-modal--choice' : 'pension-connect-modal--select',
      ]"
      :auto-focus="false"
      size="medium"
      @close="resetModal"
    >
      <div v-if="modalStep === 'choice'" class="connection-options">
        <button type="button" @click="openPensionList">
          <img class="option-icon option-icon-image" :src="pensionChainIcon" alt="" />
          <span
            ><b>보유중인 KB 개인연금 연결하기</b><small>내 계좌를 조회해 연결합니다.</small></span
          >
          <strong>→</strong>
        </button>
        <a
          href="https://omoney.kbstar.com/quics?page=C055442"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img class="option-icon option-icon-image" :src="pensionPlusIcon" alt="" />
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
            <strong class="yl-money">{{ formatCurrency(account.balance) }}원</strong>
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
      :close-on-overlay="!moimEditSubmitting"
      :close-on-esc="!moimEditSubmitting"
      :show-close-button="false"
      modal-class="pension-connect-modal pension-connect-modal--choice moim-management-modal"
      :auto-focus="false"
      @close="resetMoimEditModal"
    >
      <div v-if="editingMoimAccount" class="moim-edit-content">
        <small>선택한 모임통장</small>
        <strong>{{ editingMoimAccount.accountName }}</strong>
        <span>{{ editingMoimAccount.accountNumber }}</span>
        <form class="moim-name-form" @submit.prevent="changeMoimAccountName">
          <label for="moim-account-name">모임통장 이름 변경</label>
          <div>
            <input
              id="moim-account-name"
              v-model="moimAccountName"
              type="text"
              maxlength="50"
              autocomplete="off"
              placeholder="변경할 이름을 입력해 주세요"
              :disabled="moimEditSubmitting"
            />
            <button type="submit" :disabled="!canChangeMoimName || moimEditSubmitting">
              {{ changingMoimName ? '변경 중...' : '변경' }}
            </button>
          </div>
        </form>
        <button
          class="deactivate-button"
          type="button"
          :disabled="moimEditSubmitting"
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
      :show-close-button="false"
      :modal-class="[
        'pension-connect-modal',
        'moim-connect-modal',
        moimModalStep === 'choice' ? 'pension-connect-modal--choice' : 'pension-connect-modal--select',
      ]"
      :auto-focus="false"
      size="medium"
      @close="resetMoimModal"
    >
      <div v-if="moimModalStep === 'choice'" class="connection-options">
        <button type="button" @click="openMoimList">
          <img class="option-icon option-icon-image" :src="moimChainIcon" alt="" />
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
          <img class="option-icon option-icon-image" :src="moimPlusIcon" alt="" />
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
            <strong class="yl-money">{{ formatCurrency(account.balance) }}원</strong>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import TransactionHistory from '@/components/asset/TransactionHistory.vue'
import {
  deactivateMoimAccount,
  getAccount,
  getMoimAccounts,
  syncAccount,
  registerAccount,
  registerMoimAccount,
  searchAccounts,
  searchMoimAccounts,
  updateAccount,
  updateMoimAccountName,
  updatePensionStatus,
} from '@/api/account'
import { getMyInfo } from '@/api/user'
import { getGroups } from '@/api/group'
import pensionTabIcon from '@/assets/characters/bear.png'
import moimTabIcon from '@/assets/icons/loginIcon/starfriend.png'
import pensionChainIcon from '@/assets/asset_icon/pension_chain.png'
import pensionPlusIcon from '@/assets/asset_icon/pension_plus.png'
import moimChainIcon from '@/assets/asset_icon/moim_chain.png'
import moimPlusIcon from '@/assets/asset_icon/moim_plus.png'
import kbIcon from '@/assets/icons/kb_icon.png'

const router = useRouter()
const route = useRoute()

const tabs = [
  { id: 'pension', icon: pensionTabIcon, label: '개인연금', caption: '나의 노후 자산' },
  { id: 'group', icon: moimTabIcon, label: '모임통장', caption: '함께 관리하는 자산' },
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
const activeTab = ref(route.query.tab === 'group' ? 'group' : 'pension')
const content = computed(() => states[activeTab.value])

function selectAssetTab(tabId) {
  activeTab.value = tabId
  router.replace({
    name: 'Asset',
    query: tabId === 'group' ? { ...route.query, tab: 'group' } : { ...route.query, tab: undefined },
  })
}

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = tab === 'group' ? 'group' : 'pension'
  },
)
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
const syncingPension = ref(false)
const pensionHistoryRefreshKey = ref(0)
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
const changingMoimName = ref(false)
const moimAccountName = ref('')
const moimEditError = ref('')
const moimEditSubmitting = computed(() => deactivatingMoim.value || changingMoimName.value)
const canChangeMoimName = computed(() => {
  const nextName = moimAccountName.value.trim()
  return Boolean(nextName) && nextName !== editingMoimAccount.value?.accountName
})
let longPressTimer
let mobileDragActive = false
let mobileDragPointerId = null
let timer
let pensionSheetElement = null
let pensionSheetTouch = null
let activeConnectSheet = 'pension'

function bindPensionSheetGestures(selector = '.pension-connect-modal', type = 'pension') {
  activeConnectSheet = type
  pensionSheetElement = document.querySelector(selector)
  if (!pensionSheetElement) return
  pensionSheetElement.addEventListener('touchstart', startPensionSheetDrag, { passive: true })
  pensionSheetElement.addEventListener('touchmove', movePensionSheetDrag, { passive: false })
  pensionSheetElement.addEventListener('touchend', endPensionSheetDrag, { passive: true })
  pensionSheetElement.addEventListener('touchcancel', endPensionSheetDrag, { passive: true })
}

function unbindPensionSheetGestures() {
  if (!pensionSheetElement) return
  pensionSheetElement.removeEventListener('touchstart', startPensionSheetDrag)
  pensionSheetElement.removeEventListener('touchmove', movePensionSheetDrag)
  pensionSheetElement.removeEventListener('touchend', endPensionSheetDrag)
  pensionSheetElement.removeEventListener('touchcancel', endPensionSheetDrag)
  pensionSheetElement = null
  pensionSheetTouch = null
}

function startPensionSheetDrag(event) {
  if (!window.matchMedia('(max-width: 767px)').matches || event.touches.length !== 1) return
  const currentStep =
    activeConnectSheet === 'moim'
      ? moimModalStep.value
      : activeConnectSheet === 'pension'
        ? modalStep.value
        : 'choice'
  if (currentStep === 'select') return
  const body = pensionSheetElement?.querySelector('.base-modal__body')
  if (body?.scrollTop > 0) return
  pensionSheetTouch = {
    startY: event.touches[0].clientY,
    delta: 0,
    initialHeight: pensionSheetElement.offsetHeight,
  }
  pensionSheetElement.style.transition = 'none'
}

function movePensionSheetDrag(event) {
  if (!pensionSheetTouch || event.touches.length !== 1) return
  const delta = event.touches[0].clientY - pensionSheetTouch.startY
  pensionSheetTouch.delta = delta
  if (Math.abs(delta) < 6) return
  event.preventDefault()
  if (delta < 0) {
    pensionSheetElement.style.height = `${Math.min(window.innerHeight * 0.88, pensionSheetTouch.initialHeight - delta)}px`
    return
  }
  pensionSheetElement.style.transform = `translate3d(0, ${delta}px, 0)`
}

function endPensionSheetDrag() {
  if (!pensionSheetTouch || !pensionSheetElement) return
  const delta = pensionSheetTouch.delta
  pensionSheetTouch = null
  pensionSheetElement.style.transition = 'height 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
  if (delta < -45) {
    pensionSheetElement.style.height = '88dvh'
    pensionSheetElement.style.transform = 'translate3d(0, 0, 0)'
  } else if (delta > 90) {
    pensionSheetElement.style.transform = 'translate3d(0, 100%, 0)'
    const closeHandler =
      activeConnectSheet === 'moim'
        ? closeMoimModal
        : activeConnectSheet === 'moim-edit'
          ? closeMoimEditModal
          : closeModal
    window.setTimeout(closeHandler, 280)
  } else {
    pensionSheetElement.style.transform = 'translate3d(0, 0, 0)'
  }
}

watch(pensionModalOpen, async (isOpen) => {
  unbindPensionSheetGestures()
  if (!isOpen) return
  await nextTick()
  bindPensionSheetGestures()
})

watch(moimModalOpen, async (isOpen) => {
  unbindPensionSheetGestures()
  if (!isOpen) return
  await nextTick()
  bindPensionSheetGestures('.moim-connect-modal', 'moim')
})

watch(moimEditModalOpen, async (isOpen) => {
  unbindPensionSheetGestures()
  if (!isOpen) return
  await nextTick()
  bindPensionSheetGestures('.moim-management-modal', 'moim-edit')
})

onMounted(() => {
  loadConnectedPension()
  loadConnectedMoimAccounts()
})
onBeforeUnmount(() => {
  clearTimeout(longPressTimer)
  removeMobileDragListeners()
  unbindPensionSheetGestures()
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

function openMoimDetail(account) {
  if (draggingMoimId.value || mobileDragActive) return
  router.push({
    name: 'MoimAccountDetail',
    params: { moimAccountId: account.moimAccountId },
  })
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

function closeMoimEditModal() {
  moimEditModalOpen.value = false
  resetMoimEditModal()
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
  moimAccountName.value = account.accountName || ''
  moimEditError.value = ''
  moimEditModalOpen.value = true
}

async function changeMoimAccountName() {
  if (!editingMoimAccount.value || !canChangeMoimName.value || moimEditSubmitting.value) return

  changingMoimName.value = true
  moimEditError.value = ''
  const accountName = moimAccountName.value.trim()
  try {
    await updateMoimAccountName(editingMoimAccount.value.moimAccountId, accountName)
    moimEditModalOpen.value = false
    editingMoimAccount.value = null
    await loadConnectedMoimAccounts()
    showToast('모임통장 이름이 변경되었습니다.')
  } catch (error) {
    moimEditError.value = apiErrorMessage(error, '모임통장 이름을 변경하지 못했습니다.')
  } finally {
    changingMoimName.value = false
  }
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
  if (moimEditSubmitting.value) return
  editingMoimAccount.value = null
  moimAccountName.value = ''
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

async function refreshPensionAccount() {
  if (!connectedPension.value?.accountId || syncingPension.value) return
  syncingPension.value = true
  try {
    const { data } = await syncAccount(connectedPension.value.accountId)
    connectedPension.value = {
      ...connectedPension.value,
      balance: data?.balance ?? connectedPension.value.balance,
      syncedAt: data?.syncedAt ?? connectedPension.value.syncedAt,
    }
    pensionHistoryRefreshKey.value += 1
    showToast('개인연금 계좌 정보를 새로고침했습니다.')
  } catch (error) {
    showToast(apiErrorMessage(error, '개인연금 계좌 정보를 새로고침하지 못했습니다.'))
  } finally {
    syncingPension.value = false
  }
}

function formatSyncedAt(value) {
  if (!value) return '아직 새로고침하지 않았어요'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '최근 갱신 시간을 확인할 수 없어요'
  return `${new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)} 갱신`
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
  padding: 12px 20px 72px;
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
.asset-tab-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 4px;
  min-width: 0;
}
.tabs button {
  width: 100%;
  min-height: 56px;
  padding: 0;
  display: block;
  border: 0;
  border-radius: 0;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #fff;
  filter: none !important;
  color: #77737e;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}
.asset-tab-surface {
  display: flex;
  min-height: 54px;
  padding: 0 18px;
  align-items: center;
  gap: 13px;
}
.tabs button:hover {
  border-color: #bcb3d3;
  transform: translateY(-1px);
}
.tabs button.active {
  border-color: #ac99d2;
  --pixel-fill: var(--purple);
  color: #fff;
  box-shadow: none;
}
.tab-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: transparent;
  color: #5d5864;
  font-size: 17px;
  font-weight: 800;
}
.tab-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.asset-tab-shadow:nth-child(2) .tab-icon img {
  width: 56px;
  height: 56px;
  max-width: 100%;
  max-height: 100%;
}
.asset-tab-shadow:nth-child(2) .tab-icon {
  width: 56px;
  height: 56px;
  flex-basis: 56px;
}
.asset-tab-shadow:first-child .tab-icon {
  width: 56px;
  height: 56px;
  flex-basis: 56px;
}
.asset-tab-shadow:first-child .asset-tab-surface > span:last-child {
  transform: translateX(-4px);
}
.tabs button.active .tab-icon {
  background: transparent;
  color: #fff;
}
.tabs .asset-tab-shadow:first-child button .tab-icon,
.tabs .asset-tab-shadow:first-child button.active .tab-icon {
  background: transparent;
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
.empty-asset-card.pixel-step-solid {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-radius: 0;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  box-shadow: none;
  filter: none !important;
}
.empty-asset-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}
.empty-asset-surface {
  min-height: 386px;
  padding: 53px 28px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #fff;
  text-align: center;
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

.asset-account-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}

.linked-account-card.pixel-step-solid,
.moim-account-card.pixel-step-solid {
  width: 100%;
  box-sizing: border-box;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  filter: none !important;
}

.linked-account-card-surface {
  position: relative;
  min-height: 344px;
  padding: 31px;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #faf8fe 100%);
}

.moim-account-card-surface {
  position: relative;
  min-height: 199px;
  padding: 21px 21px 14px;
  box-sizing: border-box;
  background: linear-gradient(145deg, #fff, #f8f4fd);
}
.linked-account-card > * {
  position: relative;
  z-index: 1;
}
.linked-account-card::after {
  content: none;
}

.linked-account-card-surface > * {
  position: relative;
  z-index: 1;
}
.edit-account-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  position: absolute;
  top: 30px;
  right: 31px;
  z-index: 2;
  border: 1px solid #dad3e4;
  border-radius: 9px;
  background: #fff;
  color: #69529f;
  font-size: 18px;
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
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  object-fit: contain;
}
.linked-card-heading small {
  color: #918a99;
  font-size: 11px;
}
.linked-card-heading h2 {
  margin: 5px 0 0;
  font-size: 20px;
}
.pension-sync-row {
  width: 82px;
  position: absolute;
  top: 70px;
  right: 31px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.pension-sync-row > span {
  color: #8b8492;
  font-size: 10px;
  line-height: 1.2;
  white-space: nowrap;
}
.pension-sync-row button {
  width: 82px;
  height: 28px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #b8a7d4;
  border-radius: 10px;
  background: #fff;
  color: #60458f;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.pension-sync-row button:disabled { cursor: wait; opacity: .65; }
.pension-sync-row .spinning { animation: pension-sync-spin .75s linear infinite; }
@keyframes pension-sync-spin { to { transform: rotate(360deg); } }
.account-details {
  width: min(620px, 100%);
  margin: 45px 0 0;
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
.account-details .account-number-value {
  font-size: 17px;
  letter-spacing: 0.02em;
}
.account-details .balance-value {
  color: #4f397e;
  font-size: 19px;
}
.ai-insight-button {
  width: min(620px, 100%);
  min-height: 50px;
  margin-top: 18px;
  padding: 0 17px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background: #7156ad;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(99, 69, 150, 0.2);
}
.ai-insight-button span { color: #ffe59b; font-size: 18px; }
.ai-insight-button b { margin-left: auto; }
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

.moim-account-shadow {
  min-width: 0;
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
  grid-column: 3;
  justify-self: end;
  z-index: 8;
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  background: transparent;
  color: rgba(105, 82, 159, 0.7);
  cursor: grab;
  transform: translate(5px, 2px);
  touch-action: none;
  -webkit-touch-callout: none;
}
.drag-handle span {
  font-size: 21px;
  font-weight: 800;
  line-height: 1;
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
  top: 30px;
  right: 31px;
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
  margin: 6px 0 12px;
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
  font-size: 12px;
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
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.moim-card-bank img {
  width: 30px;
  height: 24px;
  object-fit: contain;
}
.moim-card-bank small {
  color: #777080;
  font-size: 14px;
  font-weight: 700;
}
.moim-account-card-surface > strong {
  display: block;
  color: #33294a;
  font-size: 27px;
}
.moim-account-card-surface > p {
  margin: 10px 0 4px;
  color: #665e70;
  font-size: 15px;
}
.moim-account-name {
  color: #9b95a2;
  font-size: 13px;
}

.account-details .balance-value,
.moim-account-card-surface > strong {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
}
.group-link-status {
  min-height: 31px;
  margin-top: 12px;
  padding-top: 8px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 25px;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e8e2ed;
  color: #8c8495;
  font-size: 13px;
}
.group-link-status b {
  overflow: hidden;
  color: #4c405e;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-link-status span {
  flex: 0 0 auto;
}
.group-link-status .group-member-count {
  margin-right: 0;
}
.moim-edit-content > small,
.moim-edit-content > strong,
.moim-edit-content > span {
  display: block;
}
.moim-name-form {
  padding: 14px;
  border: 1px solid #e0dbe5;
  border-radius: 10px;
  background: #faf8fc;
}
.moim-name-form label {
  display: block;
  margin-bottom: 9px;
  color: #574e62;
  font-size: 12px;
  font-weight: 800;
}
.moim-name-form > div {
  display: flex;
  gap: 8px;
}
.moim-name-form input {
  min-width: 0;
  height: 42px;
  flex: 1;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid #d8d1e1;
  border-radius: 8px;
  outline: none;
  color: #382f43;
  font: inherit;
  font-size: 13px;
}
.moim-name-form input:focus {
  border-color: #69529f;
  box-shadow: 0 0 0 3px rgba(105, 82, 159, 0.11);
}
.moim-name-form button {
  min-width: 68px;
  height: 42px;
  border: 0;
  border-radius: 8px;
  background: #69529f;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.moim-name-form button:disabled,
.moim-name-form input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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
.asset-card > p,
.asset-card .empty-asset-surface > p {
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
.option-icon-image {
  width: 66px;
  height: 66px;
  padding: 0;
  object-fit: contain;
}
.connection-options button:has(.option-icon-image),
.connection-options a:has(.option-icon-image) {
  padding-left: 10px;
  grid-template-columns: 66px minmax(0, 1fr) 20px;
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
  :global(.base-modal__overlay:has(.pension-connect-modal)) {
    align-items: flex-end;
    padding: 0;
    z-index: 10000 !important;
  }
  :global(.pension-connect-modal) {
    width: 100%;
    height: auto;
    max-width: none;
    max-height: 88dvh;
    margin: 0;
    overflow: hidden;
    border-width: 3px 0 0;
    border-radius: 26px 26px 0 0 !important;
    touch-action: pan-y;
    transition: height 300ms cubic-bezier(0.22, 1, 0.36, 1);
    animation: pension-sheet-in 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  :global(.pension-connect-modal--choice) {
    height: auto;
  }
  :global(.pension-connect-modal--select) {
    height: auto;
  }
  :global(.pension-connect-modal .base-modal__header) {
    position: relative;
    justify-content: center;
    padding: 29px 20px 13px;
    text-align: center;
    user-select: none;
  }
  :global(.pension-connect-modal .base-modal__title) {
    width: 100%;
    text-align: center;
  }
  :global(.pension-connect-modal .base-modal__header::before) {
    content: '';
    position: absolute;
    top: 11px;
    left: 50%;
    width: 42px;
    height: 5px;
    border-radius: 999px;
    background: #b4adbd;
    transform: translateX(-50%);
  }
  :global(.pension-connect-modal .base-modal__body) {
    max-height: none;
    padding: 12px 20px 22px;
    overflow: visible;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  :global(.pension-connect-modal .base-modal__footer) {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  :global(.pension-connect-modal .connection-options button),
  :global(.pension-connect-modal .connection-options a) {
    padding-left: 10px;
    grid-template-columns: 66px minmax(0, 1fr);
  }
  :global(.pension-connect-modal .connection-options > * > strong) {
    display: none;
  }
  .asset-page {
    width: 100%;
    max-width: 100%;
    min-height: calc(100dvh - 68px);
    margin: 0;
    padding: 8px 14px 110px;
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
    min-height: 52px;
    padding: 0 10px;
    border-radius: 12px;
  }
  .asset-tab-surface {
    min-height: 50px;
  }
  .tab-icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }
  .tab-icon img {
    width: 37px;
    height: 37px;
  }
  .asset-tab-shadow:nth-child(2) .tab-icon img {
    width: 50px;
    height: 50px;
  }
  .asset-tab-shadow:nth-child(2) .tab-icon {
    width: 50px;
    height: 50px;
    flex-basis: 50px;
  }
  .asset-tab-shadow:first-child .tab-icon {
    width: 50px;
    height: 50px;
    flex-basis: 50px;
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
  .empty-asset-surface {
    min-height: 336px;
    padding: 40px 14px 33px;
  }
  .linked-account-card {
    min-height: 330px;
    padding: 26px 20px;
    border-radius: 16px;
  }
  .linked-account-card-surface {
    min-height: 324px;
    padding: 23px 17px;
  }
  .pension-sync-row {
    top: 51px;
    right: 17px;
  }
  .edit-account-button {
    top: 13px;
    right: 17px;
  }
  .moim-edit-button {
    top: 13px;
    right: 17px;
  }
  .linked-card-heading h2 {
    font-size: 17px;
  }
  .account-details {
    margin-top: 36px;
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
.moim-account-card-surface {
    min-height: 184px;
    padding: 21px 21px 14px;
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
  .pension-connect-modal--select .pension-list {
    max-height: 210px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
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

@keyframes pension-sheet-in {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.floating-add-button {
  width: 56px;
  height: 56px;
  padding: 0;
  border: 0 !important;
  border-radius: 0 !important;
  background: #69529f;
  color: #fff;
  box-shadow: none !important;
  filter: none !important;
  clip-path: polygon(
    8px 0, calc(100% - 8px) 0,
    calc(100% - 8px) 3px, calc(100% - 3px) 3px,
    calc(100% - 3px) 8px, 100% 8px,
    100% calc(100% - 8px), calc(100% - 3px) calc(100% - 8px),
    calc(100% - 3px) calc(100% - 3px), calc(100% - 8px) calc(100% - 3px),
    calc(100% - 8px) 100%, 8px 100%,
    8px calc(100% - 3px), 3px calc(100% - 3px),
    3px calc(100% - 8px), 0 calc(100% - 8px),
    0 8px, 3px 8px, 3px 3px, 8px 3px
  ) !important;
}

.floating-add-button:hover,
.floating-add-button:active {
  border: 0 !important;
  box-shadow: none !important;
  filter: none !important;
  transform: none;
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
