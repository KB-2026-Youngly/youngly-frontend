<template>
  <div class="bank-home">
    <header class="bank-header">
      <button class="profile" type="button">
        <img :src="familyImage" alt="패밀리" />
      </button>
      <div ref="userMenuRef" class="user-menu">
        <button
          class="user-name"
          type="button"
          :aria-expanded="userMenuOpen"
          aria-haspopup="menu"
          @click="userMenuOpen = !userMenuOpen"
        >
          {{ displayName }}님 <span :class="{ open: userMenuOpen }">›</span>
        </button>
        <transition name="user-dropdown">
          <div v-if="userMenuOpen" class="user-dropdown" role="menu">
            <button type="button" role="menuitem" :disabled="loggingOut" @click="handleLogout">
              <span aria-hidden="true">↪</span>
              {{ loggingOut ? '로그아웃 중...' : '로그아웃' }}
            </button>
          </div>
        </transition>
      </div>
      <div class="header-actions">
        <img :src="headerMenuImage" alt="알림, 검색, 전체 메뉴" />
      </div>
    </header>

    <main>
      <button class="youngly-banner" type="button" :disabled="enteringYoungly" @click="enterYoungly">
        <span class="banner-content">
          <span class="banner-label">MZ 맞춤 자산관리</span>
          <span class="banner-copy"><span class="yellow-letter">영</span>차영차 쌓은 오늘의 습관<br /><span class="yellow-letter">리</span>치한 내일을 만드는 자산으로</span>
          <span class="banner-link">{{ enteringYoungly ? '확인 중...' : 'Youngly 시작하기' }} <b>→</b></span>
        </span>
        <img class="banner-logo" :src="younglyLogoImage" alt="Youngly" />
      </button>

      <button class="all-account" type="button" @click="router.push('/asset')">
        <strong>내 계좌 전체보기</strong><span>›</span>
      </button>

      <section class="account-card">
        <div class="account-heading">
          <div><img class="kb-account-icon" :src="kbIconImage" alt="KB" /><strong>{{ depositAccount ? 'KB마이핏통장' : '대표 입출금 통장' }}</strong></div>
          <button type="button" aria-label="계좌 메뉴">⋮</button>
        </div>
        <p class="account-number">{{ depositAccount?.accountNumber || '연결된 계좌가 없습니다' }} <button v-if="depositAccount" type="button" aria-label="계좌번호 복사" @click="copyAccountNumber"><img :src="accountNumberImage" alt="" /></button></p>
        <div class="balance"><span class="yl-money"><strong>{{ formatCurrency(depositAccount?.balance) }}</strong>원</span> <button type="button">숨김</button></div>
        <div class="account-buttons">
          <button type="button">이체</button><button type="button">전용화면</button>
        </div>
      </section>

      <div class="carousel-indicator">
        <button type="button" :disabled="depositAccounts.length <= 1" aria-label="이전 계좌" @click="showPreviousAccount">‹</button>
        <span>{{ currentAccountNumber }}/{{ totalAccountCount }}</span>
        <button type="button" :disabled="depositAccounts.length <= 1" aria-label="다음 계좌" @click="showNextAccount">›</button>
      </div>

      <section class="summary-card">
        <span>나의 총 자산</span>
        <button type="button" @click="router.push('/asset')">내 자산 한눈에 확인하기 ›</button>
      </section>
      <section class="summary-card card-spending">
        <span>이번 주 카드결제</span><strong class="yl-money">0원</strong>
      </section>

    </main>

    <nav class="bottom-nav" aria-label="은행 메뉴">
      <img :src="bottomMenuImage" alt="상품, 자산, 지갑, 혜택, 테마" />
    </nav>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAccount, searchAccounts } from '@/api/account'
import { logout } from '@/api/auth'
import { getMyInfo } from '@/api/user'
import familyImage from '@/assets/second_view/famliy.png'
import headerMenuImage from '@/assets/second_view/header_menu.png'
import accountNumberImage from '@/assets/second_view/account_number.png'
import bottomMenuImage from '@/assets/second_view/bottom_menu.png'
import kbIconImage from '@/assets/icons/kb_icon.png'
import younglyLogoImage from '@/assets/icons/yl_logo.png'

const router = useRouter()
const depositAccounts = ref([])
const currentAccountIndex = ref(0)
const depositAccount = computed(() => depositAccounts.value[currentAccountIndex.value] || null)
const totalAccountCount = computed(() => Math.max(depositAccounts.value.length, 1))
const currentAccountNumber = computed(() => depositAccounts.value.length ? currentAccountIndex.value + 1 : 1)
const currentUser = ref(null)
const enteringYoungly = ref(false)
const userMenuOpen = ref(false)
const loggingOut = ref(false)
const userMenuRef = ref(null)
const displayName = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('youngly_user') || '{}')
    return user.nickname || user.loginId || 'Youngly'
  } catch {
    return 'Youngly'
  }
})

onMounted(async () => {
  document.addEventListener('pointerdown', closeUserMenu)
  const [userResult, accountResult] = await Promise.allSettled([
    getMyInfo(),
    getAccount('DEPOSIT'),
  ])
  if (userResult.status === 'fulfilled') currentUser.value = userResult.value.data
  if (currentUser.value?.name && currentUser.value?.birthday) {
    try {
      const { data } = await searchAccounts({
        name: currentUser.value.name,
        birthday: currentUser.value.birthday,
      })
      depositAccounts.value = (Array.isArray(data) ? data : []).filter(
        (account) => account.accountType === 'DEPOSIT',
      )
    } catch {
      depositAccounts.value = []
    }
  }
  if (!depositAccounts.value.length && accountResult.status === 'fulfilled' && accountResult.value.data) {
    depositAccounts.value = [accountResult.value.data]
  }
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeUserMenu))

function closeUserMenu(event) {
  if (!userMenuRef.value?.contains(event.target)) userMenuOpen.value = false
}

function showPreviousAccount() {
  if (depositAccounts.value.length <= 1) return
  currentAccountIndex.value =
    (currentAccountIndex.value - 1 + depositAccounts.value.length) % depositAccounts.value.length
}

function showNextAccount() {
  if (depositAccounts.value.length <= 1) return
  currentAccountIndex.value = (currentAccountIndex.value + 1) % depositAccounts.value.length
}

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logout()
  } catch {
    // 서버 응답 여부와 관계없이 브라우저 인증 정보를 정리한다.
  } finally {
    localStorage.removeItem('youngly_access_token')
    localStorage.removeItem('youngly_user')
    userMenuOpen.value = false
    loggingOut.value = false
    await router.replace('/login')
  }
}

async function enterYoungly() {
  if (enteringYoungly.value) return
  enteringYoungly.value = true
  try {
    const user = currentUser.value || (await getMyInfo()).data
    currentUser.value = user
    await router.push(
      user.isNotificationAgreement == null ? '/onboarding/terms' : '/youngly-loading',
    )
  } finally {
    enteringYoungly.value = false
  }
}

async function copyAccountNumber() {
  if (!depositAccount.value?.accountNumber) return
  await navigator.clipboard?.writeText(depositAccount.value.accountNumber)
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}
</script>

<style scoped>
:global(body){background:#f2f3f5}.bank-home{width:100%;min-height:100dvh;padding-bottom:92px;background:#f2f3f5;color:#202124;font-family:Pretendard,"Noto Sans KR",sans-serif}.bank-header{height:82px;padding:0 clamp(18px,5vw,44px);display:flex;align-items:center;background:#fff}.bank-header button{border:0;background:none;cursor:pointer}.profile{height:42px;padding:3px 12px 3px 4px!important;display:flex;align-items:center;gap:7px;border:1px solid #cdd1d5!important;border-radius:23px!important}.family-mark{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:#52ae2d;color:#fff;font-weight:800}.family-text{color:#4a4d50;font-size:16px;font-weight:700}.user-name{margin-left:14px;font-size:19px;font-weight:800}.user-name span{margin-left:4px;color:#676d72;font-size:29px;font-weight:400;vertical-align:-2px}.header-actions{margin-left:auto;display:flex;align-items:center;gap:22px}.header-actions button{width:30px;height:34px;position:relative;padding:0}.bell{font-size:27px;line-height:1}.header-actions i{position:absolute;right:2px;top:0;width:7px;height:7px;border-radius:50%;background:#ff4d4f}.search::before{content:"";position:absolute;inset:3px 5px 8px 2px;border:3px solid #42474c;border-radius:50%}.search::after{content:"";position:absolute;right:1px;bottom:3px;width:12px;height:3px;background:#42474c;transform:rotate(48deg)}.menu b{display:block;height:2px;margin:7px 0;background:#42474c}.bank-home main{width:min(760px,100%);margin:auto;padding:0 26px}.youngly-banner{width:100%;min-height:180px;padding:32px 38px;display:flex;align-items:center;position:relative;overflow:hidden;border:3px solid #ffd134;background:linear-gradient(130deg,#24a8e0,#008dd0);color:#101418;text-align:left;cursor:pointer}.banner-copy{font-size:clamp(22px,4.5vw,31px);font-weight:800;letter-spacing:-1.5px;line-height:1.35}.banner-copy strong{color:#ffd137}.temporary-logo{margin-left:auto;padding-left:22px;color:#fff;font-size:20px;font-weight:900;white-space:nowrap}.temporary-logo i{width:42px;height:42px;display:inline-grid;place-items:center;margin-right:5px;border:2px solid #fff;border-radius:50%;font-style:normal}.banner-arrow{position:absolute;right:18px;bottom:10px;color:#fff;font-size:32px}.all-account{width:100%;height:82px;margin-top:20px;padding:0 30px;display:flex;align-items:center;justify-content:space-between;border:0;border-radius:22px;background:#fff;cursor:pointer}.all-account strong{font-size:24px;text-decoration:underline 9px #fff0a6;text-underline-offset:-4px}.all-account span{font-size:35px;color:#555}.account-card{margin-top:24px;padding:34px 42px 38px;border-radius:25px;background:#fff;box-shadow:0 12px 28px rgba(20,28,36,.05)}.account-heading{display:flex;justify-content:space-between}.account-heading>div{display:flex;align-items:center;gap:10px}.account-heading strong{font-size:22px;color:#5a6066}.kb-mark{width:35px;height:35px;display:grid;place-items:center;border-radius:50%;background:#81715d;color:#ffd13a;font-weight:800}.account-heading>button{border:0;background:none;color:#929ba4;font-size:29px}.account-number{margin:7px 0 35px;padding-left:45px;color:#7e858d;font-size:17px}.account-number button{border:0;background:none;color:#969da4}.balance{padding-left:45px;font-size:18px}.balance strong{font-size:32px}.balance button{margin-left:8px;padding:5px 12px;border:1px solid #d7dadd;border-radius:18px;background:#fff;color:#777}.account-buttons{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:28px 0 0 45px}.account-buttons button{height:52px;border:0;border-radius:4px;background:#e9ecef;font-size:18px}.account-buttons button:first-child{background:#ffd43d}.carousel-indicator{height:64px;display:flex;justify-content:center;align-items:center;gap:18px;color:#6f757b;font-size:20px}.carousel-indicator button{border:0;background:none;color:#899199;font-size:34px}.summary-card{min-height:120px;margin-bottom:18px;padding:26px 38px;display:flex;flex-direction:column;border-radius:23px;background:#fff}.summary-card span{font-size:18px}.summary-card button{align-self:flex-end;margin-top:auto;border:0;background:none;font-size:21px;font-weight:800}.card-spending strong{align-self:flex-end;margin-top:auto;font-size:24px}.quick-menu{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.quick-menu button{min-height:120px;padding:20px;border:0;border-radius:22px;background:#dcf5f6;text-align:left;font-size:16px}.quick-menu span{display:block;margin-bottom:12px;font-weight:900}.bottom-nav{position:fixed;right:0;bottom:0;left:0;z-index:10;height:82px;display:flex;justify-content:center;background:#fff;box-shadow:0 -3px 12px rgba(0,0,0,.06)}.bottom-nav button{width:min(150px,20%);border:0;background:#fff;color:#545a60;font-size:13px}.bottom-nav span{display:block;margin-bottom:4px;font-size:25px}
@media(max-width:600px){.bank-header{height:68px;padding:0 16px}.family-text{display:none}.profile{padding-right:4px!important}.user-name{margin-left:8px;font-size:16px}.header-actions{gap:12px}.header-actions button{transform:scale(.86)}.bank-home main{padding:0 16px}.youngly-banner{min-height:145px;padding:25px 22px}.banner-copy{font-size:19px}.temporary-logo{font-size:13px}.temporary-logo i{width:32px;height:32px}.all-account{height:70px;padding:0 22px}.all-account strong{font-size:20px}.account-card{padding:26px 22px}.account-heading strong{font-size:19px}.account-number,.balance{padding-left:0}.account-buttons{margin-left:0}.summary-card{padding:23px}.summary-card button{font-size:18px}.quick-menu{gap:8px}.quick-menu button{min-height:105px;padding:14px;font-size:14px}}
/* Youngly promotional banner */
.bank-home,.bank-home *{box-sizing:border-box}.bank-home{max-width:100%;overflow-x:hidden}
.youngly-banner{min-height:190px!important;padding:27px 34px!important;justify-content:space-between!important;isolation:isolate;border:0!important;border-radius:0 0 26px 26px!important;background:linear-gradient(125deg,#604194 0%,#7156ad 48%,#9578ca 100%)!important;box-shadow:0 15px 32px rgba(73,45,120,.2);color:#fff!important}
.youngly-banner::after{content:"";position:absolute;inset:7px;border:1px solid rgba(255,255,255,.25);border-radius:0 0 20px 20px;pointer-events:none}
.banner-decoration{position:absolute;z-index:-1;border-radius:50%;background:rgba(255,255,255,.1)}
.circle-one{width:230px;height:230px;right:-65px;top:-95px}
.circle-two{width:135px;height:135px;right:120px;bottom:-90px;border:24px solid rgba(255,255,255,.08);background:transparent}
.banner-content{display:flex;align-items:flex-start;flex-direction:column;position:relative;z-index:1}
.banner-label{margin-bottom:12px;padding:5px 10px;border-radius:20px;background:#ffd84a;color:#4b3376;font-size:12px;font-weight:800}
.banner-copy{color:#fff!important;font-size:clamp(21px,4vw,29px)!important;letter-spacing:-1.2px!important;line-height:1.35}
.yellow-letter{color:#ffe15d;font-weight:900}
.banner-link{margin-top:17px;font-size:13px;font-weight:700}.banner-link b{margin-left:5px;font-size:18px}
.temporary-logo{min-width:125px;margin-left:22px!important;padding-left:0!important;display:grid;place-items:center;color:#fff;text-align:center;white-space:nowrap}
.temporary-logo i{width:58px!important;height:58px!important;display:grid!important;place-items:center;margin:0 0 7px!important;border:2px solid rgba(255,255,255,.9)!important;border-radius:18px!important;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 5px rgba(255,255,255,.08);font-size:31px;font-weight:900}
.temporary-logo b{font-size:17px;letter-spacing:1px}.temporary-logo small{display:block;margin-top:4px;color:rgba(255,255,255,.72);font-size:9px;font-weight:500;letter-spacing:-.3px}
@media(max-width:600px){.youngly-banner{min-height:164px!important;padding:23px 20px!important;border-radius:0 0 22px 22px!important}.banner-label{margin-bottom:8px;padding:4px 8px;font-size:10px}.banner-copy{font-size:18px!important}.banner-link{margin-top:12px;font-size:11px}.temporary-logo{min-width:84px;margin-left:10px!important}.temporary-logo i{width:43px!important;height:43px!important;margin-bottom:5px!important;border-radius:13px!important;font-size:23px}.temporary-logo b{font-size:12px}.temporary-logo small{font-size:7px}}
@media(max-width:600px){.bank-home main{width:100%;max-width:100%;padding-right:14px!important;padding-left:14px!important}.bank-header{width:100%;max-width:100%;padding-right:12px!important;padding-left:12px!important}.user-name{max-width:95px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.header-actions{flex-shrink:0;gap:8px!important}.youngly-banner{width:100%;max-width:100%;min-height:164px!important;padding:21px 17px!important;border-radius:0 0 22px 22px!important}.banner-content{min-width:0;max-width:calc(100% - 78px)}.banner-label{margin-bottom:8px;padding:4px 8px;font-size:10px}.banner-copy{font-size:clamp(15px,4.7vw,18px)!important;line-height:1.45;word-break:keep-all}.banner-link{margin-top:12px;font-size:11px}.temporary-logo{min-width:68px;margin-left:8px!important}.temporary-logo i{width:40px!important;height:40px!important;margin-bottom:5px!important;border-radius:12px!important;font-size:21px}.temporary-logo b{font-size:10px}.temporary-logo small{display:none}.account-card,.all-account,.summary-card,.quick-menu{max-width:100%}.account-buttons{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.quick-menu{grid-template-columns:repeat(3,minmax(0,1fr))}.quick-menu button{min-width:0;overflow-wrap:anywhere}}
@media(max-width:380px){.family-text{display:none}.user-name{max-width:75px;font-size:14px}.header-actions .search{display:none}.temporary-logo{min-width:58px}.banner-content{max-width:calc(100% - 62px)}.banner-copy{font-size:15px!important}.account-heading strong{font-size:17px}.account-number{font-size:14px}.quick-menu button{padding:10px!important;font-size:12px!important}}
/* Reference image controls */
.profile{width:100px!important;height:40px!important;padding:0!important;border:0!important}.profile img{display:block;width:100%;height:100%;object-fit:contain}.header-actions img{display:block;width:138px;height:auto}.kb-account-icon{width:35px;height:35px;object-fit:contain}.account-number button img{display:block;width:20px;height:20px;object-fit:contain}.bottom-nav{padding:0 12px}.bottom-nav img{display:block;width:min(100%,792px);height:100%;object-fit:contain}
@media(max-width:600px){.profile{width:82px!important;height:33px!important}.user-name{max-width:82px!important}.header-actions{gap:0!important}.header-actions img{width:112px}.bottom-nav{height:72px;padding:0 8px}}
@media(max-width:380px){.profile{width:70px!important}.user-name{max-width:62px!important;font-size:13px!important}.header-actions img{width:96px}}
/* Compact reference images */
.profile{width:48px!important;height:20px!important}.header-actions img{width:66px!important}.kb-account-icon{width:17px!important;height:17px!important}.account-number button img{width:9px!important;height:9px!important}.bottom-nav{height:42px!important;padding:0 18px!important}.bottom-nav img{width:min(50%,396px)!important;margin:auto}.bank-home{padding-bottom:52px!important}
@media(max-width:600px){.profile{width:44px!important;height:18px!important}.header-actions img{width:60px!important}.bottom-nav{height:40px!important;padding:0 8px!important}.bottom-nav img{width:55%!important}}
@media(max-width:380px){.profile{width:40px!important}.header-actions img{width:54px!important}}
/* Balanced reference image sizing */
.profile{width:76px!important;height:30px!important}.header-actions img{width:100px!important}.kb-account-icon{width:26px!important;height:26px!important}.account-number button img{width:15px!important;height:15px!important}.bottom-nav{height:62px!important;padding:0 12px!important}.bottom-nav img{width:min(82%,650px)!important}.bank-home{padding-bottom:72px!important}
@media(max-width:600px){.profile{width:70px!important;height:28px!important}.header-actions img{width:92px!important}.bottom-nav{height:58px!important}.bottom-nav img{width:88%!important}}
@media(max-width:380px){.profile{width:64px!important;height:26px!important}.header-actions img{width:84px!important}}
/* Fine alignment */
.header-actions img{width:110px!important}.profile img{transform:translateY(2px)}
.account-number{padding-left:36px!important}.balance{width:84%;margin-right:auto;margin-left:auto;padding-left:0!important}.balance strong{font-size:25px!important}.account-buttons{width:84%;margin:22px auto 0!important;gap:10px!important}.account-buttons button{height:44px!important;font-size:16px!important}
.youngly-banner{min-height:168px!important;padding-top:22px!important;padding-bottom:22px!important}
@media(max-width:600px){.header-actions img{width:100px!important}.account-number{padding-left:36px!important}.balance,.account-buttons{width:88%}.youngly-banner{min-height:146px!important;padding-top:18px!important;padding-bottom:18px!important}}
@media(max-width:380px){.header-actions img{width:92px!important}}
/* Header spacing and account alignment */
.bank-header{height:72px!important}.header-actions img{width:118px!important}
.account-number{display:flex;align-items:center;gap:5px;margin-top:3px!important;margin-bottom:24px!important;padding-left:36px!important}.account-number button{padding:0;display:inline-flex;align-items:center;justify-content:center}.account-number button img{width:15px!important;height:15px!important}
.balance{width:auto!important;margin:0!important;padding-left:36px!important}.account-buttons{width:76%!important;margin:18px 0 0 36px!important}.account-buttons button{height:42px!important}
@media(max-width:600px){.bank-header{height:58px!important}.header-actions img{width:108px!important}.account-number{margin-bottom:20px!important}.balance{width:auto!important;padding-left:36px!important}.account-buttons{width:calc(100% - 72px)!important;margin-left:36px!important}}
@media(max-width:380px){.header-actions img{width:100px!important}}
/* Account card positioning */
.account-card{padding:26px 32px 32px!important}.account-heading{align-items:flex-start!important}.account-heading>div{align-items:flex-start!important}.account-heading>button{height:26px;padding:0!important;line-height:20px;transform:translateY(-1px)}
.account-number{margin-top:1px!important;margin-bottom:20px!important}.balance{margin-top:-2px!important}.account-buttons{width:84%!important}
@media(max-width:600px){.account-card{padding:22px 18px 26px!important}.account-buttons{width:calc(100% - 54px)!important}}
/* Space below account action buttons */
.account-card{padding-bottom:42px!important}
@media(max-width:600px){.account-card{padding-bottom:34px!important}}
.balance strong{margin-right:3px}
.account-card{padding-bottom:50px!important}
@media(max-width:600px){.account-card{padding-bottom:42px!important}}
.account-card{padding-bottom:60px!important}
.user-name{max-width:220px!important;min-width:0;overflow:visible!important;text-overflow:clip!important}
@media(max-width:600px){.account-card{padding-bottom:52px!important}.user-name{max-width:130px!important;overflow:hidden!important;text-overflow:ellipsis!important}}
@media(max-width:380px){.user-name{max-width:96px!important}}
.user-menu{position:relative}.user-name span{display:inline-block;transition:transform .18s}.user-name span.open{transform:rotate(90deg)}.user-dropdown{min-width:145px;padding:7px;position:absolute;top:calc(100% + 9px);left:13px;z-index:30;border:1px solid #e0e2e4;border-radius:12px;background:#fff;box-shadow:0 12px 30px rgba(32,36,40,.15)}.user-dropdown button{width:100%;height:42px;padding:0 12px;display:flex;align-items:center;gap:9px;border-radius:8px!important;color:#474b50;font-size:13px;font-weight:700;text-align:left}.user-dropdown button:hover{background:#f3f1f7}.user-dropdown button:disabled{cursor:wait;opacity:.55}.user-dropdown button span{color:#72549d;font-size:18px}.user-dropdown-enter-active,.user-dropdown-leave-active{transition:opacity .15s,transform .15s;transform-origin:top left}.user-dropdown-enter-from,.user-dropdown-leave-to{opacity:0;transform:translateY(-5px) scale(.98)}
</style>

<style scoped>
.bank-home,
.bank-home :deep(*) {
  font-family: Pretendard, "Noto Sans KR", Arial, sans-serif !important;
}

/* Bank home typography and account-card refinements */
.summary-card button {
  font-size: 17px;
  font-weight: 400;
}

.all-account {
  height: 70px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.all-account strong {
  font-size: 20px;
  font-weight: 400;
}

.account-card {
  border-radius: 17px;
}

.account-buttons button {
  border-radius: 2px;
}

.account-number {
  margin-bottom: 28px !important;
}

@media (max-width: 600px) {
  .summary-card button {
    font-size: 14px;
  }

  .all-account {
    height: 60px;
    padding-top: 3px;
    padding-bottom: 3px;
  }

  .all-account strong {
    font-size: 16px;
  }

  .account-card {
    border-radius: 15px;
  }

  .account-number {
    margin-bottom: 26px !important;
  }
}

/* Keep all bank-home cards visually consistent. */
.all-account,
.summary-card {
  border-radius: 17px;
}

.all-account strong,
.summary-card button {
  font-weight: 600;
}

.balance strong {
  font-size: 20px !important;
  font-weight: 600;
}

.card-spending strong {
  font-weight: 600;
}

.account-buttons {
  margin-top: 14px !important;
}

.account-buttons button {
  height: 38px !important;
}

@media (max-width: 600px) {
  .all-account,
  .summary-card {
    border-radius: 15px;
  }

  .balance strong {
    font-size: 20px !important;
  }

  .account-buttons {
    margin-top: 12px !important;
  }

  .account-buttons button {
    height: 36px !important;
  }
}

.summary-card:not(.card-spending) button {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 400;
}

.summary-card:not(.card-spending) > span {
  font-size: 16px;
}

.summary-card:not(.card-spending) {
  min-height: 0;
  padding-top: 26px;
  padding-bottom: 26px;
}

.account-card {
  padding-bottom: 42px !important;
}

@media (max-width: 600px) {
  .summary-card:not(.card-spending) button {
    margin-top: 8px;
    font-size: 17px;
  }

  .summary-card:not(.card-spending) > span {
    font-size: 15px;
  }

  .summary-card:not(.card-spending) {
    padding-top: 23px;
    padding-bottom: 23px;
  }

  .account-card {
    padding-bottom: 36px !important;
  }
}

.user-name {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 22px !important;
  font-weight: 400 !important;
  line-height: 1.2;
}

.user-name span {
  margin-left: 0;
  font-size: 37px;
  line-height: 1;
  vertical-align: 0;
  transform: translateY(-2px);
}

.user-name span.open {
  transform: translateY(-2px) rotate(90deg);
}

.profile img {
  transform: translateY(-1px);
}

.profile {
  width: 86px !important;
  height: 34px !important;
}

@media (max-width: 600px) {
  .user-name {
    font-size: 18px !important;
  }

  .user-name span {
    font-size: 34px;
  }

  .profile {
    width: 78px !important;
    height: 31px !important;
  }
}

@media (max-width: 380px) {
  .user-name {
    font-size: 16px !important;
  }
}

.banner-logo {
  position: relative;
  z-index: 1;
  width: clamp(104px, 19vw, 145px);
  height: auto;
  margin-left: 20px;
  flex: 0 0 auto;
  object-fit: contain;
}

@media (max-width: 600px) {
  .banner-logo {
    width: clamp(72px, 22vw, 100px);
    margin-left: 8px;
  }
}
</style>
