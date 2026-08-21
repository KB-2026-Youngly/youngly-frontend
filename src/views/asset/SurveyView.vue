<template>
  <section class="survey-page">
    <div class="survey-shell">
      <button type="button" class="back" @click="router.push({ name: 'PensionInsight' })"><ArrowLeft :size="16" aria-hidden="true" /> 인사이트로 돌아가기</button>
      <header><span>INVESTMENT SURVEY</span><h1>투자 성향 설문</h1><p>각 문항에서 현재 나와 가장 가까운 답변을 선택해 주세요.</p></header>
      <div v-if="loading" class="survey-card-shadow yl-stepped-card-shadow"><div class="state yl-card-frame pixel-step-card">설문을 불러오는 중이에요.</div></div>
      <div v-else-if="error" class="survey-card-shadow yl-stepped-card-shadow"><div class="state yl-card-frame pixel-step-card" role="alert"><p>{{ error }}</p><button type="button" @click="loadQuestions">다시 시도</button></div></div>
      <form v-else @submit.prevent="submit">
        <div v-for="question in questions" :key="question.questionId" class="survey-card-shadow yl-stepped-card-shadow"><section class="question-card yl-card-frame pixel-step-card"><h2><span class="question-number">{{ question.questionNo }}.</span><span>{{ question.questionText }}</span></h2><label v-for="choice in question.choices" :key="choice.choiceId"><input v-model="answers[question.questionNo]" :name="`question-${question.questionNo}`" type="radio" :value="choice.choiceId" required><span>{{ choice.choiceText }}</span></label></section></div>
        <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
        <button class="submit" type="submit" :disabled="submitting">{{ submitting ? '제출 중...' : '설문 완료하기' }} <ChevronRight :size="17" aria-hidden="true" /></button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getSurveyQuestions, submitSurvey } from '@/api/survey'

const router = useRouter(); const questions = ref([]); const answers = reactive({}); const loading = ref(true); const error = ref(''); const submitting = ref(false); const submitError = ref('')
async function loadQuestions() { loading.value = true; error.value = ''; try { const { data } = await getSurveyQuestions(); questions.value = Array.isArray(data) ? data : [] } catch { error.value = '설문을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' } finally { loading.value = false } }
async function submit() { submitting.value = true; submitError.value = ''; try { await submitSurvey(questions.value.map((question) => ({ questionNo: question.questionNo, choiceId: answers[question.questionNo] }))); await router.replace({ name: 'PensionInsight' }) } catch { submitError.value = '설문을 제출하지 못했어요. 선택 내용을 확인한 뒤 다시 시도해 주세요.' } finally { submitting.value = false } }
onMounted(loadQuestions)
</script>

<style scoped>
.survey-page,.survey-page *{box-sizing:border-box;font-family:Pretendard,'Noto Sans KR',Arial,sans-serif!important}.survey-page{width:100%;min-height:calc(100dvh - 68px);padding:22px 20px 110px;background:#e6dcf6;color:#302b38}.survey-shell{width:100%;max-width:680px;margin:0 auto}.back{display:inline-flex;align-items:center;gap:7px;padding:0;border:0;color:#5c477c;background:transparent;font:inherit;font-size:14px;font-weight:800;cursor:pointer}header{margin:28px 0 22px}.survey-page header span{color:#7353a2;font-size:11px;font-weight:900;letter-spacing:.08em}.survey-page h1{margin:8px 0;font-size:27px;line-height:1.25}.survey-page header p{margin:0;color:#766e7d;font-size:14px;line-height:1.65;word-break:keep-all}form{display:grid;gap:16px}.question-card,.state{min-inline-size:0;margin:0;padding:20px 18px;border:1px solid rgba(105,82,159,.14);border-radius:17px;background:#fff;box-shadow:0 8px 20px rgba(49,37,72,.05)}.question-card h2{max-width:100%;margin:0 0 14px;color:#40364c;font-size:16px;font-weight:800;line-height:1.5;word-break:keep-all}label{min-height:52px;margin-top:10px;padding:12px 15px;display:flex;align-items:center;gap:12px;border:1px solid transparent;border-radius:11px;color:#51485b;background:#f8f6fb;font-size:14px;font-weight:700;line-height:1.45;cursor:pointer;transition:border-color .15s,background .15s}label:first-of-type{margin-top:0}label:has(input:checked){border-color:#b8a4db;color:#51357d;background:#f2ecfc}input{width:18px;height:18px;flex:0 0 auto;margin:0;accent-color:#69529f}.state{text-align:center;color:#655c6d}.state p,.submit-error{margin:0;color:#b04842}.state button,.submit{min-height:50px;padding:0 16px;border:0;border-radius:11px;color:#fff;background:#69529f;font:inherit;font-size:14px;font-weight:800;cursor:pointer}.state button{margin-top:14px}.submit{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:7px}.submit:disabled{opacity:.55;cursor:wait}@media(min-width:768px){.survey-page{min-height:calc(100vh - 80px);padding:28px 32px 72px}.survey-page h1{font-size:30px}.question-card,.state{padding:24px}.back{font-size:15px}label{font-size:15px}}
.back,header{display:none}.survey-page{padding-top:12px}.question-card,.state{padding:24px 20px 20px}.question-card h2{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;column-gap:6px;margin-bottom:18px;color:#302b38}.question-number{white-space:nowrap}label{color:#39343f}.state{color:#4b4651}@media(min-width:768px){.survey-page{padding-top:18px}.question-card,.state{padding:28px 24px 24px}}
.survey-card-shadow{--yl-stepped-shadow-color:#c8b7e5;--yl-stepped-shadow-offset:5px}.survey-card-shadow .pixel-step-card{--pixel-outline-width:2px;--pixel-outline-color:#ac99d2;--pixel-fill:#fff;filter:none!important}
</style>
