<template>
  <div class="fund-banner-shadow yl-stepped-card-shadow">
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
</script>

<style scoped>
.fund-banner{min-height:72px;margin-top:16px;padding:8px 17px;display:flex;align-items:center;gap:12px;border-radius:17px;color:#302b38;background:var(--yl-yellow,#fdb913);box-shadow:0 8px 20px rgba(122,91,15,.16);text-decoration:none}.fund-banner img{width:54px;height:54px;flex:0 0 auto;object-fit:contain}.fund-banner span{min-width:0;display:grid;gap:3px}.fund-banner small{color:#735600;font-size:10px;font-weight:900}.fund-banner b{font-size:16px;line-height:1.35}.fund-banner :deep(svg){margin-left:auto;flex:0 0 auto}@media(min-width:768px){.fund-banner{min-height:80px;margin-top:16px;padding:10px 22px}.fund-banner img{width:60px;height:60px}.fund-banner b{font-size:17px}}
.fund-banner-shadow{--yl-stepped-shadow-color:#c8b7e5;--yl-stepped-shadow-offset:5px}.fund-banner{position:relative;isolation:isolate;border:0;border-radius:0;background:#8e6c0c;box-shadow:none;filter:none;clip-path:polygon(11px 0,calc(100% - 11px) 0,calc(100% - 11px) 3px,calc(100% - 7px) 3px,calc(100% - 7px) 6px,calc(100% - 3px) 6px,calc(100% - 3px) 11px,100% 11px,100% calc(100% - 11px),calc(100% - 3px) calc(100% - 11px),calc(100% - 3px) calc(100% - 6px),calc(100% - 7px) calc(100% - 6px),calc(100% - 7px) calc(100% - 3px),calc(100% - 11px) calc(100% - 3px),calc(100% - 11px) 100%,11px 100%,11px calc(100% - 3px),7px calc(100% - 3px),7px calc(100% - 6px),3px calc(100% - 6px),3px calc(100% - 11px),0 calc(100% - 11px),0 11px,3px 11px,3px 6px,7px 6px,7px 3px,11px 3px)}.fund-banner::before{position:absolute;inset:2px;z-index:0;clip-path:inherit;background:var(--yl-yellow,#fdb913);content:''}.fund-banner>*{position:relative;z-index:1}
</style>
