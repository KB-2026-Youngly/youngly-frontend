<template>
  <RouterLink class="fund-banner" :to="{ name: 'PensionFundProducts' }" aria-label="연금저축펀드 상품 보러가기">
    <img :src="rabbitImage" alt="" aria-hidden="true" />
    <span><small>KB국민은행 연금저축</small><b>연금저축펀드 상품 보러가기</b></span>
    <ChevronRight :size="21" aria-hidden="true" />
  </RouterLink>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import rabbitImage from '@/assets/pension/fund-banner-character.png'
</script>

<style scoped>
.fund-banner{min-height:82px;margin-top:16px;padding:12px 17px;display:flex;align-items:center;gap:12px;border-radius:17px;color:#302b38;background:var(--yl-yellow,#fdb913);box-shadow:0 8px 20px rgba(122,91,15,.16);text-decoration:none}.fund-banner img{width:54px;height:54px;flex:0 0 auto;object-fit:contain}.fund-banner span{min-width:0;display:grid;gap:3px}.fund-banner small{color:#735600;font-size:10px;font-weight:900}.fund-banner b{font-size:16px;line-height:1.35}.fund-banner :deep(svg){margin-left:auto;flex:0 0 auto}@media(min-width:768px){.fund-banner{min-height:90px;padding:14px 22px}.fund-banner img{width:60px;height:60px}.fund-banner b{font-size:17px}}
</style>
