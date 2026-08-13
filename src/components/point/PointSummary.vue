<template>
  <div class="point-summary-shadow yl-stepped-card-shadow"><section class="point-summary pixel-step-card pixel-step-solid" aria-labelledby="point-balance-title"><div class="point-summary__surface pixel-step-surface">
    <div class="point-summary__icon" aria-hidden="true">
      <Coins :size="30" :stroke-width="2.4" />
    </div>
    <div>
      <p id="point-balance-title">현재 보유 포인트</p>
      <strong>{{ formattedBalance }}<span>P</span></strong>
    </div>
    <span class="point-summary__badge">MY POINT</span>
  </div></section></div>
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
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #7658b5;
  position: relative;
  display: block;
  min-height: 142px;
  padding: 2px;
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

.point-summary-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 5px; }
.point-summary__surface { position: relative; display: grid; grid-template-columns: 64px 1fr auto; gap: 18px; align-items: center; min-height: 138px; padding: 26px 28px; overflow: hidden; color: #ffffff; background: #7658b5; box-sizing: border-box; }

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
    min-height: 116px;
    padding: 2px;
    border-radius: 19px;
  }

  .point-summary__surface {
    grid-template-columns: 52px 1fr;
    min-height: 112px;
    padding: 20px 16px;
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

<style scoped>
.point-summary {
  border: 0;
  background: #7658b5;
  box-shadow: none;
  filter: none !important;
}

.point-summary__surface::after {
  position: absolute;
  right: 28px;
  bottom: 18px;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  box-shadow:
    14px 0 0 rgba(255, 255, 255, 0.12),
    28px 0 0 rgba(255, 255, 255, 0.08);
  content: '';
}

.point-summary__icon {
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 12px;
}

.point-summary__badge {
  border-width: 2px;
  border-radius: 8px;
}
</style>
