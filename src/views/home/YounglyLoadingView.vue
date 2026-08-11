<template>
  <main class="youngly-loading" aria-live="polite" aria-label="Youngly 홈을 준비하고 있습니다">
    <section class="loading-content">
      <img v-if="animationSource" :src="animationSource" alt="Youngly 캐릭터가 홈을 준비하는 중" />
      <div class="brand">
        <span>습관이 자산이 되는 순간</span>
      </div>
      <p>나만의 Youngly를 준비하고 있어요</p>
      <div class="loading-track" aria-hidden="true"><span></span></div>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import coliAnimation from '@/assets/login_animation/Pixel_Coli.gif'

const router = useRouter()
const animationSource = ref('')
let loadingTimer

onMounted(() => {
  animationSource.value = `${coliAnimation}?restart=${Date.now()}`
  loadingTimer = window.setTimeout(() => {
    router.replace('/home')
  }, 4000)
})

onBeforeUnmount(() => window.clearTimeout(loadingTimer))
</script>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  background: #fefcfe;
}

.youngly-loading {
  min-height: 100dvh;
  padding: 24px 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #30283a;
  background: #fefcfe;
}

.loading-content {
  width: 100%;
  display: grid;
  justify-items: center;
  text-align: center;
}

.loading-content img {
  width: min(480px, 100vw);
  max-width: none;
  height: auto;
  display: block;
  justify-self: center;
  margin: 0 auto;
  object-fit: contain;
  image-rendering: pixelated;
  filter: none;
}

.brand {
  margin-top: 8px;
  display: grid;
  gap: 4px;
}

.brand strong {
  font-size: 27px;
  font-weight: 1000;
  letter-spacing: 2.5px;
}

.brand span,
.loading-content p {
  color: #756d7c;
  font-size: 12px;
}

.loading-content p {
  margin: 25px 0 11px;
  font-weight: 700;
}

.loading-track {
  width: min(260px, 72vw);
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #ebe7ef;
}

.loading-track span {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: inherit;
  background: #fdb913;
  transform: scaleX(0);
  transform-origin: left;
  animation: loading-progress 4s linear forwards, loading-color 4s linear forwards;
}

@keyframes loading-progress {
  to { transform: scaleX(1); }
}

@keyframes loading-color {
  from { background-color: #fdb913; }
  to { background-color: #7156ad; }
}

@media (prefers-reduced-motion: reduce) {
  .loading-track span { animation-timing-function: steps(1, end); }
}
</style>
