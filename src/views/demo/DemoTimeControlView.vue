<template>
  <section class="demo-time-page">
    <div class="demo-time-shell">
      <header class="demo-heading">
        <span>DEMO CONTROLLER</span>
        <h1>시연 시간 제어</h1>
        <p>서비스 날짜를 이동하고 지나간 날짜의 예약 작업을 하루씩 빠짐없이 실행합니다.</p>
      </header>

      <div v-if="loading" class="demo-state">서버 시간을 확인하고 있어요.</div>
      <div v-else-if="loadError" class="demo-state demo-state--error">
        <span>{{ loadError }}</span>
        <button type="button" @click="loadCurrentTime">다시 시도</button>
      </div>

      <template v-else>
        <article class="clock-card">
          <small>{{ status?.overridden ? '가상 시간 적용 중' : '실제 서버 시간' }}</small>
          <strong>{{ formattedCurrentDate }}</strong>
          <span>{{ formattedCurrentTime }}</span>
          <i :class="{ active: status?.overridden }">{{ status?.overridden ? 'DEMO' : 'REAL' }}</i>
        </article>

        <article class="control-card">
          <div class="card-heading">
            <div><small>빠른 이동</small><h2>며칠 뒤로 이동할까요?</h2></div>
            <span v-if="selectedDays">+{{ selectedDays }}일</span>
          </div>
          <div class="quick-days">
            <button
              v-for="days in quickDays"
              :key="days"
              type="button"
              :class="{ active: selectedDays === days }"
              @click="selectQuickDays(days)"
            >
              +{{ days }}일
            </button>
          </div>

          <label class="manual-date">
            <span>직접 날짜 선택</span>
            <input v-model="targetDate" type="date" @input="selectedDays = null" />
          </label>

          <label class="market-toggle">
            <span><b>시장 데이터 스케줄러 포함</b><small>선택하면 이동하는 날짜마다 함께 실행됩니다.</small></span>
            <input v-model="includeMarketScheduler" type="checkbox" />
          </label>

          <button class="apply-button" type="button" :disabled="executing || !targetDate" @click="applyTime">
            {{ executing ? `${executionLabel} 처리 중...` : `${targetDate || '날짜'} 적용하기` }}
          </button>
        </article>

        <article v-if="lastResult" class="result-card">
          <div class="card-heading"><div><small>실행 결과</small><h2>{{ lastResult.targetDate }} 적용 완료</h2></div><span>{{ lastResult.executedDayCount }}일</span></div>
          <div class="result-grid">
            <div><span>자동 승인</span><strong>{{ totals.autoApproved }}건</strong></div>
            <div><span>주간 결산</span><strong>{{ totals.weeklySettled }}명</strong></div>
            <div><span>라운드 전환</span><strong>{{ totals.transitioned }}개</strong></div>
            <div><span>최종 정산</span><strong>{{ totals.settled }}개</strong></div>
          </div>
          <p v-if="lastResult.marketSchedulerExecutionCount">시장 스케줄러 {{ lastResult.marketSchedulerExecutionCount }}회 실행</p>
          <p v-if="lastResult.warning" class="result-warning">{{ lastResult.warning }}</p>
          <details v-if="failureMessages.length">
            <summary>실패 내역 {{ failureMessages.length }}건</summary>
            <ul><li v-for="failure in failureMessages" :key="failure">{{ failure }}</li></ul>
          </details>
        </article>

        <div class="page-actions">
          <button type="button" @click="router.push('/home')">홈으로 이동</button>
          <button type="button" :disabled="executing || !status?.overridden" @click="resetTime">실제 시간으로 초기화</button>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { advanceDemoTime, applyDemoDate, getDemoTime, resetDemoTime } from '@/api/demoTime'
import { syncDemoTime } from '@/utils/demoTime'

const router = useRouter()
const quickDays = [1, 3, 7, 27]
const status = ref(null)
const loading = ref(true)
const loadError = ref('')
const executing = ref(false)
const selectedDays = ref(null)
const targetDate = ref('')
const includeMarketScheduler = ref(true)
const lastResult = ref(null)

const currentDate = computed(() => status.value?.currentDateTime ? new Date(status.value.currentDateTime) : null)
const formattedCurrentDate = computed(() => currentDate.value
  ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(currentDate.value)
  : '-')
const formattedCurrentTime = computed(() => currentDate.value
  ? new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(currentDate.value)
  : '-')
const executionLabel = computed(() => selectedDays.value ? `+${selectedDays.value}일` : targetDate.value)
const dailyBatches = computed(() => Array.isArray(lastResult.value?.dailyBatches) ? lastResult.value.dailyBatches : [])
const totals = computed(() => dailyBatches.value.reduce((sum, batch) => ({
  autoApproved: sum.autoApproved + Number(batch.autoApprovedPostCount || 0),
  weeklySettled: sum.weeklySettled + Number(batch.weeklySettledParticipantCount || 0),
  transitioned: sum.transitioned + Number(batch.transitionedGroupCount || 0),
  settled: sum.settled + Number(batch.settledGroupCount || 0),
}), { autoApproved: 0, weeklySettled: 0, transitioned: 0, settled: 0 }))
const failureMessages = computed(() => dailyBatches.value.flatMap((batch) => batch.failures || []))

function dateString(date) {
  return date.toLocaleDateString('sv-SE')
}

function selectQuickDays(days) {
  selectedDays.value = days
  const base = currentDate.value || new Date()
  const target = new Date(base)
  target.setDate(target.getDate() + days)
  targetDate.value = dateString(target)
}

function applyResponse(data) {
  status.value = data
  lastResult.value = data
  syncDemoTime(data)
  selectedDays.value = null
  targetDate.value = data.targetDate || dateString(new Date(data.currentDateTime))
}

async function loadCurrentTime() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await getDemoTime()
    status.value = data
    syncDemoTime(data)
    targetDate.value = data.targetDate || dateString(new Date(data.currentDateTime))
  } catch (error) {
    loadError.value = error.response?.data?.message || '서버 시간을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function applyTime() {
  if (!targetDate.value || executing.value) return
  executing.value = true
  try {
    const response = selectedDays.value
      ? await advanceDemoTime(selectedDays.value, includeMarketScheduler.value)
      : await applyDemoDate(targetDate.value, includeMarketScheduler.value)
    applyResponse(response.data)
  } catch (error) {
    window.alert(error.response?.data?.message || '가상 날짜를 적용하지 못했습니다.')
  } finally {
    executing.value = false
  }
}

async function resetTime() {
  if (executing.value) return
  executing.value = true
  try {
    const { data } = await resetDemoTime()
    applyResponse(data)
  } catch (error) {
    window.alert(error.response?.data?.message || '실제 시간으로 초기화하지 못했습니다.')
  } finally {
    executing.value = false
  }
}

onMounted(loadCurrentTime)
</script>

<style scoped>
.demo-time-page{min-height:100%;padding:24px 20px 110px;box-sizing:border-box;background:#e6dcf6;color:#30293a}.demo-time-shell{width:min(760px,100%);margin:0 auto}.demo-heading>span,.card-heading small{color:#7457a1;font-size:10px;font-weight:900;letter-spacing:.08em}.demo-heading h1{margin:7px 0 8px;font-size:27px}.demo-heading p{margin:0 0 22px;color:#756c7d;font-size:12px;line-height:1.7}.clock-card,.control-card,.result-card,.demo-state{position:relative;margin-bottom:16px;padding:21px;border:2px solid #ac99d2;border-radius:18px;background:#fff;box-shadow:0 7px 0 rgba(105,82,159,.16);box-sizing:border-box}.clock-card{display:grid;gap:6px}.clock-card small{color:#867b8f;font-size:11px}.clock-card strong{font-size:23px}.clock-card>span{color:#7156ad;font-size:15px}.clock-card i{position:absolute;top:20px;right:20px;padding:5px 8px;border-radius:999px;background:#ece8ef;color:#817889;font-size:9px;font-style:normal;font-weight:900}.clock-card i.active{background:#7156ad;color:#fff}.card-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.card-heading h2{margin:5px 0 0;font-size:18px}.card-heading>span{padding:6px 9px;border-radius:9px;background:#f1ebf8;color:#65488f;font-size:11px;font-weight:900}.quick-days{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:18px}.quick-days button{min-height:44px;border:1.5px solid #c8badb;border-radius:12px;background:#faf8fd;color:#66566f;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.quick-days button.active{border-color:#7156ad;background:#7156ad;color:#fff}.manual-date{display:grid;gap:8px;margin-top:18px;color:#6f6478;font-size:11px;font-weight:800}.manual-date input{width:100%;height:46px;padding:0 13px;border:1.5px solid #cfc4dc;border-radius:12px;box-sizing:border-box;background:#fff;color:#3c3444;font:inherit}.market-toggle{margin-top:14px;padding:13px;display:flex;align-items:center;justify-content:space-between;gap:15px;border-radius:12px;background:#f7f3fb}.market-toggle span{display:grid;gap:4px}.market-toggle b{font-size:11px}.market-toggle small{color:#8e8497;font-size:9px}.market-toggle input{width:19px;height:19px;accent-color:#7156ad}.apply-button{width:100%;min-height:48px;margin-top:16px;border:0;border-radius:13px;background:#7156ad;color:#fff;font:inherit;font-size:13px;font-weight:900;cursor:pointer}.apply-button:disabled{cursor:wait;opacity:.55}.result-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:17px}.result-grid>div{padding:12px 8px;display:grid;gap:6px;border-radius:11px;background:#f7f4fa;text-align:center}.result-grid span{color:#83788c;font-size:9px}.result-grid strong{font-size:14px}.result-card>p{margin:13px 0 0;color:#786d81;font-size:10px}.result-card .result-warning{color:#a26427}.result-card details{margin-top:13px;color:#a64f4f;font-size:10px}.result-card ul{padding-left:18px;line-height:1.6}.page-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.page-actions button,.demo-state button{min-height:43px;border:1.5px solid #9e89bf;border-radius:12px;background:#fff;color:#60458f;font:inherit;font-size:11px;font-weight:800}.page-actions button:disabled{opacity:.45}.demo-state{display:grid;min-height:180px;place-items:center;color:#776d80}.demo-state--error{color:#a85050}
@media(max-width:600px){.demo-time-page{padding:18px 16px 105px}.demo-heading h1{font-size:23px}.clock-card,.control-card,.result-card,.demo-state{padding:17px;border-radius:15px}.clock-card strong{padding-right:55px;font-size:19px}.quick-days{grid-template-columns:repeat(2,1fr)}.result-grid{grid-template-columns:repeat(2,1fr)}.page-actions{grid-template-columns:1fr}}
</style>
