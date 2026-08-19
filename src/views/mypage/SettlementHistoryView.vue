<template>
  <div class="settlement-page">
    <header class="settlement-header">
      <div class="settlement-back-shadow mypage-back-shadow yl-stepped-card-shadow">
        <button
          type="button"
          class="back-button mypage-back-button pixel-step-button pixel-step-solid"
          aria-label="마이페이지로 돌아가기"
          @click="goBack"
        >
          <span class="settlement-back-surface mypage-back-surface pixel-step-surface"
            ><ArrowLeft :size="18" aria-hidden="true"
          /></span>
        </button>
      </div>
      <h1>정산 내역</h1>
    </header>

    <section v-if="isLoading" class="state-panel yl-mypage-card">
      <BaseSpinner size="large" label="정산 내역을 불러오는 중..." centered />
    </section>

    <section v-else-if="error" class="state-panel yl-mypage-card" role="alert">
      <BaseEmptyState
        title="정산 내역을 불러오지 못했어요"
        :description="error"
        action-text="다시 불러오기"
        @action="retrySettlements"
      >
        <template #icon>
          <AlertTriangle />
        </template>
      </BaseEmptyState>
    </section>

    <template v-else>
      <p v-if="warning" class="partial-warning" role="status">
        <AlertTriangle :size="17" aria-hidden="true" />
        {{ warning }}
      </p>

      <section class="summary-card settlement-stepped-panel" aria-label="전체 정산 완료 금액">
        <span class="summary-card__icon" aria-hidden="true">
          <CircleDollarSign :size="25" />
        </span>
        <div>
          <span>전체 정산 완료 금액</span>
          <strong class="summary-card__value yl-money">{{
            formatAmount(totalCompletedAmount)
          }}</strong>
        </div>
      </section>

      <section class="group-section settlement-stepped-panel" aria-labelledby="group-select-title">
        <div class="section-heading">
          <div>
            <span>MY GROUP</span>
            <h2 id="group-select-title">참여한 그룹</h2>
          </div>
          <strong>{{ groups.length }}개</strong>
        </div>

        <div v-if="groups.length" ref="dropdownRef" class="group-dropdown">
          <button
            type="button"
            class="group-dropdown__trigger"
            :aria-expanded="isDropdownOpen"
            aria-haspopup="listbox"
            @click="isDropdownOpen = !isDropdownOpen"
          >
            <span class="group-dropdown__name">{{ selectedGroup?.groupName }}</span>
            <span
              class="group-status"
              :class="`group-status--${selectedGroup?.groupStatus?.toLowerCase() || 'unknown'}`"
            >
              {{ getGroupStatusLabel(selectedGroup?.groupStatus) }}
            </span>
            <ChevronDown class="group-dropdown__chevron" :size="19" aria-hidden="true" />
          </button>

          <transition name="dropdown">
            <div
              v-if="isDropdownOpen"
              class="group-dropdown__menu"
              role="listbox"
              aria-label="참여한 그룹 선택"
            >
              <button
                v-for="group in groups"
                :key="group.groupId"
                type="button"
                role="option"
                :aria-selected="String(group.groupId) === String(selectedGroupId)"
                :class="{ 'is-selected': String(group.groupId) === String(selectedGroupId) }"
                @click="selectGroup(group.groupId)"
              >
                <span>{{ group.groupName }}</span>
                <span
                  class="group-status"
                  :class="`group-status--${group.groupStatus?.toLowerCase() || 'unknown'}`"
                >
                  {{ getGroupStatusLabel(group.groupStatus) }}
                </span>
              </button>
            </div>
          </transition>
        </div>

        <BaseEmptyState
          v-else
          title="참여한 그룹이 없어요"
          description="그룹에 참여하면 정산 내역을 확인할 수 있어요."
        />
      </section>

      <section
        v-if="selectedGroup"
        class="history-section settlement-stepped-panel"
        aria-labelledby="settlement-list-title"
      >
        <div class="section-heading">
          <div>
            <span>SETTLEMENT</span>
            <h2 id="settlement-list-title">라운드별 정산</h2>
          </div>
          <strong>{{ sortedSettlements.length }}건</strong>
        </div>

        <div v-if="sortedSettlements.length" class="settlement-list">
          <article
            v-for="settlement in sortedSettlements"
            :key="settlement.settlementId"
            class="settlement-card settlement-stepped-panel settlement-stepped-panel--small"
          >
            <div class="settlement-card__heading">
              <strong v-if="settlement.roundNo != null" class="settlement-card__round">
                <span>{{ settlement.roundNo }}</span>
                라운드
              </strong>
              <time :datetime="settlement.createdAt">
                {{ formatDateTime(settlement.createdAt) }}
              </time>
            </div>

            <div class="settlement-card__body">
              <div class="account-info">
                <span class="account-info__icon" aria-hidden="true">
                  <ReceiptText :size="18" />
                </span>
                <div>
                  <strong>{{ settlement.bankName || '—' }}</strong>
                  <span>{{ settlement.maskedAccountNumber || '—' }}</span>
                </div>
              </div>
              <div class="settlement-amount">
                <span>정산 금액</span>
                <strong class="yl-money">{{ formatAmount(settlement.settlementAmount) }}</strong>
              </div>
            </div>
          </article>
        </div>

        <BaseEmptyState
          v-else
          title="정산 내역이 없어요"
          description="선택한 그룹의 정산이 완료되면 이곳에 표시됩니다."
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  CircleDollarSign,
  ReceiptText,
} from 'lucide-vue-next'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useMyPageStore } from '@/stores/mypage'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const myPageStore = useMyPageStore()
const userStore = useUserStore()
const {
  settlementGroups: groups,
  isSettlementLoading: isLoading,
  settlementError: error,
  settlementWarning: warning,
} = storeToRefs(myPageStore)
const selectedGroupId = ref(null)
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

const selectedGroup = computed(() =>
  groups.value.find((group) => String(group.groupId) === String(selectedGroupId.value)),
)

const sortedSettlements = computed(() =>
  [...(selectedGroup.value?.settlements || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

const totalCompletedAmount = computed(() =>
  groups.value.reduce(
    (total, group) =>
      total +
      group.settlements.reduce(
        (groupTotal, settlement) => groupTotal + Number(settlement.settlementAmount || 0),
        0,
      ),
    0,
  ),
)

const formatAmount = (amount) => `${new Intl.NumberFormat('ko-KR').format(amount || 0)}원`

const getGroupStatusLabel = (status) =>
  ({ RECRUITING: '모집 중', ONGOING: '진행 중', FINISHED: '종료' })[status] || '상태 미정'

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const selectGroup = (groupId) => {
  selectedGroupId.value = groupId
  isDropdownOpen.value = false
}

const closeDropdown = (event) => {
  if (!dropdownRef.value?.contains(event.target)) isDropdownOpen.value = false
}

const fetchSettlements = async (force = false) => {
  isDropdownOpen.value = false
  const user = await userStore.ensureMyInfo()
  await myPageStore.fetchSettlementOverview(user?.userId, force)
  const hasSelectedGroup = groups.value.some(
    (group) => String(group.groupId) === String(selectedGroupId.value),
  )
  if (!hasSelectedGroup) selectedGroupId.value = groups.value[0]?.groupId ?? null
}

const retrySettlements = () => fetchSettlements(true)

const goBack = () => router.push('/mypage')

onMounted(() => {
  document.addEventListener('pointerdown', closeDropdown)
  fetchSettlements()
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', closeDropdown))
</script>

<style scoped>
.settlement-page {
  --color-primary: #7156ad;
  --color-primary-dark: #5e4499;
  --color-primary-hover: #6448a3;
  --color-primary-soft: #f0eafd;

  display: grid;
  gap: 18px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 24px max(20px, calc((100% - 720px) / 2)) 72px;
  color: #342e3c;
  background: #e6dcf6;
  box-sizing: border-box;
}

.settlement-header {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
}

.settlement-header h1 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.03em;
  text-align: center;
}

.back-button {
  display: grid;
  width: 38px;
  height: 38px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(113, 86, 173, 0.12);
  border-radius: 50%;
  color: var(--color-primary-dark);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 5px 14px rgba(66, 43, 99, 0.07);
  cursor: pointer;
}

.back-button:hover {
  background: #ffffff;
}

.back-button:focus-visible,
.group-dropdown__trigger:focus-visible,
.group-dropdown__menu button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.25);
  outline-offset: 2px;
}

.state-panel,
.summary-card,
.group-section,
.history-section {
  border: 1px solid rgba(113, 86, 173, 0.09);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(66, 43, 99, 0.09);
}

.state-panel {
  min-height: 320px;
  display: grid;
  place-items: center;
}

.partial-warning {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #cdbfe6;
  border-radius: 8px;
  color: #51367f;
  background: #f7f3fc;
  font-size: 13px;
  font-weight: 700;
}

.summary-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 24px;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
  background:
    radial-gradient(circle at 88% 18%, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(135deg, #7156ad 0%, #8d6fc5 100%);
  box-shadow: 0 16px 36px rgba(83, 57, 128, 0.2);
}

.summary-card__icon {
  display: grid;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 15px;
  color: #f8d86a;
  background: rgba(255, 255, 255, 0.14);
}

.summary-card > div {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.summary-card > div span {
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
}

.summary-card > div strong {
  font-size: clamp(24px, 6vw, 32px);
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
}

.group-section,
.history-section {
  padding: 22px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 17px;
}

.section-heading > div > span {
  color: var(--color-primary);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.section-heading h2 {
  margin: 4px 0 0;
  font-size: 17px;
  letter-spacing: -0.02em;
}

.section-heading > strong {
  flex: 0 0 auto;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  font-size: 11px;
}

.group-dropdown {
  position: relative;
  z-index: 50;
}

.group-dropdown__trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 20px;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding: 0 15px 0 17px;
  border: 2px solid #d7cbe7;
  border-radius: 11px;
  color: #43394d;
  background: #faf8fc;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.group-dropdown__name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-dropdown__chevron {
  color: var(--color-primary);
  transition: transform 0.18s ease;
}

.group-dropdown__trigger[aria-expanded='true'] .group-dropdown__chevron {
  transform: rotate(180deg);
}

.group-dropdown__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  z-index: 100;
  display: grid;
  gap: 4px;
  max-height: 260px;
  padding: 7px;
  overflow-y: auto;
  border: 2px solid #342843;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 5px 5px 0 #c8b7e5;
}

.group-dropdown__menu button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 46px;
  padding: 0 10px 0 12px;
  border: 0;
  border-radius: 10px;
  color: #62576c;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.group-dropdown__menu button:hover,
.group-dropdown__menu button.is-selected {
  color: var(--color-primary-dark);
  background: #f3edf9;
}

.group-dropdown__menu button > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-status,
.settlement-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.group-status--recruiting {
  color: #7156ad;
  background: #eee7f8;
}

.group-status--ongoing {
  color: #34705a;
  background: #e6f4ed;
}

.group-status--finished,
.group-status--unknown {
  color: #756d7d;
  background: #efedf1;
}

.settlement-list {
  display: grid;
  gap: 15px;
}

.settlement-card {
  overflow: hidden;
  border: 1px solid #e6dfec;
  border-radius: 15px;
  background: #ffffff;
}

.settlement-card__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 9px 14px;
  border-bottom: 1px solid #e9e1f0;
  background: linear-gradient(90deg, #f5effb, #faf8fd);
  box-sizing: border-box;
}

.settlement-card__round {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #40354d;
  font-size: 12px;
}

.settlement-card__round span {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  color: #ffffff;
  background: #7658b5;
  font-size: 12px;
  line-height: 1;
  clip-path: polygon(
    5px 0,
    calc(100% - 5px) 0,
    calc(100% - 5px) 2px,
    calc(100% - 2px) 2px,
    calc(100% - 2px) 5px,
    100% 5px,
    100% calc(100% - 5px),
    calc(100% - 2px) calc(100% - 5px),
    calc(100% - 2px) calc(100% - 2px),
    calc(100% - 5px) calc(100% - 2px),
    calc(100% - 5px) 100%,
    5px 100%,
    5px calc(100% - 2px),
    2px calc(100% - 2px),
    2px calc(100% - 5px),
    0 calc(100% - 5px),
    0 5px,
    2px 5px,
    2px 2px,
    5px 2px
  );
}

.settlement-card__heading time {
  color: #756d7d;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.settlement-status--completed {
  color: #5e4499;
  background: #eee7f8;
  border: 1px solid #d8c8ed;
}

.settlement-status--processing {
  color: #8a6519;
  background: #fff5d9;
  border: 1px solid #efd795;
}

.settlement-status--pending {
  color: #6f6977;
  background: #efedf1;
  border: 1px solid #dcd8df;
}

.settlement-status::before {
  content: '';
  width: 5px;
  height: 5px;
  margin-right: 5px;
  border-radius: 50%;
  background: currentColor;
}

.settlement-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 14px 15px;
  background: #ffffff;
}

.account-info {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 11px;
  align-items: center;
  min-width: 0;
}

.account-info__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 0;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    calc(100% - 7px) 3px,
    calc(100% - 3px) 3px,
    calc(100% - 3px) 7px,
    100% 7px,
    100% calc(100% - 7px),
    calc(100% - 3px) calc(100% - 7px),
    calc(100% - 3px) calc(100% - 3px),
    calc(100% - 7px) calc(100% - 3px),
    calc(100% - 7px) 100%,
    7px 100%,
    7px calc(100% - 3px),
    3px calc(100% - 3px),
    3px calc(100% - 7px),
    0 calc(100% - 7px),
    0 7px,
    3px 7px,
    3px 3px,
    7px 3px
  );
}

.account-info > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.account-info strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-info > div > span {
  color: #82798a;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.settlement-amount {
  display: grid;
  gap: 2px;
  min-width: 100px;
  padding: 8px 11px;
  border-left: 3px solid #c6b4df;
  background: #f8f4fc;
  text-align: right;
}

.settlement-amount span {
  color: #8a8291;
  font-size: 10px;
}

.settlement-amount strong {
  color: #513b72;
  font-size: clamp(15px, 4vw, 18px);
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

@media (max-width: 767px) {
  .settlement-page {
    min-height: calc(100dvh - 68px - 76px);
    margin: 0;
    padding: 16px 16px 40px;
  }

  .settlement-header h1 {
    font-size: 19px;
  }

  .summary-card {
    padding: 21px 18px;
    border-radius: 18px;
  }

  .group-section,
  .history-section {
    padding: 18px 16px;
    border-radius: 18px;
  }
}

.group-section {
  position: relative;
  z-index: 40;
  overflow: visible !important;
}

.history-section {
  position: relative;
  z-index: 1;
}

@media (max-width: 420px) {
  .settlement-card__body {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 9px;
    padding-inline: 12px;
  }

  .settlement-amount {
    min-width: 86px;
    padding: 7px 8px;
  }

  .settlement-amount strong {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .group-dropdown__chevron,
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
}
</style>

<style scoped>
.settlement-page {
  --mypage-ink: #342843;
  --mypage-shadow: #c8b7e5;
  --color-primary: #7658b5;
  padding-inline: max(22px, calc((100% - 800px) / 2));
}

.back-button {
  border: 2px solid var(--mypage-ink);
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 4px 4px 0 var(--mypage-shadow);
}

.back-button:hover {
  box-shadow: 2px 2px 0 var(--mypage-shadow);
  transform: translate(2px, 2px);
}

.settlement-header h1 {
  color: var(--mypage-ink);
  font-size: 28px;
}

.settlement-page :is(.state-panel, .group-section, .history-section) {
  border: 2px solid var(--mypage-ink);
  box-shadow: 7px 7px 0 var(--mypage-shadow);
}

.summary-card {
  border: 2px solid var(--mypage-ink);
  color: #ffffff;
  background: #7658b5;
  box-shadow: 8px 8px 0 #b8a2da;
}

.summary-card__icon {
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 12px;
  color: #ffe590;
}

.group-dropdown__trigger {
  border: 2px solid #d7cbe7;
  border-radius: 11px;
  background: #ffffff;
}

.group-dropdown__trigger[aria-expanded='true'] {
  border-color: #7658b5;
  box-shadow: 0 0 0 3px rgba(118, 88, 181, 0.12);
}

.group-dropdown__menu {
  border: 2px solid var(--mypage-ink);
  border-radius: 12px;
  box-shadow: 5px 5px 0 var(--mypage-shadow);
}

.settlement-card {
  border: 2px solid #d9cfe5;
  border-radius: 14px;
  box-shadow: 3px 3px 0 #eee7f8;
}

.settlement-card__heading {
  background: #f6f1fb;
}

@media (max-width: 767px) {
  .settlement-page {
    padding-inline: 16px;
  }
}

.settlement-back-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 4px;
}

.settlement-stepped-panel {
  --settlement-panel-fill: #ffffff;
  --settlement-panel-border: #ac99d2;
  position: relative;
  isolation: isolate;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  filter: drop-shadow(5px 5px 0 #c8b7e5);
}

.settlement-stepped-panel::before,
.settlement-stepped-panel::after {
  content: '';
  position: absolute;
  clip-path: polygon(
    11px 0,
    calc(100% - 11px) 0,
    calc(100% - 11px) 3px,
    calc(100% - 7px) 3px,
    calc(100% - 7px) 6px,
    calc(100% - 3px) 6px,
    calc(100% - 3px) 11px,
    100% 11px,
    100% calc(100% - 11px),
    calc(100% - 3px) calc(100% - 11px),
    calc(100% - 3px) calc(100% - 6px),
    calc(100% - 7px) calc(100% - 6px),
    calc(100% - 7px) calc(100% - 3px),
    calc(100% - 11px) calc(100% - 3px),
    calc(100% - 11px) 100%,
    11px 100%,
    11px calc(100% - 3px),
    7px calc(100% - 3px),
    7px calc(100% - 6px),
    3px calc(100% - 6px),
    3px calc(100% - 11px),
    0 calc(100% - 11px),
    0 11px,
    3px 11px,
    3px 6px,
    7px 6px,
    7px 3px,
    11px 3px
  );
  pointer-events: none;
}

.settlement-stepped-panel::before {
  inset: 0;
  z-index: 0;
  background: var(--settlement-panel-border);
}

.settlement-stepped-panel::after {
  inset: 2px;
  z-index: 1;
  background: var(--settlement-panel-fill);
}

.settlement-stepped-panel > * {
  position: relative;
  z-index: 2;
}

.summary-card.settlement-stepped-panel {
  --settlement-panel-fill: #7658b5;
  color: #ffffff;
}

.settlement-stepped-panel--small {
  filter: drop-shadow(3px 3px 0 #ded3ed);
}

.settlement-card--processing {
  --settlement-panel-border: #d59a20;
  filter: drop-shadow(3px 3px 0 #ead9ad);
}

.settlement-card--processing .settlement-card__round span {
  background: #d59a20;
}

.settlement-card--processing .settlement-amount {
  border-left-color: #d59a20;
  background: #fffaf0;
}

.group-section.settlement-stepped-panel {
  z-index: 40;
  overflow: visible;
}
</style>
