<template>
  <div class="group-detail-page">
    <div class="group-detail-content">
      <button class="back-link" type="button" @click="$router.go(-1)">
        <span aria-hidden="true">←</span>
        뒤로
      </button>

      <section class="challenge-summary" aria-label="챌린지 안내">
        <div class="summary-copy">
          <p class="status-message">
            <span aria-hidden="true">{{ challengeStarted ? '🚩' : '🚩' }}</span>
            {{ challengeStarted ? `${challengeDay}/${challengeDuration}일` : '아직 시작 전입니다!' }}
          </p>
          <p class="goal-message"><span aria-hidden="true">🎯</span> {{ groupInfo.goal }}</p>
        </div>
        <button class="pixel-button account-button" type="button" @click="router.push('/asset')">
          <span class="account-icon" aria-hidden="true">♧</span>
          통장
        </button>
      </section>

      <section class="ranking-panel pixel-frame" aria-label="현재 랭킹">
        <div class="ranking-heading">
          <span>랭킹</span>
          <button class="expand-button" type="button" aria-label="랭킹 크게 보기" @click="rankingModalOpen = true">↗</button>
        </div>
        <div class="ranking-track-wrap">
          <div class="ranking-track" aria-label="진행률 0%">
            <span v-for="segment in rankingSegments" :key="segment" class="track-segment"></span>
          </div>
          <div
            v-for="member in members"
            :key="`${member.name}-rank`"
            class="rank-marker"
            :class="{ 'is-me': member.isMe }"
            :style="{ left: `${member.progress}%` }"
            :aria-label="`${member.name} 진행률 ${member.progress}%`"
          >
            {{ member.initial }}
          </div>
          <span class="goal-flag" aria-hidden="true">⚑</span>
        </div>
        <span class="ranking-percent">내 진행률 {{ myProgress }}%</span>
      </section>

      <div class="day-selector" aria-label="인증 날짜 선택">
        <button type="button" aria-label="이전 날짜">‹</button>
        <strong>오늘</strong>
        <button type="button" aria-label="다음 날짜">›</button>
      </div>

      <section class="feed-list" aria-label="참여자 인증 목록">
        <article
          v-for="member in displayedMembers"
          :key="member.name"
          class="feed-card pixel-frame my-feed-card"
          :class="{ 'is-started': challengeStarted, 'has-verification': challengeStarted && member.isVerified }"
          @click="openPostDetail(member)"
        >
          <div class="feed-owner">
            <span class="avatar">{{ member.initial }}</span>
            <span>{{ member.name }}</span>
            <span v-if="member.isMe" class="me-label">나</span>
          </div>
          <template v-if="challengeStarted">
            <div v-if="member.isVerified" class="verification-content">
              <img :src="member.image" :alt="`${member.name} 인증 사진`" class="verification-image" />
              <div class="verification-shade"></div>
              <p class="verification-message">{{ member.message }}</p>
              <div v-if="!member.isMe && !member.reviewStatus" class="review-actions">
                <button type="button" class="approve-button" @click.stop="reviewVerification(member, 'approved')">
                  승인
                </button>
                <button type="button" class="reject-button" @click.stop="openRejectModal(member)">
                  반려
                </button>
              </div>
              <div v-if="member.reviewStatus" class="post-engagement" aria-label="게시글 반응">
                <span>◯ {{ member.commentCount }}</span>
                <span>♧ {{ member.likeCount }}</span>
                <span>♢ {{ member.dislikeCount }}</span>
              </div>
              <p v-if="member.reviewStatus" class="latest-comment">{{ member.latestComment }}</p>
              <span v-if="member.reviewStatus && member.reviewStatus !== 'pending-rejection'" class="review-status" :class="member.reviewStatus">
                {{ member.reviewStatus === 'approved' ? '승인 완료' : '반려 처리' }}
              </span>
            </div>
            <button v-else type="button" class="pending-verification" @click="handlePendingCard(member)">
              <strong>{{ member.isMe ? '눌러서 인증하러 가기 📷 ›' : '눌러서 깨우기 ⏰ ›' }}</strong>
              <span :class="{ 'deadline-text': member.isMe }">{{ member.isMe ? '23:14:32' : 'ZZZ...' }}</span>
            </button>
          </template>
          <p v-else class="sleep-message">ZZZ...</p>
        </article>

        <template v-if="!allMembersJoined">
          <button
            v-for="slot in inviteSlots"
            :key="`invite-${slot}`"
            class="feed-card pixel-frame invite-card"
            type="button"
            @click="handleInvite"
          >
            <span class="plus" aria-hidden="true">＋</span>
            <span>친구 초대하기</span>
          </button>
        </template>
      </section>
    </div>

    <BaseModal
      v-model="inviteModalOpen"
      modal-class="group-invite-modal"
      title="코드를 누르시면 복사가 됩니다!"
      size="medium"
      @close="copyComplete = false"
    >
      <div class="invite-modal-content">
        <span class="invite-code-label">초대 코드</span>
        <button class="invite-code-button" type="button" @click="copyInviteCode">
          {{ inviteCode }}
        </button>
        <p v-if="copyComplete" class="copy-complete-message" role="status" aria-live="polite">
          ! 클립보드에 복사가 완료되었습니다 !
        </p>
      </div>
    </BaseModal>

    <BaseModal
      v-if="isOwner && allMembersJoined"
      v-model="startDateModalOpen"
      modal-class="group-start-date-modal"
      title="모든 친구가 입장하였습니다!"
      size="medium"
      :show-close-button="false"
    >
      <div class="start-date-modal-content">
        <label class="start-date-label" for="challenge-start-date">시작 날짜 설정</label>
        <input id="challenge-start-date" v-model="startDate" class="start-date-input" type="date" />
        <button class="start-date-submit" type="button" @click="setStartDate">설정 완료</button>
        <p v-if="startDateConfigured" class="start-date-complete" role="status" aria-live="polite">
          ! 날짜 설정 완료. 시작 날짜부터 시작 !
        </p>
      </div>
    </BaseModal>

    <BaseModal
      v-model="rankingModalOpen"
      modal-class="group-ranking-modal"
      title="랭킹"
      size="medium"
    >
      <div class="ranking-modal-content">
        <div class="ranking-period">
          <button type="button" aria-label="이전 라운드">‹</button>
          <strong>이번 달</strong>
          <button type="button" aria-label="다음 라운드">›</button>
        </div>

        <div class="ranking-round-summary">
          <span>현재 라운드</span>
          <strong>{{ challengeDay }}/{{ challengeDuration }}일</strong>
          <div class="ranking-modal-track"><i :style="{ width: `${myProgress}%` }"></i></div>
        </div>

        <ol class="ranking-list">
          <li v-for="(member, index) in rankedMembers" :key="`ranking-${member.name}`" :class="{ 'is-me': member.isMe }">
            <strong class="ranking-position">{{ index + 1 }}등</strong>
            <span class="ranking-avatar" :class="{ 'is-me': member.isMe, 'is-first': index === 0 }">
              <span v-if="index === 0" class="ranking-crown" aria-hidden="true">♛</span>
              {{ member.initial }}
            </span>
            <div class="ranking-member-info">
              <b>{{ member.name }}<em v-if="member.isMe">나</em></b>
              <span>완료 횟수 {{ member.completedCount }}개 | 평균 달성률 {{ member.averageRate }}%</span>
            </div>
          </li>
        </ol>
      </div>
    </BaseModal>

    <BaseModal
      v-model="groupEditOpen"
      modal-class="group-edit-modal"
      title="그룹 정보 수정"
      size="large"
      @close="closeGroupEdit"
    >
      <form class="group-edit-form" @submit.prevent="saveGroupEdit">
        <label class="group-edit-field">
          <span>1. 그룹 제목</span>
          <input v-model.trim="groupEditForm.title" required />
        </label>

        <fieldset class="group-edit-category">
          <legend>2. 카테고리</legend>
          <div>
            <button
              v-for="category in groupCategories"
              :key="category"
              type="button"
              :class="{ active: groupEditForm.category === category }"
              @click="groupEditForm.category = category"
            >
              {{ category }}
            </button>
          </div>
        </fieldset>

        <section class="group-member-editor" aria-label="모집 인원">
          <h3>3. 모집 인원</h3>
          <ul>
            <li v-for="member in editMembers" :key="`edit-${member.name}`">
              <span class="member-editor-avatar">{{ member.initial }}</span>
              <strong>{{ member.isMe ? 'Yuna Park' : member.name }}</strong>
              <button type="button" @click="removeMember(member.name)">내보내기</button>
            </li>
          </ul>
        </section>

        <label class="group-edit-field">
          <span>4. 매주 몇 번</span>
          <select v-model="groupEditForm.weeklyCount">
            <option v-for="count in [1, 2, 3, 5, 7]" :key="count" :value="count">주 {{ count }}회</option>
          </select>
        </label>

        <label class="group-edit-field">
          <span>5. 챌린지 목표</span>
          <input v-model.trim="groupEditForm.goal" required />
        </label>

        <label class="group-edit-field">
          <span>6. 1인당 최소 예치금</span>
          <input v-model.number="groupEditForm.deposit" type="number" min="0" required />
        </label>

        <button class="group-edit-submit" type="submit">수정완료</button>
        <p v-if="groupEditComplete" class="group-edit-complete" role="status">! 수정 완료. 다음달부터 적용 !</p>
      </form>
    </BaseModal>

    <BaseModal
      v-model="postDetailOpen"
      modal-class="group-post-detail-modal"
      title="인증 게시글"
      size="medium"
      @close="selectedPost = null"
    >
      <article v-if="selectedPost" class="post-detail-modal-content">
        <div class="post-detail-image-wrap">
          <img :src="selectedPost.image" :alt="`${selectedPost.name} 인증 사진`" />
          <div></div>
          <p><span>{{ selectedPost.initial }}</span><b>{{ selectedPost.name }}</b></p>
          <strong>{{ selectedPost.message }}</strong>
        </div>
        <div class="post-reaction-info">
          <p><b>좋아요 {{ postLikes.length }}</b>{{ postLikes.join(', ') }}</p>
          <p><b>싫어요 {{ postDislikes.length }}</b>{{ postDislikes.join(', ') }}</p>
          <span>승인 {{ selectedPost.approvalCount }}/6명 · 과반수 승인 완료</span>
        </div>
        <section class="post-comments" aria-label="댓글">
          <h3>댓글 <small>{{ postComments.length }}</small></h3>
          <ul>
            <li v-for="commentItem in postComments" :key="commentItem.id"><b>{{ commentItem.author }}</b>{{ commentItem.text }}</li>
          </ul>
          <form @submit.prevent="addPostComment">
            <input v-model.trim="newPostComment" maxlength="100" placeholder="댓글을 입력하세요" />
            <button type="submit" :disabled="!newPostComment">등록</button>
          </form>
        </section>
      </article>
    </BaseModal>

    <BaseModal
      v-model="rejectModalOpen"
      modal-class="group-reject-modal"
      title="반려 사유 입력"
      size="small"
      @close="resetRejectModal"
    >
      <form class="reject-form" @submit.prevent="submitRejection">
        <p>인증 사진이 기준에 맞지 않는 이유를 작성해 주세요.</p>
        <textarea v-model.trim="rejectReason" required maxlength="120" placeholder="반려 사유를 입력해 주세요"></textarea>
        <button type="submit">반려 사유 등록</button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import verificationImageOne from '@/assets/photos/excercise/KakaoTalk_Photo_2026-08-08-01-50-24.jpeg'
import verificationImageTwo from '@/assets/photos/excercise/KakaoTalk_Photo_2026-08-08-01-49-38.jpeg'
import verificationImageThree from '@/assets/photos/excercise/KakaoTalk_Photo_2026-08-08-01-49-11.jpeg'

const members = reactive([
  { name: '김민준', initial: '김', isMe: true, progress: 72, completedCount: 4, averageRate: 72, isVerified: false },
  { name: '허경민', initial: '허', isMe: false, progress: 68, completedCount: 5, averageRate: 68, isVerified: true, image: verificationImageOne, message: '운오완', commentCount: 4, likeCount: 3, dislikeCount: 1, latestComment: '꾸준함이 최고입니다!' },
  { name: '신성욱', initial: '신', isMe: false, progress: 55, completedCount: 5, averageRate: 78, isVerified: true, image: verificationImageTwo, message: '오운완. 돈줘 빼액~', commentCount: 4, likeCount: 3, dislikeCount: 1, latestComment: '도웅하지마라.' },
  { name: '김상우', initial: '김', isMe: false, progress: 45, completedCount: 3, averageRate: 45, isVerified: false },
  { name: '여강휘', initial: '여', isMe: false, progress: 72, completedCount: 2, averageRate: 40, isVerified: true, image: verificationImageThree, message: '^^b', commentCount: 2, likeCount: 2, dislikeCount: 0, latestComment: '오늘도 수고했어요!' },
  { name: '김효민', initial: '김', isMe: false, progress: 35, completedCount: 1, averageRate: 28, isVerified: false },
])
const router = useRouter()
const route = useRoute()

// mock 단계 제어: false/false = 초대 전, true/false = 입장 완료·시작일 설정, true/true = 시작 후
const allMembersJoined = true
const challengeStarted = true
const challengeDay = 20
const challengeDuration = 30
const postMajorityApproved = true
const inviteSlots = 5
const displayedMembers = computed(() => (allMembersJoined ? members : members.slice(0, 1)))
const rankingSegments = computed(() => (allMembersJoined ? members.length : 4))
const myProgress = computed(() => members.find((member) => member.isMe)?.progress ?? 0)
const rankedMembers = computed(() => [...members].sort((a, b) => b.completedCount - a.completedCount || b.averageRate - a.averageRate))
const inviteCode = 'A7K2P9'
const inviteModalOpen = ref(false)
const copyComplete = ref(false)
const isOwner = true
const startDateModalOpen = ref(allMembersJoined && !challengeStarted)
const startDate = ref('2026-07-24')
const startDateConfigured = ref(false)
const rankingModalOpen = ref(false)
const postDetailOpen = ref(false)
const selectedPost = ref(null)
const postLikes = ['김민준', '신성욱', '여강휘', '김효민']
const postDislikes = ['김상우']
const postComments = ref([
  { id: 1, author: '김민준', text: ' 오늘도 운동 완료! 멋져요 🙌' },
  { id: 2, author: '신성욱', text: ' 꾸준함이 최고입니다!' },
  { id: 3, author: '여강휘', text: ' 내일도 같이 달려요!' },
])
const newPostComment = ref('')
const rejectModalOpen = ref(false)
const rejectReason = ref('')
const rejectingMember = ref(null)
const groupEditOpen = ref(route.query.editGroup === 'true')
const groupEditComplete = ref(false)
const groupCategories = ['운동', '독서', '절약', '습관', '기타']
const groupEditForm = reactive({
  title: '30일 매일 운동 챌린지',
  category: '운동',
  weeklyCount: 5,
  goal: '매일 운동으로 건강한 생활 습관 만들기',
  deposit: 50000,
})
const groupInfo = reactive({
  title: '30일 매일 운동 챌린지',
  goal: '매일 운동으로 건강한 생활 습관 만들기',
})
const editMembers = reactive(members.map((member) => ({ ...member })))

const copyInviteCode = async () => {
  try {
    await navigator.clipboard.writeText(inviteCode)
  } catch {
    const input = document.createElement('input')
    input.value = inviteCode
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }

  copyComplete.value = true
}

const handleInvite = () => {
  copyComplete.value = false
  inviteModalOpen.value = true
}

const setStartDate = () => {
  startDateConfigured.value = true
}

const handlePendingCard = (member) => {
  if (member.isMe) {
    router.push({ name: 'FeedWrite', query: { groupId: '1' } })
    return
  }

  alert(`${member.name}님을 깨웠습니다! (mock)`)
}

const reviewVerification = (member, status) => {
  member.reviewStatus = status
}

const openRejectModal = (member) => {
  member.reviewStatus = 'pending-rejection'
  rejectingMember.value = member
  rejectReason.value = ''
  rejectModalOpen.value = true
}

const submitRejection = () => {
  if (!rejectingMember.value || !rejectReason.value) return
  rejectingMember.value.reviewStatus = 'rejected'
  rejectingMember.value.latestComment = `반려 사유: ${rejectReason.value}`
  rejectModalOpen.value = false
}

const resetRejectModal = () => {
  if (rejectingMember.value?.reviewStatus === 'pending-rejection') {
    rejectingMember.value.reviewStatus = ''
  }
  rejectingMember.value = null
  rejectReason.value = ''
}

const openPostDetail = (member) => {
  if (!member.isVerified || !postMajorityApproved) return
  selectedPost.value = { ...member, approvalCount: 4 }
  postDetailOpen.value = true
}

const addPostComment = () => {
  if (!newPostComment.value) return
  postComments.value.push({ id: Date.now(), author: '김민준', text: ` ${newPostComment.value}` })
  newPostComment.value = ''
}

const removeMember = (name) => {
  const index = editMembers.findIndex((member) => member.name === name)
  if (index >= 0) editMembers.splice(index, 1)
}

const saveGroupEdit = () => {
  groupInfo.title = groupEditForm.title
  groupInfo.goal = groupEditForm.goal
  localStorage.setItem(
    'youngly_group_info',
    JSON.stringify({ title: groupEditForm.title, goal: groupEditForm.goal }),
  )
  window.dispatchEvent(new Event('youngly-group-info-updated'))
  groupEditComplete.value = true
}

const closeGroupEdit = () => {
  groupEditComplete.value = false
  if (route.query.editGroup) {
    const query = { ...route.query }
    delete query.editGroup
    router.replace({ query })
  }
}

watch(
  () => route.query.editGroup,
  (isOpen) => {
    groupEditOpen.value = isOpen === 'true'
  },
)

onMounted(() => {
  try {
    const savedGroupInfo = JSON.parse(localStorage.getItem('youngly_group_info') || 'null')
    if (savedGroupInfo?.title) groupInfo.title = savedGroupInfo.title
    if (savedGroupInfo?.goal) groupInfo.goal = savedGroupInfo.goal

    const savedVerification = JSON.parse(localStorage.getItem('youngly_group_verification') || 'null')
    const myPost = members.find((member) => member.isMe)
    if (savedVerification?.groupId === '1' && myPost) {
      myPost.isVerified = true
      myPost.image = savedVerification.image
      myPost.message = savedVerification.comment
    }
  } catch {
    // 저장된 인증 mock 데이터가 없거나 잘못된 경우 기존 화면을 유지합니다.
  }
})
</script>

<style scoped>
.group-detail-page {
  min-height: 100%;
  background: #e6dcf6;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

.group-detail-content {
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 24px 20px 112px;
  box-sizing: border-box;
}

button { font: inherit; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7156ad;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.challenge-summary {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin: 18px 0 20px;
  padding: 18px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.summary-copy p { margin: 0; }
.status-message { color: #7156ad; font-size: 14px; font-weight: 700; }
.goal-message { margin-top: 8px !important; color: #111; font-size: 15px; font-weight: 700; line-height: 1.35; }
.mobile-break { display: none; }

.pixel-button,
.pixel-frame {
  border: 0;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.account-button {
  flex: 0 0 auto;
  min-width: 88px;
  height: 42px;
  background: #7156ad;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.account-icon { font-size: 17px; vertical-align: -1px; margin-right: 4px; }

.ranking-panel {
  padding: 18px 20px 16px;
  background: #fff;
}
.ranking-heading { display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 700; }
.expand-button { border: 0; padding: 0; background: transparent; color: #999; cursor: pointer; font-size: 20px; line-height: 1; }
.ranking-track-wrap { position: relative; margin: 30px 5px 6px; }
.ranking-track { display: flex; height: 8px; overflow: hidden; border-radius: 999px; background: #f1f3f5; }
.track-segment { flex: 1; border-right: 1px solid #dfe3e8; }
.track-segment:last-child { border-right: 0; }
.rank-marker { position: absolute; bottom: 15px; display: grid; width: 23px; height: 23px; place-items: center; transform: translateX(-50%); border: 2px solid #71717a; border-radius: 50%; background: #fff; color: #555; font-size: 10px; font-weight: 800; line-height: 1; }
.rank-marker.is-me { border-color: #7156ad; background: #7156ad; color: #fff; box-shadow: 0 0 0 3px rgba(113, 86, 173, 0.16); }
.goal-flag { position: absolute; right: -5px; bottom: 13px; color: #ef4444; font-size: 19px; line-height: 1; }
.ranking-percent { color: #888; font-size: 11px; }

.day-selector { display: flex; justify-content: center; align-items: center; gap: 40px; margin: 26px 0 16px; color: #111; }
.day-selector button { border: 0; background: transparent; padding: 0; color: #999; font-size: 25px; line-height: 1; cursor: pointer; }
.day-selector strong { font-size: 16px; }

.feed-list { display: grid; gap: 14px; }
.feed-card { min-height: 196px; box-sizing: border-box; background: #fff; color: #111; }
.my-feed-card { position: relative; padding: 16px 20px; }
.feed-owner { display: flex; align-items: center; gap: 6px; color: #444; font-size: 12px; font-weight: 700; }
.avatar { display: grid; width: 30px; height: 30px; place-items: center; border: 2px solid #fff; border-radius: 50%; background: #d1c4e9; color: #444; font-size: 11px; }
.me-label { padding: 2px 6px; border-radius: 6px; background: rgba(113, 86, 173, 0.1); color: #7156ad; font-size: 10px; }
.sleep-message { position: absolute; top: 55%; left: 50%; margin: 0; transform: translate(-50%, -50%); color: #888; font-size: 20px; font-weight: 700; letter-spacing: 2px; }
.feed-card.is-started { display: flex; flex-direction: column; min-height: 340px; overflow: hidden; border: 3px solid #222; border-radius: 18px; background: #000; color: #fff; box-shadow: none; }
.feed-card.is-started .feed-owner { position: relative; z-index: 2; color: #fff; }
.feed-card.is-started .avatar { border-color: #27272a; background: #65529d; color: #fff; }
.feed-card.has-verification { padding: 16px 20px; }
.verification-content { position: absolute; inset: 0; }
.verification-image { width: 100%; height: 100%; object-fit: cover; background: #27272a; }
.verification-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.52) 0%, rgba(0, 0, 0, 0.06) 42%, rgba(0, 0, 0, 0.72) 100%); }
.verification-message { position: absolute; right: 20px; bottom: 65px; left: 20px; z-index: 2; margin: 0; color: #fff; font-size: 17px; font-weight: 800; line-height: 1.4; text-align: center; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.72); }
.review-actions { position: absolute; right: 20px; bottom: 17px; left: 20px; z-index: 2; display: flex; gap: 8px; }
.review-actions button { flex: 1; min-height: 36px; border: 0; border-radius: 9px; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
.approve-button { background: #7156ad; }
.reject-button { background: #55515b; }
.review-status { position: absolute; top: 54px; left: 20px; z-index: 2; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.review-status.approved { background: rgba(105, 82, 159, 0.32); color: #e5e2fa; }
.review-status.rejected { background: rgba(239, 68, 68, 0.24); color: #fecaca; }
.post-engagement { position: absolute; top: 54px; right: 18px; z-index: 2; display: grid; gap: 7px; color: #fff; font-size: 12px; font-weight: 800; text-align: right; text-shadow: 0 1px 4px rgba(0,0,0,.8); }.post-engagement span { white-space: nowrap; }
.latest-comment { position: absolute; right: 20px; bottom: 17px; left: 20px; z-index: 2; margin: 0; color: #222; font-size: 13px; font-weight: 700; }.latest-comment::before { content: ''; position: absolute; inset: -5px -8px; z-index: -1; border-radius: 5px; background: rgba(255,255,255,.9); }
.pending-verification { display: grid; place-content: center; gap: 7px; flex: 1; width: 100%; border: 0; background: transparent; color: #fff; text-align: center; cursor: pointer; }
.pending-verification strong { font-size: 21px; font-weight: 800; }
.pending-verification span { color: #fff; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.pending-verification .deadline-text { color: #ef4444; }
.invite-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; cursor: pointer; }
.invite-card span:last-child { color: #888; font-size: 15px; font-weight: 600; }
.plus { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 50%; background: rgba(113, 86, 173, 0.1); color: #7156ad; font-size: 27px; font-weight: 300; line-height: 1; }

.invite-card:hover { background: #f9f7fc; }
.invite-card:focus-visible, .pixel-button:focus-visible, .back-link:focus-visible, .day-selector button:focus-visible, .expand-button:focus-visible { outline: 3px solid #7156ad; outline-offset: 3px; }

/* 친구 초대 코드 모달 */
:global(.group-invite-modal) {
  max-width: 500px;
  border: 4px solid #222;
  border-radius: 0;
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

:global(.group-invite-modal .base-modal__header) {
  padding: 26px 32px 14px;
}

:global(.group-invite-modal .base-modal__title) {
  color: #222;
  font-size: 23px;
  font-weight: 800;
}

:global(.group-invite-modal .base-modal__close) {
  color: #71717a;
  font-size: 34px;
}

:global(.group-invite-modal .base-modal__body) {
  padding: 14px 32px 30px;
}

.invite-modal-content { display: grid; gap: 13px; }
.invite-code-label { color: #222; font-size: 14px; font-weight: 700; }

.invite-code-button {
  min-height: 76px;
  border: 3px solid #222;
  border-radius: 17px;
  background: #f0ede8;
  color: #222;
  font-family: 'DungGeunMo', 'Courier New', monospace;
  font-size: 23px;
  letter-spacing: 2px;
  cursor: pointer;
}

.invite-code-button:hover { background: #e9e4dd; }
.invite-code-button:focus-visible { outline: 3px solid #7156ad; outline-offset: 3px; }

.copy-complete-message {
  margin: 14px 0 0;
  padding: 12px 14px;
  border: 2px solid #69529f;
  border-radius: 11px;
  background: #e5e2fa;
  color: #533b85;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

/* 모든 친구 입장 후 방장에게 보이는 시작일 설정 모달 */
:global(.group-start-date-modal) {
  max-width: 500px;
  border: 4px solid #222;
  border-radius: 0;
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

:global(.group-start-date-modal .base-modal__header) { padding: 26px 32px 14px; }
:global(.group-start-date-modal .base-modal__title) { color: #222; font-size: 23px; font-weight: 800; }
:global(.group-start-date-modal .base-modal__body) { padding: 14px 32px 30px; }

.start-date-modal-content { display: grid; gap: 15px; }
.start-date-label { color: #222; font-size: 14px; font-weight: 700; }

.start-date-input {
  width: 100%;
  min-height: 70px;
  box-sizing: border-box;
  border: 3px solid #222;
  border-radius: 17px;
  background: #f0ede8;
  color: #222;
  padding: 0 18px;
  font-family: 'DungGeunMo', 'Courier New', monospace;
  font-size: 20px;
  text-align: center;
}

.start-date-input:focus { outline: 3px solid rgba(105, 82, 159, 0.28); border-color: #69529f; }

.start-date-submit {
  min-height: 54px;
  margin-top: 8px;
  border: 3px solid #222;
  border-radius: 14px;
  background: #69529f;
  color: #fff;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}

.start-date-complete {
  margin: 0;
  padding: 12px 14px;
  border: 2px solid #69529f;
  border-radius: 11px;
  background: #e5e2fa;
  color: #533b85;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

/* 현재 라운드 전체 순위 모달 */
:global(.group-ranking-modal) {
  max-width: 580px;
  border: 4px solid #222;
  border-radius: 0;
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}
:global(.group-ranking-modal .base-modal__header) { padding: 22px 28px 8px; }
:global(.group-ranking-modal .base-modal__title) { color: #222; font-size: 22px; font-weight: 800; }
:global(.group-ranking-modal .base-modal__body) { padding: 6px 28px 28px; }
.ranking-modal-content { display: grid; gap: 18px; }
.ranking-period { display: flex; align-items: center; justify-content: center; gap: 30px; }
.ranking-period button { border: 0; background: transparent; color: #222; font-size: 27px; font-weight: 800; line-height: 1; cursor: pointer; }
.ranking-period strong { font-size: 17px; }
.ranking-round-summary { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; padding: 14px 16px; border: 2px solid #222; background: #f0ede8; }
.ranking-round-summary span { font-size: 12px; font-weight: 700; }
.ranking-round-summary strong { font-size: 14px; text-align: right; }
.ranking-modal-track { grid-column: 1 / -1; height: 9px; overflow: hidden; border: 2px solid #222; background: #fff; }
.ranking-modal-track i { display: block; height: 100%; background: #7156ad; }
.ranking-list { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; border-top: 1px solid #d6d2dc; }
.ranking-list li { display: grid; grid-template-columns: 44px 42px minmax(0, 1fr); align-items: center; gap: 10px; min-height: 62px; border-bottom: 1px solid #d6d2dc; }
.ranking-list li.is-me { background: #f4f0fb; }
.ranking-position { font-size: 14px; text-align: center; }
.ranking-avatar { position: relative; display: grid; width: 30px; height: 30px; place-items: center; border: 2px solid #555; border-radius: 50%; background: #fff; color: #222; font-size: 12px; font-weight: 800; }
.ranking-avatar.is-me { border-color: #7156ad; background: #7156ad; color: #fff; }
.ranking-crown { position: absolute; top: -19px; color: #e9ae22; font-size: 22px; line-height: 1; text-shadow: 1px 1px 0 #222; }
.ranking-member-info { display: grid; gap: 3px; min-width: 0; }
.ranking-member-info b { font-size: 14px; }
.ranking-member-info b em { margin-left: 5px; color: #7156ad; font-size: 11px; font-style: normal; }
.ranking-member-info span { color: #555; font-size: 12px; font-weight: 600; }

/* 그룹 정보 수정 모달 */
:global(.group-edit-modal) { max-width: 760px; border: 4px solid #222; border-radius: 0; color: #222; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif; }
:global(.group-edit-modal .base-modal__header) { padding: 22px 28px 10px; }
:global(.group-edit-modal .base-modal__title) { color: #222; font-size: 23px; font-weight: 800; }
:global(.group-edit-modal .base-modal__body) { padding: 8px 28px 28px; }
.group-edit-form { display: grid; gap: 19px; }
.group-edit-field, .group-edit-category { display: grid; gap: 9px; min-width: 0; margin: 0; padding: 0; border: 0; }
.group-edit-field > span, .group-edit-category legend, .group-member-editor h3 { padding: 0; margin: 0; color: #222; font-size: 15px; font-weight: 800; }
.group-edit-field input, .group-edit-field select { width: 100%; min-height: 48px; box-sizing: border-box; border: 2px solid #222; border-radius: 12px; background: #f0ede8; padding: 0 14px; color: #222; font: inherit; font-size: 15px; }
.group-edit-category > div { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 9px; }
.group-edit-category button { min-height: 40px; border: 2px solid #222; border-radius: 9px; background: #f0ede8; color: #71717a; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.group-edit-category button.active { background: #7156ad; color: #fff; }
.group-member-editor { display: grid; gap: 9px; }.group-member-editor ul { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
.group-member-editor li { display: grid; grid-template-columns: 32px minmax(0, 1fr) 86px; gap: 10px; align-items: center; }.member-editor-avatar { display: grid; width: 28px; height: 28px; place-items: center; border: 2px solid #222; border-radius: 50%; background: #f0ede8; font-size: 11px; font-weight: 800; }.group-member-editor strong { font-size: 14px; }.group-member-editor li button { min-height: 32px; border: 2px solid #222; border-radius: 8px; background: #f0ede8; color: #71717a; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.group-edit-submit { min-height: 54px; margin-top: 6px; border: 3px solid #222; border-radius: 14px; background: #7156ad; color: #fff; font: inherit; font-size: 17px; font-weight: 800; cursor: pointer; }.group-edit-complete { margin: 0; padding: 11px 14px; border: 2px solid #69529f; border-radius: 10px; background: #e5e2fa; color: #533b85; font-size: 14px; font-weight: 700; text-align: center; }

/* 승인 완료 게시글 상세 모달 */
:global(.group-post-detail-modal) { max-width: 560px; overflow: hidden; border-radius: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif; }
:global(.group-post-detail-modal .base-modal__header) { padding: 18px 22px 12px; }
:global(.group-post-detail-modal .base-modal__title) { color: #222; font-size: 19px; font-weight: 800; }
:global(.group-post-detail-modal .base-modal__body) { padding: 0; }
.post-detail-image-wrap { position: relative; height: min(75vw, 390px); min-height: 290px; background: #222; }.post-detail-image-wrap img { width: 100%; height: 100%; object-fit: cover; }.post-detail-image-wrap > div { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.55), transparent 45%, rgba(0,0,0,.73)); }.post-detail-image-wrap p { position: absolute; top: 16px; left: 18px; z-index: 1; display: flex; align-items: center; gap: 8px; margin: 0; color: #fff; }.post-detail-image-wrap p span { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; background: #7156ad; font-size: 11px; font-weight: 800; }.post-detail-image-wrap p b { font-size: 15px; }.post-detail-image-wrap > strong { position: absolute; right: 20px; bottom: 18px; left: 20px; z-index: 1; color: #fff; font-size: 21px; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,.75); }
.post-reaction-info { display: grid; gap: 10px; padding: 18px 20px 14px; }.post-reaction-info p { display: grid; gap: 3px; margin: 0; color: #666; font-size: 13px; }.post-reaction-info p b { color: #222; font-size: 14px; }.post-reaction-info > span { padding-top: 12px; border-top: 1px solid #ece8f2; color: #7156ad; font-size: 13px; font-weight: 700; }
.post-comments { padding: 0 20px 20px; }.post-comments h3 { margin: 0 0 12px; color: #222; font-size: 17px; }.post-comments h3 small { color: #7156ad; font-size: 13px; }.post-comments ul { display: grid; gap: 9px; max-height: 160px; overflow-y: auto; margin: 0; padding: 0; list-style: none; }.post-comments li { color: #555; font-size: 13px; line-height: 1.4; }.post-comments li b { margin-right: 7px; color: #222; }.post-comments form { display: flex; gap: 8px; margin-top: 15px; padding-top: 14px; border-top: 1px solid #ece8f2; }.post-comments input { flex: 1; min-width: 0; height: 40px; box-sizing: border-box; border: 1px solid #d9d3e4; border-radius: 11px; padding: 0 12px; font: inherit; font-size: 13px; }.post-comments button { min-width: 54px; border: 0; border-radius: 11px; background: #7156ad; color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }.post-comments button:disabled { cursor: not-allowed; opacity: .5; }

/* 반려 사유 모달 */
:global(.group-reject-modal) { max-width: 410px; border: 3px solid #222; border-radius: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif; }
:global(.group-reject-modal .base-modal__title) { font-weight: 800; }
:global(.group-reject-modal .base-modal__body) { padding-top: 4px; }
.reject-form { display: grid; gap: 13px; }.reject-form p { margin: 0; color: #555; font-size: 13px; line-height: 1.5; }.reject-form textarea { min-height: 105px; resize: vertical; border: 2px solid #222; border-radius: 12px; padding: 12px; color: #222; font: inherit; font-size: 14px; }.reject-form button { min-height: 43px; border: 0; border-radius: 11px; background: #7156ad; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }

@media (max-width: 767px) {
  .group-detail-content { padding-inline: 20px; }
  .mobile-break { display: block; }

  :global(.group-invite-modal) {
    width: calc(100% - 40px);
    max-height: calc(100dvh - 160px);
  }

  :global(.group-invite-modal .base-modal__header) { padding: 22px 20px 10px; }
  :global(.group-invite-modal .base-modal__body) { padding: 12px 20px 24px; }
  :global(.group-invite-modal .base-modal__title) { font-size: 20px; }
  .invite-code-button { min-height: 68px; font-size: 21px; }

  :global(.group-start-date-modal) {
    width: calc(100% - 40px);
    max-height: calc(100dvh - 160px);
  }

  :global(.group-start-date-modal .base-modal__header) { padding: 22px 20px 10px; }
  :global(.group-start-date-modal .base-modal__body) { padding: 12px 20px 24px; }
  :global(.group-start-date-modal .base-modal__title) { font-size: 20px; }
  .start-date-input { min-height: 64px; font-size: 18px; }

  :global(.group-edit-modal) { width: calc(100% - 40px); max-height: calc(100dvh - 160px); }
  :global(.group-edit-modal .base-modal__header) { padding: 20px 20px 8px; }
  :global(.group-edit-modal .base-modal__body) { padding: 8px 20px 22px; }
  :global(.group-edit-modal .base-modal__title) { font-size: 20px; }
  .group-edit-category > div { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  :global(.group-post-detail-modal) { width: calc(100% - 32px); max-height: calc(100dvh - 142px); }
  .post-detail-image-wrap { height: 67vw; min-height: 250px; }
}

@media (min-width: 768px) {
  .group-detail-page { margin: -20px; min-height: calc(100% + 40px); }
  .group-detail-content { padding-top: 28px; }
}
</style>
