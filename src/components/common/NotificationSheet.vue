<template>
  <BaseModal
    :model-value="modelValue"
    size="medium"
    modal-class="notification-sheet"
    :show-close-button="false"
    :auto-focus="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div
        class="notification-sheet__header"
        @touchstart="startHeaderDrag"
        @touchmove.prevent="moveHeaderDrag"
        @touchend="endHeaderDrag"
        @touchcancel="cancelHeaderDrag"
      >
        <span class="notification-sheet__handle" aria-hidden="true"></span>
        <span>알림</span>
      </div>
    </template>
    <div
      class="notification-sheet__content"
      @touchstart="startHeaderDrag"
      @touchmove="moveContentDrag"
      @touchend="endHeaderDrag"
      @touchcancel="cancelHeaderDrag"
    >
      <div class="notification-sheet__summary">
        <span>새로운 알림</span>
        <strong>{{ unreadCount }}개</strong>
      </div>

      <div v-if="loading" class="notification-sheet__state">알림을 불러오고 있어요.</div>
      <div v-else-if="error" class="notification-sheet__state notification-sheet__state--error">
        <span>{{ error }}</span>
        <button type="button" @click="$emit('retry')">다시 조회</button>
      </div>
      <div v-else-if="!notifications.length" class="notification-sheet__state">
        <span class="notification-sheet__empty-icon" aria-hidden="true">✓</span>
        <strong>새로운 알림이 없어요</strong>
        <small>새 소식이 생기면 바로 알려드릴게요.</small>
      </div>

      <ul v-else class="notification-list">
        <li
          v-for="notification in sortedNotifications"
          :key="notification.notificationId"
          :class="{ 'is-read': notification.isRead }"
        >
          <button type="button" @click="$emit('read', notification)">
            <span class="notification-copy">
              <span>
                <strong>{{ typeLabel(notification.notificationType) }}</strong>
                <i v-if="!notification.isRead" aria-label="읽지 않음"></i>
              </span>
              <b>{{ notification.content }}</b>
              <small>{{ formatNotificationDate(notification.createdAt) }}</small>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'read', 'retry'])

const unreadCount = computed(
  () => props.notifications.filter((notification) => !notification.isRead).length,
)

const sortedNotifications = computed(() => [...props.notifications].sort((a, b) => {
  if (Boolean(a.isRead) !== Boolean(b.isRead)) return a.isRead ? 1 : -1
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
}))

const dragStartY = ref(null)
const dragDistance = ref(0)
const dragCanDismiss = ref(false)

function getSheetElement(event) {
  return event.currentTarget?.closest?.('.notification-sheet')
}

function startHeaderDrag(event) {
  if (event.touches.length !== 1) return
  const notificationList = event.target.closest?.('.notification-list')
  dragStartY.value = event.touches[0].clientY
  dragDistance.value = 0
  dragCanDismiss.value = !notificationList || notificationList.scrollTop <= 0
  const sheet = getSheetElement(event)
  if (sheet) sheet.style.transition = 'none'
}

function moveHeaderDrag(event) {
  if (dragStartY.value === null || event.touches.length !== 1) return
  dragDistance.value = Math.max(0, event.touches[0].clientY - dragStartY.value)
  const sheet = getSheetElement(event)
  if (sheet) sheet.style.transform = `translate3d(0, ${dragDistance.value}px, 0)`
}

function moveContentDrag(event) {
  if (dragStartY.value === null || event.touches.length !== 1) return
  const delta = event.touches[0].clientY - dragStartY.value
  if (!dragCanDismiss.value || delta <= 10) {
    dragDistance.value = 0
    return
  }
  event.preventDefault()
  dragDistance.value = delta
  const sheet = getSheetElement(event)
  if (sheet) sheet.style.transform = `translate3d(0, ${dragDistance.value}px, 0)`
}

function endHeaderDrag(event) {
  const sheet = getSheetElement(event)
  if (!sheet) return
  sheet.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)'
  if (dragDistance.value >= 100) {
    sheet.style.transform = `translate3d(0, ${sheet.offsetHeight + 24}px, 0)`
    window.setTimeout(() => emit('update:modelValue', false), 250)
  } else {
    sheet.style.transform = 'translate3d(0, 0, 0)'
  }
  dragStartY.value = null
  dragDistance.value = 0
  dragCanDismiss.value = false
}

function cancelHeaderDrag(event) {
  const sheet = getSheetElement(event)
  if (sheet) {
    sheet.style.transition = 'transform 240ms ease'
    sheet.style.transform = 'translate3d(0, 0, 0)'
  }
  dragStartY.value = null
  dragDistance.value = 0
  dragCanDismiss.value = false
}

const typeInfo = {
  GROUP_INVITE: '모임 초대',
  APPROVAL_REQUEST: '가입 승인 요청',
  APPROVED: '가입 승인',
  REJECTED: '가입 반려',
  LEFT: '그룹 탈퇴',
  ROUND_START: '챌린지 시작',
  POST_UPLOAD: '새 인증',
  ROUND_END: '챌린지 종료',
  SETTLEMENT_COMPLETED: '정산 완료',
  REMINDER: '마감 임박',
}

function typeLabel(type) {
  return typeInfo[type] || 'Youngly 알림'
}

function formatNotificationDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ')
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<style scoped>
.notification-sheet__summary { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 3px; color: #756b7d; font-size: 12px; }
.notification-sheet__content { min-height: 0; display: flex; flex: 1; flex-direction: column; overflow: hidden; }
.notification-sheet__header { display: grid; width: 100%; gap: 8px; color: #222; font-size: 20px; font-weight: 800; text-align: center; touch-action: none; user-select: none; cursor: grab; }
.notification-sheet__handle { display: none; width: 42px; height: 5px; margin: 0 auto; border-radius: 999px; background: #b5adbd; }
.notification-sheet__summary strong { color: #684d96; font-size: 13px; }
.notification-sheet__state { min-height: 220px; display: grid; align-content: center; justify-items: center; gap: 8px; padding: 28px 15px; color: #8c8294; text-align: center; }
.notification-sheet__state strong { color: #453a4f; font-size: 15px; }
.notification-sheet__state small { font-size: 11px; }
.notification-sheet__state--error button { min-height: 34px; padding: 0 12px; border: 1px solid #c9bcda; border-radius: 9px; color: #674d93; background: #fff; font: inherit; font-size: 11px; font-weight: 800; }
.notification-sheet__empty-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: #8c73b4; font-size: 18px; }
.notification-list { max-height: min(58vh, 520px); display: grid; gap: 9px; margin: 0; padding: 0 2px 8px; overflow-y: auto; list-style: none; overscroll-behavior: contain; }
.notification-list li { border: 1px solid #e1d8e9; border-radius: 15px; background: #fff; transition: opacity .18s, background-color .18s; }
.notification-list li:not(.is-read) { border-color: #c9b9dd; background: #fbf8ff; }
.notification-list li.is-read { opacity: .58; background: #f7f5f8; }
.notification-list button { width: 100%; padding: 14px 15px; display: block; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.notification-copy { min-width: 0; display: grid; gap: 5px; }
.notification-copy > span { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.notification-copy strong { color: #564561; font-size: 11px; }
.notification-copy i { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #7655a8; }
.notification-copy b { color: #302a35; font-size: 13px; font-weight: 700; line-height: 1.55; word-break: keep-all; }
.notification-copy small { color: #99909f; font-size: 10px; }

@media (max-width: 767px) {
  :global(.base-modal__overlay:has(.notification-sheet)) { align-items: flex-end; padding: 0; z-index: 10000; }
  :global(.notification-sheet) { position: relative; width: 100%; height: 72dvh; max-width: none; max-height: 72dvh; margin: 0; overflow: hidden; overscroll-behavior: none; border-width: 3px 0 0; border-radius: 26px 26px 0 0; }
  :global(.notification-sheet .base-modal__header) { padding: 14px 20px 10px; position: sticky; top: 0; z-index: 2; justify-content: center; background: #fff; }
  :global(.notification-sheet .base-modal__title) { text-align: center; }
  :global(.notification-sheet .base-modal__body) { height: calc(72dvh - 58px); box-sizing: border-box; display: flex; flex-direction: column; padding: 10px 16px calc(18px + env(safe-area-inset-bottom)); overflow: hidden; }
  .notification-sheet__handle { display: block; }
  .notification-list { min-height: 0; max-height: none; flex: 1; overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch; }
}
</style>
