<template>
  <section class="cal" aria-label="인증 보관함">
    <div ref="groupFilterRef" class="calendar-card-shadow calendar-filter-shadow yl-stepped-card-shadow"><section class="filter-frame yl-card-frame pixel-step-card pixel-step-solid" aria-label="그룹 필터"><div class="filters pixel-step-surface"><div class="filter-copy"><span>챌린지 선택</span></div><div class="group-dropdown"><button ref="groupTriggerRef" class="group-trigger" type="button" :aria-expanded="groupMenuOpen" aria-haspopup="listbox" @click="toggleGroupMenu"><strong>{{groupName}}</strong><ChevronDown :size="18" aria-hidden="true" /></button></div></div></section></div>
    <Teleport to="body"><transition name="group-menu"><div v-if="groupMenuOpen" ref="groupMenuRef" class="group-menu calendar-filter-menu calendar-filter-menu--portal" :style="groupMenuStyle" role="listbox" aria-label="인증 그룹 선택"><button v-for="g in groups" :key="g.groupId" type="button" role="option" :aria-selected="groupId===g.groupId" :class="{selected:groupId===g.groupId}" @click="selectGroup(g.groupId)"><span>{{g.groupName}}</span><Check v-if="groupId===g.groupId" :size="16" aria-hidden="true" /></button></div></transition></Teleport>
    <div class="calendar-card-shadow yl-stepped-card-shadow"><section class="board yl-card-frame pixel-step-card pixel-step-solid"><div class="surface pixel-step-surface"><div class="nav"><button aria-label="이전 달" @click="move(-1)"><ChevronLeft :size="22" stroke-width="2.5" aria-hidden="true" /></button><h2>{{label}}</h2><button aria-label="다음 달" @click="move(1)"><ChevronRight :size="22" stroke-width="2.5" aria-hidden="true" /></button></div><div class="week"><span v-for="w in week" :key="w">{{w}}</span></div><div class="grid"><i v-for="n in offset" :key="`b${n}`"></i><button v-for="d in lastDay" :key="d" class="day" :class="{has:posts(d).length,selected:key(d)===selected,today:isToday(d)}" :aria-label="aria(d)" @click="open(d)"><span v-if="posts(d).length" class="photo"><img :src="posts(d)[0].photoUrl" :alt="`${d}일 인증 사진`"><em v-if="posts(d).length>1">+{{posts(d).length-1}}</em></span><strong>{{d}}</strong><i v-if="posts(d).length"></i></button></div><p v-if="!monthPosts.length" class="empty">{{groupId==='all'?'이번 달에는 아직 인증 기록이 없어요.':`${groupName}에서 이번 달에 올린 인증이 없어요.`}}</p><p v-else class="hint">사진이 있는 날짜를 선택하면 내 인증 기록을 확인할 수 있어요.</p></div></section></div>
    <BaseModal v-model="modal" modal-class="calendar-modal" size="large" :title="dateLabel" @close="selected=''"><section v-if="selected" class="feeds daily-feed" data-sheet-scroll-container><header class="sheet-summary"><p>인증 기록 <strong>{{daily.length}}건</strong></p><div class="sheet-status-summary"><span class="approved">승인 {{dailySummary.APPROVED}}건</span><span class="rejected">반려 {{dailySummary.REJECTED}}건</span><span class="pending">심사중 {{dailySummary.PENDING}}건</span></div></header><article v-for="p in daily" :key="p.postId" :class="p.postStatus" :aria-label="`${p.groupName} ${status(p.postStatus)} 인증 기록`"><div class="image"><img :src="p.photoUrl" :alt="`${p.groupName} 인증 사진`"><div class="feed-photo-copy"><strong>{{p.content}}</strong></div></div><div class="feed-meta"><strong class="challenge-name">{{p.groupName}}</strong><div class="reaction-counts" :aria-label="`좋아요 ${p.likeCount ?? 0}개, 싫어요 ${p.dislikeCount ?? 0}개`"><span><ThumbsUp :size="15" :stroke-width="2.2" aria-hidden="true" /><b>{{p.likeCount ?? 0}}</b></span><span><ThumbsDown :size="15" :stroke-width="2.2" aria-hidden="true" /><b>{{p.dislikeCount ?? 0}}</b></span></div><aside v-if="p.postStatus==='REJECTED'&&p.rejectReason"><strong>반려 사유</strong>{{p.rejectReason}}</aside></div></article></section></BaseModal>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, ChevronDown, ChevronLeft, ChevronRight, ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import BaseModal from '@/components/base/BaseModal.vue'
import { getMyCertificationPosts } from '@/api/post'
import { getGroups } from '@/api/group'

const calendarGroups=ref([])
const groupTriggerRef=ref(null)
const groupMenuRef=ref(null)
const groupMenuStyle=ref({})
const today=new Date()
const week=['일','월','화','수','목','금','토'],groupId=ref('all'),current=ref(new Date(today.getFullYear(),today.getMonth(),1)),selected=ref(''),modal=ref(false),groupMenuOpen=ref(false),groupFilterRef=ref(null)
const groups=computed(()=>[{groupId:'all',groupName:'전체'},...calendarGroups.value]),groupName=computed(()=>groups.value.find(g=>g.groupId===groupId.value)?.groupName??'전체')
const apiPosts=ref([]), monthPosts = computed(() =>
  apiPosts.value.filter(
    (post) =>
      groupId.value === 'all' ||
      String(post.groupId) ===
        String(groupId.value)
  )
),label=computed(()=>`${current.value.getFullYear()}년 ${current.value.getMonth()+1}월`),offset=computed(()=>new Date(current.value.getFullYear(),current.value.getMonth(),1).getDay()),lastDay=computed(()=>new Date(current.value.getFullYear(),current.value.getMonth()+1,0).getDate()),daily=computed(()=>monthPosts.value.filter(p=>p.postedAt.slice(0,10)===selected.value).sort((a,b)=>a.postedAt.localeCompare(b.postedAt))),dateLabel=computed(()=>selected.value?`${Number(selected.value.slice(5,7))}월 ${Number(selected.value.slice(8))}일`:'')
const dailySummary=computed(()=>daily.value.reduce((summary,post)=>{summary[post.postStatus]=(summary[post.postStatus]??0)+1;return summary},{APPROVED:0,REJECTED:0,PENDING:0}))
const key=d=>`${current.value.getFullYear()}-${String(current.value.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,posts=d=>monthPosts.value.filter(p=>p.postedAt.slice(0,10)===key(d)),isToday=d=>{const n=new Date();return n.getFullYear()===current.value.getFullYear()&&n.getMonth()===current.value.getMonth()&&n.getDate()===d},aria=d=>`${label.value} ${d}일${posts(d).length?`, 내 인증 ${posts(d).length}건`:', 인증 없음'}`,move=n=>{current.value=new Date(current.value.getFullYear(),current.value.getMonth()+n,1);selected.value=''},open=d=>{if(!posts(d).length)return;selected.value=key(d);modal.value=true},selectGroup=id=>{groupId.value=id;groupMenuOpen.value=false},status=s=>({APPROVED:'승인됨',REJECTED:'반려됨',PENDING:'심사중'})[s]

const dateParam=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const syncGroupMenuPosition=()=>{const rect=groupTriggerRef.value?.getBoundingClientRect();if(!rect)return;groupMenuStyle.value={position:'fixed',top:`${rect.bottom+7}px`,left:`${rect.left}px`,width:`${rect.width}px`}}
const toggleGroupMenu=async()=>{groupMenuOpen.value=!groupMenuOpen.value;if(groupMenuOpen.value){await nextTick();syncGroupMenuPosition()}}
const updateGroupMenuPosition=()=>{if(groupMenuOpen.value)syncGroupMenuPosition()}
const loadMonthPosts=async()=>{
  const from=new Date(current.value.getFullYear(),current.value.getMonth(),1)
  const to=new Date(current.value.getFullYear(),current.value.getMonth()+1,0)
  try {
    const [{ data: posts }, { data: fetchedGroups }] = await Promise.all([
      getMyCertificationPosts({ from: dateParam(from), to: dateParam(to) }),
      getGroups(),
    ])

    apiPosts.value = Array.isArray(posts)
      ? posts.map((post) => ({
          ...post,
          myReaction: post.myReaction?.toUpperCase() || null,
        }))
      : []

    calendarGroups.value = Array.isArray(fetchedGroups)
      ? fetchedGroups
          .filter((group) => group.groupId && group.groupName)
          .map((group) => ({
            groupId: String(group.groupId),
            groupName: group.groupName,
          }))
      : []

    if (groupId.value !== 'all' && !calendarGroups.value.some(
      (group) => String(group.groupId) === String(groupId.value),
    )) groupId.value = 'all'
  } catch (error) {
    console.error('캘린더 인증 기록 조회 실패:', error)
    apiPosts.value = []
    calendarGroups.value = []
    groupId.value = 'all'
  }
}

watch(current,loadMonthPosts)
const closeGroupMenu=(event)=>{if(!groupFilterRef.value?.contains(event.target)&&!groupMenuRef.value?.contains(event.target))groupMenuOpen.value=false}
let calendarSheetElement=null
let calendarSheetSwipe=null
let calendarSheetCloseTimer=null
const resetCalendarSheetSwipe=(state)=>{state?.sheet?.style.removeProperty('transform');state?.sheet?.style.removeProperty('transition');state?.sheet?.style.removeProperty('will-change');state?.overlay?.style.removeProperty('background-color');state?.overlay?.style.removeProperty('transition')}
const startCalendarSheetSwipe=(event)=>{if(!event.touches||event.touches.length!==1)return;const target=event.target;if(target instanceof Element&&target.closest('button,a,input,select,textarea'))return;const scroll=target instanceof Element?target.closest('[data-sheet-scroll-container]'):null;if(scroll?.scrollTop>0)return;const touch=event.touches[0];const now=performance.now();calendarSheetSwipe={sheet:calendarSheetElement,overlay:calendarSheetElement?.closest('.base-modal__overlay'),startY:touch.clientY,lastY:touch.clientY,lastTime:now,velocity:0,distance:0};calendarSheetElement.style.transition='none';calendarSheetElement.style.willChange='transform'}
const moveCalendarSheetSwipe=(event)=>{const state=calendarSheetSwipe;if(!state||event.touches.length!==1)return;const touch=event.touches[0];const delta=touch.clientY-state.startY;if(delta<=0)return;event.preventDefault();const now=performance.now();state.velocity=(touch.clientY-state.lastY)/Math.max(1,now-state.lastTime);state.lastY=touch.clientY;state.lastTime=now;state.distance=Math.min(delta,Math.max(220,state.sheet.offsetHeight));state.sheet.style.transform=`translate3d(0,${state.distance}px,0)`;state.overlay?.style.setProperty('background-color',`rgba(24,20,36,${.5*(1-Math.min(state.distance/Math.max(state.sheet.offsetHeight*.72,1),1))})`)}
const endCalendarSheetSwipe=()=>{const state=calendarSheetSwipe;if(!state)return;calendarSheetSwipe=null;const shouldClose=state.distance>=Math.min(140,state.sheet.offsetHeight*.24)||(state.distance>=45&&state.velocity>.4);state.sheet.style.transition='transform 380ms cubic-bezier(.22,1,.36,1)';state.overlay?.style.setProperty('transition','background-color 380ms ease');if(shouldClose){state.sheet.style.transform=`translate3d(0,${state.sheet.offsetHeight+32}px,0)`;state.overlay?.style.setProperty('background-color','rgba(24,20,36,0)');calendarSheetCloseTimer=window.setTimeout(()=>{modal.value=false;selected.value='';resetCalendarSheetSwipe(state)},370);return}state.sheet.style.transform='translate3d(0,0,0)';state.overlay?.style.setProperty('background-color','rgba(24,20,36,.5)');window.setTimeout(()=>resetCalendarSheetSwipe(state),390)}
const cancelCalendarSheetSwipe=()=>{const state=calendarSheetSwipe;if(!state)return;calendarSheetSwipe=null;state.sheet.style.transition='transform 340ms cubic-bezier(.22,1,.36,1)';state.sheet.style.transform='translate3d(0,0,0)';window.setTimeout(()=>resetCalendarSheetSwipe(state),350)}
const unbindCalendarSheetSwipe=()=>{if(!calendarSheetElement)return;calendarSheetElement.removeEventListener('touchstart',startCalendarSheetSwipe);calendarSheetElement.removeEventListener('touchmove',moveCalendarSheetSwipe);calendarSheetElement.removeEventListener('touchend',endCalendarSheetSwipe);calendarSheetElement.removeEventListener('touchcancel',cancelCalendarSheetSwipe);calendarSheetElement=null}
const bindCalendarSheetSwipe=async()=>{await nextTick();unbindCalendarSheetSwipe();if(!modal.value||!window.matchMedia('(max-width:767px)').matches)return;calendarSheetElement=document.querySelector('.calendar-modal');if(!calendarSheetElement)return;calendarSheetElement.addEventListener('touchstart',startCalendarSheetSwipe,{passive:true});calendarSheetElement.addEventListener('touchmove',moveCalendarSheetSwipe,{passive:false});calendarSheetElement.addEventListener('touchend',endCalendarSheetSwipe,{passive:true});calendarSheetElement.addEventListener('touchcancel',cancelCalendarSheetSwipe,{passive:true})}
watch(modal,bindCalendarSheetSwipe)
onMounted(()=>{loadMonthPosts();document.addEventListener('click',closeGroupMenu);window.addEventListener('resize',updateGroupMenuPosition);window.addEventListener('scroll',updateGroupMenuPosition,true)})
onBeforeUnmount(()=>{document.removeEventListener('click',closeGroupMenu);window.removeEventListener('resize',updateGroupMenuPosition);window.removeEventListener('scroll',updateGroupMenuPosition,true);unbindCalendarSheetSwipe();clearTimeout(calendarSheetCloseTimer)})
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

/* 챌린지 보관함: 그룹 상세 화면의 보라색 정보 UI 톤을 적용합니다. */
.head h1 { margin: 0; font-size: 30px; letter-spacing: -.04em; }
.filters { display: flex; align-items: center; gap: 12px; }
.filters > span { color: #62576c; font-size: 14px; font-weight: 800; }
.group-dropdown { position: relative; display: block !important; min-width: 210px; }
.group-trigger { width: 100%; min-height: 46px; padding: 0 13px 0 15px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid #d6cbe2; border-radius: 12px; background: #faf8fd; box-shadow: 0 3px 10px rgba(79,57,126,.10); color: #4d405a; font: inherit; cursor: pointer; text-align: left; transition: border-color .18s, box-shadow .18s, background-color .18s; }
.group-trigger strong { overflow: hidden; font-size: 14px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.group-trigger svg { flex: 0 0 auto; color: #69529f; transition: transform .18s; }
.group-trigger[aria-expanded='true'] { border-color: #8063aa; background: #fff; box-shadow: 0 0 0 3px rgba(105,82,159,.12); }
.group-trigger[aria-expanded='true'] svg { transform: rotate(180deg); }
.group-menu { position: absolute; top: calc(100% + 7px); right: 0; z-index: 20; width: 100%; max-height: 220px; padding: 6px; overflow-y: auto; border: 1px solid #ddd3e7; border-radius: 13px; background: #fff; box-shadow: 0 12px 30px rgba(54,39,76,.18); }
.group-menu button { width: 100%; min-height: 40px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 0; border-radius: 8px; background: transparent; color: #62576c; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; text-align: left; }
.group-menu button:hover, .group-menu button.selected { background: #eee6f8; color: #5d408d; }
.group-menu button.selected { font-weight: 900; }
.group-menu-enter-active,.group-menu-leave-active { transition: opacity .15s, transform .15s; transform-origin: top right; }
.group-menu-enter-from,.group-menu-leave-to { opacity: 0; transform: translateY(-5px) scale(.98); }
.board { --pixel-outline-color: var(--yl-purple); --pixel-fill: #fff; filter: drop-shadow(6px 7px 0 rgba(91,66,137,.38)); }
.nav { grid-template-columns: 44px 1fr 44px; }
.nav h2 { font-size: 22px; font-weight: 800; }
.nav button { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid #cfc1df; border-radius: 10px; background: #faf8fd; color: #604795; }
.nav button:hover { border-color: #8063aa; background: #f2ecfa; }
.week { font-size: 15px; font-weight: 800; }
.day strong { font-size: 16px; font-weight: 800; }
.day.has strong { font-size: 17px; }
.image b.APPROVED { border-color: #2f7d4d; background: #e4f7ea; color: #21643b; }
.image b.REJECTED { border-color: #b44755; background: #ffeaec; color: #a13b49; }
.challenge-name { color: #4d405a; font-size: 14px; font-weight: 900; line-height: 1.45; }
.feeds time { display: block; margin-top: 1px; }
@media (max-width: 767px) {
  .head h1 { font-size: 28px; }
  .filters { gap: 10px; margin-bottom: 16px; }
  .filters > span { font-size: 14px; }
  .group-dropdown { min-width: 0; flex: 1; }
  .group-trigger { min-height: 46px; }
  .nav { grid-template-columns: 42px 1fr 42px; }
  .nav h2 { font-size: 21px; }
  .nav button { width: 38px; height: 38px; }
  .week { font-size: 13px; }
  .day strong { width: 26px; height: 26px; font-size: 14px; }
  .day.has strong { font-size: 16px; }
  .challenge-name { font-size: 14px; }
}

/* 그룹 상세 화면과 동일한 카드 반경: 큰 카드 20px, 선택 요소 12px */
.head { display: none; }
.filters { min-height: 76px; box-sizing: border-box; justify-content: space-between; margin-bottom: 16px; padding: 12px 13px; border: 1px solid #ded4ea; border-radius: 20px; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.04); }
.filter-copy { display: grid !important; min-width: 0; gap: 4px; }
.filter-copy strong { color: #3f354a; font-size: 14px; font-weight: 900; }
.filter-copy span { color: #8a7d97; font-size: 12px; font-weight: 700; }
.group-dropdown { min-width: 170px; }
.group-trigger { min-height: 48px; border-width: 1.5px; border-radius: 12px; background: #f8f5fc; box-shadow: none; }
.board { padding: 7px; border-radius: 0; background: #7156ad; filter: drop-shadow(6px 7px 0 rgba(91,66,137,.32)); }
.surface { border: 0; border-radius: 20px; background: #fff; box-shadow: 0 4px 16px rgba(50,35,76,.10); }
.group-menu { border-radius: 12px; }
@media (max-width: 767px) {
  .filters { min-height: 70px; margin-bottom: 13px; padding: 10px 11px; border-radius: 20px; }
  .filter-copy strong { font-size: 13px; }
  .filter-copy span { font-size: 11px; }
  .group-dropdown { min-width: 0; width: min(52vw, 208px); flex: 0 1 auto; }
  .group-trigger { min-height: 46px; padding-inline: 12px; }
  .group-trigger strong { font-size: 13px; }
  .board { padding: 6px; }
  .surface { border-radius: 20px; }
}
/* 모바일 필터는 한 줄로 유지하고, 긴 그룹명도 가능한 한 온전히 보여줍니다. */
.filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(190px, 228px); gap: 12px; }
.filter-copy { display: flex !important; align-items: center; }
.filter-copy span { color: #7156ad; font-size: 13px; font-weight: 800; white-space: nowrap; }
.group-dropdown { width: 100%; min-width: 0; }
.group-trigger strong { overflow: visible; font-size: clamp(10px, 1.9vw, 13px); text-overflow: clip; white-space: nowrap; }
@media (max-width: 767px) {
  .filters { grid-template-columns: minmax(0, 1fr) minmax(188px, 1.5fr); gap: 8px; }
  .filter-copy span { font-size: 12px; }
  .group-dropdown { width: 100%; }
  .group-trigger strong { font-size: clamp(10px, 3.2vw, 13px); }
}

/* 날짜 가독성 및 주말 구분 */
.week span:last-child { color: #3e62c7; }
.day strong { font-size: 19px; }
.day.has strong { font-size: 19px; }
@media (max-width: 767px) {
  .day strong { font-size: 17px; }
  .day.has strong { font-size: 17px; }
}

/* 보라색을 기본 포인트로 통일하고, 반려만 차분한 빨강으로 구분합니다. */
.cal { color: #332d3a; }
.filters { border-color: #e7e1ee; background: #fff; }
.filter-copy span { color: #7156ad; }
.group-trigger { border-color: #e1d9eb; background: #fff; color: #3f354a; }
.group-trigger[aria-expanded='true'] { border-color: #7156ad; box-shadow: 0 0 0 3px rgba(113,86,173,.10); }
.group-menu { border-color: #e1d9eb; box-shadow: 0 10px 24px rgba(54,39,76,.12); }
.group-menu button:hover,.group-menu button.selected { background: #f3eff8; color: #604795; }
.surface { border-color: #7156ad; box-shadow: 3px 3px 0 rgba(113,86,173,.10); }
.nav button { color: #604795; }
.nav button:hover { background: #f3eff8; }
.week { color: #62576c; }
.week span:first-child { color: #b85b64; }
.week span:last-child { color: #536ba8; }
.photo { border-color: #7156ad; background: #f3eff8; }
.photo em,.day > i { background: #7156ad; }
.day.selected .photo { border-color: #7156ad; box-shadow: 0 0 0 3px #eee7f8; }
.empty { border-color: #d9cdea; background: #faf8fd; color: #62576c; }
:global(.calendar-modal) { border-color: #7156ad !important; box-shadow: 0 -2px 0 #7156ad !important; }
:global(.calendar-modal .base-modal__header) { border-bottom-color: #e6dff0 !important; background: #fff !important; }
:global(.calendar-modal .base-modal__title) { color: #3f354a; }
.feeds header > span { border-color: #d9cdea; background: #faf8fd; color: #604795; }
.image b { border: 1px solid; box-shadow: none; }
.image b.APPROVED { border-color: #7156ad; background: #f0ebf8; color: #604795; }
.image b.REJECTED { border-color: #c56a72; background: #fff1f2; color: #a34c55; }
.image b.PENDING { border-color: #d8d0df; background: #f7f5f8; color: #6f6678; }
.feeds aside { border-left: 3px solid #c56a72; background: #fff5f5; color: #9c5058; }

/* 선택값을 감싼 사각형을 없애고, 날짜 중심의 바텀시트로 정보 순서를 정리합니다. */
.filters { min-height: 52px; padding-block: 6px; }
.group-trigger { width: auto; min-height: 38px; padding: 0 2px 0 8px; border: 0; border-radius: 0; background: transparent; box-shadow: none; color: #604795; }
.group-trigger:hover,.group-trigger[aria-expanded='true'] { background: transparent; box-shadow: none; }
.group-trigger strong { font-size: 13px; font-weight: 900; }
.group-menu { min-width: 196px; }
:global(.calendar-modal .base-modal__header) { justify-content: center; }
:global(.calendar-modal .base-modal__title) { font-size: 19px; font-weight: 900; }
.sheet-summary { display: block; margin: 2px 0 12px; padding: 0 0 13px; border-bottom: 1px solid #ebe6f0; }
.sheet-summary p { margin: 0 0 4px; color: #3f354a; font-size: 16px; font-weight: 800; }
.sheet-summary p strong { color: #7156ad; }
.sheet-summary > span { color: #8a7d97; font-size: 12px; font-weight: 600; }
.feeds article { padding: 14px 0; border-top: 0; border-bottom: 1px solid #eeeaf1; }
.feeds article:last-child { border-bottom: 0; }
.image { min-height: 112px; border-radius: 12px; }
.image b { top: 7px; left: 7px; padding: 4px 7px; border-radius: 7px; font-size: 11px; }
.challenge-name { display: block; color: #332d3a; font-size: 15px; }
.feeds article p { color: #5f5568; }
.image b.APPROVED { border-color: #5ca36d; background: #eef8f0; color: #387747; }
.image b.REJECTED { border-color: #c56a72; background: #fff1f2; color: #a34c55; }
.image b.PENDING { border-color: #d8d0df; background: #f7f5f8; color: #6f6678; }
@media (max-width: 767px) {
  .filters { min-height: 50px; }
  .group-trigger { min-height: 36px; }
  :global(.calendar-modal .base-modal__title) { font-size: 18px; }
  .sheet-summary { margin-top: 3px; }
  .sheet-summary p { font-size: 16px; }
  .image { min-height: 108px; }
}

/* 상태는 작고 선명한 라운드 배지로 표시합니다. */
.image b { min-height: 24px; box-sizing: border-box; padding: 0 9px; display: inline-flex; align-items: center; border-radius: 999px; font-size: 11px; font-weight: 900; letter-spacing: -.02em; }

/* 긴 챌린지명을 위한 넓은 선택 영역 */
.filters { grid-template-columns: minmax(58px, .55fr) minmax(230px, 2.2fr); }
.group-trigger { width: 100%; min-height: 44px; padding: 0 13px 0 15px; border: 1px solid #d9cdea; border-radius: 12px; background: #faf8fd; box-shadow: 0 3px 10px rgba(79,57,126,.07); color: #4d405a; }
.group-trigger:hover,.group-trigger[aria-expanded='true'] { border-color: #8063aa; background: #fff; box-shadow: 0 0 0 3px rgba(105,82,159,.10); }
.group-trigger strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.group-menu { width: 100%; min-width: 0; }
@media (max-width: 767px) {
  .filters { grid-template-columns: minmax(52px, .5fr) minmax(220px, 2.15fr); }
  .group-trigger { min-height: 42px; }
}

/* 필터 라벨과 선택 영역의 시각적 간격 */
.filters { column-gap: 16px; }
.filter-copy { min-height: 28px; padding-right: 14px; border-right: 1px solid #e5deeb; }
.filter-copy span { color: #62576c; font-size: 12px; }
@media (max-width: 767px) {
  .filters { column-gap: 12px; }
  .filter-copy { padding-right: 10px; }
}

/* 그룹 피드처럼 사진과 인증 문구를 중심으로 보여주는 기록 카드 */
.sheet-summary { margin-bottom: 14px; }
.sheet-status-summary { display: flex; flex-wrap: wrap; gap: 6px; }
.sheet-status-summary span,.feed-meta b { min-height: 24px; box-sizing: border-box; padding: 0 8px; display: inline-flex; align-items: center; border: 1px solid; border-radius: 999px; font-size: 11px; font-weight: 800; }
.sheet-status-summary .approved,.feed-meta b.APPROVED { border-color: #5ca36d; background: #eef8f0; color: #387747; }
.sheet-status-summary .rejected,.feed-meta b.REJECTED { border-color: #c56a72; background: #fff1f2; color: #a34c55; }
.sheet-status-summary .pending,.feed-meta b.PENDING { border-color: #d8d0df; background: #f7f5f8; color: #6f6678; }
.feeds article { display: block; padding: 0 0 16px; overflow: hidden; border: 1px solid #e8e1ed; border-radius: 14px; background: #fff; }
.feeds article + article { margin-top: 14px; }
.image { height: 220px; min-height: 0; overflow: hidden; border-radius: 0; background: #eee; }
.image::after { content: ''; position: absolute; inset: 35% 0 0; background: linear-gradient(transparent, rgba(0,0,0,.62)); pointer-events: none; }
.image img { display: block; }
.feed-photo-copy { position: absolute; z-index: 2; right: 14px; bottom: 13px; left: 14px; display: grid; gap: 6px; color: #fff; }
.feed-photo-copy span { width: max-content; padding: 4px 8px; border-radius: 999px; background: rgba(113,86,173,.92); font-size: 11px; font-weight: 900; }
.feed-photo-copy strong { overflow: hidden; color: #fff; font-size: 19px; font-weight: 900; letter-spacing: -.04em; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
.feed-meta { padding: 12px 14px 0; }
.challenge-name { margin-bottom: 9px; font-size: 15px; }
.feed-meta > div { display: flex; align-items: center; gap: 8px; }
.feed-meta time { margin: 0; color: #8a7d97; font-size: 12px; }
.feed-meta aside { margin-bottom: 0; }
@media (max-width: 767px) {
  .image { height: 205px; }
  .feed-photo-copy strong { font-size: 18px; }
}

/* 필터는 작은 화면에서도 한 줄을 유지한다. 라벨과 선택 영역을 분리하되,
   고정 최소 너비를 두지 않아 선택 상자가 카드 밖으로 밀리지 않는다. */
.filters {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 10px 12px;
}
.filter-copy {
  display: flex !important;
  flex: 0 0 auto;
  min-height: 0;
  padding-right: 0;
  border-right: 0;
}
.filter-copy span {
  font-size: 13px;
  white-space: nowrap;
}
.group-dropdown {
  display: block !important;
  grid-column: 2;
  width: auto;
  min-width: 0;
}
.group-trigger {
  width: 100%;
  min-width: 0;
  min-height: 42px;
}
.group-trigger strong {
  min-width: 0;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-menu { min-width: 0; }
@media (max-width: 767px) {
  .filters { gap: 10px; padding: 9px 11px; }
  .group-trigger { min-height: 42px; }
}

/* 두 메인 카드는 그룹 피드와 같은 공통 픽셀 프레임 구조를 사용한다. */
.filter-frame {
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  width: 100%;
  margin: 0;
  padding: 2px !important;
  background: #ac99d2;
  filter: none !important;
}
.filter-frame::before { content: none; }
.filter-frame .filters {
  min-height: 0;
  margin: 0;
  padding: 14px 18px;
  border: 0;
  border-radius: 20px;
  background: #fff;
  box-shadow: none;
}
.filter-frame .group-dropdown {
  width: 100%;
  max-width: none;
  justify-self: stretch;
}
.calendar-filter-shadow { position: relative; z-index: 10; }
.calendar-filter-menu { top: calc(100% + 7px); right: 0; z-index: 30; width: min(228px, 62%); }
.board {
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  padding: 2px !important;
  background: #ac99d2;
  filter: drop-shadow(5px 5px 0 #c8b7e5);
}
.empty {
  margin: 18px 0 0;
  padding: 14px 16px;
  border: 1.5px dashed #cdbde1;
  border-radius: 12px;
  background: #faf8fd;
  color: #62576c;
  line-height: 1.5;
}
.feeds.daily-feed article { border: 2px solid #d8d0df; box-shadow: none; }
.feeds.daily-feed article.APPROVED { border-color: #5ca36d; }
.feeds.daily-feed article.REJECTED { border-color: #c56a72; }
.feeds.daily-feed article.PENDING { border-color: #aca1b6; }
.feed-meta { padding-bottom: 13px; }
.reaction-counts { display: flex; align-items: center; gap: 13px; margin-top: 8px; color: #766b81; }
.reaction-counts span { display: inline-flex; align-items: center; gap: 5px; }
.reaction-counts b { min-height: 0; padding: 0; border: 0; background: transparent; font-size: 12px; font-weight: 800; line-height: 1; }
.reaction-counts span { color: var(--yl-ink); }

/* 그룹 상세 카드와 동일한 2px 프레임·5px 연보라 그림자 규격 */
.filter-frame .filters,
.board .surface { border-radius: 20px; }
.day > i { display: none; }
.day:not(.has) strong,
.day.today:not(.has) strong {
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  color: #62576c;
}
.day.today:not(.has) strong {
  position: absolute;
  inset: 1px;
  width: auto;
  height: auto;
  margin: 0;
  border-width: 2px;
  background: #fff;
  color: var(--yl-ink);
}

/* 그룹 피드 카드와 같은 2px 픽셀 외곽선과 5px 연보라 그림자 */
.calendar-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}
.calendar-card-shadow { margin-bottom: 18px; }
.calendar-card-shadow .filter-frame { margin: 0; }
.calendar-card-shadow .filter-frame::before { filter: none; }
.calendar-card-shadow .board { filter: none !important; }
.calendar-card-shadow .pixel-step-surface {
  border-radius: 0;
  box-shadow: none;
  clip-path: inherit;
}
.calendar-card-shadow .nav button,
.calendar-card-shadow .nav button:hover {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
@media (max-width: 767px) {
  .calendar-card-shadow { margin-bottom: 14px; }
}
@media (max-width: 767px) {
  .filter-frame { margin-bottom: 12px; }
  .filter-frame .filters { padding: 13px 17px; }
  .filter-frame .group-dropdown { max-width: none; }
}
/* Final mobile sheet and feed alignment overrides */
.calendar-filter-shadow,.filter-frame,.filter-frame .filters,.group-dropdown{overflow:visible!important}.calendar-filter-shadow{z-index:50}.group-dropdown{position:relative;z-index:60}.group-dropdown .calendar-filter-menu{top:calc(100% + 7px);right:0;z-index:70;width:100%;min-width:0}.feed-photo-copy{inset:0;align-items:center;justify-items:center;padding:18px;text-align:center}.feed-photo-copy strong{white-space:normal}.image{height:220px}.feed-meta{margin-top:14px;padding:18px 18px 20px}.daily-feed{padding:12px 8px 28px}
@media(max-width:767px){.cal{width:100%;height:auto;min-height:calc(100dvh - 139px);margin:0;padding:8px 16px 16px;overflow:visible}.image{height:205px}.feed-photo-copy{padding:16px}.feed-meta{margin-top:14px;padding:18px 18px 22px}.daily-feed{padding:14px 10px 30px}:global(.base-modal-fade-enter-active .calendar-modal),:global(.base-modal-fade-leave-active .calendar-modal){transition:transform 380ms cubic-bezier(.22,1,.36,1)}}
:global(.calendar-filter-menu--portal){position:fixed!important;z-index:2147483647!important;isolation:isolate;box-sizing:border-box;max-height:min(220px,calc(100dvh - 16px));padding:6px;overflow-y:auto;overflow-x:visible;border:1px solid #e1d9eb;border-radius:12px;background:#fff;box-shadow:0 12px 30px rgba(55,42,74,.2);color:#62576c}
:global(.calendar-filter-menu--portal button){display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:40px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:#62576c;font:inherit;font-size:13px;font-weight:700;line-height:1.25;text-align:left;cursor:pointer}
:global(.calendar-filter-menu--portal button:hover),:global(.calendar-filter-menu--portal button.selected){background:#f3eff8;color:#604795}
:global(.calendar-filter-menu--portal button.selected){font-weight:900}
:global(.group-menu-enter-active),:global(.group-menu-leave-active){transition:opacity .16s ease,transform .16s ease}
:global(.group-menu-enter-from),:global(.group-menu-leave-to){opacity:0;transform:translateY(-4px)}
</style>
