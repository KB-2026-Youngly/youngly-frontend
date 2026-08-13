<template>
  <div class="first-login">
    <header class="kb-header">
      <a class="kb-logo" href="#" aria-label="KB국민은행" @click.prevent>
        <img :src="kbLogoImage" alt="KB국민은행" />
      </a>
      <div class="header-actions">
        <button class="search-button" type="button" aria-label="검색"><span></span></button>
        <button class="menu-button" type="button" aria-label="전체 메뉴"><i></i><i></i><i></i></button>
      </div>
    </header>

    <main class="certificate-login">
      <section class="certificate-title">
        <button class="fingerprint-register" type="button" @click="showToast('지문인증 등록 기능은 준비 중입니다.')">
          <img :src="fingerprintImage" alt="KB국민인증서 지문인증 등록" />
        </button>
      </section>

      <section class="pattern-area" aria-label="패턴 로그인">
        <div class="pattern-options">
          <label><input v-model="hidePattern" type="checkbox" /><span>✓</span> 패턴선 숨김</label>
          <i></i>
          <button type="button" @click="showToast('패턴 재설정 기능은 준비 중입니다.')">패턴 재설정</button>
        </div>
        <button class="pattern-grid" type="button" aria-label="패턴 입력" @click="showToast('등록된 패턴을 입력해 주세요.')">
          <span v-for="number in 9" :key="number" :class="{ hidden: hidePattern }"></span>
        </button>
      </section>

      <button class="other-login" type="button" @click="openLoginSheet('id')">
        다른 인증서/아이디로 로그인
      </button>
    </main>

    <button class="simple-service" type="button" @click="showToast('간편송금·결제 기능은 준비 중입니다.')">
      <img :src="moneyImage" alt="" /><b>간편송금·결제</b><strong>›</strong>
    </button>

    <transition name="fade">
      <div v-if="sheetOpen" class="sheet-backdrop" @click.self="closeSheet">
        <section class="login-sheet" :class="{ 'id-sheet': activeTab === 'id' }" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <button class="sheet-handle" type="button" aria-label="로그인 창 닫기" @click="closeSheet"></button>
          <h2 id="sheet-title" class="sr-only">다른 인증서 또는 아이디로 로그인</h2>

          <div class="sheet-tabs" role="tablist">
            <button
              v-for="tab in loginTabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >{{ tab.label }}</button>
          </div>

          <div v-if="activeTab !== 'id'" class="certificate-sheet-panel">
            <div class="sheet-cert-icon">{{ activeTab === 'joint' ? '공동' : '금융' }}</div>
            <h3>{{ activeTab === 'joint' ? '공동인증서' : '금융인증서' }}로 로그인</h3>
            <p>저장된 인증서를 선택해 안전하게 로그인해 주세요.</p>
            <button type="button" @click="showToast('인증서 로그인 기능은 준비 중입니다.')">인증서 선택</button>
          </div>

          <form v-else class="id-login-form" @submit.prevent="handleLogin">
            <label>
              <span>아이디</span>
              <input v-model.trim="form.userId" type="text" autocomplete="username" maxlength="20" placeholder="아이디를 입력해 주세요" />
            </label>
            <label>
              <span>사용자 암호</span>
              <div class="password-input">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" maxlength="30" placeholder="암호를 입력해 주세요" />
                <button type="button" @click="showPassword = !showPassword">{{ showPassword ? '숨김' : '보기' }}</button>
              </div>
            </label>
            <p v-if="error" class="login-error" role="alert">{{ error }}</p>
            <div class="login-links">
              <a href="#" @click.prevent="showToast('인증센터 기능은 준비 중입니다.')">인증센터</a>
              <a
                href="https://obank.kbstar.com/quics?page=C019875#loading"
                target="_blank"
                rel="noopener noreferrer"
                @click="closeSheet"
              >회원가입</a>
            </div>
            <button class="submit-login" type="submit" :disabled="submitting">{{ submitting ? '로그인 중...' : '로그인' }}</button>
          </form>
        </section>
      </div>
    </transition>

    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/auth'
import kbLogoImage from '@/assets/first_view/first_kb_logo.jpg'
import fingerprintImage from '@/assets/first_view/kb_jimoon.jpg'
import moneyImage from '@/assets/first_view/don.jpg'

const route = useRoute()
const router = useRouter()
const loginTabs = [
  { id: 'joint', label: '공동인증서' },
  { id: 'finance', label: '금융인증서' },
  { id: 'id', label: '아이디' },
]
const sheetOpen = ref(false)
const activeTab = ref('id')
const hidePattern = ref(false)
const showPassword = ref(false)
const rememberId = ref(false)
const submitting = ref(false)
const error = ref('')
const toast = ref('')
const form = reactive({ userId: '', password: '' })
let toastTimer

onMounted(() => {
  const savedId = localStorage.getItem('youngly_saved_login_id')
  if (savedId) { form.userId = savedId; rememberId.value = true }
  if (route.query.notice === 'account-deactivated') {
    showToast('회원 탈퇴가 완료되었습니다.')
    const nextQuery = { ...route.query }
    delete nextQuery.notice
    router.replace({ name: 'Login', query: nextQuery })
  }
})
onBeforeUnmount(() => { document.body.style.overflow = ''; clearTimeout(toastTimer) })
watch(sheetOpen, value => { document.body.style.overflow = value ? 'hidden' : '' })

function openLoginSheet(tab) { activeTab.value = tab; error.value = ''; sheetOpen.value = true }
function closeSheet() { sheetOpen.value = false; error.value = '' }
function showToast(message) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toast.value = ''), 2300) }
function apiErrorMessage(apiError) {
  if (!apiError.response) return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.'
  return apiError.response?.data?.message || apiError.response?.data?.error || `로그인에 실패했습니다. (HTTP ${apiError.response.status})`
}
async function handleLogin() {
  if (!form.userId || !form.password) { error.value = '아이디와 사용자 암호를 모두 입력해 주세요.'; return }
  error.value = ''; submitting.value = true
  try {
    const { data } = await login({ loginId: form.userId, password: form.password })
    if (!data?.accessToken) throw new Error('로그인 응답에 JWT가 없습니다.')
    localStorage.setItem('youngly_access_token', data.accessToken)
    localStorage.setItem('youngly_user', JSON.stringify({ userId: data.userId, loginId: data.loginId, nickname: data.nickname }))
    if (rememberId.value) localStorage.setItem('youngly_saved_login_id', form.userId)
    else localStorage.removeItem('youngly_saved_login_id')
    document.body.style.overflow = ''
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/bank-home'
    await router.replace(redirect)
  } catch (apiError) {
    localStorage.removeItem('youngly_access_token'); localStorage.removeItem('youngly_user')
    error.value = apiErrorMessage(apiError)
  } finally { submitting.value = false }
}
</script>

<style scoped>
/* Reference-image replacements */
.kb-logo img{display:block;width:clamp(145px,17vw,180px);height:auto}
.fingerprint-register{display:block!important;margin:10px auto 0!important;padding:0!important;border:0!important;background:transparent!important;text-decoration:none!important}
.fingerprint-register img{display:block;width:min(150px,39vw);height:auto}
.simple-service>img{width:31px;height:31px;object-fit:contain}
.pattern-grid{margin-bottom:6px!important}
.pattern-grid span{width:17px!important;height:17px!important}
.other-login{width:min(280px,calc(100% - 48px))!important;height:48px!important}
.login-sheet{padding-top:32px!important}
.sheet-handle{top:11px!important}
.sheet-tabs{padding:3px!important}
.sheet-tabs button{height:36px!important;padding:0 6px!important;font-size:15px!important;line-height:1!important}
.id-login-form{padding-top:10px!important}
.login-links{margin:12px 0 14px!important}
.submit-login{height:54px!important;font-size:18px!important}
.login-sheet.id-sheet{min-height:390px;display:flex;flex-direction:column}
.id-sheet .id-login-form{flex:1;display:flex;flex-direction:column}
.id-sheet .login-links{margin-top:auto!important}
.id-login-form input{height:40px!important}
.id-login-form>label>span{padding-top:8px!important}
.id-login-form>label+label{margin-top:10px}
:global(*){box-sizing:border-box}:global(body){margin:0;color:#202124;font-family:Pretendard,"Noto Sans KR",Arial,sans-serif;background:#fff}:global(button),:global(input){font:inherit}.first-login{min-height:100dvh;display:flex;flex-direction:column;background:#fff}.kb-header{height:86px;padding:0 clamp(24px,6vw,68px);display:flex;align-items:center;justify-content:space-between;background:#fff}.kb-logo{display:flex;align-items:center;gap:8px;color:#5d5b58;text-decoration:none}.kb-symbol{color:#ffbd00;font-family:cursive;font-size:32px;font-weight:900;font-style:italic}.kb-symbol span{font-size:21px}.kb-logo b{font-size:25px}.kb-logo strong{font-size:22px;letter-spacing:-1px}.header-actions{display:flex;align-items:center;gap:28px}.header-actions button{border:0;background:none;cursor:pointer}.search-button{width:34px;height:38px;position:relative}.search-button span{position:absolute;left:2px;top:2px;width:24px;height:24px;border:3px solid #202124;border-radius:50%}.search-button span::after{content:"";position:absolute;right:-8px;bottom:-7px;width:13px;height:3px;background:#202124;transform:rotate(48deg)}.menu-button{width:38px;padding:3px}.menu-button i{display:block;height:3px;margin:8px 0;background:#202124}.certificate-login{flex:1;min-height:650px;padding:70px 20px 26px;display:flex;flex-direction:column;align-items:center}.certificate-title{text-align:center}.certificate-title>p{margin:0 0 7px;color:#c59a00;font-size:10px;font-weight:800;letter-spacing:3px}.certificate-title h1{margin:0;font-size:38px;font-weight:500;letter-spacing:-2px}.certificate-title button{margin-top:14px;border:0;background:none;color:#666;font-size:17px;text-decoration:underline;text-underline-offset:5px;cursor:pointer}.fingerprint{color:#d5ab00;font-size:22px}.pattern-area{width:min(390px,100%);margin-top:auto}.pattern-options{display:flex;align-items:center;justify-content:center;gap:20px;color:#555}.pattern-options label{display:flex;align-items:center;gap:8px;cursor:pointer}.pattern-options input{position:absolute;opacity:0}.pattern-options label span{width:28px;height:28px;display:grid;place-items:center;border:2px solid #aeb5bd;border-radius:50%;color:transparent}.pattern-options input:checked+span{color:#8d98a3}.pattern-options i{width:1px;height:25px;background:#ddd}.pattern-options button{padding:0;border:0;background:none;color:#444;text-decoration:underline;text-underline-offset:5px;cursor:pointer}.pattern-grid{width:280px;height:280px;margin:20px auto 25px;padding:30px;display:grid;grid-template-columns:repeat(3,1fr);place-items:center;border:0;background:none;cursor:pointer}.pattern-grid span{width:24px;height:24px;border-radius:50%;background:#929ca6;transition:.2s}.pattern-grid span.hidden{opacity:.4}.other-login{width:min(330px,calc(100% - 20px));height:58px;border:1px solid #aab0b5;background:#fff;color:#4e5053;font-size:16px;cursor:pointer}.simple-service{height:98px;flex:0 0 98px;border:0;background:#f7f7f7;display:flex;align-items:center;justify-content:center;gap:14px;color:#303236;cursor:pointer}.simple-service>span{width:31px;height:31px;display:grid;place-items:center;position:relative;border-radius:50%;background:#ffca18;color:#8c6c00;font-weight:900}.simple-service>span i{position:absolute;right:-10px;bottom:-3px;color:#3989d8;font-style:normal}.simple-service b{font-size:18px;font-weight:500}.simple-service strong{font-size:34px;font-weight:300}.sheet-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.43);z-index:50}.login-sheet{position:absolute;right:0;bottom:0;left:0;max-height:92dvh;overflow-y:auto;padding:42px 28px 0;border-radius:28px 28px 0 0;background:#fff;box-shadow:0 -10px 35px rgba(0,0,0,.13)}.sheet-handle{position:absolute;top:16px;left:50%;width:58px;height:7px;border:0;border-radius:5px;background:#9ba4ad;transform:translateX(-50%);cursor:pointer}.sheet-tabs{display:grid;grid-template-columns:repeat(3,1fr);padding:6px;border-radius:5px;background:#eef0f3}.sheet-tabs button{height:60px;border:0;border-right:1px solid #d5d8dd;background:transparent;color:#64686e;font-size:18px;font-weight:700;cursor:pointer}.sheet-tabs button:last-child{border-right:0}.sheet-tabs button.active{border:0;border-radius:4px;background:#fff;color:#17191b;box-shadow:0 1px 6px rgba(0,0,0,.08)}.id-login-form,.certificate-sheet-panel{width:min(620px,100%);margin:auto}.id-login-form{padding:22px 0 0}.id-login-form>p:first-child{margin:0 0 18px;color:#444;font-size:14px}.id-login-form>label:not(.save-id){display:block;border-bottom:1px solid #dfe2e6}.id-login-form>label>span{display:block;padding-top:14px;color:#8b8f95;font-size:13px}.id-login-form input{width:100%;height:48px;border:0;outline:0;background:#fff;font-size:17px}.password-input{display:flex;align-items:center}.password-input button{flex:0 0 48px;border:0;background:none;color:#777;font-size:12px;cursor:pointer}.save-id{display:flex;align-items:center;gap:7px;margin-top:14px;color:#666;font-size:13px}.save-id input{width:17px;height:17px;accent-color:#ffcf28}.login-error{margin:12px 0 0;color:#d32f2f;font-size:12px}.login-links{display:flex;justify-content:center;margin:18px 0 22px}.login-links a{padding:0 16px;border-right:1px solid #ddd;color:#555;text-decoration:none;font-size:13px}.login-links a:last-child{border:0}.submit-login{width:calc(100% + 56px);height:76px;margin-left:-28px;border:0;background:#ffd337;color:#171717;font-size:22px;font-weight:800;cursor:pointer}.submit-login:disabled{opacity:.65;cursor:wait}.certificate-sheet-panel{padding:35px 0 38px;text-align:center}.sheet-cert-icon{width:70px;height:70px;margin:auto;display:grid;place-items:center;border-radius:20px;background:#fff3bd;color:#695600;font-size:14px;font-weight:900}.certificate-sheet-panel h3{margin:18px 0 8px}.certificate-sheet-panel p{margin:0;color:#777;font-size:13px}.certificate-sheet-panel button{width:min(330px,100%);height:52px;margin-top:24px;border:0;background:#ffd337;font-weight:800;cursor:pointer}.toast{position:fixed;left:50%;bottom:115px;z-index:100;padding:12px 19px;border-radius:5px;background:rgba(25,25,25,.9);color:#fff;font-size:12px;transform:translateX(-50%);white-space:nowrap}.fade-enter-active,.fade-leave-active{transition:opacity .2s}.fade-enter-active .login-sheet,.fade-leave-active .login-sheet{transition:transform .25s ease}.fade-enter-from,.fade-leave-to{opacity:0}.fade-enter-from .login-sheet,.fade-leave-to .login-sheet{transform:translateY(100%)}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(min-width:768px){.certificate-login{padding-top:50px}.certificate-title h1{font-size:42px}.pattern-grid{width:260px;height:260px}.login-sheet{right:50%;left:auto;width:min(680px,calc(100% - 40px));border-radius:28px 28px 0 0;transform:translateX(50%)}.fade-enter-from .login-sheet,.fade-leave-to .login-sheet{transform:translate(50%,100%)}.submit-login{width:calc(100% + 56px)}}
@media(max-width:480px){.kb-header{height:70px;padding:0 22px}.kb-symbol{font-size:26px}.kb-logo b{font-size:21px}.kb-logo strong{font-size:19px}.header-actions{gap:18px}.search-button{transform:scale(.85)}.menu-button{width:34px}.certificate-login{min-height:580px;padding-top:70px}.certificate-title h1{font-size:33px}.certificate-title button{font-size:15px}.pattern-area{width:100%}.pattern-grid{width:260px;height:260px;padding:28px}.pattern-grid span{width:22px;height:22px}.pattern-options{gap:14px;font-size:14px}.pattern-options label span{width:25px;height:25px}.other-login{height:54px}.simple-service{height:86px;flex-basis:86px}.login-sheet{padding-right:20px;padding-left:20px}.sheet-tabs button{height:54px;font-size:15px}.submit-login{width:calc(100% + 40px);margin-left:-20px}.login-links a{padding:0 10px}}
</style>
