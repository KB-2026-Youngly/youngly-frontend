<template>
  <div class="login-page">
    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">WELCOME TO YOUNGLY</p>
          <h1>로그인</h1>
          <p>습관이 개인연금으로, MZ맞춤 자산관리 서비스</p>
        </div>
        <img class="starfriend" :src="starfriendImage" alt="KB 스타프렌즈" />
      </section>

      <section class="login-section" aria-labelledby="login-title">
        <h2 id="login-title" class="sr-only">로그인 방법 선택</h2>
        <div class="login-card">
          <div class="tabs" role="tablist">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div v-if="activeTab === 'kb'" class="certificate-panel">
            <div class="cert-icon"><span>KB</span><i>✓</i></div>
            <h3>KB국민인증서로 로그인</h3>
            <p>KB스타뱅킹 앱에서 QR코드를 스캔해 주세요.</p>
            <button
              class="primary-button"
              type="button"
              @click="showMessage('QR코드가 생성되었습니다.')"
            >
              QR코드 생성하기
            </button>
            <a href="#" @click.prevent="showMessage('인증서 발급 메뉴를 준비 중입니다.')"
              >KB국민인증서 발급 안내 <b>›</b></a
            >
          </div>

          <div v-else-if="activeTab === 'cert'" class="certificate-panel">
            <div class="cert-icon document"><span>인증서</span><i>✓</i></div>
            <h3>공동·금융인증서 로그인</h3>
            <p>저장된 인증서를 선택하여 안전하게 로그인하세요.</p>
            <button
              class="primary-button"
              type="button"
              @click="showMessage('인증서 선택 창을 준비 중입니다.')"
            >
              인증서 로그인
            </button>
            <a href="#" @click.prevent="showMessage('인증서 관리 메뉴를 준비 중입니다.')"
              >인증서 발급 및 관리 <b>›</b></a
            >
          </div>

          <form v-else class="id-panel" @submit.prevent="handleLogin">
            <div class="field">
              <label for="user-id">아이디</label>
              <input
                id="user-id"
                v-model.trim="form.userId"
                type="text"
                maxlength="15"
                autocomplete="username"
                placeholder="아이디를 입력해 주세요"
              />
            </div>
            <div class="field">
              <label for="password">사용자암호</label>
              <div class="password-field">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  maxlength="15"
                  autocomplete="current-password"
                  placeholder="사용자암호를 입력해 주세요"
                />
                <button
                  type="button"
                  :aria-label="showPassword ? '암호 숨기기' : '암호 보기'"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '숨김' : '보기' }}
                </button>
              </div>
            </div>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <label class="remember"
              ><input v-model="rememberId" type="checkbox" /> <span>아이디 저장</span></label
            >
            <button class="primary-button" type="submit" :disabled="submitting">
              {{ submitting ? '로그인 중...' : '로그인' }}
            </button>
            <div class="account-links">
              <a href="#" @click.prevent>아이디 조회</a>
              <a href="#" @click.prevent>사용자암호 재설정</a>
              <router-link to="/signup/terms">회원가입</router-link>
            </div>
          </form>
        </div>

        <div class="quick-links">
          <a v-for="item in quickLinks" :key="item.title" href="#" @click.prevent>
            <img class="quick-icon" :src="item.icon" alt="" />
            <span
              ><b>{{ item.title }}</b
              ><small>{{ item.description }}</small></span
            >
            <strong>›</strong>
          </a>
        </div>

        <ul class="notice-list">
          <li>인터넷뱅킹 종료 후 안전한 금융거래를 위해 반드시 로그아웃해 주세요.</li>
          <li>로그인 설정에서 자주 이용하는 로그인 방식을 지정할 수 있습니다.</li>
        </ul>
      </section>
    </main>

    <footer>
      <div>
        <span>고객센터 <b>1588-9999</b></span
        ><span>전자민원접수</span><span>개인정보처리방침</span>
      </div>
      <p>Copyright KB Kookmin Bank. All Rights Reserved.</p>
    </footer>

    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/auth'
import loginIcon1 from '@/assets/icons/loginIcon/1.png'
import loginIcon2 from '@/assets/icons/loginIcon/2.png'
import loginIcon3 from '@/assets/icons/loginIcon/3.png'
import loginIcon4 from '@/assets/icons/loginIcon/4.png'
import starfriendImage from '@/assets/icons/loginIcon/starfriend.png'

const route = useRoute()
const router = useRouter()

const tabs = [
  { id: 'kb', label: 'KB국민인증서' },
  { id: 'cert', label: '공동·금융인증서' },
  { id: 'id', label: '아이디 로그인' },
]
const quickLinks = [
  { icon: loginIcon1, title: 'KB국민인증서 발급', description: '간편하고 안전한 인증' },
  { icon: loginIcon2, title: '인증센터', description: '인증서 발급·관리' },
  { icon: loginIcon3, title: '로그인 설정', description: '로그인 방식 설정' },
  { icon: loginIcon4, title: '이용 안내', description: '안전한 금융거래 안내' },
]

const activeTab = ref('id')
const showPassword = ref(false)
const rememberId = ref(false)
const error = ref('')
const toast = ref('')
const submitting = ref(false)
const form = reactive({ userId: '', password: '' })
let toastTimer

onMounted(() => {
  const savedId = localStorage.getItem('youngly_saved_login_id')
  if (savedId) {
    form.userId = savedId
    rememberId.value = true
  }
})

function showMessage(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2500)
}

function apiErrorMessage(apiError) {
  if (!apiError.response) {
    return `서버에 연결할 수 없습니다. 현재 접속 주소(${window.location.host})와 PC 네트워크를 확인해 주세요.`
  }

  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    `로그인 요청에 실패했습니다. (HTTP ${apiError.response.status})`
  )
}

async function handleLogin() {
  if (!form.userId || !form.password) {
    error.value = '아이디와 사용자암호를 모두 입력해 주세요.'
    return
  }
  error.value = ''
  submitting.value = true
  try {
    const { data } = await login({ loginId: form.userId, password: form.password })
    if (!data?.accessToken) throw new Error('로그인 응답에 JWT가 없습니다.')

    localStorage.setItem('youngly_access_token', data.accessToken)
    localStorage.setItem(
      'youngly_user',
      JSON.stringify({ userId: data.userId, loginId: data.loginId, nickname: data.nickname }),
    )
    if (rememberId.value) localStorage.setItem('youngly_saved_login_id', form.userId)
    else localStorage.removeItem('youngly_saved_login_id')

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    await router.replace(redirect)
  } catch (apiError) {
    localStorage.removeItem('youngly_access_token')
    localStorage.removeItem('youngly_user')
    error.value = apiErrorMessage(apiError)
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
  color: #262626;
  font-family: Pretendard, 'Noto Sans KR', Arial, sans-serif;
  background: #fff;
}
:global(button),
:global(input) {
  font: inherit;
}
.login-page {
  min-height: 100vh;
  background: #fff;
}
.site-header {
  height: 76px;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.header-inner {
  width: min(1120px, calc(100% - 40px));
  height: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #171717;
  text-decoration: none;
  font-weight: 800;
  font-size: 20px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 30px;
  background: #ffcc00;
  font-size: 14px;
  font-weight: 900;
  transform: skew(-7deg);
}
.utility {
  display: flex;
  align-items: center;
  gap: 30px;
}
.utility a {
  color: #555;
  font-size: 14px;
  text-decoration: none;
}
.utility button {
  width: 28px;
  padding: 3px;
  border: 0;
  background: none;
  cursor: pointer;
}
.utility button span {
  display: block;
  height: 2px;
  margin: 5px 0;
  background: #222;
}
.hero {
  height: 178px;
  background: linear-gradient(115deg, #fff7c7, #f4f3ed 58%, #ece9dc);
  overflow: hidden;
  position: relative;
}
.hero > div {
  width: min(1120px, calc(100% - 40px));
  margin: auto;
  padding-top: 34px;
  position: relative;
  z-index: 1;
}
.hero .eyebrow {
  margin: 0 0 6px;
  color: #8a7433;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
}
.hero h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -1.5px;
}
.hero p:last-child {
  margin: 8px 0 0;
  color: #6b6659;
  font-size: 14px;
}
.starfriend {
  position: absolute;
  right: max(40px, calc((100% - 1060px) / 2));
  bottom: 8px;
  width: 285px;
  max-height: 165px;
  object-fit: contain;
  object-position: bottom;
  z-index: 1;
}
.login-section {
  width: 100%;
  margin: 0;
  padding: clamp(32px, 4vw, 48px) clamp(20px, 4vw, 40px) clamp(48px, 6vw, 70px);
  background: #ece5db;
}
.login-card {
  width: min(900px, 100%);
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
}
.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid #d8d8d8;
}
.tabs button {
  height: 68px;
  border: 0;
  border-right: 1px solid #e3e3e3;
  background: #f7f7f7;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  position: relative;
}
.tabs button:last-child {
  border-right: 0;
}
.tabs button.active {
  background: #fff;
  color: #111;
  font-weight: 800;
}
.tabs button.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 4px;
  background: #ffcc00;
}
.id-panel,
.certificate-panel {
  width: min(520px, calc(100% - 48px));
  min-height: 355px;
  margin: auto;
  padding: 42px 0 38px;
}
.field {
  margin-bottom: 17px;
}
.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
}
.field input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #cfcfcf;
  outline: none;
}
.field input:focus {
  border: 2px solid #222;
}
.password-field {
  position: relative;
}
.password-field input {
  padding-right: 64px;
}
.password-field button {
  position: absolute;
  right: 8px;
  top: 7px;
  height: 38px;
  border: 0;
  background: none;
  color: #777;
  font-size: 12px;
  cursor: pointer;
}
.remember {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  color: #555;
  font-size: 13px;
  cursor: pointer;
}
.remember input {
  width: 18px;
  height: 18px;
  accent-color: #ffcc00;
}
.primary-button {
  width: 100%;
  height: 54px;
  border: 0;
  background: #ffcc00;
  color: #1b1b1b;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
}
.primary-button:hover {
  background: #f3be00;
}
.primary-button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.account-links {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}
.account-links a {
  padding: 0 15px;
  border-right: 1px solid #ddd;
  color: #555;
  font-size: 13px;
  text-decoration: none;
}
.account-links a:last-child {
  border: 0;
}
.error {
  margin: -5px 0 14px;
  color: #d32f2f;
  font-size: 13px;
}
.certificate-panel {
  text-align: center;
}
.cert-icon {
  width: 76px;
  height: 76px;
  margin: 2px auto 18px;
  display: grid;
  place-items: center;
  border: 2px solid #222;
  border-radius: 18px;
  position: relative;
  font-weight: 900;
}
.cert-icon::before {
  content: '';
  position: absolute;
  inset: 8px;
  background: #ffcc00;
  z-index: 0;
}
.cert-icon span {
  z-index: 1;
}
.cert-icon i {
  position: absolute;
  right: -7px;
  bottom: -7px;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #222;
  color: #fff;
  font-style: normal;
  font-size: 13px;
}
.cert-icon.document {
  border-radius: 4px;
  font-size: 12px;
}
.certificate-panel h3 {
  margin: 0 0 10px;
  font-size: 21px;
}
.certificate-panel p {
  margin: 0 0 25px;
  color: #777;
  font-size: 14px;
}
.certificate-panel .primary-button {
  max-width: 350px;
}
.certificate-panel > a {
  display: block;
  margin-top: 20px;
  color: #555;
  font-size: 13px;
  text-decoration: none;
}
.quick-links {
  width: min(900px, 100%);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0 auto;
  background: #f8f8f8;
}
.quick-links a {
  min-height: 112px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 13px;
  color: #222;
  text-decoration: none;
}
.quick-icon {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.quick-links b,
.quick-links small {
  display: block;
}
.quick-links b {
  margin-bottom: 5px;
  font-size: 13px;
}
.quick-links small {
  color: #888;
  font-size: 11px;
}
.quick-links strong {
  margin-left: auto;
  color: #aaa;
  font-size: 22px;
  font-weight: 300;
}
.notice-list {
  width: min(900px, 100%);
  margin: 28px auto 0;
  padding: 22px 24px 22px 42px;
  background: #f7f7f7;
  color: #777;
  font-size: 12px;
  line-height: 1.9;
}
footer {
  padding: 26px 20px 32px;
  border-top: 1px solid #eee;
  color: #888;
  text-align: center;
  font-size: 11px;
}
footer div {
  display: flex;
  justify-content: center;
  gap: 24px;
}
footer b {
  color: #444;
}
footer p {
  margin: 12px 0 0;
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 35px;
  transform: translateX(-50%);
  padding: 13px 22px;
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.92);
  color: #fff;
  font-size: 13px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 700px) {
  .site-header {
    height: 62px;
  }
  .utility a {
    display: none;
  }
  .hero {
    height: 145px;
  }
  .hero > div {
    padding-top: 27px;
  }
  .hero h1 {
    font-size: 28px;
  }
  .starfriend {
    right: -25px;
    width: 190px;
    opacity: 0.6;
  }
  .hero > div {
    z-index: 2;
  }
  .login-section {
    padding: 24px 16px 40px;
  }
  .login-card {
    border: 0;
    box-shadow: none;
  }
  .tabs button {
    height: 60px;
    padding: 0 6px;
    font-size: 12px;
  }
  .id-panel,
  .certificate-panel {
    width: 100%;
    min-height: 0;
    padding: 32px 20px 34px;
  }
  .account-links a {
    padding: 0 9px;
    font-size: 12px;
  }
  .quick-links {
    grid-template-columns: 1fr 1fr;
    width: 100%;
    margin: 0;
  }
  .quick-links a {
    min-height: 88px;
  }
  .notice-list {
    width: 100%;
    margin: 24px 0 0;
    padding: 20px 20px 20px 36px;
  }
  footer div {
    flex-wrap: wrap;
    gap: 10px 18px;
  }
}
@media (max-width: 430px) {
  .hero > div {
    width: calc(100% - 32px);
  }
  .hero p:last-child {
    max-width: 65%;
    line-height: 1.45;
  }
  .login-section {
    padding-inline: 12px;
  }
  .tabs button {
    min-width: 0;
    height: 56px;
    padding-inline: 4px;
    line-height: 1.35;
    word-break: keep-all;
  }
  .id-panel,
  .certificate-panel {
    padding-inline: 16px;
  }
  .account-links {
    flex-wrap: wrap;
    row-gap: 10px;
  }
  .account-links a {
    padding-inline: 8px;
  }
  .quick-links a {
    min-width: 0;
    padding: 18px 12px;
    gap: 8px;
  }
  .quick-icon {
    flex-basis: 38px;
    width: 38px;
    height: 38px;
  }
  .quick-links strong {
    display: none;
  }
}
</style>
