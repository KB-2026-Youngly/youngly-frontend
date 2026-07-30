<template>
  <Teleport to="body">
    <Transition name="base-modal-fade">
      <div v-if="modelValue" class="base-modal__overlay" @mousedown.self="handleOverlayClick">
        <section
          ref="modalElement"
          class="base-modal"
          :class="`base-modal--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasTitle ? titleId : undefined"
          :aria-label="hasTitle ? undefined : ariaLabel"
          tabindex="-1"
        >
          <header v-if="hasTitle || showCloseButton" class="base-modal__header">
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
})

const emit = defineEmits(['update:modelValue', 'close'])
const slots = useSlots()
const modalElement = ref(null)
const titleId = `base-modal-title-${Math.random().toString(36).slice(2, 9)}`

let previousActiveElement = null
let previousBodyOverflow = ''

const hasTitle = computed(() => Boolean(props.title || slots.header))

const close = (reason = 'programmatic') => {
  emit('update:modelValue', false)
  emit('close', reason)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close('overlay')
  }
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
  if (typeof document === 'undefined') return

  previousActiveElement = document.activeElement
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  await nextTick()

  const focusableElements = getFocusableElements()
  const firstTarget = focusableElements[0] || modalElement.value
  firstTarget?.focus()
}

const unlockPage = () => {
  if (typeof document === 'undefined') return

  document.body.style.overflow = previousBodyOverflow
  previousActiveElement?.focus?.()
  previousActiveElement = null
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      lockPage()
    } else {
      unlockPage()
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  if (props.modelValue) {
    lockPage()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)

  if (props.modelValue) {
    unlockPage()
  }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 14px;
}

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
</style>
