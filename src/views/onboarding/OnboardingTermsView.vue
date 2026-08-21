<template>
  <main ref="pageRoot" class="onboarding-page">
    <section class="hero-section">
      <div class="hero-copy">
        <span class="eyebrow">YOUNGLY</span>
        <h1><em>습관</em>이 <em>개인연금</em>으로,<br />MZ 맞춤 자산 관리 서비스</h1>
        <p>오늘의 작은 금융 습관을<br />미래의 든든한 자산으로 연결해요.</p>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <span class="habit-chip">오늘의 습관 +1</span>
        <span class="pension-chip">예상 연금 UP</span>
        <div class="growth-line"><i></i><i></i><i></i></div>
        <div class="growth-labels"><span>오늘</span><span>습관</span><span>미래 연금</span></div>
        <strong>오늘의 작은 습관이<br />든든한 미래가 돼요</strong>
      </div>
      <button class="scroll-hint" type="button" @click="scrollToStory">아래로 살펴보기 <span>↓</span></button>
    </section>

    <section ref="storySection" class="story-section">
      <span class="section-number">01</span>
      <h2>혼자서는 어려운 자산 관리,<br /><em>습관부터</em> 시작해요</h2>
      <p>거창한 투자 계획보다 매일 반복할 수 있는 작은 행동이 중요해요. 영리는 모임, 챌린지, 보상을 통해 꾸준함을 만들어줍니다.</p>
      <div class="habit-card">
        <div><strong>작은 습관</strong><span>매일 차곡차곡</span></div>
        <span class="flow-arrow">→</span>
        <div><strong>연금 자산</strong><span>미래를 든든하게</span></div>
      </div>
      <img class="section-character llama" :src="llama" alt="라마 캐릭터" />
    </section>

    <section class="needs-section">
      <span class="section-number">02</span>
      <h2>이럴 때<br /><em>YOUNGLY</em>가 필요해요</h2>
      <div class="need-list">
        <article><span>01</span><div><strong>연금 준비가 막막할 때</strong><p>내 상황에 맞는 시작점을 쉽고 가볍게 찾아요.</p></div></article>
        <article><span>02</span><div><strong>저축이 오래가지 않을 때</strong><p>함께하는 챌린지로 포기하지 않는 습관을 만들어요.</p></div></article>
        <article><span>03</span><div><strong>내 연금 준비가 충분한지 궁금할 때</strong><p>예상 연금과 부족한 준비를 내 눈높이에 맞춰 확인해요.</p></div></article>
      </div>
      <img class="section-character bear" :src="bear" alt="곰 캐릭터" />
    </section>

    <section class="feature-section">
      <span class="section-number light">03</span>
      <h2>재미있게 모으고,<br />똑똑하게 키워요</h2>
      <div class="feature-grid">
        <article><span>01</span><div><strong>함께하는 챌린지</strong><p>목표를 인증하고 친구들과 꾸준히 달성해요.</p></div></article>
        <article><span>02</span><div><strong>포인트와 캐릭터</strong><p>좋은 습관이 쌓일수록 나만의 보상도 커져요.</p></div></article>
        <article><span>03</span><div><strong>맞춤 연금 인사이트</strong><p>복잡한 연금 정보를 내 눈높이에 맞춰 알려줘요.</p></div></article>
        <article><span>04</span><div><strong>모임 자산 관리</strong><p>친구와 공동 목표를 세우고 투명하게 관리해요.</p></div></article>
      </div>
      <figure class="feature-preview">
        <div>
          <span>CHALLENGE WITH FRIENDS</span>
          <strong>친구들과 인증하고<br />서로 응원하며 이어가요</strong>
          <p>인증 사진을 함께 확인하고 승인·반려하며 챌린지를 투명하게 진행해요.</p>
        </div>
        <div class="phone-frame">
          <img :src="challengePreview" alt="친구들과 인증 사진을 확인하고 승인 또는 반려하는 YOUNGLY 챌린지 화면" />
        </div>
      </figure>
    </section>

    <section class="friends-section">
      <span class="section-number">04</span>
      <h2>스타프렌즈와 함께라면<br />금융 습관도 <em>즐거워져요</em></h2>
      <p>챌린지를 달성하고 포인트를 모아<br />다섯 친구를 하나씩 만나보세요.</p>
      <div class="friends-stage" aria-label="스타프렌즈 캐릭터">
        <img class="starfriend-image" :src="starfriend" alt="스타프렌즈 캐릭터" />
      </div>
    </section>

    <section class="terms-section">
      <div class="terms-panel">
        <header>
          <span class="step">WELCOME TO YOUNGLY</span>
          <h2>YOUNGLY를 시작하기 위해<br />약관을 확인해 주세요</h2>
          <p>안전한 서비스 이용을 위해 필수 약관 동의가 필요해요.</p>
        </header>

        <label class="all-agreement">
          <input v-model="agreeAll" type="checkbox" @change="toggleAll" />
          <span class="check-mark">✓</span><strong>필수 약관 전체 동의</strong>
        </label>

        <div class="agreement-list">
          <label v-for="term in terms" :key="term.id">
            <input v-model="agreements" type="checkbox" :value="term.id" />
            <span class="check-mark">✓</span><span>{{ term.label }}</span>
            <button type="button" aria-label="약관 자세히 보기">›</button>
          </label>
        </div>

        <footer>
          <button class="later-button" type="button" @click="router.replace('/bank-home')">다음에</button>
          <button class="confirm-button" type="button" :disabled="!allRequiredAgreed" @click="router.push('/onboarding/setup')">동의하고 시작</button>
        </footer>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import llama from '@/assets/characters/llama.png'
import bear from '@/assets/characters/bear.png'
import starfriend from '@/assets/icons/loginIcon/starfriend.png'
import challengePreview from '@/assets/icons/exex.png'

const router = useRouter()
const pageRoot = ref(null)
const storySection = ref(null)
let revealObserver
const terms = [
  { id: 1, label: 'YOUNGLY 서비스 이용약관 [필수]' },
  { id: 2, label: '개인정보 수집·이용·제공 동의 [필수]' },
  { id: 3, label: '개인(신용)정보 수집·이용·제공 동의 [필수]' },
]
const agreements = ref([])
const agreeAll = ref(false)
const allRequiredAgreed = computed(() => agreements.value.length === terms.length)

watch(allRequiredAgreed, (value) => (agreeAll.value = value))
function toggleAll() { agreements.value = agreeAll.value ? terms.map((term) => term.id) : [] }
function scrollToStory() { storySection.value?.scrollIntoView({ behavior: 'smooth' }) }

onMounted(() => {
  const targets = pageRoot.value?.querySelectorAll(
    '.story-section > *, .needs-section > *, .feature-section > *, .friends-section > *, .terms-panel',
  )
  revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      }
    }),
    { threshold: 0.14, rootMargin: '0px 0px -40px' },
  )
  targets?.forEach((target) => {
    target.classList.add('scroll-reveal')
    revealObserver.observe(target)
  })
})

onBeforeUnmount(() => revealObserver?.disconnect())
</script>

<style scoped>
@font-face{font-family:YounglyPixel;src:url('@/assets/fonts/YounglyNeoPixel.woff2') format('woff2');font-display:swap}
:global(*){box-sizing:border-box}:global(body){margin:0}.onboarding-page{overflow:hidden;background:#fff;color:#28232d;font-family:Pretendard,'Noto Sans KR',sans-serif}.hero-section,.story-section,.needs-section,.feature-section,.friends-section,.terms-section{position:relative;min-height:100dvh;padding:68px 22px;overflow:hidden}.hero-section{display:flex;flex-direction:column;background:linear-gradient(180deg,#fff 0%,#f3edf9 100%)}.eyebrow,.section-number{color:#75539d;font:900 12px/1 YounglyPixel,monospace;letter-spacing:.18em}.hero-copy h1,.story-section h2,.needs-section h2,.feature-section h2,.friends-section h2,.terms-panel h2{margin:16px 0;color:#28232d;font-family:YounglyPixel,'Noto Sans KR',sans-serif;font-size:clamp(28px,8vw,40px);line-height:1.4;letter-spacing:-.04em}.hero-copy h1 em,.story-section h2 em,.needs-section h2 em,.friends-section h2 em{color:#68468c;font-style:normal}.hero-copy p,.story-section>p,.friends-section>p{margin:0;color:#756d7c;font-size:15px;line-height:1.75}.hero-characters{position:absolute;left:0;right:0;bottom:10%;height:39%;display:flex;align-items:flex-end;justify-content:center}.hero-characters img{position:absolute;width:48%;object-fit:contain;filter:drop-shadow(0 14px 12px rgba(72,49,96,.14))}.hero-rabbit{left:-10%;bottom:-9%;transform:rotate(7deg)}.hero-broccoli{z-index:2;left:26%;bottom:1%;width:54%!important}.hero-duck{right:-10%;bottom:-10%;transform:rotate(-7deg)}.scroll-hint{position:absolute;z-index:3;left:50%;bottom:22px;padding:8px;border:0;background:transparent;color:#6f6279;font-size:12px;transform:translateX(-50%)}.scroll-hint span{display:block;margin-top:4px;font-size:18px}.story-section{background:#fff}.story-section>p{max-width:330px;margin-top:24px}.habit-card{position:relative;z-index:2;margin-top:38px;padding:22px 16px;display:flex;align-items:center;justify-content:space-between;border:1px solid #e7dcef;border-radius:20px;background:rgba(250,247,253,.94);box-shadow:0 14px 34px rgba(83,58,108,.1)}.habit-card div{display:flex;flex-direction:column;gap:7px}.habit-card strong{font-size:16px}.habit-card span{color:#8c8294;font-size:11px}.flow-arrow{color:#76539d!important;font-size:22px!important}.section-character{position:absolute;object-fit:contain;pointer-events:none}.section-character.llama{right:-14%;bottom:-4%;width:55%;opacity:.93}.needs-section{background:#f2ebf8}.need-list{position:relative;z-index:2;margin-top:32px;display:grid;gap:12px}.need-list article{display:flex;gap:15px;padding:19px;border-radius:18px;background:rgba(255,255,255,.9);box-shadow:0 8px 24px rgba(74,50,98,.07)}.need-list article>span{color:#76539d;font:900 12px/1 YounglyPixel,monospace}.need-list strong{display:block;margin-bottom:7px;font-size:15px}.need-list p{margin:0;color:#7d7484;font-size:12px;line-height:1.55}.section-character.bear{right:-18%;bottom:-9%;width:48%;opacity:.3}.feature-section{background:#342744;color:#fff}.feature-section h2{color:#fff}.section-number.light{color:#c7a9e8}.feature-grid{margin-top:34px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.feature-grid article{min-height:170px;padding:20px 16px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.07)}.feature-grid article>span{font-size:25px}.feature-grid strong{display:block;margin:18px 0 8px;font-size:14px}.feature-grid p{margin:0;color:#cfc5d7;font-size:11px;line-height:1.55}.friends-section{min-height:86dvh;background:#fff}.friends-stage{position:absolute;left:-14%;right:-14%;bottom:-7%;height:48%;display:flex;align-items:flex-end;justify-content:center}.friends-stage img{width:25%;margin:0 -3%;object-fit:contain;filter:drop-shadow(0 12px 10px rgba(63,43,83,.13))}.friends-stage img:nth-child(1),.friends-stage img:nth-child(5){transform:translateY(16%)}.friends-stage img:nth-child(2),.friends-stage img:nth-child(4){transform:translateY(5%)}.friends-stage .main-friend{z-index:2;width:31%}.terms-section{min-height:100dvh;padding:54px 20px;background:linear-gradient(150deg,#eee5f6,#ddd0ec)}.terms-panel{width:100%;padding:30px 20px;border-radius:26px;background:#fff;box-shadow:0 18px 50px rgba(68,45,98,.13)}.terms-panel header{margin-bottom:26px}.step{color:#7353a2;font-size:11px;font-weight:900}.terms-panel h2{margin:10px 0 8px;font-size:26px}.terms-panel header p{margin:0;color:#8a8291;font-size:12px;line-height:1.55}.all-agreement,.agreement-list label{display:flex;align-items:center;gap:11px;cursor:pointer}.all-agreement{padding:17px;border:1px solid #cdbdde;border-radius:15px;background:#f7f2fc}.all-agreement input,.agreement-list input{position:absolute;opacity:0}.check-mark{width:23px;height:23px;display:grid;place-items:center;flex:0 0 23px;border:1px solid #c7bdcf;border-radius:50%;color:transparent;background:#fff;font-size:12px;font-weight:900}.all-agreement input:checked+.check-mark,.agreement-list input:checked+.check-mark{border-color:#69529f;color:#fff;background:#69529f}.all-agreement strong{font-size:14px}.agreement-list{margin-top:12px;border-top:1px solid #eee9f2}.agreement-list label{min-height:66px;padding:10px 3px;border-bottom:1px solid #eee9f2}.agreement-list label>span:nth-of-type(2){font-size:12px;line-height:1.45}.agreement-list button{margin-left:auto;border:0;background:transparent;color:#a098a8;font-size:24px}footer{margin-top:26px;display:grid;grid-template-columns:1fr 1.5fr;gap:9px}footer button{height:52px;border-radius:12px;font-weight:800}.later-button{border:1px solid #d9d1df;background:#fff;color:#706978}.confirm-button{border:0;background:#69529f;color:#fff}.confirm-button:disabled{opacity:.35}
.feature-preview{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:32px;align-items:center;margin:38px 0 0;padding:28px;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(255,255,255,.08)}
.feature-preview>div{display:grid;gap:12px}.feature-preview>div>span{color:#c7a9e8;font:900 10px/1 YounglyPixel,monospace;letter-spacing:.12em}.feature-preview strong{font-size:20px;line-height:1.55}.feature-preview p{margin:0;color:#cfc5d7;font-size:12px;line-height:1.7}.feature-preview img{display:block;width:100%;max-height:430px;object-fit:contain;filter:drop-shadow(0 16px 24px rgba(8,4,13,.3))}
.phone-frame{position:relative;justify-self:center;width:100%;max-width:230px;padding:6px;border:2px solid #17131c;border-radius:27px;background:#17131c;box-shadow:0 18px 30px rgba(8,4,13,.34)}
.phone-frame::after{content:'';position:absolute;inset:3px;border:1px solid rgba(255,255,255,.14);border-radius:22px;pointer-events:none}
.phone-frame img{position:relative;z-index:1;width:100%;max-height:410px;border-radius:20px;object-fit:cover;object-position:top;filter:none}
@media(min-width:700px){.hero-section,.story-section,.needs-section,.feature-section,.friends-section{padding-left:max(40px,calc(50% - 310px));padding-right:max(40px,calc(50% - 310px))}.terms-panel{max-width:620px;margin:0 auto;padding:42px}.hero-characters,.friends-stage{max-width:760px;margin:0 auto}.feature-grid{grid-template-columns:repeat(4,1fr)}}

/* Mobile presentation polish */
@media(max-width:699px){
  .hero-section{min-height:100svh}
  .story-section,.needs-section,.feature-section,.friends-section{min-height:auto;padding:76px 22px}
  .hero-copy{position:relative;z-index:4}
  .hero-copy h1{font-size:clamp(23px,6.7vw,32px);line-height:1.72}
  .hero-characters{bottom:11%;height:31%}
  .hero-characters img{width:31%;filter:drop-shadow(0 8px 8px rgba(72,49,96,.12))}
  .hero-rabbit{left:2%;bottom:-4%}
  .hero-broccoli{left:34%;bottom:2%;width:34%!important}
  .hero-duck{right:1%;bottom:-5%}

  .story-section{padding-bottom:155px}
  .section-character.llama{right:-5%;bottom:-3%;width:34%;opacity:.88}
  .needs-section{padding-bottom:125px}
  .section-character.bear{right:-3%;bottom:-3%;width:29%;opacity:.65}

  .friends-section{min-height:auto;padding-bottom:250px}
  .friends-stage{left:-2%;right:-2%;bottom:1%;height:225px;gap:0}
  .friends-stage img{width:20%;margin:0 -1.2%;filter:drop-shadow(0 7px 7px rgba(63,43,83,.12))}
  .friends-stage .main-friend{width:24%}
  .friends-stage img:nth-child(1),.friends-stage img:nth-child(5){transform:translateY(12%)}

  .terms-section{min-height:100svh;padding:70px 16px 42px;background:linear-gradient(160deg,#3d2c50 0%,#251b31 100%)}
  .terms-section::before{content:'YOUNGLY';position:absolute;right:-12px;top:18px;color:rgba(255,255,255,.045);font:900 52px/1 YounglyPixel,monospace;letter-spacing:.05em}
  .terms-panel{position:relative;padding:0 20px 26px;overflow:hidden;border:1px solid rgba(255,255,255,.22);border-radius:28px;background:#fff;box-shadow:0 24px 55px rgba(10,5,17,.32)}
  .terms-panel::before{content:'';display:block;height:8px;margin:0 -20px 28px;background:linear-gradient(90deg,#9d78c4,#68468c)}
  .terms-panel header{padding:0 2px 24px;border-bottom:1px solid #eee8f2}
  .terms-panel h2{font-size:25px;line-height:1.42}
  .all-agreement{margin-top:22px;border:2px solid #d7c6e5;background:linear-gradient(135deg,#faf7fd,#f2eaf8);box-shadow:0 6px 15px rgba(91,63,119,.08)}
  .agreement-list{margin-top:14px}
  .agreement-list label{padding:12px 4px}
  footer{position:sticky;bottom:0;padding-top:8px;background:#fff}
  .confirm-button:not(:disabled){box-shadow:0 8px 18px rgba(105,82,159,.28)}
}

.scroll-reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .75s cubic-bezier(.22,.7,.25,1)}.scroll-reveal.is-visible{opacity:1;transform:none}.need-list.scroll-reveal article,.feature-grid.scroll-reveal article{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .6s ease}.need-list.scroll-reveal.is-visible article,.feature-grid.scroll-reveal.is-visible article{opacity:1;transform:none}.need-list article:nth-child(2),.feature-grid article:nth-child(2){transition-delay:.08s}.need-list article:nth-child(3),.feature-grid article:nth-child(3){transition-delay:.16s}.feature-grid article:nth-child(4){transition-delay:.24s}.section-character.scroll-reveal{transform:translateY(45px) rotate(3deg)}.section-character.scroll-reveal.is-visible{transform:none}

@media(max-width:699px){
  .feature-section{background:#faf8fc;color:#28232d;border-top:1px solid #eee8f2;border-bottom:1px solid #eee8f2}
  .feature-section h2{color:#28232d}
  .section-number.light{color:#75539d}
  .feature-grid{display:block;margin-top:30px;border-top:1px solid #dcd3e3}
  .feature-grid article{min-height:0;padding:22px 2px;display:grid;grid-template-columns:42px 1fr;gap:10px;border:0;border-bottom:1px solid #dcd3e3;border-radius:0;background:transparent}
  .feature-grid article>span{padding-top:3px;color:#75539d;font:900 12px/1 YounglyPixel,monospace}
  .feature-grid strong{margin:0 0 7px;color:#28232d;font-size:15px}
  .feature-grid p{margin:0;color:#786f80;font-size:12px;line-height:1.6}
  .feature-preview{grid-template-columns:1fr;margin-top:34px;padding:24px 18px;border-color:#ddd2e6;background:#fff;text-align:center;box-shadow:0 14px 34px rgba(83,58,108,.1)}
  .feature-preview>div{justify-items:center}
  .feature-preview>div>span{color:#75539d}
  .feature-preview strong{color:#28232d;font-size:18px}
  .feature-preview p{max-width:310px;color:#786f80;font-size:12px}
  .phone-frame{width:min(76vw,270px);max-width:270px;padding:6px;border-radius:29px}
  .phone-frame img{width:100%;max-height:none;border-radius:22px;filter:none}
}

@media(prefers-reduced-motion:reduce){.scroll-reveal,.need-list.scroll-reveal article,.feature-grid.scroll-reveal article{opacity:1;transform:none;transition:none}}

@media(max-width:699px){
  .hero-copy h1{font-size:26px;line-height:1.72;letter-spacing:-.025em}
  .hero-visual{position:absolute;left:22px;right:22px;bottom:84px;height:235px;padding:30px 24px;border:1px solid #e4d8ed;border-radius:28px;background:linear-gradient(150deg,#fff,#eee5f6);box-shadow:0 18px 42px rgba(72,49,96,.12);animation:hero-visual-in .8s .25s ease both}
  .hero-visual::before{content:'';position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(117,83,157,.08)}
  .hero-visual strong{position:absolute;left:24px;bottom:28px;font-size:17px;line-height:1.55}
  .growth-line{height:95px;display:flex;align-items:flex-end;justify-content:space-around;border-bottom:1px solid #cfc0dc}
  .growth-line i{position:relative;width:34px;border-radius:8px 8px 0 0;background:#cdb9df}.growth-line i:nth-child(1){height:28px}.growth-line i:nth-child(2){height:54px;background:#9b78bc}.growth-line i:nth-child(3){height:86px;background:#68468c}.growth-line i::after{content:'';position:absolute;left:50%;top:-5px;width:8px;height:8px;border-radius:50%;background:#fff;border:3px solid #76539d;transform:translateX(-50%)}
  .growth-labels{display:flex;justify-content:space-around;margin-top:9px;color:#7e7386;font-size:10px}.growth-labels span{width:34%;text-align:center}

  .story-section>.scroll-reveal{transform:translateX(-30px)}.story-section>.scroll-reveal.is-visible{transform:none}
  .needs-section>.scroll-reveal{transform:scale(.94);transform-origin:center bottom}.needs-section>.scroll-reveal.is-visible{transform:scale(1)}
  .feature-section>.scroll-reveal{transform:translateX(34px)}.feature-section>.scroll-reveal.is-visible{transform:none}
  .feature-grid.scroll-reveal article{transform:translateX(28px)}.feature-grid.scroll-reveal.is-visible article{transform:none}
  .friends-section>.scroll-reveal{transform:translateY(0) scale(.92)}.friends-section>.scroll-reveal.is-visible{transform:none}
  .friends-stage{left:0;right:0;bottom:0;height:245px;display:grid;place-items:end center;overflow:hidden}
  .friends-stage .starfriend-image{width:92%;max-height:235px;margin:0;object-fit:contain;transform:none;filter:drop-shadow(0 10px 9px rgba(63,43,83,.14))}
  .terms-panel.scroll-reveal{transform:translateY(35px) scale(.97)}.terms-panel.scroll-reveal.is-visible{transform:none}
}

@keyframes hero-visual-in{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}

@media(max-width:699px){
  .hero-copy h1{font-family:YounglyPixel,'Noto Sans KR',sans-serif!important;font-size:26px;font-weight:700;line-height:1.72;letter-spacing:-.04em;font-stretch:normal;word-spacing:0}
  .hero-visual::before{display:none}

  .hero-section::before{content:'';position:absolute;inset:0;background:linear-gradient(rgba(104,70,140,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(104,70,140,.035) 1px,transparent 1px);background-size:24px 24px;mask-image:linear-gradient(to bottom,transparent 8%,#000 38%,#000 82%,transparent)}
  .hero-visual{overflow:visible;background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(238,229,246,.96));box-shadow:0 22px 50px rgba(72,49,96,.16)}
  .habit-chip,.pension-chip{position:absolute;z-index:2;padding:8px 11px;border:1px solid #e1d5e9;border-radius:10px;background:#fff;color:#68468c;font-size:11px;font-weight:800;box-shadow:0 8px 18px rgba(72,49,96,.11)}
  .habit-chip{left:-7px;top:-16px;animation:chip-float 2.8s ease-in-out infinite}
  .pension-chip{right:-7px;top:35px;animation:chip-float 2.8s .5s ease-in-out infinite}
  .growth-line i{transform-origin:center bottom;animation:bar-grow .8s cubic-bezier(.2,.75,.25,1) both}
  .growth-line i:nth-child(2){animation-delay:.12s}.growth-line i:nth-child(3){animation-delay:.24s}

  .terms-section{padding:72px 22px 48px;background:#f5f0f8}
  .terms-section::before{display:none}
  .terms-panel{padding:0;overflow:visible;border:0;border-radius:0;background:transparent;box-shadow:none}
  .terms-panel::before{display:none}
  .terms-panel header{padding:0 0 28px;border-bottom:1px solid #dcd2e3}
  .terms-panel h2{margin-top:13px;font-size:28px}
  .all-agreement{margin-top:26px;border:1px solid #cdbdde;border-radius:14px;background:#fff;box-shadow:none}
  .agreement-list{padding:0 4px}
  footer{position:static;padding-top:10px;background:transparent}
}

@keyframes bar-grow{from{transform:scaleY(.08);opacity:.2}to{transform:scaleY(1);opacity:1}}
@keyframes chip-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
</style>
