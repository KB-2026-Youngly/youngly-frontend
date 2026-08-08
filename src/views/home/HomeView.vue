<template>
  <div class="home-container">
    <!-- 최상단 인증 알림 카드 -->
    <section class="alert-section">
      <div class="alert-card">
        <div class="alert-content">
          <div class="alert-icon-wrap">
            <span class="alert-icon">!</span>
          </div>
          <div class="alert-text">
            <h3>오늘 인증이 {{ unverifiedCount }}개 남았어요!</h3>
            <p>마감 전 인증을 완료하세요</p>
          </div>
        </div>
        <button class="action-btn">인증하기 ➔</button>
      </div>
    </section>

    <!-- 그룹 리스트 섹션 -->
    <section class="group-section">
      <h3 class="section-title">그룹</h3>

      <div class="group-list">
        <div
          class="group-card"
          v-for="group in groups"
          :key="group.id"
          :class="{ 'is-completed': group.isCompleted }"
          @click="goToGroupDetail(group.id)"
        >
          <!-- 좌측: 크기를 1/3로 줄인 오버랩 프로필 -->
          <div class="profiles-wrap">
            <div
              class="profile-circle"
              v-for="(profile, index) in group.profiles"
              :key="index"
              :style="{ backgroundColor: getProfileColor(index) }"
            >
              {{ profile }}
            </div>
          </div>

          <!-- 중앙: 텍스트 정보 -->
          <div class="group-info">
            <div class="tags">
              <span class="tag category-tag">{{ group.category }}</span>
              <span class="tag status-tag" :class="{ 'completed': group.isCompleted }">
                {{ group.status }}
              </span>
            </div>
            <h4 class="group-title">{{ group.title }}</h4>
            <p class="group-subtitle" :class="{ 'highlight': !group.isCompleted }">
              {{ group.subtitle }}
            </p>
          </div>

          <!-- 우측: 화살표 -->
          <div class="group-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <div class="floating-add">
      <button
        class="floating-add-button"
        type="button"
        aria-label="새로운 그룹 만들기"
        @click="groupModalOpen = true"
      >
        +
      </button>
    </div>

    <BaseModal
      v-model="groupModalOpen"
      modal-class="home-group-modal"
      title="➕ 새로운 그룹 만들기"
      size="large"
    >
      <form class="group-create-form" @submit.prevent="createGroup">
        <label class="form-field form-field--full">
          <span>1. 그룹 제목</span>
          <input v-model.trim="newGroup.title" required placeholder="매일 30분 산책 챌린지" />
        </label>

        <fieldset class="category-field">
          <legend>2. 카테고리</legend>
          <div class="category-options">
            <button
              v-for="category in categories"
              :key="category.name"
              type="button"
              :class="{ active: newGroup.category === category.name }"
              @click="newGroup.category = category.name"
            >
              {{ category.icon }} {{ category.name }}
            </button>
          </div>
        </fieldset>

        <div class="form-row">
          <label class="form-field">
            <span>3. 모집 인원</span>
            <select v-model="newGroup.memberLimit">
              <option v-for="count in [3, 4, 5, 6]" :key="count" :value="count">{{ count }}명</option>
            </select>
          </label>
          <label class="form-field">
            <span>4. 매주 몇 번</span>
            <select v-model="newGroup.weeklyCount">
              <option v-for="count in [1, 2, 3, 5, 7]" :key="count" :value="count">주 {{ count }}회</option>
            </select>
          </label>
        </div>

        <label class="form-field form-field--full">
          <span>5. 챌린지 목표</span>
          <input v-model.trim="newGroup.goal" required placeholder="매일 운동으로 건강한 생활 습관 만들기" />
        </label>

        <label class="form-field form-field--full">
          <span>6. 1인당 최소 예치금</span>
          <input v-model.number="newGroup.deposit" type="number" min="0" required placeholder="50,000" />
        </label>

        <button class="create-group-button" type="submit">🚀 그룹 생성하기</button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import { useRouter } from 'vue-router';
import BaseModal from '@/components/base/BaseModal.vue';

const router = useRouter();

// 그룹 카드를 누르면 해당 ID의 상세 페이지로 이동
const goToGroupDetail = (groupId) => {
  router.push(`/groups/${groupId}`);
};

// 상단 인증 개수 상태
const unverifiedCount = ref(1);
const groupModalOpen = ref(false);
const categories = [
  { name: '운동', icon: '🏃' },
  { name: '독서', icon: '📚' },
  { name: '절약', icon: '☕' },
  { name: '습관', icon: '🌅' },
  { name: '기타', icon: '✨' },
];
const newGroup = ref({
  title: '',
  category: '운동',
  memberLimit: 5,
  weeklyCount: 5,
  goal: '',
  deposit: 50000,
});

// 그룹 리스트 더미 데이터
const groups = ref([
  {
    id: 1,
    profiles: ['김', '이', '박'],
    category: '운동',
    status: '진행 중',
    title: '30일 매일 운동 챌린지',
    subtitle: '인증 마감 23:14:32',
    isCompleted: false
  },
  {
    id: 2,
    profiles: ['김', '이', '정'],
    category: '독서',
    status: '진행 중',
    title: '한 달 독서 마라톤',
    subtitle: '오늘 인증 완료 🌟',
    isCompleted: true
  },
  {
    id: 3,
    profiles: ['김', '야', '+3'],
    category: '절약',
    status: '팀원 모집중',
    title: '하루 1커피 절약 챌린지',
    subtitle: '팀원 2/5명 모집 완료',
    isCompleted: false
  },
]);

// 프로필 배경색 지정 함수
const getProfileColor = (index) => {
  const colors = ['#D1C4E9', '#C5CAE9', '#BBDEFB', '#B2EBF2'];
  return colors[index % colors.length];
};

const createGroup = () => {
  const id = Math.max(...groups.value.map((group) => group.id), 0) + 1;
  groups.value.unshift({
    id,
    profiles: ['나'],
    category: newGroup.value.category,
    status: '팀원 모집중',
    title: newGroup.value.title,
    subtitle: `팀원 1/${newGroup.value.memberLimit}명 모집 완료`,
    isCompleted: false,
  });
  groupModalOpen.value = false;
  newGroup.value = {
    title: '',
    category: '운동',
    memberLimit: 5,
    weeklyCount: 5,
    goal: '',
    deposit: 50000,
  };
};
</script>

<style scoped>
/* 배경 설정 */
.home-container {
  margin: -20px;
  padding: 24px 20px 100px;
  min-height: 100vh;
  background-color: #E6DCF6;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", sans-serif;
}

/* 최상단 알림 카드 */
.alert-card {
  background-color: #7156AD;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(113, 86, 173, 0.2);
  margin-bottom: 32px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-icon-wrap {
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-icon {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
}

.alert-text h3 {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.alert-text p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.action-btn {
  align-self: flex-end;
  background: none;
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

/* 그룹 리스트 섹션 */
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin-bottom: 16px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-card {
  background-color: #FFFFFF;
  border-radius: 24px;
  padding: 16px 20px; /* 패딩을 살짝 컴팩트하게 조정 */
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.group-card:active {
  transform: scale(0.98);
}

.group-card.is-completed {
  border: 2px solid #7156AD;
  background-color: #F9F7FC;
}

/* 💡 프로필 영역 크기 축소 (1/3 비율 느낌) */
.profiles-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-left: 6px; /* 왼쪽 여백 살짝 */
}

/* 프로필 동그라미 사이즈 줄이기 (44px -> 32px) */
.profile-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  margin-left: -10px; /* 겹치는 간격도 비례해서 축소 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #444;
  position: relative;
}

.is-completed .profile-circle {
  border-color: #F9F7FC;
}

.profile-circle:first-child {
  margin-left: 0;
  z-index: 3;
}
.profile-circle:nth-child(2) { z-index: 2; }
.profile-circle:nth-child(3) { z-index: 1; }

.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
}

.category-tag {
  background-color: #F1F3F5;
  color: #495057;
}

.status-tag {
  background-color: rgba(113, 86, 173, 0.1);
  color: #7156AD;
}

.status-tag.completed {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.group-title {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.group-subtitle {
  font-size: 12px;
  color: #888;
}

.group-subtitle.highlight {
  color: #7156AD;
  font-weight: 600;
}

.group-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 우측 하단 그룹 생성 버튼 */
.floating-add {
  position: fixed;
  right: 34px;
  bottom: 34px;
  z-index: 30;
}

.floating-add-button {
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #69529f;
  color: #fff;
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 9px 24px rgba(70, 49, 115, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.floating-add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(70, 49, 115, 0.38);
}

.floating-add-button:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

/* 새로운 그룹 만들기 팝업 */
.group-create-form {
  display: grid;
  gap: 18px;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

.form-field,
.category-field {
  display: grid;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.form-field > span,
.category-field legend {
  padding: 0;
  color: #222;
  font-size: 14px;
  font-weight: 700;
}

.form-field input,
.form-field select {
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  border: 2px solid #222;
  border-radius: 12px;
  background: #f0ede8;
  color: #222;
  padding: 0 14px;
  font: inherit;
  font-size: 15px;
}

.form-field input:focus,
.form-field select:focus {
  outline: 3px solid rgba(113, 86, 173, 0.28);
  border-color: #7156ad;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.category-options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.category-options button {
  min-height: 48px;
  border: 2px solid #222;
  border-radius: 12px;
  background: #f0ede8;
  color: #71717a;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.category-options button.active {
  background: #69529f;
  color: #fff;
}

.create-group-button {
  min-height: 54px;
  margin-top: 6px;
  border: 0;
  border-radius: 14px;
  background: #69529f;
  color: #fff;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}

.create-group-button:hover { background: #5d478c; }

:global(.home-group-modal) {
  border-radius: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

:global(.home-group-modal .base-modal__title) {
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
  font-size: 22px;
  font-weight: 700;
}

:global(.home-group-modal .base-modal__close) {
  color: #77717f;
}

@media (max-width: 767px) {
  .floating-add {
    right: 20px;
    bottom: 94px;
  }

  .category-options { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .category-options button { min-height: 43px; font-size: 12px; }

  :global(.base-modal__overlay:has(.home-group-modal)) {
    align-items: flex-start;
    padding: 76px 16px 92px;
  }

  :global(.home-group-modal) {
    max-height: calc(100dvh - 168px);
    border-radius: 22px;
  }

  :global(.home-group-modal .base-modal__header) {
    padding: 18px 20px 10px;
  }

  :global(.home-group-modal .base-modal__body) {
    padding: 6px 20px 20px;
  }

  :global(.home-group-modal .base-modal__title) { font-size: 19px; }
}
</style>
