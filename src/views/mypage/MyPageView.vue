<template>
  <div class="mypage">
    <h1>마이페이지</h1>

    <ProfileCard :user="user" :summary="activitySummary" @edit="goToProfileEdit" />

    <section class="character-card" aria-labelledby="character-title">
      <div class="character-card__preview" aria-hidden="true">{{ character.emoji }}</div>
      <div class="character-card__copy">
        <h2 id="character-title">내 캐릭터 꾸미기</h2>
        <p>{{ character.description }}</p>
        <span>{{ character.itemCount }}개의 아이템 보유</span>
      </div>
      <button class="character-card__button" type="button" aria-label="내 캐릭터 꾸미기">
        <ChevronRight :size="20" aria-hidden="true" />
      </button>
    </section>

    <SettingsMenu :items="settingsItems" />

    <BaseButton class="logout-button" variant="ghost" block @click="logout">
      <LogOut :size="16" aria-hidden="true" />
      로그아웃
    </BaseButton>
  </div>
</template>

<script setup>
import { ChevronRight, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import ProfileCard from '@/components/mypage/ProfileCard.vue'
import SettingsMenu from '@/components/mypage/SettingsMenu.vue'

const router = useRouter()

// 사용자 API 연동 전까지 디자인 확인용 임시 데이터는 부모 화면에서 관리합니다.
const user = {
  name: '김민준',
  avatarText: '민',
  group: 'KB 챌린지',
  activeDays: 12,
  badge: '12일 연속 활동 중',
}

const activitySummary = [
  { label: '완료 횟수', value: '5개' },
  { label: '평균 달성률', value: '78%' },
  { label: '보유 포인트', value: '820P', isPoint: true },
]

const character = {
  emoji: '🧑🏻‍💼',
  description: '획득한 아이템으로 나만의 캐릭터를 꾸며보세요.',
  itemCount: 5,
}

const settingsItems = [
  {
    id: 'account',
    icon: 'account',
    label: '입출금 계좌 설정',
    description: '계좌 변경 / KB 신규 발급',
  },
  {
    id: 'challenge-history',
    icon: 'history',
    label: '챌린지 기록',
    description: '인증 내역 확인',
  },
]

const goToProfileEdit = () => {
  router.push('/mypage/profile')
}

const logout = () => {
  localStorage.removeItem('youngly_access_token')
  localStorage.removeItem('youngly_user')
  router.replace('/login')
}
</script>

<style scoped>
.mypage {
  --color-primary: #7156ad;
  --color-primary-dark: #7156ad;
  --color-primary-hover: #7156ad;
  --color-primary-soft: #e6dcf6;
  --color-primary-border: #e6dcf6;
  --color-surface-hover: #e6dcf6;

  display: grid;
  gap: 20px;
  min-height: calc(100vh - 69px);
  margin: -20px;
  padding: 32px max(20px, calc((100% - 780px) / 2)) 80px;
  color: var(--color-text, #33313d);
  background: #e6dcf6;
  box-sizing: border-box;
}

.mypage > h1 {
  margin: 0 0 2px;
  font-size: 28px;
  line-height: 1.25;
}

.character-card {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 44px;
  gap: 18px;
  align-items: center;
  padding: 20px 24px;
  border: 1px solid var(--color-primary-border, #e6dcf6);
  border-radius: 12px;
  background: var(--color-surface, #ffffff);
  box-sizing: border-box;
}

.character-card__preview {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid var(--color-primary-border, #e6dcf6);
  background: var(--color-surface, #ffffff);
  font-size: 38px;
}

.character-card__copy h2 {
  margin: 0;
  font-size: 17px;
}

.character-card__copy p {
  margin: 6px 0;
  color: var(--color-text-muted, #77717f);
  font-size: 12px;
}

.character-card__copy span {
  color: var(--color-primary-dark, #7156ad);
  font-size: 11px;
  font-weight: 700;
}

.character-card__button {
  display: grid;
  width: 40px;
  height: 40px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 4px;
  color: #ffffff;
  background: var(--color-primary-dark, #7156ad);
  cursor: pointer;
}

.character-card__button:hover {
  background: var(--color-primary-hover, #7156ad);
}

.character-card__button:focus-visible {
  outline: 3px solid var(--color-focus, rgba(124, 104, 215, 0.28));
  outline-offset: 2px;
}

.logout-button {
  min-height: 44px;
  border: 1px solid var(--color-border, #ddd9e8);
  border-radius: 4px;
  color: var(--color-text-muted, #77717f);
  background: var(--color-surface, #ffffff);
}

@media (max-width: 767px) {
  .mypage {
    gap: 14px;
    min-height: calc(100vh - 62px);
    padding: 20px 20px 52px;
  }

  .mypage > h1 {
    font-size: 22px;
  }

  .character-card {
    grid-template-columns: 58px minmax(0, 1fr) 36px;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 8px;
  }

  .character-card__preview {
    width: 54px;
    height: 54px;
    font-size: 30px;
  }

  .character-card__copy h2 {
    font-size: 14px;
  }

  .character-card__copy p {
    overflow: hidden;
    margin: 4px 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .character-card__button {
    width: 34px;
    height: 34px;
  }
}
</style>
