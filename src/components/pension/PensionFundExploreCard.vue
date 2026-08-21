<template>
  <div class="fund-banner-shadow yl-stepped-card-shadow" :class="{ 'has-callout': highlight, 'is-highlighted': highlight }">
  <p v-if="highlight" class="fund-banner-callout">지금, 연금저축펀드도 둘러볼까요?</p>
  <RouterLink class="fund-banner" :to="{ name: 'PensionFundProducts' }" aria-label="연금저축펀드 상품 보러가기">
    <img :src="rabbitImage" alt="" aria-hidden="true" />
    <span><small>KB국민은행 연금저축</small><b>연금저축펀드 상품 보러가기</b></span>
    <ChevronRight :size="21" aria-hidden="true" />
  </RouterLink>
  </div>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import rabbitImage from '@/assets/characters/pension-coli-thumbs-up.png'

defineProps({ highlight: { type: Boolean, default: false } })

</script>

<style scoped>
.fund-banner{min-height:72px;margin-top:16px;padding:8px 17px;display:flex;align-items:center;gap:12px;border-radius:17px;color:#302b38;background:var(--yl-yellow,#fdb913);box-shadow:0 8px 20px rgba(122,91,15,.16);text-decoration:none}.fund-banner img{width:54px;height:54px;flex:0 0 auto;object-fit:contain}.fund-banner span{min-width:0;display:grid;gap:3px}.fund-banner small{color:#735600;font-size:10px;font-weight:900}.fund-banner b{font-size:16px;line-height:1.35}.fund-banner :deep(svg){margin-left:auto;flex:0 0 auto}@media(min-width:768px){.fund-banner{min-height:80px;margin-top:16px;padding:10px 22px}.fund-banner img{width:60px;height:60px}.fund-banner b{font-size:17px}}
.fund-banner-shadow{--yl-stepped-shadow-color:#c8b7e5;--yl-stepped-shadow-offset:5px;position:relative;margin-top:16px}.fund-banner-shadow.has-callout{margin-bottom:52px}.fund-banner{margin-top:0;position:relative;isolation:isolate;border:0;border-radius:0;background:#8e6c0c;box-shadow:none;filter:none;clip-path:polygon(11px 0,calc(100% - 11px) 0,calc(100% - 11px) 3px,calc(100% - 7px) 3px,calc(100% - 7px) 6px,calc(100% - 3px) 6px,calc(100% - 3px) 11px,100% 11px,100% calc(100% - 11px),calc(100% - 3px) calc(100% - 11px),calc(100% - 3px) calc(100% - 6px),calc(100% - 7px) calc(100% - 6px),calc(100% - 7px) calc(100% - 3px),calc(100% - 11px) calc(100% - 3px),calc(100% - 11px) 100%,11px 100%,11px calc(100% - 3px),7px calc(100% - 3px),7px calc(100% - 6px),3px calc(100% - 6px),3px calc(100% - 11px),0 calc(100% - 11px),0 11px,3px 11px,3px 6px,7px 6px,7px 3px,11px 3px)}.fund-banner::before{position:absolute;inset:2px;z-index:0;clip-path:inherit;background:var(--yl-yellow,#fdb913);content:''}.fund-banner>*{position:relative;z-index:1}.fund-banner-callout{position:absolute;z-index:2;top:calc(100% + 12px);left:12px;max-width:min(270px,calc(100% - 12px));margin:0;padding:8px 11px;border:1px solid #d8ccea;border-radius:12px;background:#fff;color:#5e428c;font-size:11px;font-weight:800;line-height:1.4}.fund-banner-callout::after{position:absolute;top:-6px;left:15px;width:10px;height:10px;border-top:1px solid #d8ccea;border-left:1px solid #d8ccea;background:#fff;content:'';transform:rotate(45deg)}
.fund-banner-shadow.is-highlighted::before{animation:fund-banner-shadow-blink 1.2s ease-in-out infinite}.fund-banner-shadow.is-highlighted .fund-banner{animation:fund-banner-border-blink 1.2s ease-in-out infinite}.fund-banner-shadow.is-highlighted .fund-banner::before{animation:fund-banner-fill-blink 1.2s ease-in-out infinite}@keyframes fund-banner-shadow-blink{0%,100%{background:#c8b7e5}50%{background:#b59bdb}}@keyframes fund-banner-border-blink{0%,100%{background:#8e6c0c}50%{background:#af8509}}@keyframes fund-banner-fill-blink{0%,100%{background:var(--yl-yellow,#fdb913)}50%{background:#ffe06c}}@media(prefers-reduced-motion:reduce){.fund-banner-shadow.is-highlighted::before,.fund-banner-shadow.is-highlighted .fund-banner,.fund-banner-shadow.is-highlighted .fund-banner::before{animation:none}}
</style>
