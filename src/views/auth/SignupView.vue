<template>
  <div class="signup-page">
    <header class="header">
      <router-link to="/login" class="brand"><span>KB</span> 국민은행</router-link>
    </header>
    <main class="content">
      <p class="step">온라인고객 신규가입 <b>02</b> / 02</p>
      <h1>온라인고객 신규가입</h1>

      <section class="guide-box">
        <strong>온라인 고객으로 가입하시면 계좌조회 서비스를 이용하실 수 있습니다.</strong>
        <ul>
          <li>국민은행 입출금식 상품 계좌를 보유하신 고객에 한하여 신규 가입이 가능합니다.</li>
          <li>
            임의단체 또는 개인사업자, 기업 고객님께서는 국민은행 영업점을 방문하셔서 인터넷뱅킹에
            가입 후 이용하여 주시기 바랍니다. (인터넷을 통한 온라인고객 신규 가입은 불가능합니다.)
          </li>
          <li>
            정보통신부 개인정보보호지침고시에 따라 만 14세 미만 고객은 온라인 고객 가입이
            제한됩니다. 가까운 영업점에 방문하여 부모님께서 대리인으로 인터넷뱅킹에 가입하시고
            이용하시기 바랍니다.
          </li>
          <li>
            본인확인을 위해 고객정보에 등록된 전화번호로 ARS 전화인증이 필요합니다. 전화번호가 없는
            경우 가까운 영업점을 방문하여 주시기 바랍니다.
          </li>
          <li>
            생년월일은 실제 생일이 아닌, 주민등록번호 발급 시 신고한 생년월일을 입력해 주시기
            바랍니다.
          </li>
        </ul>
      </section>

      <form @submit.prevent="submitForm">
        <section class="section-card basic-card">
          <div class="section-heading">
            <div>
              <h2>기본정보 입력</h2>
              <p>안전한 금융서비스 이용을 위한 정보를 입력해 주세요.</p>
            </div>
            <p><b>*</b> 필수 입력 항목</p>
          </div>
          <div class="fields">
            <label v-for="field in fields" :key="field.key" class="form-field">
              <span class="label">{{ field.label }}<b>*</b></span>
              <input
                v-model="form[field.key]"
                :type="field.type || 'text'"
                :maxlength="field.maxlength"
                :disabled="infoConfirmed"
              />
              <span class="help"><img :src="infoIcon" alt="안내" />{{ field.help }}</span>
            </label>
          </div>
          <p v-if="infoError" class="inline-error">{{ infoError }}</p>
          <div class="confirm-row">
            <p v-if="infoConfirmed"><span>✓</span> 기본정보 확인이 완료되었습니다.</p>
            <button
              type="button"
              :class="{ edit: infoConfirmed }"
              :disabled="accountSearching"
              @click="toggleInfoConfirm"
            >
              {{ accountSearching ? '계좌 조회 중...' : infoConfirmed ? '수정하기' : '확인' }}
            </button>
          </div>
        </section>

        <section class="section-card interests-card">
          <div class="section-heading">
            <div>
              <h2>관심 분야</h2>
              <p>관심 있는 항목을 여러 개 선택할 수 있습니다.</p>
            </div>
          </div>
          <div class="interest-group">
            <h3>투자 관심 분야</h3>
            <div class="chips">
              <label v-for="item in investmentInterests" :key="item"
                ><input v-model="form.interests" type="checkbox" :value="item" /><span>{{
                  item
                }}</span></label
              >
            </div>
          </div>
          <div class="interest-group">
            <h3>일상 관심사</h3>
            <div class="chips">
              <label v-for="item in generalInterests" :key="item"
                ><input v-model="form.interests" type="checkbox" :value="item" /><span>{{
                  item
                }}</span></label
              >
            </div>
          </div>
        </section>

        <section class="section-card account-card">
          <div class="account-heading">
            <div>
              <h2>대표 개인 입출금 통장 연동 <b>필수</b></h2>
              <p>조회 및 자산관리에 사용할 대표계좌를 선택해 주세요.</p>
            </div>
            <div v-if="selectedAccount" class="selected-summary">
              <strong>{{ selectedAccount.accountNumber }}</strong
              ><span>{{ formatCurrency(selectedAccount.balance) }}원</span>
            </div>
            <button
              type="button"
              :disabled="!infoConfirmed || accountSearching"
              @click="toggleAccountList"
            >
              {{ accountSearching ? '조회 중' : selectedAccount ? '계좌 변경' : '계좌 선택' }}
              <span>{{ accountListOpen ? '⌃' : '⌄' }}</span>
            </button>
          </div>
          <div v-if="accountListOpen" class="account-list">
            <p v-if="!accounts.length" class="empty-accounts">
              입력한 이름과 생년월일로 조회된 입출금 통장이 없습니다.
            </p>
            <button
              v-for="account in accounts"
              :key="account.kbAccountId"
              type="button"
              :class="{ selected: selectedAccount?.kbAccountId === account.kbAccountId }"
              @click="selectAccount(account)"
            >
              <span class="bank-symbol">KB</span>
              <span class="account-name"
                ><b>{{ account.bankName }} 입출금 통장</b
                ><small>{{ account.accountNumber }}</small></span
              >
              <span class="balance"
                ><small>출금가능금액</small><b>{{ formatCurrency(account.balance) }}원</b></span
              >
              <i>✓</i>
            </button>
          </div>
        </section>

        <p v-if="error" class="page-error" role="alert">{{ error }}</p>
        <div class="actions">
          <button type="button" class="back" @click="$router.back()">이전</button
          ><button type="submit" class="submit" :disabled="submitting">
            {{ submitting ? '가입 처리 중...' : '가입하기' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchAccounts, registerAccount } from '@/api/account'
import { login, signup } from '@/api/auth'
import infoIcon from '@/assets/icons/loginIcon/i.png'

const router = useRouter()

const fields = [
  { key: 'name', label: '이름', help: '예: 홍길동' },
  { key: 'birthDate', label: '생년월일', help: '예: 1981년 2월 1일인 경우 : 810201', maxlength: 6 },
  { key: 'email', label: '이메일 주소', help: '예: example@kbstar.com', type: 'email' },
  { key: 'userId', label: '아이디', help: '6~10자, 공백 포함 불가', maxlength: 10 },
  {
    key: 'password',
    label: '비밀번호',
    help: '8~15자, 공백 포함 불가',
    type: 'password',
    maxlength: 15,
  },
  {
    key: 'passwordConfirm',
    label: '비밀번호 확인',
    help: '위에서 입력한 비밀번호를 한 번 더 입력해 주세요.',
    type: 'password',
    maxlength: 15,
  },
  { key: 'nickname', label: '닉네임', help: '2~10자, 공백 포함 불가', maxlength: 10 },
]
const investmentInterests = [
  'IT/테크',
  '금융',
  '헬스케어/바이오',
  '에너지/친환경',
  '소비재/유통',
  '부동산/리츠',
  '자동차/모빌리티',
  '엔터테인먼트/미디어',
  '반도체',
  '기타',
]
const generalInterests = [
  '여행',
  '운동/피트니스',
  '게임',
  '독서',
  '반려동물',
  '요리/맛집',
  '뷰티/패션',
  '자기계발',
  '음악/공연',
  '재테크/경제',
]
const accounts = ref([])
const form = reactive({
  name: '',
  birthDate: '',
  email: '',
  userId: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  interests: [],
})
const infoConfirmed = ref(false)
const infoError = ref('')
const accountListOpen = ref(false)
const selectedAccount = ref(null)
const error = ref('')
const accountSearching = ref(false)
const submitting = ref(false)
const signupAccessToken = ref('')
const basicComplete = computed(() => fields.every((field) => form[field.key].trim()))

function toBirthday(value) {
  if (!/^\d{6}$/.test(value)) return null
  const year = Number(value.slice(0, 2))
  const month = Number(value.slice(2, 4))
  const day = Number(value.slice(4, 6))
  const currentYear = new Date().getFullYear() % 100
  const fullYear = year <= currentYear ? 2000 + year : 1900 + year
  const lastDay = new Date(fullYear, month, 0).getDate()
  if (month < 1 || month > 12 || day < 1 || day > lastDay) return null
  return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function apiErrorMessage(apiError, fallback) {
  return apiError.response?.data?.message || apiError.response?.data?.error || fallback
}

async function toggleInfoConfirm() {
  if (infoConfirmed.value) {
    infoConfirmed.value = false
    accounts.value = []
    selectedAccount.value = null
    accountListOpen.value = false
    signupAccessToken.value = ''
    return
  }
  if (!basicComplete.value) {
    infoError.value = '필수 기본정보를 모두 입력해 주세요.'
    return
  }
  if (form.password !== form.passwordConfirm) {
    infoError.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }
  const birthday = toBirthday(form.birthDate)
  if (!birthday) {
    infoError.value = '생년월일을 YYMMDD 형식으로 정확히 입력해 주세요.'
    return
  }

  infoError.value = ''
  accountSearching.value = true
  try {
    const { data } = await searchAccounts({ name: form.name, birthday })
    accounts.value = (Array.isArray(data) ? data : []).filter(
      (account) => account.accountType === 'DEPOSIT',
    )
    selectedAccount.value = null
    accountListOpen.value = false
    infoConfirmed.value = true
  } catch (apiError) {
    infoError.value = apiErrorMessage(
      apiError,
      '계좌를 조회하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    )
  } finally {
    accountSearching.value = false
  }
}
function toggleAccountList() {
  if (!infoConfirmed.value || accountSearching.value) return
  accountListOpen.value = !accountListOpen.value
}
function selectAccount(account) {
  selectedAccount.value = account
  accountListOpen.value = false
  error.value = ''
}
function formatCurrency(value) {
  return value.toLocaleString('ko-KR')
}
async function submitForm() {
  if (!infoConfirmed.value) {
    error.value = '기본정보 입력 후 확인 버튼을 눌러 주세요.'
    return
  }
  if (!form.interests.length) {
    error.value = '관심 분야를 한 개 이상 선택해 주세요.'
    return
  }
  if (!selectedAccount.value) {
    error.value = '대표 개인 입출금 통장을 선택해 주세요.'
    toggleAccountList()
    return
  }
  error.value = ''
  submitting.value = true
  try {
    const investmentInterestIds = form.interests
      .filter((interest) => investmentInterests.includes(interest))
      .map((interest) => investmentInterests.indexOf(interest) + 1)
    const interestIds = form.interests
      .filter((interest) => generalInterests.includes(interest))
      .map((interest) => generalInterests.indexOf(interest) + 11)

    if (!signupAccessToken.value) {
      await signup({
        loginId: form.userId,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        birthday: toBirthday(form.birthDate),
        interestIds,
        investmentInterestIds,
      })

      const { data } = await login({
        loginId: form.userId,
        password: form.password,
      })
      if (!data?.accessToken) {
        throw new Error('로그인 응답에 JWT가 없습니다.')
      }
      signupAccessToken.value = data.accessToken
    }

    await registerAccount(selectedAccount.value.kbAccountId, signupAccessToken.value)
    await router.push('/login')
  } catch (apiError) {
    error.value = apiErrorMessage(apiError, '회원가입 처리 중 오류가 발생했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Pretendard, 'Noto Sans KR', Arial, sans-serif;
  color: #252525;
}
:global(button),
:global(input) {
  font: inherit;
}
.signup-page {
  min-height: 100vh;
  background: #ece5db;
}
.header {
  height: 76px;
  display: flex;
  align-items: center;
  background: #fff;
}
.brand {
  width: min(980px, calc(100% - 40px));
  margin: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #171717;
  text-decoration: none;
  font-size: 20px;
  font-weight: 800;
}
.brand > span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 30px;
  background: #ffcc00;
  font-size: 14px;
  transform: skew(-7deg);
}
.content {
  width: min(980px, calc(100% - 40px));
  margin: 58px auto 100px;
}
.step {
  margin: 0;
  color: #716b64;
  font-size: 13px;
}
.step b {
  color: #9b7900;
}
.content > h1 {
  margin: 12px 0 30px;
  font-size: 34px;
}
.guide-box {
  padding: 28px 30px;
  background: #fff;
}
.guide-box strong {
  display: block;
  margin-bottom: 13px;
  font-size: 15px;
}
.guide-box ul {
  margin: 0;
  padding-left: 18px;
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}
.section-card {
  margin-top: 28px;
  background: #fff;
}
.section-heading {
  padding: 28px 30px 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.section-heading h2,
.account-heading h2 {
  margin: 0;
  font-size: 21px;
}
.section-heading p,
.account-heading p {
  margin: 6px 0 0;
  color: #888;
  font-size: 12px;
}
.section-heading > p b,
.label b {
  margin-left: 4px;
  color: #d39f00;
}
.fields {
  padding: 0 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 28px;
}
.form-field {
  padding: 18px 0;
  border-top: 1px solid #eee;
}
.label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
}
.form-field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d7d7d7;
  background: #fff;
  outline: none;
}
.form-field input:focus {
  border-color: #b79519;
  box-shadow: 0 0 0 2px rgba(255, 204, 0, 0.18);
}
.form-field input:disabled {
  border-color: #eee;
  background: #f7f7f7;
  color: #777;
}
.help {
  min-height: 24px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #929292;
  font-size: 11px;
}
.help img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.inline-error,
.page-error {
  color: #c62828;
  font-size: 12px;
}
.inline-error {
  margin: 0 30px 12px;
}
.confirm-row {
  min-height: 82px;
  padding: 16px 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #eee;
  background: #fafafa;
}
.confirm-row p {
  margin-right: auto;
  color: #6b665d;
  font-size: 13px;
}
.confirm-row p span {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 7px;
  border-radius: 50%;
  background: #ffcc00;
  color: #222;
}
.confirm-row button {
  width: 150px;
  height: 46px;
  border: 0;
  background: #ffcc00;
  font-weight: 800;
  cursor: pointer;
}
.confirm-row button:disabled,
.account-heading > button:disabled,
.actions button:disabled {
  cursor: wait;
  opacity: 0.6;
}
.confirm-row button.edit {
  border: 1px solid #ccc;
  background: #fff;
}
.interest-group {
  margin: 0 30px;
  padding: 22px 0;
  border-top: 1px solid #eee;
}
.interest-group h3 {
  margin: 0 0 15px;
  font-size: 14px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.chips input {
  position: absolute;
  opacity: 0;
}
.chips span {
  display: block;
  padding: 10px 16px;
  border: 1px solid #dedede;
  border-radius: 23px;
  color: #686868;
  font-size: 12px;
  cursor: pointer;
  transition: 0.15s;
}
.chips input:checked + span {
  border-color: #ffcc00;
  background: #fff4bd;
  color: #292929;
  font-weight: 700;
}
.account-heading {
  min-height: 110px;
  padding: 27px 30px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.account-heading h2 b {
  margin-left: 7px;
  color: #9b7900;
  font-size: 11px;
}
.account-heading > div:first-child {
  margin-right: auto;
}
.account-heading > button {
  flex: 0 0 140px;
  height: 46px;
  border: 0;
  background: #ffcc00;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.account-heading > button span {
  margin-left: 7px;
  line-height: 1;
}
.selected-summary {
  text-align: right;
}
.selected-summary strong,
.selected-summary span {
  display: block;
}
.selected-summary strong {
  font-size: 14px;
}
.selected-summary span {
  margin-top: 6px;
  color: #777;
  font-size: 12px;
}
.account-list {
  padding: 0 30px 28px;
  display: grid;
  gap: 8px;
}
.empty-accounts {
  margin: 0;
  padding: 24px 16px;
  border: 1px solid #e0e0e0;
  color: #777;
  text-align: center;
  font-size: 13px;
}
.account-list > button {
  width: 100%;
  min-height: 82px;
  padding: 15px 18px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e0e0e0;
  background: #fff;
  text-align: left;
  cursor: pointer;
}
.account-list > button:hover,
.account-list > button.selected {
  border-color: #d3aa00;
  background: #fffdf4;
}
.bank-symbol {
  display: grid;
  place-items: center;
  width: 42px;
  height: 34px;
  background: #ffcc00;
  font-size: 12px;
  font-weight: 900;
}
.account-name b,
.account-name small,
.balance b,
.balance small {
  display: block;
}
.account-name small {
  margin-top: 6px;
  color: #888;
}
.balance {
  margin-left: auto;
  text-align: right;
}
.balance small {
  margin-bottom: 5px;
  color: #999;
}
.account-list i {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid #ccc;
  border-radius: 50%;
  color: transparent;
  font-style: normal;
}
.account-list > button.selected i {
  border-color: #ffcc00;
  background: #ffcc00;
  color: #222;
}
.page-error {
  margin: 25px 0 0;
  text-align: center;
}
.actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.actions button {
  width: 190px;
  height: 56px;
  border: 0;
  font-weight: 800;
  cursor: pointer;
}
.back {
  border: 1px solid #ccc !important;
  background: #fff;
}
.submit {
  background: #ffcc00;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}
.modal {
  width: min(420px, 100%);
  padding: 40px;
  background: #fff;
  text-align: center;
}
.modal > span {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: auto;
  border-radius: 50%;
  background: #ffcc00;
  font-size: 23px;
}
.modal h2 {
  margin: 20px 0 9px;
  font-size: 20px;
}
.modal p {
  color: #777;
  font-size: 13px;
}
.modal button {
  width: 100%;
  height: 50px;
  margin-top: 20px;
  border: 0;
  background: #ffcc00;
  font-weight: 800;
  cursor: pointer;
}
@media (max-width: 700px) {
  .header {
    height: 62px;
  }
  .content {
    margin: 38px auto 70px;
  }
  .content > h1 {
    font-size: 28px;
  }
  .guide-box {
    padding: 22px;
  }
  .fields {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }
  .section-heading {
    padding: 24px 20px 15px;
    align-items: flex-start;
    gap: 10px;
  }
  .confirm-row {
    padding: 15px 20px;
  }
  .interest-group {
    margin: 0 20px;
  }
  .account-heading {
    padding: 24px 20px;
    flex-wrap: wrap;
  }
  .selected-summary {
    order: 3;
    width: 100%;
    padding-top: 15px;
    border-top: 1px solid #eee;
    text-align: left;
  }
  .account-list {
    padding: 0 20px 22px;
  }
  .account-name {
    min-width: 0;
  }
  .balance {
    display: none;
  }
  .actions button {
    width: 50%;
  }
}
:global(html),
:global(body),
:global(#app) {
  min-height: 100%;
  background: #ece5db;
}
.signup-page {
  padding-bottom: 1px;
}
</style>
