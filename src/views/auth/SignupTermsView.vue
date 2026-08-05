<template>
  <div class="page-shell">
    <header class="header">
      <router-link to="/login" class="brand"><span>KB</span> 국민은행</router-link>
    </header>
    <main class="content">
      <p class="step">온라인고객 신규가입 <b>01</b> / 02</p>
      <h1>약관 동의</h1>
      <p class="lead">온라인고객 신규가입을 위해 약관에 동의해 주세요.</p>

      <section class="terms-card">
        <label class="all-check">
          <input v-model="allChecked" type="checkbox" @change="toggleAll" />
          <span class="round-check">✓</span>
          <strong>전체 약관 동의</strong>
          <button class="view-all" type="button" @click.prevent="expanded = !expanded">
            <span>전체약관보기</span><i>{{ expanded ? '⌃' : '⌄' }}</i>
          </button>
        </label>
        <div v-if="expanded" class="terms-preview">
          전자금융거래 및 서비스 이용, 온라인고객 가입을 위한 개인정보 수집·이용에 관한 약관입니다.
        </div>
        <label v-for="(term, index) in terms" :key="term" class="term-row">
          <input v-model="checks[index]" type="checkbox" @change="syncAll" />
          <span class="square-check">✓</span><span><b>[필수]</b> {{ term }}</span>
          <button type="button" aria-label="약관 보기">›</button>
        </label>
      </section>

      <p v-if="error" class="error" role="alert">필수 약관에 모두 동의해 주세요.</p>
      <div class="actions">
        <button class="cancel" type="button" @click="$router.push('/login')">취소</button>
        <button class="confirm" type="button" @click="continueSignup">확인</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const terms = [
  '전자금융거래기본약관',
  '전자금융서비스이용약관',
  '개인(신용)정보 수집·이용 동의서(온라인고객 신규가입)',
]
const checks = reactive([false, false, false])
const allChecked = ref(false)
const expanded = ref(false)
const error = ref(false)
function toggleAll() {
  checks.forEach((_, i) => (checks[i] = allChecked.value))
  error.value = false
}
function syncAll() {
  allChecked.value = checks.every(Boolean)
  error.value = false
}
function continueSignup() {
  if (!checks.every(Boolean)) {
    error.value = true
    return
  }
  router.push('/signup')
}
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Pretendard, 'Noto Sans KR', Arial, sans-serif;
  color: #222;
}
.page-shell {
  min-height: 100vh;
  background: #fafafa;
}
.header {
  height: 76px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.brand {
  width: min(900px, calc(100% - 40px));
  margin: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #171717;
  text-decoration: none;
  font-size: 20px;
  font-weight: 800;
}
.brand span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 30px;
  background: #ffcc00;
  font-size: 14px;
  transform: skew(-7deg);
}
.content {
  width: min(760px, calc(100% - 40px));
  margin: 64px auto;
}
.step {
  color: #777;
  font-size: 13px;
}
.step b {
  color: #d2a900;
}
.content h1 {
  margin: 12px 0 8px;
  font-size: 34px;
}
.lead {
  margin: 0 0 34px;
  color: #777;
}
.terms-card {
  border: 1px solid #ddd;
  background: #fff;
}
.all-check,
.term-row {
  min-height: 72px;
  padding: 0 26px;
  display: flex;
  align-items: center;
  gap: 13px;
  cursor: pointer;
}
.all-check {
  border-bottom: 1px solid #ddd;
  background: #f8f8f8;
}
.all-check input,
.term-row input {
  position: absolute;
  opacity: 0;
}
.round-check,
.square-check {
  display: grid;
  place-items: center;
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  border: 1px solid #bbb;
  color: transparent;
}
.round-check {
  border-radius: 50%;
}
.all-check input:checked + .round-check,
.term-row input:checked + .square-check {
  border-color: #ffcc00;
  background: #ffcc00;
  color: #222;
}
.all-check button,
.term-row button {
  margin-left: auto;
  border: 0;
  background: none;
  color: #666;
  cursor: pointer;
}
.term-row {
  border-bottom: 1px solid #eee;
  font-size: 14px;
}
.term-row:last-child {
  border-bottom: 0;
}
.term-row b {
  color: #9a7d00;
}
.terms-preview {
  padding: 18px 65px;
  background: #fffdf1;
  color: #777;
  font-size: 13px;
  line-height: 1.7;
}
.actions {
  margin-top: 34px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.actions button {
  width: 180px;
  height: 54px;
  border: 1px solid #ccc;
  font-weight: 800;
  cursor: pointer;
}
.cancel {
  background: #fff;
}
.confirm {
  border-color: #ffcc00 !important;
  background: #ffcc00;
}
.error {
  text-align: center;
  color: #d32f2f;
  font-size: 13px;
}
@media (max-width: 600px) {
  .header {
    height: 62px;
  }
  .content {
    margin: 40px auto;
  }
  .content h1 {
    font-size: 28px;
  }
  .all-check,
  .term-row {
    padding: 15px;
    min-height: 66px;
  }
  .term-row span:nth-child(3) {
    line-height: 1.5;
  }
  .actions button {
    width: 50%;
  }
}
.view-all {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.view-all i {
  display: block;
  line-height: 1;
  font-style: normal;
  font-size: 17px;
}
</style>
