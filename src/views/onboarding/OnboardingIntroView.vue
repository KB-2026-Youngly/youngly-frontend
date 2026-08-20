<template>
  <main class="intro-stage onboarding-page" @click="finishIntro">
    <div class="white-curtain" aria-hidden="true"></div>

    <section class="intro-content">
      <h1 class="typing-message" aria-label="습관이 개인연금으로, MZ 맞춤 자산 관리 서비스">
        <span v-for="(line, lineIndex) in typedLines" :key="lineIndex" class="typing-line">
          <span
            v-for="token in line"
            :key="token.sourceIndex"
            :class="{ purple: isPurple(lineIndex, token.sourceIndex) }"
          >{{ token.display }}</span>
          <i v-if="activeLine === lineIndex && isTyping" class="caret" aria-hidden="true"></i>
        </span>
      </h1>

      <img class="coli-gif" :src="coliIntro" alt="" aria-hidden="true" />
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import coliIntro from '@/assets/login_animation/coli_intro.gif'

const router = useRouter()
const phrases = ['습관이 개인연금으로,', 'MZ 맞춤 자산 관리 서비스']
const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const typedLines = ref([[], []])
const activeLine = ref(0)
const isTyping = ref(true)
let typingTimer
let transitionTimer
let hasFinished = false

function stagesFor(char) {
  const code = char.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return [char]
  const offset = code - 0xac00
  const initialIndex = Math.floor(offset / 588)
  const vowelIndex = Math.floor((offset % 588) / 28)
  const finalIndex = offset % 28
  const baseSyllable = String.fromCharCode(0xac00 + initialIndex * 588 + vowelIndex * 28)
  return finalIndex ? [initials[initialIndex], baseSyllable, char] : [initials[initialIndex], char]
}

const typingSteps = phrases.flatMap((phrase, lineIndex) =>
  Array.from(phrase).flatMap((char, sourceIndex) =>
    stagesFor(char).map((display) => ({ lineIndex, sourceIndex, display })),
  ),
)

function runTyping() {
  let stepIndex = 0
  const interval = 4000 / typingSteps.length

  function renderNextStep() {
    const step = typingSteps[stepIndex]
    if (!step) {
      window.clearInterval(typingTimer)
      isTyping.value = false
      return
    }
    activeLine.value = step.lineIndex
    const nextLines = typedLines.value.map((line) => [...line])
    nextLines[step.lineIndex][step.sourceIndex] = {
      sourceIndex: step.sourceIndex,
      display: step.display,
    }
    typedLines.value = nextLines
    stepIndex += 1
  }

  // 첫 초성이 빈 화면 없이 즉시 보이게 한다.
  renderNextStep()
  typingTimer = window.setInterval(renderNextStep, interval)
}

function showCompletedText() {
  typedLines.value = phrases.map((phrase) =>
    Array.from(phrase).map((display, sourceIndex) => ({ display, sourceIndex })),
  )
  isTyping.value = false
}

function isPurple(lineIndex, index) {
  return lineIndex === 0 && (index <= 1 || (index >= 4 && index <= 7))
}

function finishIntro() {
  if (hasFinished) return
  hasFinished = true
  window.clearInterval(typingTimer)
  window.clearTimeout(transitionTimer)
  router.replace({ name: 'OnboardingTerms' })
}

onMounted(async () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (document.fonts?.load) {
    await document.fonts.load('700 26px Pretendard')
  }
  if (reduceMotion) showCompletedText()
  else runTyping()
  transitionTimer = window.setTimeout(finishIntro, reduceMotion ? 500 : 5200)
})

onBeforeUnmount(() => {
  window.clearInterval(typingTimer)
  window.clearTimeout(transitionTimer)
})
</script>

<style scoped>
@font-face{font-family:YounglyPixel;src:url('@/assets/fonts/YounglyNeoPixel.woff2') format('woff2');font-display:swap}
.intro-stage{position:relative;min-height:100dvh;overflow:hidden;background-image:linear-gradient(rgba(104,70,140,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(104,70,140,.035) 1px,transparent 1px),linear-gradient(180deg,#fff 0%,#f3edf9 100%);background-size:24px 24px,24px 24px,100% 100%;cursor:pointer}.terms-preview{position:absolute;inset:0;opacity:0;transform:translateY(42px);animation:terms-arrive 5.6s ease both;pointer-events:none}.white-curtain{position:absolute;z-index:2;inset:0;background-image:linear-gradient(rgba(104,70,140,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(104,70,140,.035) 1px,transparent 1px),linear-gradient(180deg,#fff 0%,#f3edf9 100%);background-size:24px 24px,24px 24px,100% 100%;animation:curtain-open 5.6s ease both}.intro-content{position:absolute;z-index:3;inset:0;pointer-events:none}.typing-message{position:absolute;left:50%;top:35%;width:calc(100% - 32px);margin:0;color:#211d25;font-family:YounglyPixel,'Noto Sans KR',sans-serif;font-size:clamp(23px,6.7vw,32px);font-weight:700;line-height:1.72;letter-spacing:-.025em;text-align:center;transform:translate(-50%,-50%);animation:message-land 5.6s cubic-bezier(.65,0,.25,1) both}.typing-line{display:block;min-height:1.72em;white-space:nowrap}.typing-line .purple{color:#68468c}.caret{display:inline-block;width:2px;height:.86em;margin-left:3px;background:#68468c;vertical-align:-.05em;animation:blink .55s steps(1,end) infinite}.coli-gif{position:absolute;left:50%;top:56%;width:min(58vw,260px);max-height:34vh;object-fit:contain;transform:translate(-50%,-50%);animation:gif-exit 5.6s ease both}
@keyframes blink{50%{opacity:0}}@keyframes gif-exit{0%,69%{opacity:1;transform:translate(-50%,-50%) scale(1)}76%,100%{opacity:0;transform:translate(-50%,-56%) scale(.94)}}@keyframes message-land{0%,70%{left:50%;top:35%;font-size:clamp(23px,6.7vw,32px);text-align:center;transform:translate(-50%,-50%);opacity:1}86%,94%{left:20px;top:34px;font-size:16px;text-align:left;transform:none;opacity:1}100%{left:20px;top:34px;font-size:16px;text-align:left;transform:none;opacity:0}}@keyframes curtain-open{0%,72%{opacity:1}90%,100%{opacity:0;visibility:hidden}}@keyframes terms-arrive{0%,72%{opacity:0;transform:translateY(42px)}90%,100%{opacity:1;transform:none}}
@media(min-width:601px){.typing-message{font-size:clamp(27px,5vw,50px)}@keyframes message-land{0%,70%{left:50%;top:35%;font-size:clamp(27px,5vw,50px);text-align:center;transform:translate(-50%,-50%);opacity:1}86%,94%{left:max(20px,calc(50% - 268px));top:calc(50% - 290px);font-size:17px;text-align:left;transform:none;opacity:1}100%{left:max(20px,calc(50% - 268px));top:calc(50% - 290px);font-size:17px;text-align:left;transform:none;opacity:0}}}
.coli-gif{width:100vw;max-width:760px;max-height:none;height:auto;animation:gif-clean-exit 5.2s ease both}.typing-message{width:calc(100% - 44px);font-size:26px;line-height:1.72;letter-spacing:-.025em;animation:message-clean-exit 5.2s cubic-bezier(.65,0,.25,1) both}.white-curtain{animation:none}
@keyframes gif-clean-exit{0%,77%{opacity:1;transform:translate(-50%,-50%) scale(1)}90%,100%{opacity:0;transform:translate(-50%,-58%) scale(.94)}}
@keyframes message-clean-exit{0%,77%{left:50%;top:35%;font-size:26px;text-align:center;transform:translate(-50%,-50%);opacity:1}100%{left:22px;top:96px;font-size:26px;text-align:left;transform:none;opacity:1}}
.typing-message{font-family:Pretendard,'Noto Sans KR',Arial,sans-serif!important;font-size:26px!important;font-weight:700;line-height:1.72;letter-spacing:-.04em!important;font-stretch:normal;word-spacing:0}.typing-message span{font-family:inherit;letter-spacing:inherit}
@media(prefers-reduced-motion:reduce){.terms-preview{opacity:1;transform:none;animation:none}.white-curtain,.intro-content{display:none}}
</style>
