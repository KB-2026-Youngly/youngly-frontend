<template>
  <div class="group-list-container">
    <!-- 헤더 영역 -->
    <header class="pixel-header">
      <h1 class="pixel-title">MY GROUPS</h1>
    </header>

    <!-- 참여 중인 그룹(챌린지) 리스트 -->
    <main class="group-list">
      <div class="pixel-card" v-for="group in myGroups" :key="group.id">
        <h2 class="group-name">{{ group.name }}</h2>
        <div class="status-wrap">
          <span class="status-text">진행률: {{ group.progress }}%</span>
          <span class="status-text">D-{{ group.dDay }}</span>
        </div>

        <!-- 픽셀 스타일 진행바 -->
        <div class="pixel-progress-bar">
          <div class="pixel-progress-fill" :style="{ width: group.progress + '%' }"></div>
        </div>

        <button class="pixel-btn" @click="goToDetail(group.id)">입장하기</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// [더미 데이터] 나중에 백엔드 API 연동할 부분
const myGroups = ref([
  { id: 1, name: '아침 6시 기상 챌린지', progress: 80, dDay: 5 },
  { id: 2, name: '매일 영단어 10개 외우기', progress: 45, dDay: 12 },
]);

const goToDetail = (id) => {
  router.push(`/group/${id}`);
};
</script>

<style scoped>
/* 기존 레이아웃 안에서 여백만 차지하도록 수정 */
.group-list-container {
  padding: 20px;
  /* 💡 프로젝트 글로벌 CSS에 픽셀 폰트가 있다면 inherit 하거나 직접 지정! */
  font-family: 'Galmuri11', 'Press Start 2P', monospace;
}

/* 👾 픽셀 헤더 */
.pixel-header {
  text-align: center;
  margin-bottom: 24px;
}

.pixel-title {
  font-size: 24px;
  color: #fff;
  text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
  letter-spacing: 2px;
}

/* 👾 픽셀 카드 */
.pixel-card {
  border: 4px solid #000;
  background-color: #fff;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 6px 6px 0px #000;
}

.group-name {
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: bold;
}

.status-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: bold;
}

/* 👾 픽셀 진행바 */
.pixel-progress-bar {
  width: 100%;
  height: 16px;
  border: 3px solid #000;
  background-color: #ddd;
  margin-bottom: 16px;
}

.pixel-progress-fill {
  height: 100%;
  background-color: #ff5722;
  border-right: 3px solid #000;
}

/* 👾 픽셀 버튼 */
.pixel-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: #fff;
  font-size: 16px;
  font-family: inherit;
  border: 4px solid #000;
  box-shadow: inset -4px -4px 0px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.1s;
}

.pixel-btn:active {
  box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.2);
  transform: translateY(2px);
}
</style>