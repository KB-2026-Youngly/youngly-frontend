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
  min-height: 142px;
  padding: 28px 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 22px;
  color: #ffffff;
  background:
    radial-gradient(circle at 88% 14%, rgba(255, 255, 255, 0.18), transparent 27%),
    linear-gradient(135deg, #7156ad 0%, #8d6fc5 100%);
  box-shadow: 0 16px 36px rgba(83, 57, 128, 0.22);
  box-sizing: border-box;
}

.point-summary__icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff1b2;
  box-shadow: none;
}

.point-summary p {
  margin: 0 0 5px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 14px;
  font-weight: 700;
}

.point-summary strong {
  color: #ffffff;
  font-size: clamp(30px, 5vw, 42px);
  line-height: 1;
  letter-spacing: -1px;
}

.point-summary strong span {
  margin-left: 5px;
  color: #fff0af;
  font-size: 0.55em;
}

.point-summary__badge {
  align-self: start;
  padding: 6px 9px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
}

@media (max-width: 560px) {
  .point-summary {
    grid-template-columns: 52px 1fr;
    min-height: 116px;
    padding: 22px 18px;
    border-radius: 19px;
  }

  .point-summary__icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
  }

  .point-summary__badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}
</style>
