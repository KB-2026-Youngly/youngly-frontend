<template>
  <section class="cal" aria-labelledby="title">
    <div class="head"><small>MY CERTIFICATION</small><h1 id="title">내 인증 캘린더</h1><p>내가 올린 인증만 날짜별로 모아볼 수 있어요.</p></div>
    <section class="filters" aria-label="그룹 필터"><label for="calendar-group">그룹 선택</label><div class="select-wrap"><select id="calendar-group" v-model="groupId" aria-label="인증 그룹 선택"><option v-for="g in groups" :key="g.groupId" :value="g.groupId">{{g.groupName}}</option></select></div></section>
    <section class="board pixel-step-card pixel-step-solid"><div class="surface pixel-step-surface"><div class="nav"><button aria-label="이전 달" @click="move(-1)">‹</button><h2>{{label}}</h2><button aria-label="다음 달" @click="move(1)">›</button></div><div class="week"><span v-for="w in week" :key="w">{{w}}</span></div><div class="grid"><i v-for="n in offset" :key="`b${n}`"></i><button v-for="d in lastDay" :key="d" class="day" :class="{has:posts(d).length,selected:key(d)===selected,today:isToday(d)}" :aria-label="aria(d)" @click="open(d)"><span v-if="posts(d).length" class="photo"><img :src="posts(d)[0].photoUrl" :alt="`${d}일 인증 사진`"><em v-if="posts(d).length>1">+{{posts(d).length-1}}</em></span><strong>{{d}}</strong><i v-if="posts(d).length"></i></button></div><p v-if="!monthPosts.length" class="empty">{{groupId==='all'?'이번 달에는 아직 인증 기록이 없어요.':`${groupName}에서 이번 달에 올린 인증이 없어요.`}}</p><p v-else class="hint">사진이 있는 날짜를 선택하면 내 인증 기록을 확인할 수 있어요.</p></div></section>
    <BaseModal v-model="modal" modal-class="calendar-modal" size="large" title="내 인증 기록" @close="selected=''"><section v-if="selected" class="feeds"><header><div><p>{{dateLabel}}</p><h2>내 인증 {{daily.length}}건</h2></div><span>{{groupName}}</span></header><article v-for="p in daily" :key="p.postId"><div class="image"><img :src="p.photoUrl" :alt="`${p.groupName} 인증 사진`"><b :class="p.postStatus">{{status(p.postStatus)}}</b></div><div><small>{{p.groupName}}</small><p>{{p.content}}</p><time :datetime="p.postedAt">{{datetime(p.postedAt)}}</time><aside v-if="p.postStatus==='REJECTED'&&p.rejectReason"><strong>반려 사유</strong>{{p.rejectReason}}</aside></div></article></section></BaseModal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { getMyCertificationPosts } from '@/api/post'
import { getGroups } from '@/api/group'

const calendarGroups=ref([])
const today=new Date()
const week=['일','월','화','수','목','금','토'],groupId=ref('all'),current=ref(new Date(today.getFullYear(),today.getMonth(),1)),selected=ref(''),modal=ref(false)
const groups=computed(()=>[{groupId:'all',groupName:'전체'},...calendarGroups.value]),groupName=computed(()=>groups.value.find(g=>g.groupId===groupId.value)?.groupName??'전체')
const apiPosts=ref([]),monthPosts=computed(()=>apiPosts.value.filter(p=>groupId.value==='all'||p.groupId===groupId.value)),label=computed(()=>`${current.value.getFullYear()}년 ${current.value.getMonth()+1}월`),offset=computed(()=>new Date(current.value.getFullYear(),current.value.getMonth(),1).getDay()),lastDay=computed(()=>new Date(current.value.getFullYear(),current.value.getMonth()+1,0).getDate()),daily=computed(()=>monthPosts.value.filter(p=>p.postedAt.slice(0,10)===selected.value).sort((a,b)=>a.postedAt.localeCompare(b.postedAt))),dateLabel=computed(()=>selected.value?`${Number(selected.value.slice(5,7))}월 ${Number(selected.value.slice(8))}일`:'')
const key=d=>`${current.value.getFullYear()}-${String(current.value.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,posts=d=>monthPosts.value.filter(p=>p.postedAt.slice(0,10)===key(d)),isToday=d=>{const n=new Date();return n.getFullYear()===current.value.getFullYear()&&n.getMonth()===current.value.getMonth()&&n.getDate()===d},aria=d=>`${label.value} ${d}일${posts(d).length?`, 내 인증 ${posts(d).length}건`:', 인증 없음'}`,move=n=>{current.value=new Date(current.value.getFullYear(),current.value.getMonth()+n,1);selected.value=''},open=d=>{if(!posts(d).length)return;selected.value=key(d);modal.value=true},status=s=>({APPROVED:'승인됨',REJECTED:'반려됨',PENDING:'심사중'})[s],datetime=v=>new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v))

const dateParam=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const loadMonthPosts=async()=>{
  const from=new Date(current.value.getFullYear(),current.value.getMonth(),1)
  const to=new Date(current.value.getFullYear(),current.value.getMonth()+1,0)
  const [{ data: posts },{ data: groups }]=await Promise.all([
    getMyCertificationPosts({from:dateParam(from),to:dateParam(to)}),
    getGroups(),
  ])
  apiPosts.value=Array.isArray(posts)?posts:[]
  const fetchedGroups=Array.isArray(groups)?groups.filter(group=>group.groupId&&group.groupName).map(group=>({groupId:group.groupId,groupName:group.groupName})):[]
  calendarGroups.value=fetchedGroups
  if(groupId.value!=='all'&&!calendarGroups.value.some(group=>group.groupId===groupId.value))groupId.value='all'
}
watch(current,loadMonthPosts)
onMounted(loadMonthPosts)
</script>

<style scoped>
.cal{max-width:920px;margin:auto;padding:12px 4px 44px;color:var(--yl-ink)}.head{margin-bottom:22px}.head small{color:var(--yl-purple-dark);letter-spacing:.08em}.head h1{margin:7px 0;font-size:28px}.head p,.hint{margin:0;color:var(--yl-muted);font-size:14px}.filters{display:flex;gap:14px;align-items:center;margin-bottom:20px;font-size:14px}.filters div{display:flex;flex-wrap:wrap;gap:8px}.filters button{min-height:38px;padding:7px 13px;border:2px solid var(--yl-ink);background:#fff;box-shadow:2px 2px var(--yl-ink);font:inherit;font-size:13px;cursor:pointer}.filters button.on{background:var(--yl-purple);color:#fff}.filters button:focus-visible,.day:focus-visible,.nav button:focus-visible{outline:3px solid var(--yl-yellow);outline-offset:3px}.board{--pixel-outline-color:var(--yl-ink);--pixel-fill:#fff}.surface{padding:20px}.nav{display:grid;grid-template-columns:42px 1fr 42px;align-items:center;margin-bottom:24px;text-align:center}.nav h2{margin:0;font-size:20px}.nav button{width:38px;height:38px;border:2px solid var(--yl-ink);background:var(--yl-purple-light);font:inherit;font-size:30px;line-height:1;cursor:pointer}.week,.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.week{margin-bottom:9px;color:var(--yl-muted);font-size:13px;text-align:center}.week span:first-child{color:#c64955}.grid{gap:9px 5px}.grid>i,.day{min-height:74px}.day{position:relative;min-width:0;border:0;background:transparent;font:inherit;cursor:default}.day.has{cursor:pointer}.photo{position:absolute;inset:0 3px 3px;overflow:hidden;border:3px solid var(--yl-purple);border-radius:50%;background:var(--yl-purple-light)}.photo img{width:100%;height:100%;object-fit:cover}.photo:after{content:'';position:absolute;inset:0;background:linear-gradient(transparent 50%,#0006)}.day strong{position:relative;z-index:2;display:grid;place-items:center;width:25px;height:25px;margin:1px auto;border-radius:50%;background:#ffffffe6;font-size:13px}.photo em{position:absolute;z-index:3;right:0;bottom:0;display:grid;place-items:center;width:22px;height:22px;border:2px solid var(--yl-ink);border-radius:50%;background:var(--yl-yellow);font-style:normal;font-size:11px}.day>i{position:absolute;z-index:4;bottom:-2px;left:50%;width:7px;height:7px;border-radius:50%;background:var(--yl-yellow);transform:translateX(-50%)}.day.selected .photo{border-color:var(--yl-yellow);box-shadow:0 0 0 3px var(--yl-ink)}.day.today:not(.has) strong{border:2px solid var(--yl-purple)}.empty{margin:22px 0 0;padding:14px;border:2px dashed var(--yl-purple);background:#faf7ff;color:var(--yl-purple-dark);text-align:center;font-size:13px}.hint{margin-top:22px;text-align:center}:global(.calendar-modal){border:3px solid var(--yl-ink)!important;border-radius:0!important;box-shadow:7px 7px var(--yl-ink)!important}:global(.calendar-modal .base-modal__header){border-bottom:3px solid var(--yl-ink);background:var(--yl-yellow)}.feeds header{display:flex;justify-content:space-between;gap:12px;margin-bottom:17px}.feeds header p{margin:0 0 4px;color:var(--yl-muted);font-size:13px}.feeds h2{margin:0;font-size:18px}.feeds header>span{padding:5px 8px;border:1px solid var(--yl-purple);color:var(--yl-purple-dark);font-size:12px}.feeds article{display:grid;grid-template-columns:155px 1fr;gap:14px;padding:12px 0;border-top:2px solid #e6dcf6}.image{position:relative;min-height:132px;overflow:hidden;background:#eee}.image img{width:100%;height:100%;object-fit:cover}.image b{position:absolute;top:8px;left:8px;padding:5px 7px;border:2px solid var(--yl-ink);background:#fff;font-size:12px}.image b.APPROVED{background:#dff6e6}.image b.REJECTED{background:#ffe1e4}.image b.PENDING{background:#fff0bd}.feeds article small{color:var(--yl-purple-dark)}.feeds article p{margin:8px 0 12px;font-size:15px;line-height:1.5}.feeds time{color:var(--yl-muted);font-size:12px}.feeds aside{margin-top:10px;padding:8px;background:#fff2f3;color:#8e3340;font-size:12px;line-height:1.5}.feeds aside strong{display:block;margin-bottom:3px}@media(max-width:767px){.cal{padding:4px 0 22px}.head h1{font-size:24px}.filters{align-items:flex-start;flex-direction:column;gap:8px}.surface{padding:16px 10px}.grid{gap:7px 2px}.grid>i,.day{min-height:54px}.photo{inset:0 2px 3px;border-width:2px}.day strong{width:22px;height:22px;font-size:12px}.feeds article{grid-template-columns:108px 1fr;gap:11px}.image{min-height:112px}}
.filters label { font-weight: 700; }
.filters .select-wrap { position: relative; display: block; min-width: 190px; }
.filters .select-wrap::after { content: '⌄'; position: absolute; top: 50%; right: 12px; pointer-events: none; font-size: 18px; transform: translateY(-58%); }
.filters .select-wrap select { width: 100%; min-height: 42px; padding: 8px 36px 8px 13px; border: 2px solid var(--yl-ink); border-radius: 0; background: #fff; box-shadow: 3px 3px var(--yl-ink); color: var(--yl-ink); appearance: none; font: inherit; font-size: 13px; cursor: pointer; }
.filters .select-wrap select:focus-visible { outline: 3px solid var(--yl-yellow); outline-offset: 3px; }
.grid { gap: 10px 6px; }
.grid > i, .day { aspect-ratio: 1 / 1; min-height: 0; }
.photo { inset: 1px; }
@media (max-width: 767px) { .filters .select-wrap { min-width: min(240px, 100%); } .grid { gap: 7px 3px; } .photo { inset: 1px; } .day > i { width: 6px; height: 6px; } }
@media (max-width: 767px) {
  .cal { padding: 2px 0 28px; }
  .head { margin-bottom: 18px; }
  .head small { font-size: 10px; }
  .head h1 { margin: 5px 0 7px; font-size: 23px; }
  .head p { font-size: 12px; line-height: 1.45; }
  .filters { display: grid; grid-template-columns: 58px minmax(0, 1fr); align-items: center; gap: 10px; margin-bottom: 16px; }
  .filters label { font-size: 12px; }
  .filters .select-wrap { min-width: 0; width: 100%; }
  .filters .select-wrap select { min-height: 40px; padding-left: 11px; font-size: 12px; }
  .board { filter: drop-shadow(4px 4px 0 var(--yl-purple-dark)); }
  .surface { padding: 15px 9px 16px; }
  .nav { grid-template-columns: 36px 1fr 36px; margin-bottom: 18px; }
  .nav h2 { font-size: 16px; }
  .nav button { width: 32px; height: 32px; font-size: 26px; }
  .week { margin-bottom: 7px; font-size: 11px; }
  .grid { gap: 8px 3px; }
  .grid > i, .day { min-height: 0; }
  .day strong { width: 20px; height: 20px; margin-top: 0; font-size: 11px; }
  .photo { border-width: 2px; }
  .photo em { width: 18px; height: 18px; border-width: 1px; font-size: 9px; }
  .day > i { bottom: -3px; width: 5px; height: 5px; }
  .day.selected .photo { box-shadow: 0 0 0 2px var(--yl-ink); }
  .hint, .empty { margin-top: 17px; font-size: 11px; line-height: 1.45; }
  .empty { padding: 11px 10px; }
  :global(.calendar-modal .base-modal__body) { padding: 8px 15px 16px; }
  .feeds article { grid-template-columns: 96px minmax(0, 1fr); gap: 10px; }
  .image { min-height: 104px; }
  .feeds article p { margin: 6px 0 8px; font-size: 13px; }
}
@media (max-width: 767px) {
  .cal { padding-top: 8px; }
  .head { padding: 0 2px; margin-bottom: 22px; }
  .head small { font-size: 11px; font-weight: 700; }
  .head h1 { margin: 7px 0 9px; font-size: 27px; line-height: 1.15; }
  .head p { font-size: 14px; line-height: 1.55; }
  .filters { grid-template-columns: 68px minmax(0, 1fr); gap: 12px; margin-bottom: 20px; }
  .filters label { font-size: 14px; }
  .filters .select-wrap select { min-height: 46px; padding-left: 13px; font-size: 14px; }
  .filters .select-wrap::after { right: 13px; font-size: 20px; }
  .surface { padding: 19px 11px 18px; }
  .nav { grid-template-columns: 42px 1fr 42px; margin-bottom: 21px; }
  .nav h2 { font-size: 19px; }
  .nav button { width: 37px; height: 37px; font-size: 29px; }
  .week { margin-bottom: 10px; font-size: 12px; font-weight: 700; }
  .grid { gap: 10px 4px; }
  .day strong { width: 24px; height: 24px; font-size: 13px; }
  .photo em { width: 20px; height: 20px; font-size: 10px; }
  .hint, .empty { margin-top: 20px; font-size: 13px; line-height: 1.55; }
  .empty { padding: 13px 12px; }
  .feeds header p, .feeds header > span, .feeds time, .feeds aside { font-size: 13px; }
  .feeds h2 { font-size: 20px; }
  .feeds article small { font-size: 13px; }
  .feeds article p { margin: 8px 0 10px; font-size: 15px; line-height: 1.5; }
}
@media (max-width: 767px) {
  .cal {
    box-sizing: border-box;
    width: calc(100% + 40px);
    height: calc(100dvh - 144px);
    min-height: 0;
    margin: -20px;
    padding: 16px 16px 10px;
    overflow: hidden;
    background: var(--app-background, #e6dcf6);
  }
  .head { margin-bottom: 15px; }
  .head p { display: none; }
  .filters { margin-bottom: 15px; }
  .board { margin-bottom: 4px; }
  .surface { padding-bottom: 14px; }
  .hint { display: none; }
}
@media (max-width: 767px) and (max-height: 700px) {
  .cal { padding-top: 10px; }
  .head { margin-bottom: 10px; }
  .head small { display: none; }
  .head h1 { font-size: 23px; }
  .filters { margin-bottom: 10px; }
  .filters .select-wrap select { min-height: 40px; }
  .surface { padding-top: 13px; }
  .nav { margin-bottom: 13px; }
  .nav button { width: 32px; height: 32px; }
  .grid { gap: 7px 3px; }
}
/* 상세 피드의 텍스트 축을 이미지 중심에 맞춰 상단 쏠림을 줄입니다. */
.feeds header { align-items: center; }
.feeds header > span { display: inline-flex; min-height: 32px; align-items: center; justify-content: center; text-align: center; }
.feeds article { align-items: stretch; }
.feeds article > div:last-child { display: flex; min-width: 0; flex-direction: column; justify-content: center; }
.feeds article > div:last-child > :first-child { margin-top: 0; }
@media (max-width: 767px) {
  .feeds header { min-height: 48px; }
  .feeds header > span { min-width: 112px; min-height: 36px; padding-inline: 10px; }
  .feeds article > div:last-child { padding-block: 3px; }
  .feeds article small, .feeds article time { line-height: 1.45; }
  .feeds aside { text-align: left; }
}
@media (max-width: 767px) {
  :global(.base-modal__overlay:has(.calendar-modal)) {
    align-items: end;
    padding: 0;
    z-index: 10000 !important;
  }
  :global(.calendar-modal) {
    position: relative;
    width: 100% !important;
    height: 72dvh !important;
    max-width: none !important;
    max-height: 72dvh !important;
    margin: 0 !important;
    overflow: hidden !important;
    overscroll-behavior: none;
    border-width: 3px 0 0 !important;
    border-radius: 22px 22px 0 0 !important;
    box-shadow: 0 -3px 0 var(--yl-ink) !important;
  }
  :global(.calendar-modal .base-modal__header) {
    position: sticky;
    top: 0;
    z-index: 2;
    box-sizing: border-box;
    height: 54px;
    min-height: 54px;
    padding: 16px 18px 9px;
    border-radius: 19px 19px 0 0;
    justify-content: center;
  }
  :global(.calendar-modal .base-modal__header::before) {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 42px;
    height: 4px;
    border-radius: 999px;
    background: rgba(34, 34, 34, 0.45);
    transform: translateX(-50%);
  }
  :global(.calendar-modal .base-modal__title) { font-size: 16px; }
  :global(.calendar-modal .base-modal__close) { display: none; }
  :global(.calendar-modal .base-modal__body) { height: calc(72dvh - 54px); box-sizing: border-box; display: flex; flex-direction: column; padding: 8px 18px calc(16px + env(safe-area-inset-bottom)); overflow: hidden; }
  .daily-feed { min-height: 0; flex: 1; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
}
/* 한 날짜의 추가 인증 수는 스토리 썸네일 우측 상단에 표시합니다. */
.photo { overflow: visible; }
.photo img, .photo::after { border-radius: 50%; }
.photo em { top: -3px; right: -3px; bottom: auto; z-index: 7; width: 17px; height: 17px; border-width: 1px; opacity: .92; font-size: 9px; }
@media (max-width: 767px) { .photo em { width: 15px; height: 15px; font-size: 8px; } }
/* 인증한 날은 스토리 이미지 위에 날짜를 직접 표시합니다. */
.day.has strong {
  position: absolute;
  inset: 0;
  z-index: 5;
  width: auto;
  height: auto;
  margin: 0;
  color: #fff;
  background: transparent;
  font-size: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .9), 1px 0 1px rgba(0, 0, 0, .75);
}
@media (max-width: 767px) { .day.has strong { font-size: 13px; } }
</style>
