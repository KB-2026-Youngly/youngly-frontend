<template>
  <main class="onboarding-page">
    <section class="setup-panel">
      <header>
        <span>YOUNGLY 시작하기 · 2/2</span>
        <h1>나에게 맞는 Youngly 설정</h1>
        <p>관심 분야와 대표 입출금 통장을 선택해 주세요.</p>
      </header>

      <section class="setup-section">
        <div class="section-title"><b>관심 분야</b><small>여러 개 선택할 수 있어요</small></div>
        <div v-for="group in interestGroups" :key="group.label" class="interest-group">
          <h2>{{ group.label }}</h2>
          <div class="interest-chips">
            <label v-for="item in group.items" :key="item.id">
              <input v-model="selectedInterestIds" type="checkbox" :value="item.id" @change="handleInterestChange(item.id)" />
              <span>{{ item.name }}</span>
            </label>
          </div>
        </div>
      </section>

      <section class="setup-section">
        <div class="section-title"><b>대표 개인 입출금 통장</b><small>Youngly에서 사용할 계좌예요</small></div>
        <div v-if="loading" class="state">계좌를 불러오고 있어요.</div>
        <div v-else-if="accounts.length" class="account-list">
          <label v-for="account in accounts" :key="account.kbAccountId" :class="{ selected: selectedAccountId === account.kbAccountId }">
            <input v-model="selectedAccountId" type="radio" :value="account.kbAccountId" />
            <span class="radio-mark"></span>
            <div><strong>{{ account.bankName }} 입출금 통장</strong><small>{{ account.accountNumber }}</small></div>
            <b class="yl-money">{{ formatCurrency(account.balance) }}원</b>
          </label>
        </div>
        <div v-else class="state error">{{ error || '연결할 수 있는 입출금 통장이 없습니다.' }}</div>
      </section>

      <section class="notification-row">
        <div><strong>푸시 알림 받기</strong><small>챌린지와 자산 관련 소식을 알려드려요.</small></div>
        <label class="toggle"><input v-model="notificationAgreement" type="checkbox" /><span></span></label>
      </section>

      <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
      <button class="complete-button" type="button" :disabled="!canSubmit || submitting" @click="submitOnboarding">{{ submitting ? '설정 저장 중...' : 'Youngly 시작하기' }}</button>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchAccounts } from '@/api/account'
import { completeOnboarding, getMyInfo } from '@/api/user'

const router = useRouter()
const investmentNames = ['IT/테크','금융','헬스케어/바이오','에너지/친환경','소비재/유통','부동산/리츠','자동차/모빌리티','엔터테인먼트/미디어','반도체','해당 없음']
const generalNames = ['여행','운동/피트니스','게임','독서','반려동물','요리/맛집','뷰티/패션','자기계발','음악/공연','재테크/경제']
const interestGroups = [
  { label: '투자 관심 분야', items: investmentNames.map((name,index) => ({ id:index+1,name })) },
  { label: '일상 관심사', items: generalNames.map((name,index) => ({ id:index+11,name })) },
]
const accounts = ref([])
const selectedInterestIds = ref([])
const selectedAccountId = ref('')
const notificationAgreement = ref(false)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')
const canSubmit = computed(() => selectedInterestIds.value.length > 0 && Boolean(selectedAccountId.value))

onMounted(loadSetup)
async function loadSetup() {
  loading.value = true
  try {
    const { data: user } = await getMyInfo()
    if (user.isNotificationAgreement != null) { await router.replace('/home'); return }
    const { data } = await searchAccounts({ name:user.name, birthday:user.birthday })
    accounts.value = (Array.isArray(data) ? data : []).filter((account) => account.accountType === 'DEPOSIT')
    if (accounts.value.length === 1) selectedAccountId.value = accounts.value[0].kbAccountId
  } catch (requestError) {
    error.value = requestError.response?.data?.message || '계좌를 불러오지 못했습니다.'
  } finally { loading.value = false }
}
async function submitOnboarding() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true; submitError.value = ''
  try {
    await completeOnboarding({ interestIds:selectedInterestIds.value, kbAccountId:selectedAccountId.value, isNotificationAgreement:notificationAgreement.value })
    await router.replace('/youngly-loading')
  } catch (requestError) {
    submitError.value = requestError.response?.data?.message || '초기 설정을 저장하지 못했습니다.'
  } finally { submitting.value = false }
}
function handleInterestChange(interestId) {
  const noInvestmentInterestId = 10

  if (interestId === noInvestmentInterestId && selectedInterestIds.value.includes(interestId)) {
    selectedInterestIds.value = selectedInterestIds.value.filter(
      (id) => id >= noInvestmentInterestId,
    )
    return
  }

  if (interestId < noInvestmentInterestId && selectedInterestIds.value.includes(interestId)) {
    selectedInterestIds.value = selectedInterestIds.value.filter(
      (id) => id !== noInvestmentInterestId,
    )
  }
}
function formatCurrency(value) { return Number(value || 0).toLocaleString('ko-KR') }
</script>

<style scoped>
:global(*){box-sizing:border-box}:global(body){margin:0}.onboarding-page{min-height:100dvh;padding:38px 20px;background:linear-gradient(145deg,#f3edf9,#e5daf4);font-family:Pretendard,"Noto Sans KR",sans-serif}.setup-panel{width:min(760px,100%);margin:auto;padding:38px;border-radius:26px;background:#fff;box-shadow:0 18px 50px rgba(68,45,98,.13)}header>span{color:#7353a2;font-size:11px;font-weight:900}h1{margin:9px 0 7px;color:#30283a;font-size:27px}header p{margin:0;color:#8a8291;font-size:13px}.setup-section{margin-top:26px;padding-top:23px;border-top:1px solid #eee9f2}.section-title{display:flex;align-items:end;justify-content:space-between;gap:10px}.section-title b{color:#3b3145;font-size:17px}.section-title small{color:#918999;font-size:11px}.interest-group{margin-top:18px}.interest-group h2{margin:0 0 10px;color:#756d7c;font-size:12px}.interest-chips{display:flex;flex-wrap:wrap;gap:8px}.interest-chips input,.account-list input{position:absolute;opacity:0}.interest-chips span{min-height:36px;padding:0 13px;display:flex;align-items:center;border:1px solid #ddd5e5;border-radius:999px;color:#6c6474;background:#fff;font-size:12px;font-weight:700;cursor:pointer}.interest-chips input:checked+span{border-color:#69529f;color:#fff;background:#69529f}.state{margin-top:15px;padding:28px;border-radius:13px;background:#f8f5fa;color:#8a8291;text-align:center;font-size:12px}.state.error{color:#a84e4e}.account-list{margin-top:14px;display:grid;gap:9px}.account-list label{min-height:76px;padding:14px;display:flex;align-items:center;gap:12px;border:1px solid #e0d9e7;border-radius:13px;cursor:pointer}.account-list label.selected{border-color:#9274ba;background:#f7f2fc}.radio-mark{width:20px;height:20px;display:grid;place-items:center;flex:0 0 20px;border:1px solid #bab1c3;border-radius:50%;background:#fff}.radio-mark::after{content:"";width:10px;height:10px;border-radius:50%;background:#69529f;opacity:0}.account-list input:checked+.radio-mark::after{opacity:1}.account-list div{display:grid;gap:5px}.account-list div strong{color:#403748;font-size:13px}.account-list div small{color:#8f8796;font-size:11px}.account-list label>b{margin-left:auto;color:#4e3a68;font-size:13px}.notification-row{margin-top:26px;padding:19px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-radius:15px;background:#f7f3fb}.notification-row>div{display:grid;gap:5px}.notification-row strong{color:#403649;font-size:14px}.notification-row small{color:#8c8493;font-size:11px}.toggle input{position:absolute;opacity:0}.toggle>span{width:48px;height:27px;display:block;position:relative;border-radius:999px;background:#c9c3ce;cursor:pointer}.toggle>span::after{content:"";width:21px;height:21px;position:absolute;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s}.toggle input:checked+span{background:#69529f}.toggle input:checked+span::after{transform:translateX(21px)}.submit-error{margin:15px 0 0;color:#b34e4e;font-size:12px;text-align:center}.complete-button{width:100%;height:54px;margin-top:22px;border:0;border-radius:13px;background:#69529f;color:#fff;font-weight:900;cursor:pointer}.complete-button:disabled{cursor:not-allowed;opacity:.38}@media(max-width:600px){.onboarding-page{padding:0;background:#fff}.setup-panel{min-height:100dvh;padding:30px 20px;border-radius:0;box-shadow:none}h1{font-size:23px}.section-title{align-items:start;flex-direction:column}.account-list label{flex-wrap:wrap}.account-list label>b{width:calc(100% - 32px);margin-left:32px}.notification-row{padding:16px}.complete-button{position:sticky;bottom:12px;box-shadow:0 8px 25px rgba(70,48,101,.25)}}
</style>
