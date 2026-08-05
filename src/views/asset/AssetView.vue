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
        <span><b>{{ tab.label }}</b><small>{{ tab.caption }}</small></span>
      </button>
    </div>

    <article class="asset-card">
      <div class="card-decoration"></div>
      <div class="empty-icon" aria-hidden="true">{{ content.icon }}</div>
      <h2>{{ content.title }}</h2>
      <p>{{ content.description }}</p>
      <button
        class="connect-button"
        :class="{ 'group-connect-button': activeTab === 'group' }"
        type="button"
        @click="notify"
      >
        {{ content.button }}
        <span>→</span>
      </button>
    </article>

    <transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </transition>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

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
let timer

function notify() {
  toast.value = '계좌 연결 기능은 다음 단계에서 추가할 예정입니다.'
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 2400)
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
.asset-page * { box-sizing: border-box; }
.tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 230px)); gap: 12px; margin-bottom: 18px; }
.tabs button { min-height: 68px; padding: 0 20px; display: flex; align-items: center; gap: 13px; border: 1px solid #e2e0e6; border-radius: 14px; background: #fff; color: #77737e; text-align: left; cursor: pointer; transition: .2s ease; }
.tabs button:hover { border-color: #bcb3d3; transform: translateY(-1px); }
.tabs button.active { border-color: var(--purple); background: var(--purple); color: #fff; box-shadow: 0 8px 20px rgba(105,82,159,.18); }
.tab-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: #f1eff4; color: #5d5864; font-size: 17px; font-weight: 800; }
.tabs button.active .tab-icon { background: rgba(255,255,255,.17); color: #fff; }
.tabs b,.tabs small { display: block; }
.tabs b { font-size: 14px; }
.tabs small { margin-top: 4px; color: #a09ca6; font-size: 10px; }
.tabs button.active small { color: rgba(255,255,255,.68); }
.asset-card { min-height: 390px; padding: 55px 30px 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; border: 1px solid #e7e5e9; border-radius: 20px; background: #fff; text-align: center; box-shadow: 0 10px 32px rgba(34,28,47,.055); }
.card-decoration { position: absolute; width: 220px; height: 220px; right: -80px; top: -100px; border-radius: 50%; background: var(--purple-light); }
.empty-icon { width: 72px; height: 72px; display: grid; place-items: center; border-radius: 22px; background: var(--purple-light); color: var(--purple); font-size: 28px; font-weight: 900; }
.asset-card h2 { margin: 24px 0 9px; font-size: 20px; letter-spacing: -.5px; }
.asset-card > p { margin: 0; color: #85818c; font-size: 13px; }
.connect-button { min-width: 210px; height: 50px; margin-top: 27px; padding: 0 20px; display: flex; align-items: center; justify-content: center; gap: 18px; border: 0; border-radius: 12px; background: var(--purple); color: #fff; font-weight: 800; cursor: pointer; box-shadow: 0 7px 16px rgba(105,82,159,.22); transition: .2s; }
.connect-button:hover { background: #594287; transform: translateY(-1px); }
.group-connect-button { background: #7156ad; }
.group-connect-button:hover { background: #62499a; }
.connect-button span { font-size: 18px; font-weight: 400; }
.toast { position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%); padding: 13px 20px; border-radius: 10px; background: rgba(35,32,40,.94); color: #fff; font-size: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.18); z-index: 20; }
.toast-enter-active,.toast-leave-active { transition: .2s; }.toast-enter-from,.toast-leave-to { opacity: 0; transform: translate(-50%,8px); }
@media (max-width: 767px) {
  .asset-page { width: 100%; max-width: 100%; min-height: calc(100dvh - 68px); margin: 0; padding: 24px 20px 110px; overflow-x: hidden; }
  .tabs { width: 100%; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 9px; }
  .tabs button { width: 100%; min-width: 0; min-height: 62px; padding: 0 10px; border-radius: 12px; }
  .tab-icon { width: 30px; height: 30px; }
  .tabs small { display: none; }
  .asset-card { width: 100%; max-width: 100%; min-height: 340px; padding: 42px 16px 35px; border-radius: 16px; }
  .asset-card h2 { font-size: 17px; }
  .asset-card > p { max-width: 270px; line-height: 1.6; }
  .connect-button { min-width: 0; width: min(100%, 230px); }
  .toast { bottom: 92px; width: calc(100% - 40px); text-align: center; }
}
:global(.mobile-bottom-nav) { position: fixed !important; right: 0; bottom: 0 !important; left: 0; z-index: 9999 !important; transform: translateZ(0); backface-visibility: hidden; }
</style>
