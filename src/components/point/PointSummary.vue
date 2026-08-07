<template>
  <section class="point-summary" aria-labelledby="point-balance-title">
    <div class="point-summary__icon" aria-hidden="true">
      <Coins :size="30" :stroke-width="2.4" />
    </div>
    <div>
      <p id="point-balance-title">현재 보유 포인트</p>
      <strong>{{ formattedBalance }}<span>P</span></strong>
    </div>
    <span class="point-summary__badge">MY POINT</span>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Coins } from 'lucide-vue-next'

const props = defineProps({
  balance: {
    type: Number,
    default: 0,
  },
})

const formattedBalance = computed(() => new Intl.NumberFormat('ko-KR').format(props.balance))
</script>

<style scoped>
.point-summary {
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 18px;
  align-items: center;
  min-height: 136px;
  padding: 26px 30px;
  border: 3px solid #322a43;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 8px 8px 0 #7156ad;
  box-sizing: border-box;
}

.point-summary__icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 3px solid #322a43;
  background: #f8d86a;
  color: #564016;
  box-shadow: 4px 4px 0 #cab350;
}

.point-summary p {
  margin: 0 0 5px;
  color: #6d6578;
  font-size: 14px;
  font-weight: 700;
}

.point-summary strong {
  color: #30283d;
  font-size: clamp(30px, 5vw, 42px);
  line-height: 1;
  letter-spacing: -1px;
}

.point-summary strong span {
  margin-left: 5px;
  color: #7156ad;
  font-size: 0.55em;
}

.point-summary__badge {
  align-self: start;
  padding: 6px 9px;
  border: 2px solid #7156ad;
  color: #7156ad;
  background: #f4effc;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
}

@media (max-width: 560px) {
  .point-summary {
    grid-template-columns: 52px 1fr;
    min-height: 116px;
    padding: 22px 20px;
    box-shadow: 6px 6px 0 #7156ad;
  }

  .point-summary__icon {
    width: 46px;
    height: 46px;
  }

  .point-summary__badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}
</style>
