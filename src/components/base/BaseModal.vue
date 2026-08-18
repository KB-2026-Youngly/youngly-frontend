<template>
  <Teleport to="body">
    <Transition name="base-modal-fade">
      <div v-if="modelValue" class="base-modal__overlay" @mousedown.self="handleOverlayClick">
        <section
          ref="modalElement"
          class="base-modal"
          :class="[`base-modal--${size}`, modalClass]"
          :style="sheetDragStyle"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasTitle ? titleId : undefined"
          :aria-label="hasTitle ? undefined : ariaLabel"
          tabindex="-1"
        >
          <div class="base-modal__surface">
            <header
              v-if="hasTitle || showCloseButton"
              class="base-modal__header"
              @pointerdown="startSheetPull"
              @pointermove="moveSheetPull"
              @pointerup="endSheetPull"
              @pointercancel="cancelSheetPull"
            >
              <span v-if="showSheetHandle" class="base-modal__handle" aria-hidden="true"></span>
              <div :id="titleId" class="base-modal__title">
                <slot name="header">
                  {{ title }}
                </slot>
              </div>

              <button
                v-if="showCloseButton"
                type="button"
                class="base-modal__close"
                aria-label="모달 닫기"
                @click="close('button')"
              >
                ×
              </button>
            </header>

            <div class="base-modal__body">
              <slot />
            </div>

            <footer v-if="$slots.footer" class="base-modal__footer">
              <slot name="footer" :close="close" />
            </footer>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '모달',
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  modalClass: {
    type: [String, Array, Object],
    default: '',
  },
  autoFocus: {
    type: Boolean,
    default: true,
  },
  showSheetHandle: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])
const slots = useSlots()
const modalElement = ref(null)
const titleId = `base-modal-title-${Math.random().toString(36).slice(2, 9)}`
const sheetPullStartY = ref(null)
const sheetPullDistance = ref(0)

let previousActiveElement = null
let previousBodyStyles = null
let previousRootOverflow = ''
let lockedScrollY = 0
let isPageLocked = false
let hasAnnouncedBottomSheet = false

const hasTitle = computed(() => Boolean(props.title || slots.header))
const sheetDragStyle = computed(() => sheetPullDistance.value > 0
  ? { transform: `translateY(${sheetPullDistance.value}px)`, transition: 'none' }
  : {})

const close = (reason = 'programmatic') => {
  emit('update:modelValue', false)
  emit('close', reason)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close('overlay')
  }
}

const isMobileSheet = () => typeof window !== 'undefined' && window.innerWidth < 768

const startSheetPull = (event) => {
  if (!isMobileSheet() || event.isPrimary === false) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  event.preventDefault()
  sheetPullStartY.value = event.clientY
  sheetPullDistance.value = 0
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

const moveSheetPull = (event) => {
  if (sheetPullStartY.value === null) return

  event.preventDefault()
  sheetPullDistance.value = Math.min(Math.max(0, event.clientY - sheetPullStartY.value), 220)
}

const endSheetPull = (event) => {
  if (sheetPullStartY.value === null) return
  const shouldDismiss = sheetPullDistance.value >= 96
  sheetPullStartY.value = null
  sheetPullDistance.value = 0
  event.currentTarget.releasePointerCapture?.(event.pointerId)
  if (shouldDismiss) close('swipe')
}

const cancelSheetPull = () => {
  sheetPullStartY.value = null
  sheetPullDistance.value = 0
}

const announceBottomSheet = (isOpen) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('youngly-bottom-nav-visibility', { detail: { id: titleId, hidden: isOpen } }))
  hasAnnouncedBottomSheet = isOpen
}

const getFocusableElements = () => {
  if (!modalElement.value) return []

  return Array.from(
    modalElement.value.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

const handleKeydown = (event) => {
  if (!props.modelValue) return

  if (event.key === 'Escape' && props.closeOnEsc) {
    close('escape')
    return
  }

  if (event.key !== 'Tab') return

  const focusableElements = getFocusableElements()

  if (focusableElements.length === 0) {
    event.preventDefault()
    modalElement.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const lockPage = async () => {
  if (typeof document === 'undefined' || isPageLocked) return

  previousActiveElement = document.activeElement
  lockedScrollY = window.scrollY
  previousBodyStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  }
  previousRootOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.width = '100%'
  isPageLocked = true

  await nextTick()

  const focusableElements = getFocusableElements()
  const firstTarget = props.autoFocus ? (focusableElements[0] || modalElement.value) : modalElement.value
  firstTarget?.focus()
}

const unlockPage = () => {
  if (typeof document === 'undefined' || !isPageLocked) return

  document.documentElement.style.overflow = previousRootOverflow
  document.body.style.overflow = previousBodyStyles?.overflow || ''
  document.body.style.position = previousBodyStyles?.position || ''
  document.body.style.top = previousBodyStyles?.top || ''
  document.body.style.width = previousBodyStyles?.width || ''
  window.scrollTo(0, lockedScrollY)
  isPageLocked = false
  previousBodyStyles = null
  previousActiveElement?.focus?.()
  previousActiveElement = null
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      lockPage()
      announceBottomSheet(true)
    } else {
      unlockPage()
      announceBottomSheet(false)
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  if (props.modelValue) {
    lockPage()
    announceBottomSheet(true)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)

  if (props.modelValue) {
    unlockPage()
  }
  if (hasAnnouncedBottomSheet) announceBottomSheet(false)
})
</script>

<style scoped>
.base-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background-color: rgba(24, 20, 36, 0.5);
}

.base-modal {
  width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 16px;
  color: var(--color-text, #33313d);
  background-color: var(--color-surface, #ffffff);
  box-shadow: 0 20px 60px rgba(24, 20, 36, 0.24);
}

.base-modal__surface {
  background: inherit;
}

.base-modal--small {
  max-width: 360px;
}

.base-modal--medium {
  max-width: 520px;
}

.base-modal--large {
  max-width: 760px;
}

.base-modal:focus {
  outline: none;
}

.base-modal__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 14px;
  border-bottom: 0 !important;
  background: #fff;
}

.base-modal__handle { display: none; }

.base-modal__title {
  font-size: 19px;
  font-weight: 700;
}

.base-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: var(--color-text-muted, #77717f);
  background-color: transparent;
  font-family: inherit;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.base-modal__close:hover {
  background-color: var(--color-surface-hover, #f4f2f8);
}

.base-modal__close:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.base-modal__body {
  padding: 8px 22px 22px;
}

.base-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px 20px;
  border-top: 1px solid var(--color-border-soft, #eeeaf4);
}

.base-modal-fade-enter-active,
.base-modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.base-modal-fade-enter-active .base-modal,
.base-modal-fade-leave-active .base-modal {
  transition: transform 0.18s ease;
}

.base-modal-fade-enter-from,
.base-modal-fade-leave-to {
  opacity: 0;
}

.base-modal-fade-enter-from .base-modal,
.base-modal-fade-leave-to .base-modal {
  transform: translateY(8px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .base-modal-fade-enter-active,
  .base-modal-fade-leave-active,
  .base-modal-fade-enter-active .base-modal,
  .base-modal-fade-leave-active .base-modal {
    transition: none;
  }
}

@media (max-width: 767px) {
  .base-modal__overlay {
    display: flex;
    align-items: end;
    justify-content: stretch;
    padding: 0;
    overscroll-behavior: none;
  }
  .base-modal {
    --sheet-fill: var(--color-surface, #fff);
    flex: 0 1 auto;
    position: relative;
    isolation: isolate;
    width: 100vw;
    max-width: 100vw !important;
    max-height: min(88dvh, 760px);
    margin: 0;
    box-sizing: border-box;
    overflow: hidden;
    border: 0 !important;
    border-radius: 0 !important;
    padding: 0;
    background: #222 !important;
    box-shadow: none;
    clip-path: polygon(
      8px 0,
      calc(100% - 8px) 0,
      calc(100% - 8px) 3px,
      calc(100% - 3px) 3px,
      calc(100% - 3px) 8px,
      100% 8px,
      100% 100%,
      0 100%,
      0 8px,
      3px 8px,
      3px 3px,
      8px 3px
    );
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .base-modal::before {
    display: none;
  }
  .base-modal__surface {
    position: relative;
    z-index: 1;
    width: calc(100% - 6px);
    max-height: calc(min(88dvh, 760px) - 6px);
    margin: 3px;
    box-sizing: border-box;
    overflow-y: auto;
    background: #fff !important;
    clip-path: polygon(
      5px 0,
      calc(100% - 5px) 0,
      calc(100% - 5px) 2px,
      calc(100% - 2px) 2px,
      calc(100% - 2px) 5px,
      100% 5px,
      100% 100%,
      0 100%,
      0 5px,
      2px 5px,
      2px 2px,
      5px 2px
    );
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .base-modal__header {
    position: sticky;
    top: 0;
    z-index: 10;
    margin: 0;
    justify-content: center;
    padding: 27px 22px 10px;
    background: var(--sheet-fill);
    clip-path: polygon(5px 0, calc(100% - 5px) 0, calc(100% - 5px) 2px, calc(100% - 2px) 2px, calc(100% - 2px) 5px, 100% 5px, 100% 100%, 0 100%, 0 5px, 2px 5px, 2px 2px, 5px 2px);
    touch-action: none;
    user-select: none;
  }
  .base-modal__title { width: 100%; text-align: center; }
  .base-modal__close { display: none; }
  .base-modal__handle { position: absolute; top: 10px; left: 50%; display: block; width: 42px; height: 5px; border-radius: 999px; background: #aaa4b2; transform: translateX(-50%); }
  .base-modal__body { padding: 8px 22px calc(24px + env(safe-area-inset-bottom)); }
  .base-modal__footer { padding: 14px 22px calc(20px + env(safe-area-inset-bottom)); }
  .base-modal-fade-enter-from .base-modal, .base-modal-fade-leave-to .base-modal { transform: translateY(100%); }
}
</style>
