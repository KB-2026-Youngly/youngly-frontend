<template>
  <main class="onboarding-page">
    <section class="terms-panel">
      <header>
        <span class="step">YOUNGLY 시작하기 · 1/2</span>
        <h1>약관 필수 동의</h1>
        <p>안전한 서비스 이용을 위해 필수 약관을 확인해 주세요.</p>
      </header>

      <label class="all-agreement">
        <input v-model="agreeAll" type="checkbox" @change="toggleAll" />
        <span class="check-mark">✓</span>
        <strong>필수 약관 전체 동의</strong>
      </label>

      <div class="agreement-list">
        <label v-for="term in terms" :key="term.id">
          <input v-model="agreements" type="checkbox" :value="term.id" />
          <span class="check-mark">✓</span>
          <span>{{ term.label }}</span>
          <button type="button" aria-label="약관 자세히 보기">›</button>
        </label>
      </div>

      <footer>
        <button class="later-button" type="button" @click="router.replace('/bank-home')">다음에</button>
        <button class="confirm-button" type="button" :disabled="!allRequiredAgreed" @click="router.push('/onboarding/setup')">확인</button>
      </footer>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const terms = [
  { id: 1, label: '영리 서비스 이용약관 [필수]' },
  { id: 2, label: '개인정보 수집·이용·제공 동의서(영리) [필수]' },
  { id: 3, label: '개인(신용)정보 수집·이용·제공 동의서(KB금융그룹 오픈 API서비스용) [필수]' },
]
const agreements = ref([])
const agreeAll = ref(false)
const allRequiredAgreed = computed(() => agreements.value.length === terms.length)

watch(allRequiredAgreed, (value) => (agreeAll.value = value))
function toggleAll() {
  agreements.value = agreeAll.value ? terms.map((term) => term.id) : []
}
</script>

<style scoped>
:global(*){box-sizing:border-box}:global(body){margin:0}.onboarding-page{min-height:100dvh;padding:48px 20px;display:grid;place-items:center;background:linear-gradient(145deg,#f3edf9,#e5daf4);font-family:Pretendard,"Noto Sans KR",sans-serif}.terms-panel{width:min(620px,100%);padding:42px;border-radius:26px;background:#fff;box-shadow:0 18px 50px rgba(68,45,98,.13)}header{margin-bottom:28px}.step{color:#7353a2;font-size:11px;font-weight:900;letter-spacing:.5px}h1{margin:10px 0 8px;color:#30283a;font-size:28px}header p{margin:0;color:#8a8291;font-size:13px}.all-agreement,.agreement-list label{display:flex;align-items:center;gap:12px;cursor:pointer}.all-agreement{padding:19px;border:1px solid #cdbdde;border-radius:15px;background:#f7f2fc}.all-agreement input,.agreement-list input{position:absolute;opacity:0}.check-mark{width:24px;height:24px;display:grid;place-items:center;flex:0 0 24px;border:1px solid #c7bdcf;border-radius:50%;color:transparent;background:#fff;font-size:13px;font-weight:900}.all-agreement input:checked+.check-mark,.agreement-list input:checked+.check-mark{border-color:#69529f;color:#fff;background:#69529f}.all-agreement strong{color:#43374e;font-size:15px}.agreement-list{margin-top:12px;border-top:1px solid #eee9f2}.agreement-list label{min-height:68px;padding:12px 5px;border-bottom:1px solid #eee9f2}.agreement-list label>span:nth-of-type(2){color:#56505c;font-size:13px;line-height:1.5;word-break:keep-all}.agreement-list button{margin-left:auto;border:0;background:transparent;color:#a098a8;font-size:25px;cursor:pointer}footer{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:10px}footer button{height:52px;border-radius:12px;font-weight:800;cursor:pointer}.later-button{border:1px solid #d9d1df;background:#fff;color:#706978}.confirm-button{border:0;background:#69529f;color:#fff}.confirm-button:disabled{cursor:not-allowed;opacity:.35}@media(max-width:600px){.onboarding-page{padding:0;background:#fff;place-items:stretch}.terms-panel{min-height:100dvh;padding:34px 20px 24px;border-radius:0;box-shadow:none;display:flex;flex-direction:column}.terms-panel footer{margin-top:auto;padding-top:24px}h1{font-size:24px}.agreement-list label{min-height:74px}}
</style>
