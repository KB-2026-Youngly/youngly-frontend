<template>
  <section class="card" aria-labelledby="interest-title">
    <h2 id="interest-title">관심사</h2>
    <div v-if="investment.length" class="group"><span>투자 관심사</span><div><b v-for="item in investment" :key="item">{{ item }}</b></div></div>
    <div v-if="general.length" class="group"><span>일반 관심사</span><div><b v-for="item in general" :key="item">{{ item }}</b></div></div>
  </section>
</template>
<script setup>
defineProps({ investment: { type: Array, default: () => [] }, general: { type: Array, default: () => [] } })
</script>
<style scoped>
.card { padding: 22px 25px; border: 1px solid rgba(105, 82, 159, .14); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(49, 37, 72, .07); }.card h2 { margin: 0 0 16px; color: #302b38; font-size: 17px; }.group + .group { margin-top: 15px; }.group > span { display: block; margin-bottom: 8px; color: #847a91; font-size: 11px; font-weight: 800; }.group div { display: flex; flex-wrap: wrap; gap: 7px; }.group b { padding: 6px 10px; border-radius: 999px; color: #60408f; background: #f0eafb; font-size: 11px; } .group + .group b { color: #486d65; background: #e8f3ef; }@media (max-width: 767px) { .card { padding: 20px 17px; } }
</style>
