<template>
  <Teleport to="body">
    <div v-if="open" class="gacha-overlay" @mousedown.self="requestClose">
      <section
        ref="modalRef"
        class="gacha-modal"
        :class="`gacha-modal--${mode}`"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="mode === 'error' || mode === 'result' ? titleId : undefined"
        :aria-label="
          mode === 'confirm'
            ? '캐릭터 뽑기 확인'
            : mode === 'drawing'
              ? '캐릭터 소환 중'
              : undefined
        "
        tabindex="-1"
        @keydown.esc="requestClose"
      >
        <template v-if="mode === 'confirm' || mode === 'drawing'">
          <button
            type="button"
            class="gacha-modal__pixel-close"
            aria-label="뽑기 창 닫기"
            :disabled="mode === 'drawing' || loading"
            @click="requestClose"
          >
            <span aria-hidden="true">×</span>
          </button>
          <div
            class="gacha-modal__summon-scene"
            :class="{ 'gacha-modal__summon-scene--drawing': mode === 'drawing' }"
            aria-hidden="true"
          >
            <span class="summon-scene__pillar summon-scene__pillar--left"></span>
            <span class="summon-scene__pillar summon-scene__pillar--right"></span>
            <span class="summon-scene__spark summon-scene__spark--1"></span>
            <span class="summon-scene__spark summon-scene__spark--2"></span>
            <span class="summon-scene__spark summon-scene__spark--3"></span>
            <span class="summon-scene__spark summon-scene__spark--4"></span>
            <span class="summon-scene__spark summon-scene__spark--5"></span>
            <span class="summon-scene__spark summon-scene__spark--6"></span>
            <span class="summon-scene__magic-wrap">
              <span class="summon-scene__magic-circle"></span>
            </span>
            <span class="summon-scene__egg-position summon-state-fade">
              <span
                class="summon-scene__egg"
                :class="{ 'summon-scene__egg--hatching': mode === 'drawing' }"
              >
                <span class="summon-scene__egg-question">?</span>
                <span v-if="mode === 'drawing'" class="summon-scene__cracks">
                  <i></i><i></i><i></i>
                </span>
              </span>
              <span v-if="mode === 'drawing'" class="summon-scene__fragments">
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </span>
              <span v-if="mode === 'drawing'" class="summon-scene__hatch-flash"></span>
            </span>
          </div>

          <div
            v-if="mode === 'confirm'"
            class="gacha-modal__actions gacha-modal__actions--confirm summon-state-fade"
          >
            <button
              type="button"
              class="gacha-modal__primary"
              :disabled="loading"
              @click="emit('confirm')"
            >
              뽑기
            </button>
          </div>
          <div
            v-else
            class="gacha-modal__summon-loading summon-state-fade"
            role="status"
            aria-live="polite"
          >
            <span>캐릭터를 소환하는 중...</span>
          </div>
        </template>

        <template v-else-if="mode === 'error'">
          <span class="gacha-modal__eyebrow gacha-modal__eyebrow--error">DRAW FAILED</span>
          <h2 :id="titleId">캐릭터를 뽑지 못했어요</h2>
          <div class="gacha-modal__error-icon" aria-hidden="true">!</div>
          <p class="gacha-modal__error" role="alert">
            {{ error || '잠시 후 다시 시도해 주세요.' }}
          </p>

          <div class="gacha-modal__actions">
            <button type="button" class="gacha-modal__secondary" @click="requestClose">닫기</button>
            <button type="button" class="gacha-modal__primary" @click="emit('confirm')">
              다시 시도
            </button>
          </div>
        </template>

        <template v-else-if="mode === 'result'">
          <span class="gacha-modal__eyebrow">NEW FRIEND!</span>
          <h2 :id="titleId">새 캐릭터 획득!</h2>
          <div
            class="gacha-modal__result"
            :class="{ 'gacha-modal__result--cover': usesCoverImage }"
          >
            <CharacterPreview :character="character" size="hero" />
          </div>
          <strong class="gacha-modal__name">{{ character?.name }}</strong>
          <p class="gacha-modal__success" role="status" aria-live="polite">
            뽑기가 완료되었어요. 남은 포인트는 <strong>{{ formattedBalance }}P</strong>예요.
          </p>
          <p v-if="equipError" class="gacha-modal__error" role="alert">{{ equipError }}</p>

          <div class="gacha-modal__actions">
            <button
              type="button"
              class="gacha-modal__secondary"
              :disabled="equipping"
              @click="requestClose"
            >
              확인
            </button>
            <button
              type="button"
              class="gacha-modal__primary"
              :disabled="equipping"
              @click="emit('equip')"
            >
              {{ equipping ? '장착 중...' : '획득한 캐릭터 장착하기' }}
            </button>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import CharacterPreview from '@/components/collectible/CharacterPreview.vue'
import { isCoverCharacterImage } from '@/constants/characterImages'

defineOptions({ name: 'GachaModal' })

const props = defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: 'confirm',
    validator: (value) => ['confirm', 'drawing', 'error', 'result'].includes(value),
  },
  balance: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: 100,
  },
  character: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  animationKey: {
    type: Number,
    default: 0,
  },
  equipping: Boolean,
  error: {
    type: String,
    default: '',
  },
  equipError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'confirm', 'equip'])
const titleId = 'gacha-modal-title'
const modalRef = ref(null)
const formattedBalance = computed(() => new Intl.NumberFormat('ko-KR').format(props.balance))
const usesCoverImage = computed(() => isCoverCharacterImage(props.character))

const requestClose = () => {
  if (!props.loading && !props.equipping) emit('close')
}

watch([() => props.open, () => props.mode], async ([open]) => {
  if (!open) return
  await nextTick()
  const focusTarget = modalRef.value?.querySelector('button:not([disabled])') || modalRef.value
  focusTarget?.focus()
})
</script>

<style scoped>
.gacha-overlay {
  position: fixed;
  z-index: 3000;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgba(31, 23, 45, 0.68);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.gacha-modal {
  position: relative;
  isolation: isolate;
  width: min(460px, calc(100vw - 40px));
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 36px 32px 32px;
  border: 0;
  border-radius: 0;
  background: #ac99d2;
  box-shadow: none;
  filter: drop-shadow(7px 7px 0 #c8b7e5);
  clip-path: polygon(9px 0, calc(100% - 9px) 0, calc(100% - 9px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 9px, 100% 9px, 100% calc(100% - 9px), calc(100% - 3px) calc(100% - 9px), calc(100% - 3px) calc(100% - 3px), calc(100% - 9px) calc(100% - 3px), calc(100% - 9px) 100%, 9px 100%, 9px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 9px), 0 calc(100% - 9px), 0 9px, 3px 9px, 3px 3px, 9px 3px);
  box-sizing: border-box;
  text-align: center;
}

.gacha-modal::before {
  content: '';
  position: absolute;
  inset: 3px;
  z-index: 0;
  background: #ffffff;
  clip-path: inherit;
  pointer-events: none;
}

.gacha-modal > * {
  position: relative;
  z-index: 1;
}

.gacha-modal--confirm,
.gacha-modal--drawing {
  height: 340px;
  padding: 3px;
  overflow: hidden;
  background: #a58bce;
  filter:
    drop-shadow(6px 6px 0 #70569c)
    drop-shadow(11px 13px 18px rgba(24, 15, 40, 0.24));
}

.gacha-modal--confirm::before,
.gacha-modal--drawing::before {
  background:
    linear-gradient(180deg, #111634 0%, #1d1749 61%, #10132f 79%, #090d24 100%);
}

.gacha-modal__pixel-close {
  position: absolute;
  isolation: isolate;
  top: 13px;
  right: 13px;
  z-index: 10;
  display: grid;
  width: 32px;
  height: 32px;
  padding: 3px;
  place-items: center;
  border: 0;
  color: #f6ecff;
  background: rgba(8, 10, 30, 0.88);
  filter: drop-shadow(3px 3px 0 rgba(6, 7, 20, 0.68));
  clip-path: polygon(6px 0, calc(100% - 6px) 0, calc(100% - 6px) 2px, calc(100% - 2px) 2px, calc(100% - 2px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 2px) calc(100% - 6px), calc(100% - 2px) calc(100% - 2px), calc(100% - 6px) calc(100% - 2px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 2px), 2px calc(100% - 2px), 2px calc(100% - 6px), 0 calc(100% - 6px), 0 6px, 2px 6px, 2px 2px, 6px 2px);
  font: inherit;
  cursor: pointer;
}

.gacha-modal__pixel-close::before {
  content: '';
  position: absolute;
  inset: 2px;
  z-index: -1;
  border: 1px solid rgba(225, 205, 255, 0.82);
  clip-path: inherit;
}

.gacha-modal__pixel-close span {
  margin-top: -2px;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}

.gacha-modal__pixel-close:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(113, 86, 173, 0.96);
  transform: translate(1px, 1px);
}

.gacha-modal__pixel-close:focus-visible {
  outline: 3px solid rgba(233, 212, 255, 0.72);
  outline-offset: 2px;
}

.gacha-modal__pixel-close:disabled {
  cursor: wait;
  opacity: 0.38;
}

.gacha-modal__summon-scene {
  position: relative;
  z-index: 2;
  height: 228px;
  overflow: visible;
  perspective: 480px;
  background:
    linear-gradient(90deg, rgba(91, 58, 139, 0.2) 0 2px, transparent 2px 100%) 17px 0 / 42px 18px,
    radial-gradient(circle at 50% 72%, rgba(175, 92, 255, 0.42), transparent 31%),
    linear-gradient(90deg, rgba(22, 18, 55, 0.84), transparent 25% 75%, rgba(22, 18, 55, 0.84)),
    linear-gradient(180deg, #111634 0%, #1d1749 58%, #321a62 100%);
  box-shadow:
    inset 0 -4px 0 #6f4aa7,
    inset 0 0 35px rgba(4, 7, 27, 0.78);
}

.gacha-modal__summon-scene::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, transparent 10%, rgba(133, 90, 191, 0.2) 10% 11%, transparent 11% 89%, rgba(133, 90, 191, 0.2) 89% 90%, transparent 90%),
    linear-gradient(180deg, transparent 0 80%, rgba(8, 10, 30, 0.48) 80%);
  pointer-events: none;
}

.gacha-modal__summon-scene::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  height: 34px;
  background:
    linear-gradient(90deg, #171536 0 12%, transparent 12% 88%, #171536 88%),
    repeating-linear-gradient(90deg, #201849 0 18px, #2c1d5c 18px 36px);
  border-top: 3px solid #59378b;
  opacity: 0.92;
}

.summon-scene__pillar {
  position: absolute;
  bottom: 24px;
  z-index: 2;
  width: 27px;
  height: 124px;
  background:
    linear-gradient(90deg, #23183f 0 6px, #4e2b68 6px 20px, #291942 20px),
    #35204f;
  border-top: 8px solid #674282;
  box-shadow:
    -8px 0 0 #19152f,
    8px 0 0 #19152f;
  clip-path: polygon(5px 0, calc(100% - 5px) 0, calc(100% - 5px) 5px, 100% 5px, 100% 100%, 0 100%, 0 5px, 5px 5px);
  opacity: 0.8;
}

.summon-scene__pillar--left {
  left: 29px;
}

.summon-scene__pillar--right {
  right: 29px;
}

.summon-scene__pillar::before {
  content: '';
  position: absolute;
  top: -13px;
  left: -8px;
  width: 43px;
  height: 9px;
  background: #694287;
  box-shadow:
    0 5px 0 #3a2455,
    0 122px 0 #24183d;
  clip-path: polygon(5px 0, calc(100% - 5px) 0, calc(100% - 5px) 3px, 100% 3px, 100% 100%, 0 100%, 0 3px, 5px 3px);
}

.summon-scene__pillar::after {
  content: '';
  position: absolute;
  top: 19px;
  width: 25px;
  height: 43px;
  background:
    linear-gradient(#d5a535, #d5a535) center / 3px 19px no-repeat,
    linear-gradient(90deg, #d5a535, #d5a535) center / 19px 3px no-repeat,
    #593184;
  border-top: 3px solid #b37a31;
  clip-path: polygon(0 0, 100% 0, 100% 78%, 76% 78%, 76% 88%, 50% 100%, 24% 88%, 24% 78%, 0 78%);
  opacity: 0.82;
}

.summon-scene__pillar--left::after {
  left: 25px;
}

.summon-scene__pillar--right::after {
  right: 25px;
}

.summon-scene__magic-wrap {
  position: absolute;
  right: 0;
  bottom: -68px;
  left: 0;
  z-index: 2;
  width: 224px;
  height: 224px;
  margin-inline: auto;
  transform: rotateX(69deg);
  transform-origin: center center;
  transform-style: preserve-3d;
}

.summon-scene__magic-circle {
  position: absolute;
  inset: 0;
  border: 5px solid #b972f0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(237, 204, 255, 0.9) 0 5deg,
    transparent 5deg 25deg
  );
  box-shadow:
    0 0 0 11px rgba(136, 71, 202, 0.72),
    0 0 0 16px rgba(216, 161, 255, 0.52),
    0 0 30px 19px rgba(177, 87, 255, 0.76),
    inset 0 0 22px rgba(245, 223, 255, 0.86);
  box-sizing: border-box;
  animation: summon-magic-rotate 12s linear infinite;
}

.summon-scene__magic-circle::before,
.summon-scene__magic-circle::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.summon-scene__magic-circle::before {
  inset: 26px;
  border: 4px dashed #dfb3ff;
  box-shadow: 0 0 12px #aa5ff0;
}

.summon-scene__magic-circle::after {
  inset: 63px;
  border: 5px solid #f0d8ff;
  background: rgba(182, 91, 240, 0.2);
  box-shadow: 0 0 18px #c477ff;
}

.summon-scene__egg-position {
  position: absolute;
  bottom: 39px;
  left: 50%;
  z-index: 4;
  width: 72px;
  height: 94px;
  transform: translateX(-50%);
}

.summon-scene__egg {
  position: relative;
  isolation: isolate;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #ffffff;
  background: #e4cff7;
  filter: drop-shadow(0 8px 7px rgba(8, 5, 27, 0.72));
  clip-path: polygon(39% 0, 61% 0, 61% 4%, 72% 4%, 72% 10%, 80% 10%, 80% 18%, 87% 18%, 87% 29%, 93% 29%, 93% 76%, 87% 76%, 87% 85%, 78% 85%, 78% 92%, 65% 92%, 65% 97%, 35% 97%, 35% 92%, 22% 92%, 22% 85%, 13% 85%, 13% 76%, 7% 76%, 7% 29%, 13% 29%, 13% 18%, 20% 18%, 20% 10%, 28% 10%, 28% 4%, 39% 4%);
  animation: summon-egg-float 2.2s ease-in-out infinite;
}

.summon-scene__egg::before {
  content: '';
  position: absolute;
  inset: 4px;
  z-index: -1;
  background: linear-gradient(135deg, #67417e, #251b45 72%);
  clip-path: inherit;
}

.summon-scene__egg-question {
  position: relative;
  z-index: 2;
  margin-top: 9px;
  font-size: 38px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 3px 3px 0 #3f285d;
}

.summon-scene__egg--hatching {
  transform-origin: 50% 86%;
  animation: summon-egg-hatch 1.8s steps(1, end) both;
}

.summon-scene__egg--hatching::after {
  content: '';
  position: absolute;
  inset: 5px;
  z-index: 1;
  background: radial-gradient(circle, rgba(255, 238, 151, 0.9), rgba(178, 92, 244, 0.42) 45%, transparent 72%);
  clip-path: inherit;
  opacity: 0;
  animation: summon-egg-inner-glow 1.8s ease-in both;
  pointer-events: none;
}

.summon-scene__egg--hatching .summon-scene__egg-question {
  animation: summon-question-fade 1.8s steps(1, end) both;
}

.summon-scene__cracks {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.summon-scene__cracks i {
  position: absolute;
  display: block;
  background: #f6d96f;
  filter: drop-shadow(0 0 3px #c56cff);
  opacity: 0;
  animation: summon-crack-show 1.8s steps(1, end) both;
}

.summon-scene__cracks i:nth-child(1) {
  top: 20px;
  left: 34px;
  width: 5px;
  height: 35px;
  clip-path: polygon(20% 0, 100% 0, 60% 26%, 100% 26%, 36% 56%, 76% 56%, 0 100%, 28% 65%, 0 65%, 48% 36%, 12% 36%);
}

.summon-scene__cracks i:nth-child(2) {
  top: 44px;
  left: 18px;
  width: 25px;
  height: 6px;
  clip-path: polygon(0 18%, 38% 18%, 38% 0, 66% 50%, 100% 50%, 100% 100%, 62% 100%, 62% 72%, 34% 42%, 0 42%);
}

.summon-scene__cracks i:nth-child(3) {
  top: 51px;
  right: 15px;
  width: 25px;
  height: 6px;
  clip-path: polygon(0 46%, 34% 46%, 56% 0, 72% 38%, 100% 18%, 100% 46%, 70% 70%, 58% 38%, 38% 100%, 0 74%);
}

.summon-scene__fragments {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.summon-scene__fragments i {
  --fragment-x: 0px;
  --fragment-y: 0px;
  --fragment-rotate: 0deg;
  position: absolute;
  top: 44px;
  left: 33px;
  width: 8px;
  height: 7px;
  background: #d8b8ec;
  box-shadow: inset -2px -2px 0 #634276;
  opacity: 0;
  animation: summon-shell-fragment 0.58s steps(5, end) 1.12s both;
}

.summon-scene__fragments i:nth-child(1) { --fragment-x: -43px; --fragment-y: -26px; --fragment-rotate: -24deg; }
.summon-scene__fragments i:nth-child(2) { --fragment-x: -51px; --fragment-y: 5px; --fragment-rotate: 18deg; width: 6px; }
.summon-scene__fragments i:nth-child(3) { --fragment-x: -29px; --fragment-y: 31px; --fragment-rotate: -12deg; }
.summon-scene__fragments i:nth-child(4) { --fragment-x: 42px; --fragment-y: -28px; --fragment-rotate: 28deg; width: 7px; }
.summon-scene__fragments i:nth-child(5) { --fragment-x: 51px; --fragment-y: 4px; --fragment-rotate: -18deg; }
.summon-scene__fragments i:nth-child(6) { --fragment-x: 31px; --fragment-y: 32px; --fragment-rotate: 16deg; width: 6px; }

.summon-scene__hatch-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 6;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 18px 8px #f8df7f,
    0 0 42px 22px rgba(184, 103, 255, 0.9);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.2);
  animation: summon-hatch-flash 0.36s ease-out 1.4s both;
  pointer-events: none;
}

.summon-scene__spark {
  position: absolute;
  z-index: 3;
  width: 5px;
  height: 5px;
  background: #dfa1ff;
  box-shadow: 0 0 8px #bd69ff;
  animation: summon-spark-twinkle 1.8s steps(2, end) infinite;
}

.summon-scene__spark::before,
.summon-scene__spark::after {
  content: '';
  position: absolute;
  background: inherit;
  box-shadow: inherit;
}

.summon-scene__spark::before {
  top: -4px;
  bottom: -4px;
  left: 2px;
  width: 2px;
}

.summon-scene__spark::after {
  top: 2px;
  right: -4px;
  left: -4px;
  height: 2px;
}

.summon-scene__spark--1 { top: 42px; left: 22%; animation-delay: -0.3s; }
.summon-scene__spark--2 { top: 72px; left: 34%; width: 8px; height: 8px; animation-delay: -1.1s; }
.summon-scene__spark--3 { top: 35px; right: 29%; animation-delay: -0.7s; }
.summon-scene__spark--4 { top: 80px; right: 20%; width: 7px; height: 7px; animation-delay: -1.5s; }
.summon-scene__spark--5 { top: 117px; left: 17%; animation-delay: -0.9s; }
.summon-scene__spark--6 { top: 123px; right: 16%; animation-delay: -0.1s; }

.gacha-modal__summon-scene--drawing .summon-scene__magic-circle {
  border-color: #d69bff;
  box-shadow:
    0 0 0 11px rgba(157, 82, 224, 0.82),
    0 0 0 16px rgba(229, 185, 255, 0.68),
    0 0 38px 23px rgba(191, 105, 255, 0.9),
    inset 0 0 27px rgba(251, 238, 255, 0.96);
  animation-duration: 5.5s;
}

.gacha-modal__summon-scene--drawing .summon-scene__spark {
  animation: summon-spark-surge 1.8s steps(2, end) both;
  animation-delay: 0s;
}

.summon-state-fade {
  animation: summon-state-fade 0.24s ease-out both;
}

@keyframes summon-magic-rotate {
  to { transform: rotate(360deg); }
}

@keyframes summon-spark-twinkle {
  0%, 100% { opacity: 0.25; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.45); }
}

@keyframes summon-egg-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes summon-egg-hatch {
  0%, 14% { opacity: 1; transform: translateX(0) rotate(0); }
  18% { transform: translateX(-2px) rotate(-1deg); }
  22% { transform: translateX(2px) rotate(1deg); }
  27% { transform: translateX(-3px) rotate(-2deg); }
  32% { transform: translateX(3px) rotate(2deg); }
  38% { transform: translateX(-4px) rotate(-3deg); }
  44% { transform: translateX(4px) rotate(3deg); }
  51% { transform: translateX(-5px) rotate(-4deg); }
  58% { transform: translateX(5px) rotate(4deg); }
  65% { transform: translateX(-7px) rotate(-5deg); }
  72% { transform: translateX(7px) rotate(5deg); }
  79% { transform: translateX(-9px) rotate(-6deg); }
  85% { transform: translateX(9px) rotate(6deg); }
  90% { opacity: 1; transform: translateX(0) rotate(0) scale(1.04); }
  95% { opacity: 0.28; transform: scale(0.94); }
  100% { opacity: 0; transform: scale(0.9); }
}

@keyframes summon-egg-inner-glow {
  0%, 28% { opacity: 0; }
  48% { opacity: 0.24; }
  72% { opacity: 0.65; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes summon-question-fade {
  0%, 76% { opacity: 1; }
  90% { opacity: 0.35; }
  100% { opacity: 0; }
}

@keyframes summon-crack-show {
  0%, 30% { opacity: 0; }
  42% { opacity: 0.42; }
  62% { opacity: 0.74; }
  78%, 91% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes summon-shell-fragment {
  0% { opacity: 0; transform: translate(0, 0) rotate(0); }
  15% { opacity: 1; }
  78% { opacity: 1; }
  100% {
    opacity: 0;
    transform: translate(var(--fragment-x), var(--fragment-y)) rotate(var(--fragment-rotate));
  }
}

@keyframes summon-hatch-flash {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  42% { opacity: 1; transform: translate(-50%, -50%) scale(3.4); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(5.2); }
}

@keyframes summon-spark-surge {
  0% { opacity: 0.25; transform: scale(0.7); }
  45% { opacity: 0.72; transform: scale(1); }
  78% { opacity: 1; transform: scale(1.65); }
  92%, 100% { opacity: 0; transform: scale(0.5); }
}

@keyframes summon-state-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes summon-egg-hatch-reduced {
  from { opacity: 1; }
  to { opacity: 0.65; }
}

@keyframes summon-egg-glow-reduced {
  0% { opacity: 0; }
  55% { opacity: 0.75; }
  100% { opacity: 0.18; }
}

@keyframes summon-hatch-flash-reduced {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
  55% { opacity: 0.7; transform: translate(-50%, -50%) scale(2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.6); }
}

.gacha-modal__eyebrow {
  display: inline-flex;
  padding: 5px 9px 4px;
  color: #7156ad;
  background: #f0e9fa;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.gacha-modal h2 {
  margin: 10px 0 10px;
  color: #322a43;
  font-size: 24px;
  line-height: 1.3;
}

.gacha-modal p {
  margin: 0 0 14px;
  color: #6e6677;
  font-size: 13px;
  line-height: 1.65;
}

.gacha-modal__result {
  width: 210px;
  height: 210px;
  margin: 16px auto 10px;
  padding: 12px;
  border: 3px solid #d4c5e7;
  border-radius: 50%;
  background: #f6f1fb;
  box-sizing: border-box;
}

.gacha-modal__result--cover {
  width: min(280px, 100%);
  height: auto;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.gacha-modal__eyebrow--error {
  color: #a9445b;
}

.gacha-modal__error-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 20px auto 10px;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #a9445b;
  font-size: 28px;
  font-weight: 900;
}

.gacha-modal__name {
  display: block;
  margin-bottom: 18px;
  color: #322a43;
  font-size: 20px;
}

.gacha-modal .gacha-modal__success {
  margin: -6px 0 18px;
  color: #4f6f63;
  font-size: 13px;
}

.gacha-modal__success strong {
  color: #3f7965;
}

.gacha-modal .gacha-modal__error {
  margin: 14px 0 0;
  color: #b33f54;
  font-size: 13px;
  font-weight: 800;
}

.gacha-modal .gacha-modal__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 0;
  color: #7156ad;
  font-size: 12px;
  font-weight: 800;
}

.gacha-modal__actions {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 10px;
  margin-top: 22px;
}

.gacha-modal__actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 10px 14px;
  border: 2px solid #322a43;
  border-radius: 2px;
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease,
    background-color 0.14s ease;
}

.gacha-modal__primary {
  color: #ffffff;
  background: #7156ad;
  box-shadow: 4px 4px 0 #3f3053;
}

.gacha-modal__primary:hover:not(:disabled) {
  background: #7c5dbd;
  box-shadow: 2px 2px 0 #3f3053;
  transform: translate(2px, 2px);
}

.gacha-modal__secondary:hover:not(:disabled) {
  background: #f4effa;
  box-shadow: 1px 1px 0 #3f3053;
  transform: translate(2px, 2px);
}

.gacha-modal__secondary {
  color: #554873;
  background: #ffffff;
  box-shadow: 3px 3px 0 #cabbe0;
}

.gacha-modal__actions button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.gacha-modal__actions--confirm {
  position: absolute;
  right: 3px;
  bottom: 3px;
  left: 3px;
  z-index: 4;
  width: auto;
  height: 132px;
  grid-template-columns: 1fr;
  margin: 0;
  padding: 52px 0 28px;
  place-items: center;
  background: linear-gradient(180deg, rgba(9, 13, 36, 0) 0%, rgba(9, 13, 36, 0.74) 40%, #090d24 100%);
  box-sizing: border-box;
  pointer-events: none;
}

.gacha-modal__summon-loading {
  position: absolute;
  right: 3px;
  bottom: 3px;
  left: 3px;
  z-index: 4;
  display: grid;
  width: auto;
  height: 132px;
  margin: 0;
  padding: 52px 0 28px;
  place-content: center;
  color: #dac9f2;
  background: linear-gradient(180deg, rgba(9, 13, 36, 0) 0%, rgba(9, 13, 36, 0.72) 42%, #090d24 100%);
  font-size: 13px;
  font-weight: 900;
  text-align: center;
  text-shadow: 2px 2px 0 rgba(5, 7, 21, 0.72);
  box-sizing: border-box;
}

.gacha-modal__actions--confirm button {
  pointer-events: auto;
}

.gacha-modal__actions--confirm button {
  --confirm-button-outline: #4a3b5d;
  --confirm-button-fill: #fffaf0;
  position: relative;
  isolation: isolate;
  width: 54%;
  height: 44px;
  min-height: 44px;
  padding: 3px 12px;
  border: 0;
  border-radius: 0;
  background: var(--confirm-button-outline);
  box-shadow: none;
  filter: drop-shadow(0 5px 0 #c8b7e5);
  clip-path: polygon(7px 0, calc(100% - 7px) 0, calc(100% - 7px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 7px, 100% 7px, 100% calc(100% - 7px), calc(100% - 3px) calc(100% - 7px), calc(100% - 3px) calc(100% - 3px), calc(100% - 7px) calc(100% - 3px), calc(100% - 7px) 100%, 7px 100%, 7px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 7px), 0 calc(100% - 7px), 0 7px, 3px 7px, 3px 3px, 7px 3px);
  box-sizing: border-box;
}

.gacha-modal__actions--confirm button::before {
  content: '';
  position: absolute;
  inset: 3px;
  z-index: -1;
  background: var(--confirm-button-fill);
  clip-path: inherit;
  pointer-events: none;
}

.gacha-modal__actions--confirm .gacha-modal__primary {
  --confirm-button-outline: #3b294f;
  --confirm-button-fill: #7156ad;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: var(--confirm-button-outline);
  filter: drop-shadow(0 5px 0 #3b294f);
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1;
}

.gacha-modal__actions--confirm .gacha-modal__primary:hover:not(:disabled) {
  --confirm-button-fill: #8061bd;
  background: var(--confirm-button-outline);
  box-shadow: none;
  filter: drop-shadow(0 4px 0 #3b294f);
  transform: translateY(1px);
}

.gacha-modal__actions--confirm button:active:not(:disabled) {
  box-shadow: none;
  filter: drop-shadow(0 1px 0 #3b294f);
  transform: translateY(4px);
}

.gacha-modal__actions--confirm button:disabled {
  --confirm-button-outline: #665c70;
  --confirm-button-fill: #81768e;
  color: rgba(255, 255, 255, 0.76);
  background: var(--confirm-button-outline);
  box-shadow: none;
  filter: drop-shadow(0 3px 0 #51475d);
  cursor: wait;
  opacity: 0.72;
}

.gacha-modal__actions button:focus-visible {
  outline: 3px solid rgba(113, 86, 173, 0.35);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .gacha-overlay {
    padding: 14px;
  }

  .gacha-modal {
    width: min(460px, calc(100vw - 28px));
    max-height: calc(100dvh - 28px);
    padding: 30px 18px 24px;
    filter: drop-shadow(5px 5px 0 #c8b7e5);
  }

  .gacha-modal--confirm,
  .gacha-modal--drawing {
    height: 296px;
    padding: 3px;
  }

  .gacha-modal__summon-scene {
    height: 194px;
  }

  .summon-scene__pillar {
    bottom: 22px;
    width: 22px;
    height: 105px;
  }

  .summon-scene__pillar--left {
    left: 22px;
  }

  .summon-scene__pillar--right {
    right: 22px;
  }

  .summon-scene__magic-wrap {
    bottom: -61px;
    width: 194px;
    height: 194px;
  }

  .summon-scene__egg-position {
    bottom: 34px;
    width: 61px;
    height: 80px;
  }

  .summon-scene__egg-question {
    font-size: 32px;
  }

  .gacha-modal__result {
    width: 170px;
    height: 170px;
  }

  .gacha-modal__result--cover {
    width: min(240px, 78vw);
    height: auto;
  }

  .gacha-modal__actions {
    grid-template-columns: 1fr;
  }

  .gacha-modal__actions--confirm {
    height: 116px;
    grid-template-columns: 1fr;
    margin: 0;
    padding: 40px 0 26px;
  }

  .gacha-modal__summon-loading {
    height: 116px;
    margin: 0;
    padding: 40px 0 26px;
    font-size: 12px;
  }

  .gacha-modal__actions--confirm button {
    width: 60%;
    height: 44px;
    min-height: 44px;
    padding-inline: 9px;
    font-size: 14px;
  }

  .gacha-modal__pixel-close {
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .summon-scene__magic-circle,
  .summon-scene__spark,
  .summon-scene__egg,
  .summon-state-fade {
    animation: none;
  }

  .gacha-modal__summon-scene--drawing .summon-scene__magic-circle,
  .gacha-modal__summon-scene--drawing .summon-scene__spark {
    animation: none;
  }

  .gacha-modal__summon-scene--drawing .summon-scene__spark {
    opacity: 0.4;
  }

  .summon-scene__egg--hatching {
    animation: summon-egg-hatch-reduced 0.45s ease-out both;
  }

  .summon-scene__egg--hatching::after {
    animation: summon-egg-glow-reduced 0.45s ease-out both;
  }

  .summon-scene__egg--hatching .summon-scene__egg-question {
    animation: none;
  }

  .summon-scene__cracks,
  .summon-scene__fragments {
    display: none;
  }

  .summon-scene__hatch-flash {
    animation: summon-hatch-flash-reduced 0.45s ease-out both;
  }
}
</style>
