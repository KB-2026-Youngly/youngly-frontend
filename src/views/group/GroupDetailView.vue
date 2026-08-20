<template>
  <div class="group-detail-page">
    <div class="group-detail-content">
      <div v-if="groupLoadError" class="group-load-error" role="alert">
        <span>{{ groupLoadError }}</span>
        <button type="button" @click="loadGroupInfo">다시 시도</button>
      </div>

      <div class="detail-card-shadow detail-card-shadow--summary yl-stepped-card-shadow">
        <section
          class="challenge-summary yl-card-frame pixel-step-card pixel-step-solid"
          aria-label="챌린지 안내"
        >
          <div class="challenge-summary-surface pixel-step-surface">
            <div class="summary-top-row">
              <div class="summary-copy">
                <div class="summary-heading">
                  <Flag :size="15" :stroke-width="2.2" aria-hidden="true" />
                  <span>{{ challengeStarted ? '챌린지 진행' : '챌린지 준비' }}</span>
                </div>
                <p class="status-message" :class="{ 'is-waiting': !challengeStarted }">
                  <strong>{{ challengeStarted ? `${challengeDay}일째` : '시작 전' }}</strong>
                  <span>{{
                    challengeStarted ? `전체 ${challengeDuration}일` : '시작 일정을 기다리고 있어요'
                  }}</span>
                </p>
              </div>
              <button
  class="account-button"
  type="button"
  @click="goToMoimAccount"
>
                <Landmark :size="15" :stroke-width="2.2" aria-hidden="true" />
                <span>모임통장</span>
                <ArrowRight :size="15" :stroke-width="2.4" aria-hidden="true" />
              </button>
            </div>
            <div class="goal-block">
              <div class="goal-heading">
                <CircleCheck :size="15" :stroke-width="2.2" aria-hidden="true" />
                <span>챌린지 목표</span>
              </div>
              <p class="goal-message">{{ groupInfo.goal }}</p>
            </div>
          </div>
        </section>
      </div>

      <div v-if="currentRound && currentRoundStarted" class="detail-card-shadow yl-stepped-card-shadow">
        <section
          class="ranking-panel pixel-frame yl-card-frame pixel-step-card pixel-step-solid"
          aria-label="현재 라운드 현황"
        >
          <div class="ranking-panel-surface pixel-step-surface">
            <div class="round-overview-heading">
              <div>
                <span>{{ currentRound.roundNo }}라운드</span>
                <strong>{{ currentRoundPhaseLabel }}</strong>
              </div>
              <button
                class="expand-button account-button"
                type="button"
                aria-label="라운드 랭킹 자세히 보기"
                @click="openRankingSheet"
              >
                <span>전체 랭킹</span>
                <ArrowRight :size="15" :stroke-width="2.4" aria-hidden="true" />
              </button>
            </div>
            <div class="round-overview-progress">
              <div>
                <span>{{ formatRoundPeriod(currentRound) }}</span>
                <strong>{{ currentRoundRemainingLabel }}</strong>
              </div>
              <div class="round-overview-progress__bar" aria-hidden="true">
                <i :style="{ width: `${currentRoundProgress}%` }"></i>
              </div>
            </div>
            <div class="round-overview-stats">
              <div>
                <span>현재 등수</span>
                <strong>{{ currentUserRank ? `${currentUserRank}위` : '-' }}</strong>
              </div>
              <div>
                <span>이번 주 인증</span>
                <strong>{{ currentWeekPostCount }}회</strong>
              </div>
              <div>
                <span>이번 주 승인</span>
                <strong>{{ currentWeekApprovedCount }}회/{{ groupEditForm.weeklyCount }}회</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="day-selector">
        <button
          type="button"
          :disabled="!canMovePrevious"
          @click="changeFeedDate(-1)"
        >
          &lt;
        </button>

        <strong>
          {{ isTodaySelected ? '오늘' : selectedDate }}
        </strong>

        <button
          type="button"
          :disabled="!canMoveNext"
          @click="changeFeedDate(1)"
        >
          &gt;
        </button>
      </div>

      <section
  v-if="isOwner && (joinRequestsLoading || joinRequests.length)"
  class="join-request-panel"
>
  <div class="join-request-panel__header">
    <div>
      <strong>참여 요청</strong>

      <span v-if="joinRequests.length">
        {{ joinRequests.length }}명
      </span>
    </div>
  </div>

  <p
    v-if="joinRequestsLoading"
    class="join-request-loading"
  >
    참여 요청을 불러오는 중...
  </p>

  <div
    v-else
    class="join-request-list"
  >
    <div
      v-for="request in joinRequests"
      :key="request.groupUserId"
      class="join-request-item"
    >
      <div class="join-request-user">
        <div class="join-request-avatar">
          <img
            v-if="request.profileImageUrl"
            :src="request.profileImageUrl"
            :alt="`${request.nickname} 프로필`"
          />

          <span v-else>
            {{ request.nickname?.slice(0, 1) || '?' }}
          </span>
        </div>

        <div>
          <strong>
            {{ request.nickname || request.userId }}
          </strong>
          <span>그룹 참여를 요청했어요</span>
        </div>
      </div>

      <div class="join-request-actions">
        <button
          type="button"
          class="join-request-reject"
          :disabled="
            joinRequestProcessingId === request.groupUserId
          "
          @click="
            rejectGroupJoinRequest(request)
          "
        >
          거절
        </button>

        <button
          type="button"
          class="join-request-approve"
          :disabled="
            joinRequestProcessingId === request.groupUserId
          "
          @click="
            approveGroupJoinRequest(request)
          "
        >
          승인
        </button>
      </div>
    </div>
  </div>
</section>

      <section class="feed-list" aria-label="참여자 인증 목록">
        <div
          v-for="member in displayedMembers"
          :key="member.name"
          class="feed-card-shadow yl-stepped-card-shadow"
        >
          <article
            :data-feed-member="member.name"
            class="feed-card pixel-frame pixel-step-card pixel-step-solid my-feed-card"
            :class="{
              'is-started': challengeStarted,
              'has-verification': challengeStarted && member.isVerified,
              'is-reordering': draggingFeedName === member.name,
              [`review-${getReviewState(member)}`]: challengeStarted && member.isVerified,
            }"
            draggable="true"
            @click="handleFeedCardClick(member)"
            @dragstart="handleFeedDesktopDragStart(member.name, $event)"
            @dragover.prevent
            @drop="handleFeedDesktopDrop(member.name)"
            @dragend="finishFeedDrag"
          >
            <div class="feed-card-surface pixel-step-surface">
              <div class="feed-owner">
                <span class="avatar">{{ member.initial }}</span>
                <span class="feed-owner__info">
                  <span class="feed-owner__name"
                    >{{ member.name }} <em v-if="member.isMe" class="me-label">나</em></span
                  >
                  <small
                    v-if="member.reviewStatus === 'approved'"
                    class="feed-review-badge is-approved"
                    >승인</small
                  >
                  <small
                    v-else-if="member.reviewStatus === 'rejected'"
                    class="feed-review-badge is-rejected"
                    >반려</small
                  >
                </span>
              </div>
              <template v-if="challengeStarted">
                <div v-if="member.isVerified" class="verification-content">
                  <img
                    :src="member.image"
                    :alt="`${member.name} 인증 사진`"
                    class="verification-image"
                  />
                  <div class="verification-shade"></div>
                  <p class="verification-message">{{ member.message }}</p>

                  <div
                        v-if="
                          !member.isMe &&
                          !member.reviewStatus &&
                          !member.myApproval
                        "
                        class="review-deadline"
                      >
                        승인/반려 마감 {{ getReviewCountdown(member) }}
                      </div>
                  <div
                      v-if="
                        !member.isMe &&
                        !member.reviewStatus &&
                        !member.myApproval &&
                        !isReviewExpired(member)
                      "
                      class="review-actions"
                    >
                    <button type="button" class="reject-button" @click.stop="openRejectModal(member)">
                      <X :size="14" :stroke-width="2.5" aria-hidden="true" />
                      <span>반려</span>
                    </button>
                    <button type="button" class="approve-button" @click.stop="reviewVerification(member)">
                      <Check :size="14" :stroke-width="2.5" aria-hidden="true" />
                      <span>승인</span>
                    </button>
                </div>
                <div
                  v-if="canAccessPost(member)"
                  class="post-engagement"
                  aria-label="게시글 반응"
                >
                  <button class="engagement-item" type="button" :aria-label="`댓글 ${member.commentCount}개, 상세 보기`" @click.stop="openPostDetail(member)">
                    <span class="engagement-icon"><MessageCircle :size="23" :stroke-width="2.2" aria-hidden="true" /></span>
                    <b>{{ member.commentCount }}</b>
                  </button>
                  <button class="engagement-item engagement-item--like"
                      :class="{ 'is-active': member.myReaction === 'like' }" type="button" :aria-pressed="member.myReaction === 'like'" :aria-label="`좋아요 ${member.likeCount}개`" @click.stop="toggleFeedReaction(member, 'like')">
                    <span class="engagement-icon"><ThumbsUp :size="23" :stroke-width="2.2" aria-hidden="true" /></span>
                    <b>{{ member.likeCount }}</b>
                  </button>
                  <button class="engagement-item engagement-item--dislike"
                      :class="{ 'is-active': member.myReaction === 'dislike' }" type="button" :aria-pressed="member.myReaction === 'dislike'" :aria-label="`싫어요 ${member.dislikeCount}개`" @click.stop="toggleFeedReaction(member, 'dislike')">
                    <span class="engagement-icon"><ThumbsDown :size="23" :stroke-width="2.2" aria-hidden="true" /></span>
                    <b>{{ member.dislikeCount }}</b>
                  </button>
                </div>
                  <div
                    v-if="canAccessPost(member)"
                    class="latest-comment-row"
                  >
                    <span
                      class="latest-comment-avatar"
                      :title="member.latestCommentAuthor || '김민준'"
                      aria-hidden="true"
                      >{{ member.latestCommentInitial || '김' }}</span
                    >
                    <p class="latest-comment">{{ member.latestComment }}</p>
                  </div>
                  <span
                    v-if="member.reviewStatus && member.reviewStatus !== 'pending-rejection'"
                    class="review-status"
                    :class="member.reviewStatus"
                  >
                    {{ member.reviewStatus === 'approved' ? '승인 완료' : '반려 처리' }}
                  </span>
                </div>
                <template v-else>
                  <button
                    v-if="isTodaySelected"
                    type="button"
                    class="pending-verification"
                    @click="handlePendingCard(member)"
                  >
                    <strong>
                      {{
                        member.isMe
                          ? '눌러서 인증하러 가기 📷 ›'
                          : '눌러서 깨우기 ⏰ ›'
                      }}
                    </strong>
                  </button>

                  <div
                    v-else
                    class="pending-verification past-verification"
                  >
                    <strong>ZZZ...</strong>
                  </div>
                </template>
              </template>
              <p v-else class="sleep-message">ZZZ...</p>
              <span
                class="feed-drag-handle"
                role="button"
                aria-label="우하단을 길게 눌러 피드 순서 변경"
                @pointerdown.stop="handleFeedPointerDown(member.name, $event)"
                @click.stop
                @contextmenu.prevent
                ><span aria-hidden="true">⠿</span></span
              >
            </div>
          </article>
        </div>

        <template v-if="!allMembersJoined">
          <div
            v-for="slot in inviteSlots"
            :key="`invite-${slot}`"
            class="feed-card-shadow yl-stepped-card-shadow"
          >
            <button
              class="feed-card pixel-frame pixel-step-card pixel-step-solid invite-card"
              type="button"
              @click="handleInvite"
            >
              <span class="invite-card-surface pixel-step-surface">
                <span class="plus pixel-step-circle" aria-hidden="true">＋</span>
                <span>친구 초대하기</span>
              </span>
            </button>
          </div>
        </template>
      </section>
    </div>

    <BaseModal
      v-model="inviteModalOpen"
      modal-class="youngly-modal group-invite-modal"
      title="코드를 누르시면 복사가 됩니다!"
      size="medium"
      @close="copyComplete = false"
    >
      <div class="invite-modal-content">
        <span class="invite-code-label">초대 코드</span>
        <button class="invite-code-button" type="button" @click="copyInviteCode">
          {{ inviteCode }}
        </button>
        <button class="invite-share-button" type="button" @click="shareInviteLink">
          ↗ 링크 공유
        </button>
        <p v-if="copyComplete" class="copy-complete-message" role="status" aria-live="polite">
          {{ copyComplete }}
        </p>
      </div>
    </BaseModal>

    <BaseModal
      v-if="isOwner && allMembersJoined"
      v-model="startDateModalOpen"
      modal-class="youngly-modal group-start-date-modal"
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
      modal-class="youngly-modal group-ranking-modal"
      title="랭킹"
      size="large"
      :show-close-button="false"
      :auto-focus="false"
      drag-from-anywhere
    >
      <template #header>
        <div class="ranking-sheet-header">
          <span>라운드 랭킹</span>
        </div>
      </template>
      <div class="ranking-modal-content">
        <div class="ranking-period">
          <button
            type="button"
            aria-label="이전 라운드"
            :disabled="selectedRoundIndex === 0"
            @click="selectRankingRound(-1)"
          >
            ‹
          </button>
          <div v-if="selectedRankingRound" class="ranking-period-copy">
            <strong>{{ selectedRankingRound.roundNo }}라운드</strong>
            <small>{{ formatRoundPeriod(selectedRankingRound) }}</small>
          </div>
          <strong v-else>라운드 정보 없음</strong>
          <button
            type="button"
            aria-label="다음 라운드"
            :disabled="selectedRoundIndex >= rankingRounds.length - 1"
            @click="selectRankingRound(1)"
          >
            ›
          </button>
        </div>

        <div v-if="rankingLoading" class="ranking-api-state">랭킹을 불러오고 있어요.</div>
        <div v-else-if="rankingError" class="ranking-api-state error">
          <span>{{ rankingError }}</span>
          <button type="button" @click="loadSelectedRoundData">다시 조회</button>
        </div>
        <template v-else-if="selectedRankingRound">
          <div class="ranking-round-summary">
            <span>{{ isSelectedRoundOngoing ? '랭킹 종료까지' : '라운드 상태' }}</span>
            <strong>{{
              isSelectedRoundOngoing
                ? rankingRemainingLabel
                : roundStatusLabel(selectedRankingRound.roundStatus)
            }}</strong>
            <div class="ranking-modal-track">
              <i :style="{ width: `${selectedRoundProgress}%` }"></i>
            </div>
          </div>

          <ol class="ranking-list">
            <li
              v-for="ranking in roundRankings"
              :key="`ranking-${ranking.userId}`"
              :class="{ 'is-me': ranking.userId === currentUserId }"
            >
              <strong class="ranking-position">{{ ranking.rankNo }}등</strong>
              <span
                class="ranking-avatar"
                :class="{
                  'is-me': ranking.userId === currentUserId,
                  'is-first': ranking.rankNo === 1,
                }"
              >
                <span v-if="ranking.rankNo === 1" class="ranking-crown" aria-hidden="true">♛</span>
                {{ ranking.nickname?.slice(0, 1) || '?' }}
              </span>
              <div class="ranking-member-info">
                <b
                  >{{ ranking.nickname || ranking.userId
                  }}<em v-if="ranking.userId === currentUserId">나</em></b
                >
                <span>주간 챌린지 성공 {{ ranking.successCount ?? 0 }}회</span>
                <small v-if="settlementByUser(ranking.userId)" class="ranking-settlement">
                  정산 {{ formatMoney(settlementByUser(ranking.userId).settlementAmount) }}원 ·
                  {{ settlementAccountLabel(settlementByUser(ranking.userId)) }}
                </small>
              </div>
            </li>
          </ol>
          <div v-if="!roundRankings.length" class="ranking-api-state">표시할 랭킹이 없습니다.</div>
        </template>
      </div>
    </BaseModal>

    <BaseModal
      v-model="groupEditOpen"
      :modal-class="[
        'youngly-modal',
        'group-edit-modal',
        { 'is-expanded': groupEditSheetExpanded },
      ]"
      :title="groupInfo.title"
      size="large"
      :show-close-button="false"
      :show-sheet-handle="false"
      :auto-focus="false"
      @close="closeGroupEdit"
    >
      <template #header>
        <div class="group-edit-sheet-header">
          <span class="group-edit-sheet-handle" aria-hidden="true"></span>
          <span class="group-edit-sheet-title">{{ groupInfo.title }}</span>
        </div>
      </template>
      <form class="group-edit-form" @submit.prevent="saveGroupEdit">
        <label class="group-edit-field">
          <span>그룹 이름</span>
          <input v-model.trim="groupEditForm.title" required maxlength="20" />
        </label>

        <fieldset class="group-edit-category">
          <legend>카테고리</legend>
          <div>
            <button
              v-for="category in groupCategories"
              :key="category.name"
              type="button"
              :class="{ active: groupEditForm.category === category.name }"
              @click="groupEditForm.category = category.name"
            >
              <component :is="category.icon" :size="16" :stroke-width="2" aria-hidden="true" />
              <span>{{ category.name }}</span>
            </button>
          </div>
        </fieldset>

        <section class="group-member-editor" aria-label="모집 인원">
          <h3>모집 인원</h3>
          <ul>
            <li v-for="member in editMembers" :key="`edit-${member.name}`">
              <span class="member-editor-avatar">{{ member.initial }}</span>
              <strong>{{ member.isMe ? 'Yuna Park' : member.name }}</strong>
              <button type="button" @click="removeMember(member)">내보내기</button>
            </li>
          </ul>
        </section>

        <div class="group-edit-field">
          <span>매주 몇 번</span>

          <BaseSelect
            v-model="groupEditForm.weeklyCount"
            :options="weeklyCountOptions"
            placeholder="횟수 선택"
          />
        </div>

        <label class="group-edit-field">
          <span>챌린지 목표</span>
          <input v-model.trim="groupEditForm.goal" required />
        </label>

        <label class="group-edit-field">
          <span>1인당 최소 예치금</span>
          <input
            class="yl-money"
            :value="formatGroupDeposit(groupEditForm.deposit)"
            type="text"
            inputmode="numeric"
            required
            @input="updateGroupDeposit"
          />
        </label>

        <label class="group-edit-field">
          <span class="group-edit-field-label">
            실패 면제권
            <span class="group-edit-tooltip-wrap">
              <button
                class="group-edit-tooltip-trigger"
                type="button"
                aria-label="실패 면제권 안내"
              >
                ?
              </button>
              <span class="group-edit-tooltip" role="tooltip"
                >하루 챌린지를 하지 못했을 때 해당 날짜를 면제합니다.</span
              >
            </span>
          </span>
          <BaseSelect
            v-model="groupEditForm.failurePassCount"
            :options="failurePassOptions"
            placeholder="면제권 개수 선택"
          />
        </label>

        <label class="group-edit-field">
          <span>추가 규칙 <em>(선택)</em></span>
          <textarea
            v-model.trim="groupEditForm.additionalRule"
            maxlength="120"
            placeholder="예: 이번 달 꼴찌가 모든 참여자에게 커피 쏘기"
          ></textarea>
        </label>

        <button class="group-edit-submit" type="submit">수정완료</button>
        <p v-if="groupEditComplete" class="group-edit-complete" role="status">
          ! 수정 완료. 다음달부터 적용 !
        </p>
      </form>
    </BaseModal>

    <BaseModal
      v-model="postDetailOpen"
      modal-class="youngly-modal group-post-detail-modal"
      title="인증 게시글"
      size="medium"
      @close="selectedPost = null"
    >
      <template #header>
        <div class="post-detail-modal-header">
          <span>인증 게시글</span>
          <button
            v-if="selectedPost?.isMe"
            class="post-delete-button"
            type="button"
            aria-label="내 인증 게시글 삭제"
            title="게시글 삭제"
            @click="deleteOwnPost"
          >
            🗑
          </button>
        </div>
      </template>
      <article v-if="selectedPost" class="post-detail-modal-content">
        <div class="post-detail-image-wrap">
          <img :src="selectedPost.image" :alt="`${selectedPost.name} 인증 사진`" />
          <div></div>
          <p>
            <span class="post-detail-avatar">{{ selectedPost.initial }}</span
            ><b>{{ selectedPost.name }}</b>
          </p>
          <strong>{{ selectedPost.message }}</strong>
        </div>
        <div class="post-reaction-info">

          <span class="post-approval-status">승인 {{ selectedPost.approvalCount }}/{{ groupInfo.memberCount }}명 · 과반수 승인 완료</span>
          <p><b>좋아요 {{ postLikes.length }}</b>{{ postLikes.join(', ') }}</p>
          <p><b>싫어요 {{ postDislikes.length }}</b>{{ postDislikes.join(', ') }}</p>
        </div>
        <section class="post-comments" aria-label="댓글">
          <h3>
            댓글 <small>{{ postComments.length }}</small>
          </h3>
          <ul>
            <li v-for="commentItem in postComments" :key="commentItem.id">
              <b>{{ commentItem.author }}</b
              >{{ commentItem.text }}
            </li>
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
      modal-class="youngly-modal group-reject-modal"
      title="반려 사유 입력"
      size="small"
      @close="resetRejectModal"
    >
      <form class="reject-form" @submit.prevent="submitRejection">
        <p>인증 사진이 기준에 맞지 않는 이유를 작성해 주세요.</p>
        <div class="reject-input-wrap">
          <textarea
            v-model.trim="rejectReason"
            required
            maxlength="30"
            placeholder="반려 사유를 입력해 주세요"
          ></textarea>
          <span class="reject-character-count" aria-live="polite"
            >{{ rejectReason.length }} / 30</span
          >
        </div>
        <button type="submit">반려 사유 등록</button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  CircleCheck,
  Dumbbell,
  Flag,
  GraduationCap,
  Landmark,
  MessageCircle,
  Shapes,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-vue-next'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import {
  getGroupDetail,
  getGroupUsers,
  kickGroupUser,
  updateGroup,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '@/api/group'

import {
  createGroupRound,
  getGroupRounds,
  getRoundRanking,
  getRoundSettlements,
} from '@/api/round'

import {
  getVerificationFeed,
  getVerificationPostDetail,
  reviewVerificationPost,
  createPostComment,
  setPostReaction,
  deletePostReaction,
  deleteVerificationPost,
  getMyCertificationPosts,
} from '@/api/post'

import { useUserStore } from '@/stores/user'

const members = reactive([])
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const joinRequests = ref([])
const joinRequestsLoading = ref(false)
const joinRequestProcessingId = ref(null)

const challengeStarted = computed(
  () => currentRound.value?.roundStatus === 'ONGOING'
)

const challengeDay = computed(() => {
  if (!currentRound.value?.startDate) return 0

  const start = new Date(`${currentRound.value.startDate}T00:00:00`)
  const today = new Date()

  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return Math.max(
    1,
    Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1
  )
})

const challengeDuration = 28

const displayedMembers = computed(() =>
  allMembersJoined.value ? members : members.slice(0, 1)
)

const goToMoimAccount = () => {
  if (!groupInfo.moimAccountId) return

  router.push({
    name: 'MoimAccountDetail',
    params: {
      moimAccountId: groupInfo.moimAccountId,
    },
  })
}

// const rankingSegments = computed(() => (allMembersJoined.value ? members.length : 4))

// const myProgress = computed(() => members.find((member) => member.isMe)?.progress ?? 0)
// const rankedMembers = computed(() =>
//   [...members].sort((a, b) => b.completedCount - a.completedCount || b.averageRate - a.averageRate),
// )
const inviteCode = ref('A7K2P9')
const inviteModalOpen = ref(false)
const copyComplete = ref(false)
const isOwner = ref(route.query.owner !== 'false')
const startDateModalOpen = ref(false)
const startDate = ref('')
const startDateConfigured = ref(false)
const rankingModalOpen = ref(false)
const rankingRounds = ref([])
const selectedRoundIndex = ref(0)
const roundRankings = ref([])
const roundSettlements = ref([])
const rankingLoading = ref(false)
const rankingError = ref('')
const currentRoundPosts = ref([])
const currentRound = ref(null)
const currentUserId = computed(() => userStore.user?.userId || '')


const currentRoundStarted = computed(() => {
  if (!currentRound.value?.startDate) return false
  return Date.now() >= new Date(`${currentRound.value.startDate}T00:00:00`).getTime()
})
const currentRoundProgress = computed(() => {
  const round = currentRound.value
  if (!round?.startDate || !round?.endDate) return 0
  const start = new Date(`${round.startDate}T00:00:00`)
  const end = new Date(`${round.endDate}T23:59:59`)
  return Math.max(0, Math.min(100, ((Date.now() - start) / Math.max(end - start, 1)) * 100))
})
const currentRoundWeek = computed(() => {
  const startDate = currentRound.value?.startDate
  if (!startDate) return 1
  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(`${startDate}T00:00:00`).getTime()) / 86400000),
  )
  return Math.floor(elapsedDays / 7) + 1
})
const currentRoundPhaseLabel = computed(() =>
  currentRound.value?.roundStatus === 'ONGOING'
    ? `${currentRoundWeek.value}주차 진행 중`
    : '라운드 종료',
)
const currentRoundRemainingLabel = computed(() => {
  if (currentRound.value?.roundStatus !== 'ONGOING') return '종료된 라운드'
  const endDate = currentRound.value?.endDate
  if (!endDate) return '기간 확인 중'
  const remaining = Math.max(
    0,
    Math.ceil((new Date(`${endDate}T23:59:59`).getTime() - Date.now()) / 86400000),
  )
  return remaining === 0 ? '오늘 종료' : `${remaining}일 남음`
})
const currentWeekPosts = computed(() => {
  const startDate = currentRound.value?.startDate
  if (!startDate) return []

  const weekStart = new Date(`${startDate}T00:00:00`)
  weekStart.setDate(weekStart.getDate() + (currentRoundWeek.value - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return currentRoundPosts.value.filter((post) => {
    const postedAt = new Date(post.postedAt || post.createdAt)
    return !Number.isNaN(postedAt.getTime()) && postedAt >= weekStart && postedAt < weekEnd
  })
})
const currentWeekPostCount = computed(() => currentWeekPosts.value.length)
const currentWeekApprovedCount = computed(
  () => currentWeekPosts.value.filter((post) => post.postStatus === 'APPROVED').length,
)
const currentUserRank = computed(
  () => roundRankings.value.find((ranking) => ranking.userId === currentUserId.value)?.rankNo,
)
const selectedRankingRound = computed(() => rankingRounds.value[selectedRoundIndex.value] || null)
const isSelectedRoundOngoing = computed(() => selectedRankingRound.value?.roundStatus === 'ONGOING')
const selectedRoundProgress = computed(() => {
  const round = selectedRankingRound.value
  if (!round?.startDate || !round?.endDate) return 0
  const start = new Date(`${round.startDate}T00:00:00`)
  const end = new Date(`${round.endDate}T23:59:59`)
  return Math.max(
    0,
    Math.min(100, ((Date.now() - start.getTime()) / Math.max(end - start, 1)) * 100),
  )
})
const rankingRemainingLabel = computed(() => {
  const endDate = selectedRankingRound.value?.endDate
  if (!endDate) return '기간 확인 중'
  const remaining = Math.max(
    0,
    Math.ceil((new Date(`${endDate}T23:59:59`).getTime() - Date.now()) / 86400000),
  )
  return remaining === 0 ? '오늘 종료' : `${remaining}일 남음`
})
const postDetailOpen = ref(false)
const selectedPost = ref(null)

const postLikes = ref([])
const postDislikes = ref([])
const postComments = ref([])

const newPostComment = ref('')
const rejectModalOpen = ref(false)
const rejectReason = ref('')
const rejectingMember = ref(null)
const groupEditOpen = ref(isOwner.value && route.query.editGroup === 'true')
const groupLoading = ref(false)
const groupLoadError = ref('')
const groupEditComplete = ref(false)
const groupEditSheetExpanded = ref(false)
const draggingFeedName = ref(null)
let feedLongPressTimer = null
let mobileFeedDragActive = false
let mobileFeedPointerId = null
let preventNextFeedClick = false
let groupEditSwipeState = null
let groupEditCloseTimer = null
let groupEditSheetElement = null
const groupCategories = [
  { name: '운동', icon: Dumbbell },
  { name: '독서', icon: BookOpen },
  { name: '공부', icon: GraduationCap },
  { name: '습관', icon: CalendarCheck2 },
  { name: '기타', icon: Shapes },
]
const categoryValues = {
  운동: 'EXERCISE',
  독서: 'READING',
  공부: 'STUDY',
  습관: 'HABIT',
  기타: 'CUSTOM',
}

const weeklyCountOptions = Array.from(
  { length: 7 },
  (_, index) => ({
    label: `주 ${index + 1}회`,
    value: index + 1,
  })
)

const failurePassOptions = Array.from(
  { length: 9 },
  (_, index) => ({
    label: `${index}개`,
    value: index,
  })
)

const groupEditForm = reactive({
  title: '30일 매일 운동 챌린지',
  category: '운동',
  weeklyCount: 5,
  goal: '매일 운동으로 건강한 생활 습관 만들기',
  deposit: 50000,
  failurePassCount: 0,
  additionalRule: '',
})

const groupInfo = reactive({
  id: '',
  title: '30일 매일 운동 챌린지',
  goal: '매일 운동으로 건강한 생활 습관 만들기',
  category: '운동',
  status: 'ONGOING',
  memberLimit: 6,
  memberCount: 0,
  durationDays: 7,
  roundCycleDays: 28,
  moimAccountId: '',
  futureDepositRatioRule: '',
})

const now = ref(new Date())

let countdownTimer = null

const getReviewDeadline = (member) => {
  if (!member?.createdAt) return null

  const created = new Date(member.createdAt)

  const deadline = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate() + 2,
    0,
    0,
    0
  )

  return deadline
}

const getReviewCountdown = (member) => {
  const deadline = getReviewDeadline(member)

  if (!deadline) return ''

  const diff = deadline.getTime() - now.value.getTime()

  if (diff <= 0) return '마감'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const isReviewExpired = (member) => {
  const deadline = getReviewDeadline(member)

  if (!deadline) return true

  return now.value >= deadline
}

const selectedDate = ref(
  new Date().toLocaleDateString('sv-SE')
)

const inviteSlots = computed(() => {
  const maxCount = Number(groupInfo.memberLimit) || 0
  const currentCount = Number(groupInfo.memberCount) || 0

  return Math.max(maxCount - currentCount, 0)
})

const allMembersJoined = computed(() => inviteSlots.value === 0)

const editMembers = reactive(members.map((member) => ({ ...member })))

const categoryNames = {
  EXERCISE: '운동',
  READING: '독서',
  STUDY: '공부',
  HABIT: '습관',
  CUSTOM: '기타',
  DRAFT: '기타',
}

const getGroupLoadErrorMessage = (error) => {
  const status = error?.response?.status
  if (status === 401) return '로그인이 필요합니다.'
  if (status === 403) return '이 그룹을 조회할 권한이 없습니다.'
  if (status === 404) return '존재하지 않는 그룹입니다.'
  return error?.response?.data?.message || '그룹 정보를 불러오지 못했습니다.'
}

const syncGroupHeader = () => {
  const storedGroupInfo = {
    groupId: groupInfo.id,
    title: groupInfo.title,
    goal: groupInfo.goal,
    category: groupInfo.category,
    status: groupInfo.status,
    memberCount: groupInfo.memberCount,
    memberLimit: groupInfo.memberLimit,
    isOwner: isOwner.value,
    weeklyCount: groupEditForm.weeklyCount,
    deposit: groupEditForm.deposit,
    failurePassCount: groupEditForm.failurePassCount,
    additionalRule: groupEditForm.additionalRule,
  }
  localStorage.setItem('youngly_group_info', JSON.stringify(storedGroupInfo))
  window.dispatchEvent(new CustomEvent('youngly-group-info-updated', { detail: storedGroupInfo }))
}

const applyGroupDetail = (detail) => {
  groupInfo.id = detail.groupId || String(route.params.id || '')
  groupInfo.title = detail.groupName || groupInfo.title
  groupInfo.goal = detail.content || groupInfo.goal
  groupInfo.category = categoryNames[detail.challengeType] || '기타'
  groupInfo.status = detail.groupStatus || 'RECRUITING'
  groupInfo.memberLimit = Number(detail.groupCount) || groupInfo.memberLimit
  groupInfo.moimAccountId = detail.moimAccountId || ''

  groupInfo.memberCount = Number(detail.memberCount) || 0

  groupInfo.durationDays = Number(detail.durationDays) || groupInfo.durationDays
  groupInfo.roundCycleDays = Number(detail.roundCycleDays) || groupInfo.roundCycleDays
  groupInfo.futureDepositRatioRule =
  detail.futureDepositRatioRule || ''

  groupEditForm.title = groupInfo.title
  groupEditForm.category = groupInfo.category
  groupEditForm.weeklyCount = Number(detail.minCount) || groupEditForm.weeklyCount
  groupEditForm.goal = groupInfo.goal
  groupEditForm.deposit = Number(detail.baseDepositAmount) || 0
  groupEditForm.additionalRule = detail.customRule || ''
  groupEditForm.failurePassCount =
  Number(detail.defaultFailPassCount) || 0

  inviteCode.value = detail.inviteCode || ''
  isOwner.value = Boolean(detail.inviteCode)
  startDateModalOpen.value = isOwner.value && allMembersJoined.value && groupInfo.status === 'RECRUITING'
  syncGroupHeader()
}

const loadGroupInfo = async () => {
  const groupId = String(route.params.id || '')
  if (!groupId || groupLoading.value) return

  groupLoading.value = true
  groupLoadError.value = ''
  try {
    const response = await getGroupDetail(groupId)
    applyGroupDetail(response.data || {})
  } catch (error) {
    groupLoadError.value = getGroupLoadErrorMessage(error)
    console.error('그룹 상세 조회 실패:', error)
  } finally {
    groupLoading.value = false
  }
}

// const loadCurrentRound = async () => {
//   const groupId = String(route.params.id || '')
//   if (!groupId) return

//   try {
//     const response = await getGroupRounds(groupId)
//     const rounds = Array.isArray(response.data) ? response.data : []

//     currentRound.value =
//       rounds.find((round) => round.roundStatus === 'ONGOING') ||
//       rounds[0] ||
//       null
//   } catch (error) {
//     console.error('현재 라운드 조회 실패:', error)
//     currentRound.value = null
//   }
// }

const loadGroupMembers = async () => {
  const groupId = String(route.params.id || '')
  if (!groupId) return

  try {
    const response = await getGroupUsers(groupId)

    const currentUser = JSON.parse(
  localStorage.getItem('youngly_user') || '{}'
)


const loadedMembers = (response.data || []).map((member) => ({
  groupUserId: member.groupUserId,
  userId: member.userId,
  name: member.nickname,
  initial: member.nickname?.charAt(0) || '',
  profileImageUrl: member.profileImageUrl,
  isLeader: member.leader,

  // 로그인한 사용자와 비교
  isMe: String(member.userId) === String(currentUser.userId),
}))

    members.splice(0, members.length, ...loadedMembers)
    editMembers.splice(
      0,
      editMembers.length,
      ...loadedMembers.map((member) => ({ ...member }))
    )

    groupInfo.memberCount = loadedMembers.length
  } catch (error) {
    console.error('그룹 참여자 조회 실패:', error)
  }
}

const loadJoinRequests = async () => {
  if (!isOwner.value) {
    joinRequests.value = []
    return
  }

  const groupId = String(route.params.id || '')
  if (!groupId) return

  joinRequestsLoading.value = true

  try {
    const response = await getJoinRequests(groupId)

    joinRequests.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    console.error('그룹 참여 요청 조회 실패:', error)
    joinRequests.value = []
  } finally {
    joinRequestsLoading.value = false
  }
}

const approveGroupJoinRequest = async (request) => {
  if (!request?.groupUserId) return

  const groupId = String(route.params.id || '')
  if (!groupId) return

  joinRequestProcessingId.value = request.groupUserId

  try {
    await approveJoinRequest(
      groupId,
      request.groupUserId
    )

    await Promise.all([
      loadJoinRequests(),
      loadGroupMembers(),
      loadGroupInfo(),
    ])
  } catch (error) {
    console.error('그룹 참여 승인 실패:', error)

    window.alert(
      error?.response?.data?.message ||
      '참여 승인에 실패했습니다.'
    )
  } finally {
    joinRequestProcessingId.value = null
  }
}

const rejectGroupJoinRequest = async (request) => {
  if (!request?.groupUserId) return

  const groupId = String(route.params.id || '')
  if (!groupId) return

  joinRequestProcessingId.value = request.groupUserId

  try {
    await rejectJoinRequest(
      groupId,
      request.groupUserId
    )

    await loadJoinRequests()
  } catch (error) {
    console.error('그룹 참여 거절 실패:', error)

    window.alert(
      error?.response?.data?.message ||
      '참여 거절에 실패했습니다.'
    )
  } finally {
    joinRequestProcessingId.value = null
  }
}

const loadVerificationFeed = async () => {
  if (!currentRound.value?.roundId) return

  try {
    const response = await getVerificationFeed({
      roundId: currentRound.value.roundId,
      date: selectedDate.value,
    })

    const posts = Array.isArray(response.data)
      ? response.data
      : []

    // 먼저 모든 참여자를 미인증 상태로 초기화
    members.forEach((member) => {
      member.isVerified = false
      member.postId = null
      member.image = null
      member.message = ''
      member.commentCount = 0
      member.likeCount = 0
      member.dislikeCount = 0
      member.reviewStatus = ''
      member.myReaction = null
      member.myApproval = null
    })

    // 해당 날짜에 인증한 참여자 정보 덮어쓰기
    posts.forEach((post) => {
      const member = members.find(
        (item) => String(item.userId) === String(post.userId)
      )

      if (!member) return

      member.postId = post.postId
      member.isVerified = true
      member.image = post.photoUrl
      member.message = post.content
      member.commentCount = post.commentCount || 0
      member.likeCount = post.likeCount || 0
      member.dislikeCount = post.dislikeCount || 0
      member.latestComment = post.latestCommentContent || ''
      member.myReaction = post.myReaction?.toLowerCase() || null
      member.myApproval = post.myApproval || null
      member.createdAt = post.postedAt

      member.reviewStatus =
        post.postStatus === 'APPROVED'
          ? 'approved'
          : post.postStatus === 'REJECTED'
            ? 'rejected'
            : ''
    })
  } catch (error) {
    console.error('인증 피드 조회 실패:', error)
  }
}

const copyInviteCode = async () => {
  try {
    await navigator.clipboard.writeText(inviteCode.value)
  } catch {
    const input = document.createElement('input')
    input.value = inviteCode.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }

  copyComplete.value = '초대 코드를 복사했어요.'
}

const shareInviteLink = async () => {
  const shareUrl = `${window.location.origin}/groups/join?code=${inviteCode.value}`
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: 'CHALLENGE PIXEL 그룹 초대',
        text: `초대 코드: ${inviteCode.value}`,
        url: shareUrl,
      })
      return
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl)
    copyComplete.value = '공유 링크를 복사했어요.'
  } catch {
    copyComplete.value = '이 브라우저에서는 공유를 지원하지 않아요.'
  }
}

const handleInvite = () => {
  copyComplete.value = ''
  inviteModalOpen.value = true
}

const loadCurrentRoundOverview = async () => {
  try {
    const { data } = await getGroupRounds(route.params.id)

    rankingRounds.value = (Array.isArray(data) ? data : []).sort(
      (first, second) =>
        Number(first.roundNo || 0) - Number(second.roundNo || 0)
    )

    const ongoingIndex = rankingRounds.value.findIndex(
      (round) => round.roundStatus === 'ONGOING'
    )

    const latestStartedIndex = rankingRounds.value.findLastIndex(
      (round) =>
        round.startDate &&
        Date.now() >= new Date(`${round.startDate}T00:00:00`).getTime()
    )

    const overviewIndex =
      ongoingIndex >= 0 ? ongoingIndex : latestStartedIndex

    if (overviewIndex < 0) {
      currentRound.value = null
      roundRankings.value = []
      currentRoundPosts.value = []
      return
    }

    selectedRoundIndex.value = overviewIndex

    const round = rankingRounds.value[overviewIndex]

    currentRound.value = round

    const [rankingResult, postsResult] =
      await Promise.allSettled([
        getRoundRanking(round.roundId),
        getMyCertificationPosts({
          from: round.startDate,
          to: round.endDate,
          groupId: String(route.params.id || ''),
        }),
      ])

    roundRankings.value =
      rankingResult.status === 'fulfilled' &&
      Array.isArray(rankingResult.value.data)
        ? rankingResult.value.data
        : []

    currentRoundPosts.value =
      postsResult.status === 'fulfilled' &&
      Array.isArray(postsResult.value.data)
        ? postsResult.value.data.filter(
            (post) =>
              Number(post.roundId) === Number(round.roundId)
          )
        : []
  } catch (error) {
  console.error('라운드 목록 조회 실패:', error)

  roundRankings.value = []
  currentRoundPosts.value = []
  }
}

const openRankingSheet = async () => {
  rankingModalOpen.value = true
  rankingError.value = ''
  if (rankingRounds.value.length) {
    await loadSelectedRoundData()
    return
  }
  rankingLoading.value = true
  try {
    const { data } = await getGroupRounds(route.params.id)
    rankingRounds.value = (Array.isArray(data) ? data : []).sort(
      (first, second) => Number(first.roundNo || 0) - Number(second.roundNo || 0),
    )
    selectedRoundIndex.value = Math.max(0, rankingRounds.value.length - 1)
    await loadSelectedRoundData()
  } catch (error) {
    rankingError.value = error.response?.data?.message || '라운드 목록을 불러오지 못했습니다.'
  } finally {
    rankingLoading.value = false
  }
}

const loadSelectedRoundData = async () => {
  const roundId = selectedRankingRound.value?.roundId
  if (!roundId) return
  rankingLoading.value = true
  rankingError.value = ''
  try {
    const [rankingResponse, settlementResponse] = await Promise.all([
      getRoundRanking(roundId),
      getRoundSettlements(roundId),
    ])
    roundRankings.value = Array.isArray(rankingResponse.data) ? rankingResponse.data : []
    roundSettlements.value = Array.isArray(settlementResponse.data) ? settlementResponse.data : []
  } catch (error) {
    roundRankings.value = []
    roundSettlements.value = []
    rankingError.value = error.response?.data?.message || '라운드 랭킹을 불러오지 못했습니다.'
  } finally {
    rankingLoading.value = false
  }
}

const selectRankingRound = async (offset) => {
  const nextIndex = selectedRoundIndex.value + offset
  if (nextIndex < 0 || nextIndex >= rankingRounds.value.length) return
  selectedRoundIndex.value = nextIndex
  await loadSelectedRoundData()
}

const settlementByUser = (userId) =>
  roundSettlements.value.find((settlement) => settlement.userId === userId)

const settlementAccountLabel = (settlement) => {
  if (Number(settlement?.settlementAmount || 0) === 0) return '지급 금액 없음'
  if (!settlement?.bankName || !settlement?.maskedAccountNumber) return '입금 계좌 정보 미제공'
  return `${settlement.bankName} ${settlement.maskedAccountNumber}`
}

const formatMoney = (value) => Number(value || 0).toLocaleString('ko-KR')

const formatRoundPeriod = (round) => {
  const shortDate = (value) => {
    if (!value) return '--.--.--'
    const [year, month, day] = String(value).split('-')
    return `${year?.slice(-2)}.${month}.${day}`
  }
  return `(${shortDate(round.startDate)}~${shortDate(round.endDate)})`
}

const roundStatusLabel = (status) =>
  ({
    ONGOING: '진행 중',
    WAITING_SETTLEMENT: '정산 대기',
    SETTLED: '정산 완료',
  })[status] ||
  status ||
  '상태 확인 중'

const setStartDate = async () => {
  if (!startDate.value) return

  const groupId = String(route.params.id || '')
  if (!groupId) return

  try {
    await createGroupRound(groupId, {
      startDate: startDate.value,
    })

    startDateConfigured.value = true
    startDateModalOpen.value = false

    await loadGroupInfo()

    // 생성된 라운드 다시 조회
    await loadCurrentRoundOverview()
    await loadVerificationFeed()
  } catch (error) {
    console.error('시작 날짜 설정 실패:', error)

    alert(
      error?.response?.data?.message ||
      '시작 날짜를 설정하지 못했습니다.'
    )
  }
}

const handlePendingCard = (member) => {
  if (member.isMe) {
    router.push({ name: 'FeedWrite', query: { groupId: String(route.params.id || '') } })
    return
  }

  alert(`${member.name}님을 깨웠습니다! (mock)`)
}

const reviewVerification = async (member) => {
  if (!member?.postId) return

  try {
    await reviewVerificationPost({
      postId: member.postId,
      approvalStatus: 'APPROVE',
    })


    await loadVerificationFeed()
  } catch (error) {
    console.error('인증 승인 실패:', error)
    alert(error?.response?.data?.message || '승인 처리에 실패했습니다.')
  }
}

const getReviewState = (member) => {
  if (!member.reviewStatus || member.reviewStatus === 'pending-rejection') return 'pending'
  return member.reviewStatus
}

const openRejectModal = (member) => {
  member.reviewStatus = 'pending-rejection'
  rejectingMember.value = member
  rejectReason.value = ''
  rejectModalOpen.value = true
}

const submitRejection = async () => {
  if (!rejectingMember.value?.postId || !rejectReason.value) return

  try {
    await reviewVerificationPost({
      postId: rejectingMember.value.postId,
      approvalStatus: 'REJECT',
      rejectReason: rejectReason.value,
    })

    rejectModalOpen.value = false
    rejectingMember.value = null
    rejectReason.value = ''

    await loadVerificationFeed()
  } catch (error) {
    console.error('인증 반려 실패:', error)
    alert(error?.response?.data?.message || '반려 처리에 실패했습니다.')
  }
}

const resetRejectModal = () => {
  if (rejectingMember.value?.reviewStatus === 'pending-rejection') {
    rejectingMember.value.reviewStatus = ''
  }
  rejectingMember.value = null
  rejectReason.value = ''
}

const openPostDetail = async (member) => {
  if (!member?.postId) return

  try {
    const response = await getVerificationPostDetail(member.postId)
    const detail = response.data

    selectedPost.value = {
      ...member,
      approvalCount: detail.approveCount || 0,
      rejectCount: detail.rejectCount || 0,
      postStatus: detail.postStatus,
    }

    postLikes.value = (detail.likers || []).map(
      (user) => user.nickname
    )

    postDislikes.value = (detail.dislikers || []).map(
      (user) => user.nickname
    )

    postComments.value = (detail.comments || []).map(
      (comment) => ({
        id: comment.postCommentId,
        author: comment.nickname,
        text: comment.content,
      })
    )

    postDetailOpen.value = true
  } catch (error) {
    console.error('게시글 상세 조회 실패:', error)
  }
}

const toggleFeedReaction = async (member, reaction) => {
  if (!member?.postId) return

  try {
    const previousReaction = member.myReaction

    if (previousReaction === reaction) {
      await deletePostReaction(member.postId)
    } else {
      await setPostReaction({
        postId: member.postId,
        reactionType: reaction.toUpperCase(),
      })
    }

    await loadVerificationFeed()
  } catch (error) {
    console.error('좋아요/싫어요 처리 실패:', error)

    alert(
      error?.response?.data?.message ||
      '반응 처리에 실패했습니다.'
    )
  }
}

const addPostComment = async () => {
  if (!newPostComment.value || !selectedPost.value?.postId) return

  try {
    await createPostComment({
      postId: selectedPost.value.postId,
      content: newPostComment.value,
    })

    newPostComment.value = ''

    // 댓글 등록 후 상세 다시 조회
    await openPostDetail(selectedPost.value)
  } catch (error) {
    console.error('댓글 등록 실패:', error)

    alert(
      error?.response?.data?.message ||
      '댓글 등록에 실패했습니다.'
    )
  }
}

const deleteOwnPost = async () => {
  if (!selectedPost.value?.isMe || !selectedPost.value?.postId) return
  if (!window.confirm('이 인증 게시글을 삭제할까요?')) return

  try {
    await deleteVerificationPost(selectedPost.value.postId)

    postDetailOpen.value = false
    selectedPost.value = null

    // 현재 날짜 피드 다시 조회
    await loadVerificationFeed()
  } catch (error) {
    console.error('인증글 삭제 실패:', error)

    alert(
      error?.response?.data?.message ||
      '인증글 삭제에 실패했습니다.'
    )
  }
}

const removeMember = async (member) => {
  if (!member?.groupUserId) return

  if (!window.confirm(`${member.name}님을 내보낼까요?`)) return

  try {
    await kickGroupUser(
      String(route.params.id || ''),
      member.groupUserId
    )

    const index = editMembers.findIndex(
      (item) => item.groupUserId === member.groupUserId
    )

    if (index >= 0) {
      editMembers.splice(index, 1)
    }

    const memberIndex = members.findIndex(
      (item) => item.groupUserId === member.groupUserId
    )

    if (memberIndex >= 0) {
      members.splice(memberIndex, 1)
    }

    groupInfo.memberCount = members.length
  } catch (error) {
    console.error('참여자 내보내기 실패:', error)

    alert(
      error?.response?.data?.message ||
      '참여자를 내보내지 못했습니다.'
    )
  }
}

const canAccessPost = (member) => {
  if (!member?.postId) return false

  return (
    member.isMe ||
    Boolean(member.myApproval) ||
    member.reviewStatus === 'approved' ||
    member.reviewStatus === 'rejected'
  )
}

const handleFeedCardClick = (member) => {
  if (preventNextFeedClick) {
    preventNextFeedClick = false
    return
  }

  if (!canAccessPost(member)) return

  openPostDetail(member)
}

const moveFeedMember = (targetName) => {
  if (!targetName || targetName === draggingFeedName.value) return
  const fromIndex = members.findIndex((member) => member.name === draggingFeedName.value)
  const targetIndex = members.findIndex((member) => member.name === targetName)
  if (fromIndex < 0 || targetIndex < 0) return

  const [member] = members.splice(fromIndex, 1)
  members.splice(targetIndex, 0, member)
  editMembers.splice(0, editMembers.length, ...members.map((item) => ({ ...item })))
}

const saveFeedOrder = () => {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()
  document.cookie = `youngly_group_feed_order=${encodeURIComponent(JSON.stringify(members.map((member) => member.name)))}; expires=${expires}; path=/; SameSite=Lax`
}

const getFeedOrderCookie = () => {
  const cookiePrefix = 'youngly_group_feed_order='
  const storedCookie = document.cookie.split('; ').find((cookie) => cookie.startsWith(cookiePrefix))
  if (!storedCookie) return []

  try {
    return JSON.parse(decodeURIComponent(storedCookie.slice(cookiePrefix.length)))
  } catch {
    return []
  }
}

const handleFeedDesktopDragStart = (memberName, event) => {
  if (window.matchMedia('(max-width: 767px)').matches) {
    event.preventDefault()
    return
  }
  draggingFeedName.value = memberName
  event.dataTransfer.effectAllowed = 'move'
}

const handleFeedDesktopDrop = (targetName) => {
  moveFeedMember(targetName)
  finishFeedDrag()
}

const finishFeedDrag = () => {
  if (draggingFeedName.value) saveFeedOrder()
  if (draggingFeedName.value) {
    draggingFeedName.value = null
    window.setTimeout(() => {
      preventNextFeedClick = false
    }, 0)
  }
}

const handleFeedPointerDown = (memberName, event) => {
  if (!window.matchMedia('(max-width: 767px)').matches) return
  if (event.pointerType === 'mouse' || !event.isPrimary) return

  event.preventDefault()
  clearTimeout(feedLongPressTimer)
  const startX = event.clientX
  const startY = event.clientY
  const cancelLongPress = (moveEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return
    if (Math.abs(moveEvent.clientX - startX) > 14 || Math.abs(moveEvent.clientY - startY) > 14) {
      clearTimeout(feedLongPressTimer)
      removePendingFeedDragListeners()
    }
  }
  const cancelPendingDrag = (endEvent) => {
    if (endEvent.pointerId !== event.pointerId) return
    clearTimeout(feedLongPressTimer)
    removePendingFeedDragListeners()
  }
  const removePendingFeedDragListeners = () => {
    window.removeEventListener('pointermove', cancelLongPress)
    window.removeEventListener('pointerup', cancelPendingDrag)
    window.removeEventListener('pointercancel', cancelPendingDrag)
  }

  feedLongPressTimer = window.setTimeout(() => {
    removePendingFeedDragListeners()
    draggingFeedName.value = memberName
    mobileFeedDragActive = true
    mobileFeedPointerId = event.pointerId
    preventNextFeedClick = true
    navigator.vibrate?.(25)
    window.addEventListener('pointermove', handleMobileFeedDragMove, { passive: false })
    window.addEventListener('pointerup', finishMobileFeedDrag)
    window.addEventListener('pointercancel', finishMobileFeedDrag)
  }, 450)
  window.addEventListener('pointermove', cancelLongPress, { passive: false })
  window.addEventListener('pointerup', cancelPendingDrag)
  window.addEventListener('pointercancel', cancelPendingDrag)
}

const handleMobileFeedDragMove = (event) => {
  if (!mobileFeedDragActive || event.pointerId !== mobileFeedPointerId) return
  event.preventDefault()
  const edgeSize = 72
  if (event.clientY < edgeSize) window.scrollBy({ top: -12, behavior: 'auto' })
  if (event.clientY > window.innerHeight - edgeSize) window.scrollBy({ top: 12, behavior: 'auto' })
  const targetCard = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest('[data-feed-member]')
  moveFeedMember(targetCard?.dataset.feedMember)
}

const finishMobileFeedDrag = (event) => {
  if (event?.pointerId != null && event.pointerId !== mobileFeedPointerId) return
  clearTimeout(feedLongPressTimer)
  if (mobileFeedDragActive) finishFeedDrag()
  mobileFeedDragActive = false
  mobileFeedPointerId = null
  removeMobileFeedDragListeners()
}

const removeMobileFeedDragListeners = () => {
  window.removeEventListener('pointermove', handleMobileFeedDragMove)
  window.removeEventListener('pointerup', finishMobileFeedDrag)
  window.removeEventListener('pointercancel', finishMobileFeedDrag)
}

const formatGroupDeposit = (value) => Number(value || 0).toLocaleString('ko-KR')

const updateGroupDeposit = (event) => {
  groupEditForm.deposit = Number(event.target.value.replace(/[^0-9]/g, '')) || 0
}

const saveGroupEdit = async () => {
  const groupId = String(route.params.id || '')
  if (!groupId) return

  try {
    await updateGroup(groupId, {
      groupName: groupEditForm.title,
      challengeType: categoryValues[groupEditForm.category],
      content: groupEditForm.goal,
      minCount: groupEditForm.weeklyCount,
      baseDepositAmount: groupEditForm.deposit,
      defaultFailPassCount: groupEditForm.failurePassCount,
      customRule: groupEditForm.additionalRule,

      // 기존 설정 유지
      durationDays: groupInfo.durationDays,
      roundCycleDays: groupInfo.roundCycleDays,
      futureDepositRatioRule: groupInfo.futureDepositRatioRule,
    })

    await loadGroupInfo()

    groupEditComplete.value = true
  } catch (error) {
    console.error('그룹 수정 실패:', error)
    alert(
      error?.response?.data?.message ||
      '그룹 수정에 실패했습니다.'
    )
  }
}

const closeGroupEdit = () => {
  groupEditComplete.value = false
  groupEditSheetExpanded.value = false
  if (route.query.editGroup) {
    const query = { ...route.query }
    delete query.editGroup
    router.replace({ query })
  }
}

const resetGroupEditSheetStyles = (sheet, overlay) => {
  if (sheet) {
    sheet.style.removeProperty('transform')
    sheet.style.removeProperty('transition')
    sheet.style.removeProperty('will-change')
    sheet.style.removeProperty('height')
  }
  if (overlay) {
    overlay.style.removeProperty('background-color')
    overlay.style.removeProperty('transition')
  }
}

const unbindGroupEditSheetGestures = () => {
  if (!groupEditSheetElement) return
  groupEditSheetElement.removeEventListener('touchstart', startGroupEditSwipe)
  groupEditSheetElement.removeEventListener('touchmove', moveGroupEditSwipe)
  groupEditSheetElement.removeEventListener('touchend', endGroupEditSwipe)
  groupEditSheetElement.removeEventListener('touchcancel', cancelGroupEditSwipe)
  groupEditSheetElement = null
}

const bindGroupEditSheetGestures = async () => {
  await nextTick()
  unbindGroupEditSheetGestures()
  if (!groupEditOpen.value || !window.matchMedia('(max-width: 767px)').matches) return

  groupEditSheetElement = document.querySelector('.group-edit-modal')
  if (!groupEditSheetElement) return
  groupEditSheetElement.addEventListener('touchstart', startGroupEditSwipe, { passive: true })
  groupEditSheetElement.addEventListener('touchmove', moveGroupEditSwipe, { passive: false })
  groupEditSheetElement.addEventListener('touchend', endGroupEditSwipe, { passive: true })
  groupEditSheetElement.addEventListener('touchcancel', cancelGroupEditSwipe, { passive: true })
}

const startGroupEditSwipe = (event) => {
  if (!window.matchMedia('(max-width: 767px)').matches || event.touches.length !== 1) return
  const sheet = groupEditSheetElement
  if (!sheet || (groupEditSheetExpanded.value && sheet.scrollTop > 0)) return
  const touch = event.touches[0]
  const now = performance.now()
  groupEditSwipeState = {
    startY: touch.clientY,
    startTime: now,
    lastY: touch.clientY,
    lastTime: now,
    velocity: 0,
    distance: 0,
    direction: null,
    initialHeight: sheet.offsetHeight,
    sheet,
    overlay: sheet?.closest('.base-modal__overlay'),
  }
  sheet.style.transition = 'none'
  sheet.style.willChange = 'transform'
}

const moveGroupEditSwipe = (event) => {
  const state = groupEditSwipeState
  if (!state || event.touches.length !== 1) return
  const touch = event.touches[0]
  const delta = touch.clientY - state.startY

  if (!state.direction && Math.abs(delta) > 8) {
    state.direction =
      delta < 0 && !groupEditSheetExpanded.value ? 'expand' : delta > 0 ? 'dismiss' : 'scroll'
  }
  if (!state.direction || state.direction === 'scroll') return

  event.preventDefault()
  const now = performance.now()
  const elapsed = Math.max(1, now - state.lastTime)
  state.velocity = (touch.clientY - state.lastY) / elapsed
  state.lastY = touch.clientY
  state.lastTime = now
  state.distance = Math.abs(delta)

  if (state.direction === 'expand') {
    const maximumHeight = window.innerHeight * 0.88
    state.sheet.style.height = `${Math.min(state.initialHeight + state.distance, maximumHeight)}px`
    return
  }

  state.sheet.style.transform = `translate3d(0, ${state.distance}px, 0)`
  const progress = Math.min(state.distance / Math.max(state.sheet.offsetHeight * 0.72, 1), 1)
  state.overlay?.style.setProperty('background-color', `rgba(24, 20, 36, ${0.5 * (1 - progress)})`)
}

const endGroupEditSwipe = () => {
  const state = groupEditSwipeState
  if (!state) return
  groupEditSwipeState = null

  if (state.direction === 'expand') {
    groupEditSheetExpanded.value = state.distance >= 54 || state.velocity < -0.55
    state.sheet.style.transition = 'height 300ms cubic-bezier(0.22, 1, 0.36, 1)'
    state.sheet.style.height = groupEditSheetExpanded.value ? '88dvh' : '56dvh'
    window.setTimeout(() => resetGroupEditSheetStyles(state.sheet, state.overlay), 310)
    return
  }

  if (state.direction !== 'dismiss') {
    resetGroupEditSheetStyles(state.sheet, state.overlay)
    return
  }

  const elapsed = Math.max(1, performance.now() - state.startTime)
  const averageVelocity = state.distance / elapsed
  const closeDistance = Math.min(140, state.sheet.offsetHeight * 0.24)
  const isIntentionalFlick = state.distance >= 45 && averageVelocity > 0.55 && state.velocity > 0.4
  const shouldClose = state.distance >= closeDistance || isIntentionalFlick

  state.sheet.style.transition = 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
  state.overlay?.style.setProperty('transition', 'background-color 380ms ease')

  if (shouldClose) {
    state.sheet.style.transform = `translate3d(0, ${state.sheet.offsetHeight + 32}px, 0)`
    state.overlay?.style.setProperty('background-color', 'rgba(24, 20, 36, 0)')
    clearTimeout(groupEditCloseTimer)
    groupEditCloseTimer = window.setTimeout(() => {
      groupEditOpen.value = false
      closeGroupEdit()
      groupEditCloseTimer = null
    }, 370)
    return
  }

  state.sheet.style.transform = 'translate3d(0, 0, 0)'
  state.overlay?.style.setProperty('background-color', 'rgba(24, 20, 36, 0.5)')
  window.setTimeout(() => resetGroupEditSheetStyles(state.sheet, state.overlay), 390)
}

// 날짜 이동 함수
const changeFeedDate = async (days) => {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  date.setDate(date.getDate() + days)

  const nextDate = date.toLocaleDateString('sv-SE')
  const today = new Date().toLocaleDateString('sv-SE')

  if (
    currentRound.value?.startDate &&
    nextDate < currentRound.value.startDate
  ) {
    return
  }

  if (nextDate > today) {
    return
  }

  selectedDate.value = nextDate

  await loadVerificationFeed()
}

const isTodaySelected = computed(
  () =>
    selectedDate.value ===
    new Date().toLocaleDateString('sv-SE')
)

const canMovePrevious = computed(() => {
  if (!currentRound.value?.startDate) return false

  return selectedDate.value > currentRound.value.startDate
})

const canMoveNext = computed(() => {
  const today = new Date().toLocaleDateString('sv-SE')

  return selectedDate.value < today
})

const cancelGroupEditSwipe = () => {
  const state = groupEditSwipeState
  if (!state) return
  groupEditSwipeState = null
  state.sheet.style.transition = 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)'
  state.sheet.style.transform = 'translate3d(0, 0, 0)'
  state.overlay?.style.setProperty('background-color', 'rgba(24, 20, 36, 0.5)')
  window.setTimeout(() => resetGroupEditSheetStyles(state.sheet, state.overlay), 350)
}

watch(
  () => route.query.editGroup,
  (isOpen) => {
    groupEditOpen.value = isOwner.value && isOpen === 'true'
  },
)

watch(
  () => route.params.id,
  async (groupId, previousGroupId) => {
    if (groupId && groupId !== previousGroupId) {
      await loadGroupInfo()
      await loadCurrentRoundOverview()
      await loadGroupMembers()
      await loadVerificationFeed()

      if (isOwner.value) {
    await loadJoinRequests()
  }
    }
  },
)

watch(groupEditOpen, (isOpen) => {
  if (isOpen) bindGroupEditSheetGestures()
  else unbindGroupEditSheetGestures()
})

onMounted(async () => {
  if (groupEditOpen.value) bindGroupEditSheetGestures()
  try {
    const savedGroupInfo = JSON.parse(localStorage.getItem('youngly_group_info') || 'null')
    if (savedGroupInfo?.title) groupInfo.title = savedGroupInfo.title
    if (savedGroupInfo?.goal) groupInfo.goal = savedGroupInfo.goal
    if (savedGroupInfo?.title) groupEditForm.title = savedGroupInfo.title
    if (savedGroupInfo?.goal) groupEditForm.goal = savedGroupInfo.goal
    if (savedGroupInfo?.weeklyCount) groupEditForm.weeklyCount = savedGroupInfo.weeklyCount
    if (savedGroupInfo?.deposit !== undefined) groupEditForm.deposit = savedGroupInfo.deposit
    if (savedGroupInfo?.failurePassCount !== undefined)
      groupEditForm.failurePassCount = savedGroupInfo.failurePassCount
    if (savedGroupInfo?.additionalRule !== undefined)
      groupEditForm.additionalRule = savedGroupInfo.additionalRule

    const savedFeedOrder = getFeedOrderCookie()
    if (Array.isArray(savedFeedOrder) && savedFeedOrder.length) {
      const orderIndex = new Map(savedFeedOrder.map((name, index) => [name, index]))
      members.sort(
        (first, second) =>
          (orderIndex.get(first.name) ?? Infinity) - (orderIndex.get(second.name) ?? Infinity),
      )
      editMembers.splice(0, editMembers.length, ...members.map((member) => ({ ...member })))
    }

    const savedVerification = JSON.parse(
      localStorage.getItem('youngly_group_verification') || 'null',
    )
    const myPost = members.find((member) => member.isMe)
    if (savedVerification?.groupId === '1' && myPost) {
      myPost.isVerified = true
      myPost.image = savedVerification.image
      myPost.message = savedVerification.comment
    }
  } catch {
    // 저장된 인증 mock 데이터가 없거나 잘못된 경우 기존 화면을 유지합니다.
  }

  await loadGroupInfo()
  await loadGroupMembers()
  await loadCurrentRoundOverview()
  await loadVerificationFeed()

  if (isOwner.value) {
    await loadJoinRequests()
  }

  countdownTimer = setInterval(() => {
  now.value = new Date()
  }, 1000)

})

onBeforeUnmount(() => {
  clearTimeout(feedLongPressTimer)
  clearTimeout(groupEditCloseTimer)
  removeMobileFeedDragListeners()
  unbindGroupEditSheetGestures()

  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.group-detail-page {
  min-height: 100%;
  background: #e6dcf6;
  color: #111;
  font-family: inherit;
}

.group-detail-content {
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 24px 20px 112px;
  box-sizing: border-box;
}

.group-load-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 12px;
  padding: 10px 12px;
  border: 1px solid #d99a9a;
  border-radius: 10px;
  background: #fff1f1;
  color: #a33f3f;
  font-size: 13px;
  font-weight: 700;
}
.group-load-error button {
  flex: none;
  padding: 5px 9px;
  border: 1px solid currentColor;
  border-radius: 7px;
  background: #fff;
  color: inherit;
  cursor: pointer;
}

button {
  font: inherit;
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

.summary-copy {
  min-width: 0;
}
.summary-copy p {
  margin: 0;
}
.summary-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.summary-heading {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
  color: #7156ad;
  font-size: 11px;
  font-weight: 800;
}
.goal-block {
  margin-top: 14px;
}
.goal-heading {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
  color: #7156ad;
  font-size: 11px;
  font-weight: 800;
}
.status-message {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.status-message strong {
  color: #222;
  font-size: 20px;
  line-height: 1.15;
}
.status-message span {
  color: #8b8493;
  font-size: 11px;
  font-weight: 700;
}
.status-message.is-waiting strong {
  font-size: 17px;
}
.goal-message {
  margin: 0;
  color: #222;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  white-space: nowrap;
}
.mobile-break {
  display: none;
}

.pixel-button,
.pixel-frame {
  border: 0;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.account-button {
  display: inline-flex;
  flex: 0 0 auto;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 11px;
  border: 1.5px solid #7156ad;
  border-radius: 10px;
  background: #fff;
  color: #60418f;
  box-shadow: none;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.account-button:active {
  transform: scale(0.97);
}

.ranking-panel {
  padding: 18px 20px 16px;
  background: #fff;
}
.ranking-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
}
.round-overview-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.round-overview-heading > div {
  display: grid;
  gap: 4px;
}
.round-overview-heading span {
  color: #7156ad;
  font-size: 13px;
  font-weight: 800;
}
.round-overview-heading strong {
  font-size: 19px;
  line-height: 1.3;
}
.round-overview-progress {
  display: grid;
  gap: 9px;
  margin-top: 18px;
}
.round-overview-progress > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #77717f;
  font-size: 12px;
  font-weight: 700;
}
.round-overview-progress > div:first-child strong {
  color: #60418f;
  font-size: 13px;
}
.round-overview-progress__bar {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #eeeaf5;
}
.round-overview-progress__bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #9d83d2, #7156ad);
}
.round-overview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
}
.round-overview-stats > div {
  display: grid;
  justify-items: center;
  gap: 5px;
  padding: 11px 6px;
  border: 1px solid #ded5ec;
  border-radius: 10px;
  background: #faf8fd;
}
.round-overview-stats span {
  color: #77717f;
  font-size: 11px;
  font-weight: 700;
}
.round-overview-stats strong {
  color: #2f2838;
  font-size: 17px;
}
.expand-button {
  flex: 0 0 auto;
  min-width: 0;
  font-size: 12px;
  white-space: nowrap;
  word-break: keep-all;
}
.ranking-track-wrap {
  position: relative;
  margin: 30px 5px 6px;
}
.ranking-track {
  display: flex;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #f1f3f5;
}
.track-segment {
  flex: 1;
  border-right: 1px solid #dfe3e8;
}
.track-segment:last-child {
  border-right: 0;
}
.rank-marker {
  position: absolute;
  bottom: 15px;
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  transform: translateX(-50%);
  border: 2px solid #71717a;
  border-radius: 50%;
  background: #fff;
  color: #555;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}
.rank-marker.is-me {
  border-color: #7156ad;
  background: #7156ad;
  color: #fff;
  box-shadow: 0 0 0 3px rgba(113, 86, 173, 0.16);
}
.goal-flag {
  position: absolute;
  right: -5px;
  bottom: 13px;
  color: #ef4444;
  font-size: 19px;
  line-height: 1;
}
.ranking-percent {
  color: #888;
  font-size: 11px;
}

.day-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin: 26px 0 16px;
  color: #111;
}
.day-selector button {
  border: 0;
  background: transparent;
  padding: 0;
  color: #999;
  font-size: 25px;
  line-height: 1;
  cursor: pointer;
}
.day-selector strong {
  font-size: 16px;
}

.feed-list {
  display: grid;
  gap: 14px;
}
.feed-card {
  min-height: 196px;
  box-sizing: border-box;
  background: #fff;
  color: #111;
}
.my-feed-card {
  position: relative;
  min-height: 340px;
  padding: 16px 20px;
}
.my-feed-card.is-reordering {
  opacity: 0.72;
  outline: 4px dashed #a78bdf;
  outline-offset: 3px;
  cursor: grabbing;
}
.feed-drag-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 8;
  width: 64px;
  height: 64px;
  cursor: grab;
  touch-action: none;
  -webkit-touch-callout: none;
}
.feed-drag-handle:active {
  cursor: grabbing;
}
.feed-owner {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #444;
  font-size: 12px;
  font-weight: 700;
}
.avatar {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #d1c4e9;
  color: #444;
  font-size: 11px;
}
.me-label {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(113, 86, 173, 0.1);
  color: #7156ad;
  font-size: 10px;
}
.sleep-message {
  position: absolute;
  top: 55%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  color: #888;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
}
.feed-card.is-started {
  display: flex;
  flex-direction: column;
  min-height: 340px;
  overflow: hidden;
  border: 3px solid #222;
  border-radius: 18px;
  background: #000;
  color: #fff;
  box-shadow: none;
}
.feed-card.is-started .feed-owner {
  position: relative;
  z-index: 2;
  color: #fff;
}
.feed-card.is-started .avatar {
  border-color: #27272a;
  background: #65529d;
  color: #fff;
}
.feed-card.has-verification {
  padding: 16px 20px;
}
.verification-content {
  position: absolute;
  inset: 0;
}
.verification-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #27272a;
}
.verification-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.52) 0%,
    rgba(0, 0, 0, 0.06) 42%,
    rgba(0, 0, 0, 0.72) 100%
  );
}
.verification-message {
  position: absolute;
  right: 20px;
  bottom: 65px;
  left: 20px;
  z-index: 2;
  margin: 0;
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.4;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.72);
}
.review-actions {
  position: absolute;
  bottom: 16px;
  left: 50%;
  z-index: 3;
  display: flex;
  width: min(220px, calc(100% - 104px));
  gap: 12px;
  transform: translateX(-50%);
}
.review-actions button {
  display: inline-flex;
  flex: 1;
  min-width: 0;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.review-actions button:active {
  transform: scale(0.97);
}
.approve-button {
  border: 1.5px solid #7156ad;
  background: #7156ad;
  color: #fff;
}
.reject-button {
  border: 1.5px solid rgba(213, 91, 91, 0.75);
  background: rgba(255, 255, 255, 0.94);
  color: #bd4646;
}
.review-status {
  position: absolute;
  top: 54px;
  left: 20px;
  z-index: 2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}
.review-status.approved {
  background: rgba(105, 82, 159, 0.32);
  color: #e5e2fa;
}
.review-status.rejected {
  background: rgba(239, 68, 68, 0.24);
  color: #fecaca;
}
.post-engagement {
  position: absolute;
  right: 5px;
  bottom: 52px;
  z-index: 4;
  display: grid;
  gap: 8px;
  color: #ffffffa8;
  text-align: center;
  text-shadow: none;
}
.engagement-item {
  display: grid;
  min-width: 38px;
  justify-items: center;
  gap: 3px;
  padding: 2px;
  border: 0;
  background: transparent;
  color: #ffffffa8;
  cursor: pointer;
  text-shadow: none;
}
.engagement-icon {
  display: grid;
  place-items: center;
  color: #ffffffa8;
  filter: none;
  text-shadow: none;
}
.engagement-item b {
  color: #ffffffa8;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  filter: none;
  text-shadow: none;
}
.engagement-item.is-active,
.engagement-item.is-active .engagement-icon,
.engagement-item.is-active b {
  color: #b994f4;
}
.engagement-item:active {
  transform: scale(0.9);
}
.engagement-item:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: 5px;
}
.latest-comment-row {
  position: absolute;
  right: 45px;
  bottom: 10px;
  left: 12px;
  z-index: 3;
  display: flex;
  min-width: 0;
  align-items: flex-end;
  gap: 12px;
}
.latest-comment-row::before {
  position: absolute;
  bottom: 6px;
  left: 32px;
  width: 8px;
  height: 12px;
  background: rgba(191, 168, 224, 0.95);
  clip-path: polygon(100% 0, 100% 100%, 0 50%);
  content: '';
}
.latest-comment-row::after {
  position: absolute;
  bottom: 7.5px;
  left: 34px;
  width: 7px;
  height: 9px;
  background: rgba(248, 244, 253, 0.98);
  clip-path: polygon(100% 0, 100% 100%, 0 50%);
  content: '';
}
.latest-comment-avatar {
  display: grid;
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  box-sizing: border-box;
  place-items: center;
  border: 1.5px solid rgba(255, 255, 255, 0.88);
  border-radius: 50%;
  background: #7156ad;
  box-shadow: 0 2px 7px rgba(24, 16, 35, 0.22);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}
.latest-comment {
  position: relative;
  overflow: hidden;
  flex: 0 1 auto;
  width: fit-content;
  max-width: calc(100% - 39px);
  min-width: 0;
  box-sizing: border-box;
  min-height: 27px;
  margin: 0;
  padding: 5px 9px;
  border: 1.5px solid rgba(191, 168, 224, 0.95);
  border-radius: 9px;
  background: rgba(248, 244, 253, 0.94);
  box-shadow: 0 2px 7px rgba(24, 16, 35, 0.16);
  color: #403947;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}
.pending-verification {
  display: grid;
  place-content: center;
  gap: 7px;
  flex: 1;
  width: 100%;
  border: 0;
  background: transparent;
  color: #fff;
  text-align: center;
  cursor: pointer;
}
.pending-verification strong {
  font-size: 21px;
  font-weight: 800;
}
.pending-verification span {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}
.pending-verification .deadline-text {
  color: #ef4444;
}
.invite-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
}
.invite-card span:last-child {
  color: #888;
  font-size: 15px;
  font-weight: 600;
}
.plus {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: rgba(113, 86, 173, 0.1);
  color: #7156ad;
  font-size: 27px;
  font-weight: 300;
  line-height: 1;
}

.invite-card:hover {
  background: #f9f7fc;
}
.invite-card:focus-visible,
.pixel-button:focus-visible,
.account-button:focus-visible,
.day-selector button:focus-visible,
.expand-button:focus-visible {
  outline: 3px solid #7156ad;
  outline-offset: 3px;
}

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

.invite-modal-content {
  display: grid;
  gap: 13px;
}
.invite-code-label {
  color: #222;
  font-size: 14px;
  font-weight: 700;
}

.invite-code-button {
  min-height: 76px;
  border: 3px solid #222;
  border-radius: 17px;
  background: #f0ede8;
  color: #222;
  font-family: 'YounglyNeoPixel', monospace;
  font-size: 23px;
  letter-spacing: 2px;
  cursor: pointer;
}

.invite-code-button:hover {
  background: #e9e4dd;
}
.invite-code-button:focus-visible {
  outline: 3px solid #7156ad;
  outline-offset: 3px;
}
.invite-share-button {
  min-height: 42px;
  border: 2px solid var(--yl-ink);
  background: var(--yl-purple);
  color: #fff;
  box-shadow: 3px 3px 0 var(--yl-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

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

/* 모든 친구 입장 후 그룹장에게 보이는 시작일 설정 모달 */
:global(.group-start-date-modal) {
  max-width: 500px;
  border: 4px solid #222;
  border-radius: 0;
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}

:global(.group-start-date-modal .base-modal__header) {
  padding: 26px 32px 14px;
}
:global(.group-start-date-modal .base-modal__title) {
  color: #222;
  font-size: 23px;
  font-weight: 800;
}
:global(.group-start-date-modal .base-modal__body) {
  padding: 14px 32px 30px;
}

.start-date-modal-content {
  display: grid;
  gap: 15px;
}
.start-date-label {
  color: #222;
  font-size: 14px;
  font-weight: 700;
}

.start-date-input {
  width: 100%;
  min-height: 70px;
  box-sizing: border-box;
  border: 3px solid #222;
  border-radius: 17px;
  background: #f0ede8;
  color: #222;
  padding: 0 18px;
  font-family: 'YounglyNeoPixel', monospace;
  font-size: 20px;
  text-align: center;
}

.start-date-input:focus {
  outline: 3px solid rgba(105, 82, 159, 0.28);
  border-color: #69529f;
}

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
:global(.group-ranking-modal .base-modal__header) {
  padding: 22px 28px 8px;
}
:global(.group-ranking-modal .base-modal__title) {
  color: #222;
  font-size: 22px;
  font-weight: 800;
}
:global(.group-ranking-modal .base-modal__body) {
  padding: 6px 28px 28px;
}
.ranking-modal-content {
  display: grid;
  gap: 18px;
}
.ranking-period {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
}
.ranking-period button {
  border: 0;
  background: transparent;
  color: #222;
  font-size: 27px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}
.ranking-period button:disabled {
  cursor: default;
  opacity: 0.25;
}
.ranking-period strong {
  font-size: 17px;
}
.ranking-period-copy {
  min-width: 190px;
  display: grid;
  justify-items: center;
  gap: 4px;
}
.ranking-period-copy small {
  color: #746d7d;
  font-size: 12px;
  font-weight: 700;
}
.ranking-sheet-header {
  display: grid;
  gap: 8px;
  width: 100%;
  text-align: center;
}
.ranking-sheet-handle {
  display: none;
  width: 42px;
  height: 5px;
  margin: 0 auto;
  border-radius: 999px;
  background: #b4adbd;
}
.ranking-api-state {
  min-height: 140px;
  display: grid;
  place-items: center;
  gap: 10px;
  color: #77707f;
  text-align: center;
}
.ranking-api-state.error {
  color: #a44e4e;
}
.ranking-api-state button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #cfc5dc;
  border-radius: 9px;
  color: #5f438b;
  background: #fff;
  font: inherit;
  font-weight: 800;
}
.ranking-round-summary {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border: 2px solid #222;
  background: #f0ede8;
}
.ranking-round-summary span {
  font-size: 12px;
  font-weight: 700;
}
.ranking-round-summary strong {
  font-size: 14px;
  text-align: right;
}
.ranking-modal-track {
  grid-column: 1 / -1;
  height: 9px;
  overflow: hidden;
  border: 2px solid #222;
  background: #fff;
}
.ranking-modal-track i {
  display: block;
  height: 100%;
  background: #7156ad;
}
.ranking-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid #d6d2dc;
}
.ranking-list li {
  display: grid;
  grid-template-columns: 44px 42px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 62px;
  border-bottom: 1px solid #d6d2dc;
}
.ranking-list li.is-me {
  background: #f4f0fb;
}
.ranking-position {
  font-size: 14px;
  text-align: center;
}
.ranking-avatar {
  position: relative;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 2px solid #555;
  border-radius: 50%;
  background: #fff;
  color: #222;
  font-size: 12px;
  font-weight: 800;
}
.ranking-avatar.is-me {
  border-color: #7156ad;
  background: #7156ad;
  color: #fff;
}
.ranking-crown {
  position: absolute;
  top: -19px;
  color: #e9ae22;
  font-size: 22px;
  line-height: 1;
  text-shadow: 1px 1px 0 #222;
}
.ranking-member-info {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.ranking-member-info b {
  font-size: 14px;
}
.ranking-member-info b em {
  margin-left: 5px;
  color: #7156ad;
  font-size: 11px;
  font-style: normal;
}
.ranking-member-info span {
  color: #555;
  font-size: 12px;
  font-weight: 600;
}
.ranking-member-info .ranking-settlement {
  color: #675083;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.45;
}
.current-round-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.current-round-stats > div {
  display: grid;
  justify-items: center;
  gap: 5px;
  padding: 12px 8px;
  border-radius: 10px;
  background: #f4f0fa;
}
.current-round-stats small {
  color: #756d7d;
  font-size: 11px;
}
.current-round-stats strong {
  color: #4f3977;
  font-size: 18px;
}
.current-round-stats p {
  grid-column: 1 / -1;
  margin: 0;
  color: #8a8292;
  font-size: 10px;
  text-align: center;
}

/* 그룹 정보 수정 모달 */
:global(.group-edit-modal) {
  max-width: 760px;
  max-height: 760px;
  border: 4px solid #222;
  border-radius: 0;
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}
:global(.group-edit-modal .base-modal__header) {
  padding: 22px 28px 10px;
}
:global(.group-edit-modal .base-modal__title) {
  color: #222;
  font-size: 23px;
  font-weight: 800;
}
:global(.group-edit-modal .base-modal__body) {
  padding: 8px 28px 28px;
}
.group-edit-form {
  display: grid;
  gap: 19px;
}
.group-edit-field,
.group-edit-category {
  display: grid;
  gap: 9px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.group-edit-field > span,
.group-edit-category legend,
.group-member-editor h3 {
  padding: 0;
  margin: 0;
  color: #222;
  font-size: 15px;
  font-weight: 800;
}
.group-edit-field input,
.group-edit-field select,
.group-edit-field textarea {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  border: 2px solid #222;
  border-radius: 12px;
  background: #f0ede8;
  padding: 0 14px;
  color: #222;
  font: inherit;
  font-size: 15px;
}
.group-edit-field textarea {
  height: 84px;
  padding-top: 12px;
  padding-bottom: 12px;
  line-height: 1.45;
  resize: vertical;
}
.group-edit-field em {
  color: #85808b;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
}
.group-edit-category > div {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 9px;
}
.group-edit-category button {
  min-height: 40px;
  border: 2px solid #222;
  border-radius: 9px;
  background: #f0ede8;
  color: #71717a;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.group-edit-category button.active {
  background: #7156ad;
  color: #fff;
}
.group-member-editor {
  display: grid;
  gap: 9px;
}
.group-member-editor ul {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.group-member-editor li {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 86px;
  gap: 10px;
  align-items: center;
}
.member-editor-avatar {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 2px solid #222;
  border-radius: 50%;
  background: #f0ede8;
  font-size: 11px;
  font-weight: 800;
}
.group-member-editor strong {
  font-size: 14px;
}
.group-member-editor li button {
  min-height: 32px;
  border: 2px solid #222;
  border-radius: 8px;
  background: #f0ede8;
  color: #71717a;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.group-edit-submit {
  min-height: 54px;
  margin-top: 6px;
  border: 3px solid #222;
  border-radius: 14px;
  background: #7156ad;
  color: #fff;
  font: inherit;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
}
.group-edit-complete {
  margin: 0;
  padding: 11px 14px;
  border: 2px solid #69529f;
  border-radius: 10px;
  background: #e5e2fa;
  color: #533b85;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

/* 승인 완료 게시글 상세 모달 */
:global(.group-post-detail-modal) {
  max-width: 560px;
  overflow: hidden;
  border-radius: 22px;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}
:global(.group-post-detail-modal .base-modal__header) {
  padding: 18px 22px 12px;
}
:global(.group-post-detail-modal .base-modal__title) {
  color: #222;
  font-size: 19px;
  font-weight: 800;
}
:global(.group-post-detail-modal .base-modal__body) {
  padding: 0;
}
.post-detail-modal-header {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 9px;
  text-align: center;
}
.post-detail-modal-header .post-delete-button {
  position: absolute;
  right: 0;
}
.post-delete-button {
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #e4dce9;
  border-radius: 9px;
  place-items: center;
  background: #fff;
  font-size: 15px;
  cursor: pointer;
}
.post-delete-button:hover {
  background: #fff2f2;
}
.post-detail-image-wrap {
  position: relative;
  height: min(75vw, 390px);
  min-height: 290px;
  background: #222;
}
.post-detail-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.post-detail-image-wrap > div {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 45%, rgba(0, 0, 0, 0.73));
}
.post-detail-image-wrap p {
  position: absolute;
  top: 16px;
  left: 18px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #fff;
}
.post-detail-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: #7156ad;
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}
.post-detail-image-wrap p b {
  font-size: 15px;
}
.post-detail-image-wrap > strong {
  position: absolute;
  right: 20px;
  bottom: 18px;
  left: 20px;
  z-index: 1;
  color: #fff;
  font-size: 21px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.75);
}
.post-reaction-info {
  display: grid;
  gap: 10px;
  padding: 16px 20px 14px;
}
.post-reaction-info p {
  display: grid;
  gap: 3px;
  margin: 0;
  color: #666;
  font-size: 13px;
}
.post-reaction-info p b {
  color: #222;
  font-size: 14px;
}
.post-approval-status {
  margin-bottom: 2px;
  padding: 0 0 12px;
  border-bottom: 1px solid #e4dced;
  color: #7156ad;
  font-size: 13px;
  font-weight: 800;
}
.post-comments {
  padding: 0 20px 20px;
}
.post-comments h3 {
  margin: 0 0 12px;
  color: #222;
  font-size: 17px;
}
.post-comments h3 small {
  color: #7156ad;
  font-size: 13px;
}
.post-comments ul {
  display: grid;
  gap: 9px;
  max-height: 160px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
.post-comments li {
  color: #555;
  font-size: 13px;
  line-height: 1.4;
}
.post-comments li b {
  margin-right: 7px;
  color: #222;
}
.post-comments form {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding-top: 14px;
  border-top: 1px solid #ece8f2;
}
.post-comments input {
  flex: 1;
  min-width: 0;
  height: 44px;
  box-sizing: border-box;
  border: 1.5px solid #d9cdea;
  border-radius: 12px;
  background: #f8f5fc;
  padding: 0 13px;
  color: #2f2935;
  outline: none;
  font: inherit;
  font-size: 13px;
  box-shadow: none;
}
.post-comments input:focus {
  border-color: #8e6bc5;
  box-shadow: 0 0 0 3px rgba(113, 86, 173, 0.12);
}
.post-comments button {
  min-width: 58px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: #7156ad;
  box-shadow: none;
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.post-comments button:active {
  transform: scale(0.97);
}
.post-comments button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

/* 반려 사유 모달 */
:global(.group-reject-modal) {
  max-width: 410px;
  border: 3px solid #222;
  border-radius: 18px;
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
}
:global(.group-reject-modal .base-modal__title) {
  font-weight: 800;
}
:global(.group-reject-modal .base-modal__body) {
  padding-top: 4px;
}
.reject-form {
  display: grid;
  gap: 13px;
}
.reject-form p {
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.5;
}
.reject-form textarea {
  min-height: 105px;
  resize: vertical;
  border: 2px solid #222;
  border-radius: 12px;
  padding: 12px;
  color: #222;
  font: inherit;
  font-size: 14px;
}
.reject-form button {
  min-height: 43px;
  border: 0;
  border-radius: 11px;
  background: #7156ad;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 767px) {
  .group-detail-content {
    padding-inline: 20px;
  }
  .mobile-break {
    display: block;
  }

  :global(.youngly-modal) {
    width: 100vw;
    max-width: 100vw !important;
    max-height: min(88dvh, 760px);
    margin: 0;
    border-width: 3px 0 0;
    box-shadow: none !important;
  }

  :global(.group-invite-modal),
  :global(.group-start-date-modal),
  :global(.group-ranking-modal),
  :global(.group-post-detail-modal),
  :global(.group-reject-modal) {
    width: 100vw;
    max-width: 100vw !important;
    max-height: min(88dvh, 760px);
    margin: 0;
  }

  :global(.group-invite-modal .base-modal__header) {
    padding: 22px 20px 10px;
  }
  :global(.group-invite-modal .base-modal__body) {
    padding: 12px 20px 24px;
  }
  :global(.group-invite-modal .base-modal__title) {
    font-size: 20px;
  }
  .invite-code-button {
    min-height: 68px;
    font-size: 21px;
  }

  :global(.group-start-date-modal .base-modal__header) {
    padding: 22px 20px 10px;
  }
  :global(.group-start-date-modal .base-modal__body) {
    padding: 12px 20px 24px;
  }
  :global(.group-start-date-modal .base-modal__title) {
    font-size: 20px;
  }
  .start-date-input {
    min-height: 64px;
    font-size: 18px;
  }

  :global(.base-modal__overlay:has(.group-ranking-modal)) {
    z-index: 20000 !important;
    align-items: end;
    padding: 0;
  }
  :global(.group-ranking-modal .base-modal__header) {
    position: sticky;
    top: 0;
    z-index: 5;
    display: block;
    padding: 34px 20px 10px;
    background: var(--yl-yellow);
  }
  :global(.group-ranking-modal .base-modal__body) {
    padding: 8px 18px calc(24px + env(safe-area-inset-bottom));
  }
  :global(.group-ranking-modal),
  :global(.group-ranking-modal .base-modal__surface),
  :global(.group-ranking-modal .base-modal__body) {
    touch-action: none;
  }
  :global(.group-ranking-modal .base-modal__title) {
    display: block;
    width: 100%;
    font-size: 20px;
  }
  .ranking-modal-content {
    touch-action: none;
  }
  .ranking-period {
    gap: 12px;
  }
  .ranking-period-copy {
    min-width: 170px;
  }
  .ranking-list li {
    grid-template-columns: 39px 38px minmax(0, 1fr);
    gap: 8px;
    min-height: 68px;
  }

  :global(.base-modal__overlay:has(.group-edit-modal)) {
    z-index: 2000 !important;
    align-items: end;
    padding: 0;
  }
  :global(.group-edit-modal) {
    position: relative;
    width: 100%;
    height: 56dvh;
    max-height: 88dvh;
    overflow: hidden;
    overscroll-behavior: contain;
    border-width: 3px 0 0;
    border-radius: 26px 26px 0 0;
    transition: height 300ms cubic-bezier(0.22, 1, 0.36, 1);
    -webkit-overflow-scrolling: touch;
  }
  :global(.group-edit-modal.is-expanded) {
    height: 88dvh;
    overflow-y: auto;
  }
  :global(.group-edit-modal .base-modal__header) {
    position: sticky;
    top: 0;
    z-index: 5;
    display: block;
    padding: 14px 20px 8px;
    background: #fff;
  }
  :global(.group-edit-modal .base-modal__body) {
    padding: 8px 20px calc(22px + env(safe-area-inset-bottom));
  }
  :global(.group-edit-modal .base-modal__title) {
    display: block;
    width: 100%;
    font-size: 20px;
  }
  .group-edit-category > div {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .group-edit-sheet-header {
    display: grid;
    gap: 8px;
    width: 100%;
    color: #222;
    font-size: 20px;
    font-weight: 800;
    text-align: center;
    touch-action: none;
    user-select: none;
    cursor: grab;
  }
  .group-edit-form {
    touch-action: pan-y;
  }
  .group-edit-sheet-header:active {
    cursor: grabbing;
  }
  .group-edit-sheet-handle {
    display: block;
    width: 42px;
    height: 5px;
    margin: 0 auto;
    border-radius: 999px;
    background: #b4adbd;
  }

  :global(.group-post-detail-modal) {
    overflow-y: auto;
  }
  .post-detail-image-wrap {
    height: 67vw;
    min-height: 250px;
  }
}

@media (min-width: 768px) {
  .group-detail-page {
    margin: -20px;
    min-height: calc(100% + 40px);
  }
  .group-detail-content {
    padding-top: 28px;
  }
}

/* Youngly pixel design */
.group-detail-page,
.group-detail-page * {
  font-family: inherit;
}

.challenge-summary,
.pixel-frame {
  border: var(--yl-pixel-border);
  border-radius: 0;
  box-shadow: var(--yl-pixel-shadow);
  clip-path: polygon(
    8px 0,
    calc(100% - 8px) 0,
    calc(100% - 8px) 3px,
    calc(100% - 3px) 3px,
    calc(100% - 3px) 8px,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 3px) calc(100% - 8px),
    calc(100% - 3px) calc(100% - 3px),
    calc(100% - 8px) calc(100% - 3px),
    calc(100% - 8px) 100%,
    8px 100%,
    8px calc(100% - 3px),
    3px calc(100% - 3px),
    3px calc(100% - 8px),
    0 calc(100% - 8px),
    0 8px,
    3px 8px,
    3px 3px,
    8px 3px
  );
}

.pixel-button,
.group-edit-category button,
.group-member-editor li button,
.group-edit-submit,
.start-date-submit,
.post-comments button,
.reject-form button {
  border: var(--yl-pixel-border);
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--yl-ink);
  clip-path: polygon(
    5px 0,
    calc(100% - 5px) 0,
    calc(100% - 5px) 2px,
    calc(100% - 2px) 2px,
    calc(100% - 2px) 5px,
    100% 5px,
    100% calc(100% - 5px),
    calc(100% - 2px) calc(100% - 5px),
    calc(100% - 2px) calc(100% - 2px),
    calc(100% - 5px) calc(100% - 2px),
    calc(100% - 5px) 100%,
    5px 100%,
    5px calc(100% - 2px),
    2px calc(100% - 2px),
    2px calc(100% - 5px),
    0 calc(100% - 5px),
    0 5px,
    2px 5px,
    2px 2px,
    5px 2px
  );
}

.pixel-button:active,
.group-edit-submit:active,
.start-date-submit:active,
.reject-form button:active {
  box-shadow: 1px 1px 0 var(--yl-ink);
  transform: translate(3px, 3px);
}

.approve-button,
.group-edit-submit,
.start-date-submit,
.reject-form button {
  background: var(--yl-purple);
  color: #fff;
}

.approve-button {
  --pixel-fill: var(--yl-purple);
}
.feed-card.is-started {
  --pixel-fill: #000;
}
.avatar {
  --pixel-fill: #d1c4e9;
}
.feed-card.is-started .avatar {
  --pixel-fill: #65529d;
}
.rank-marker.is-me,
.ranking-avatar.is-me {
  --pixel-fill: var(--yl-purple);
}
.plus {
  --pixel-fill: var(--yl-purple-light);
}

.ranking-track,
.ranking-modal-track {
  height: 10px;
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: var(--yl-paper);
}

.track-segment {
  border-right: 2px solid var(--yl-ink);
}

.rank-marker,
.ranking-avatar,
.member-editor-avatar,
.plus {
  border-radius: 0;
  clip-path: polygon(
    33% 0,
    67% 0,
    67% 7%,
    80% 7%,
    80% 13%,
    93% 13%,
    93% 33%,
    100% 33%,
    100% 67%,
    93% 67%,
    93% 87%,
    80% 87%,
    80% 93%,
    67% 93%,
    67% 100%,
    33% 100%,
    33% 93%,
    20% 93%,
    20% 87%,
    7% 87%,
    7% 67%,
    0 67%,
    0 33%,
    7% 33%,
    7% 13%,
    20% 13%,
    20% 7%,
    33% 7%
  );
}

.rank-marker,
.ranking-avatar,
.member-editor-avatar {
  border: 2px solid var(--yl-ink);
  box-shadow: 2px 2px 0 var(--yl-ink);
}

.day-selector button,
.expand-button,
.post-delete-button {
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: var(--yl-paper);
  box-shadow: 3px 3px 0 var(--yl-ink);
}

.day-selector button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: #655b70;
  font-size: 19px;
  font-weight: 700;
}
.expand-button {
  width: 30px;
  height: 30px;
}

.me-label,
.review-status,
.copy-complete-message,
.start-date-complete,
.group-edit-complete {
  border-radius: 0;
  border: 2px solid var(--yl-ink);
}

.invite-code-button,
.start-date-input,
.group-edit-field input,
.group-edit-field select,
.group-edit-field textarea,
.reject-form textarea {
  border: var(--yl-pixel-border);
  border-radius: 0;
  background: var(--yl-paper);
  box-shadow: 3px 3px 0 var(--yl-purple);
}

:global(.youngly-modal),
:global(.youngly-modal *) {
  font-family: 'YounglyNeoPixel', monospace !important;
}

:global(.group-invite-modal),
:global(.group-start-date-modal),
:global(.group-ranking-modal),
:global(.group-edit-modal),
:global(.group-post-detail-modal),
:global(.group-reject-modal) {
  border: var(--yl-pixel-border);
  border-radius: 0;
  box-shadow: 8px 8px 0 var(--yl-ink);
}

:global(.youngly-modal .base-modal__header) {
  border-bottom: 0;
  background: #fff;
}

:global(.youngly-modal .base-modal__close) {
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: var(--yl-paper);
  box-shadow: 2px 2px 0 var(--yl-ink);
}

/* 홈 카드와 동일한 2px 연결형 공통 프레임 */
.challenge-summary.pixel-step-solid,
.ranking-panel.pixel-step-solid,
.feed-card.pixel-step-solid {
  display: block;
  box-sizing: border-box;
}

.detail-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
  margin-bottom: 20px;
}

.detail-card-shadow--summary {
  margin-top: 0;
}

.challenge-summary.pixel-step-solid,
.ranking-panel.pixel-step-solid {
  width: 100%;
  margin: 0;
  --pixel-outline-color: #ac99d2;
  filter: none !important;
}

.feed-card.pixel-step-solid {
  width: 100%;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  filter: none !important;
}

.feed-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}

.rank-marker.pixel-step-circle,
.ranking-avatar.pixel-step-circle {
  --pixel-outline-width: 1px;
  box-shadow: 1px 1px 0 var(--yl-ink);
}

.challenge-summary-surface {
  display: flex;
  min-height: 76px;
  align-items: stretch;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  padding: 16px 22px;
}

.ranking-panel-surface {
  padding: 16px 18px 14px;
}

/* 랭킹 프로필은 공통 헤더 프로필처럼 매끄러운 원형으로 표시합니다. */
.ranking-avatar {
  border: 1px solid #2d1f4f;
  border-radius: 50%;
  clip-path: none;
  box-shadow: none;
}

.feed-card-surface {
  position: relative;
  display: flex;
  min-height: 192px;
  flex-direction: column;
  padding: 14px 18px;
  color: inherit;
}

.my-feed-card .feed-card-surface {
  min-height: 336px;
}

.feed-card.is-started .feed-card-surface {
  min-height: 336px;
}

.invite-card-surface {
  display: flex;
  min-height: 192px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 767px) {
  .group-detail-content {
    padding: 8px 14px 112px;
  }
  .challenge-summary-surface {
    align-items: stretch;
    padding: 16px 20px;
  }
  .day-selector {
    gap: 24px;
  }

  :global(.group-edit-modal) {
    border: var(--yl-pixel-border);
    border-bottom: 0;
    border-radius: 0;
    box-shadow: none;
  }
}

/* 피드 검토 상태와 순서 변경 안내 */
.feed-card-surface {
  padding: 7px 9px;
}
.feed-card.has-verification {
  padding: 0;
}
.feed-owner {
  gap: 8px;
}
.feed-card.is-started .avatar {
  width: 36px;
  height: 36px;
  font-size: 12px;
}
.feed-owner__info {
  display: grid;
  gap: 2px;
}
.feed-owner__name {
  display: flex;
  align-items: center;
  gap: 5px;
}
.feed-review-badge {
  display: inline-flex;
  width: fit-content;
  min-height: 18px;
  box-sizing: border-box;
  align-items: center;
  padding: 2px 7px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  backdrop-filter: blur(4px);
}
.feed-review-badge.is-approved {
  border-color: rgba(132, 221, 174, 0.72);
  background: rgba(21, 105, 63, 0.72);
  color: #e4fff0;
}
.feed-review-badge.is-rejected {
  border-color: rgba(255, 167, 167, 0.72);
  background: rgba(139, 38, 38, 0.72);
  color: #fff0f0;
}
.feed-card.has-verification.review-pending {
  --pixel-outline-color: #a7a0ae;
}
.feed-card.has-verification.review-approved {
  --pixel-outline-color: #2fa36b;
}
.feed-card.has-verification.review-rejected {
  --pixel-outline-color: #e25353;
}
.review-status {
  display: none;
}
.feed-drag-handle {
  right: 11px;
  bottom: 10px;
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  background: transparent;
  color: rgba(255, 255, 255, 0.66);
}
.feed-drag-handle span {
  font-size: 21px;
  font-weight: 800;
  line-height: 1;
}
.feed-card:not(.has-verification) .feed-drag-handle {
  color: rgba(105, 82, 159, 0.7);
}

/* 그룹 생성 바텀시트와 동일한 그룹 수정 폼 */
:global(.group-edit-modal .base-modal__header) {
  border-bottom: 0;
  background: #fff;
}

.group-edit-sheet-header {
  min-width: 0;
}

.group-edit-sheet-title {
  display: block;
  overflow: hidden;
  color: #222;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-edit-form {
  gap: 18px;
}

.group-edit-field,
.group-edit-category,
.group-member-editor {
  gap: 8px;
}

.group-edit-field > span,
.group-edit-category legend,
.group-member-editor h3 {
  color: #222;
  font-size: 14px;
  font-weight: 700;
}

.group-edit-category legend {
  margin-bottom: 8px;
}

.group-edit-field input,
.group-edit-field select,
.group-edit-field textarea {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  border: 1.5px solid #d6cbe2 !important;
  border-radius: 14px !important;
  outline: 0;
  background: #f8f5fc !important;
  box-shadow: none !important;
  padding: 0 14px;
  color: #222;
  font: inherit;
  font-size: 15px;
}

.group-edit-field select {
  appearance: none;
  padding-right: 48px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23222' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 16px center !important;
  background-size: 17px 17px !important;
}

.group-edit-field textarea {
  min-height: 88px;
  padding-block: 12px;
  line-height: 1.45;
}

.group-edit-field input:focus,
.group-edit-field select:focus,
.group-edit-field textarea:focus {
  border-color: #8b6ab8 !important;
  outline: 3px solid rgba(139, 106, 184, 0.16);
  outline-offset: 1px;
}

.group-edit-category button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  border: 1.5px solid #d6cbe2 !important;
  border-radius: 14px !important;
  background: #fff !important;
  box-shadow: none !important;
  filter: none !important;
  clip-path: none !important;
  color: #71687b;
  font-size: 13px;
  font-weight: 700;
  transform: none !important;
}

.group-edit-category button.active {
  border-color: #8b6ab8 !important;
  background: #eee8fa !important;
  color: #60418f;
}

.group-member-editor ul {
  gap: 8px;
}

.group-member-editor li {
  min-height: 52px;
  box-sizing: border-box;
  grid-template-columns: 38px minmax(0, 1fr) 78px;
  padding: 7px 10px;
  border: 1.5px solid #e2d9eb;
  border-radius: 14px;
  background: #faf8fd;
}

.member-editor-avatar {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #e9e0f6;
  box-shadow: none;
  clip-path: none;
  color: #60418f;
  font-size: 12px;
}

.group-member-editor strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-member-editor li button {
  min-height: 34px;
  border: 1.5px solid #d6cbe2 !important;
  border-radius: 10px !important;
  background: #fff !important;
  box-shadow: none !important;
  filter: none !important;
  clip-path: none !important;
  color: #71687b;
  transform: none !important;
}

.group-edit-field-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.group-edit-tooltip-wrap {
  position: relative;
  display: inline-flex;
}

.group-edit-tooltip-trigger {
  display: grid;
  width: 18px;
  height: 18px;
  padding: 0;
  place-items: center;
  border: 1.5px solid #bca7dc;
  border-radius: 50%;
  background: #f8f5fc;
  color: #7156ad;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}

.group-edit-tooltip {
  position: absolute;
  z-index: 10;
  top: calc(100% + 8px);
  left: -74px;
  display: none;
  width: min(230px, 68vw);
  padding: 9px 10px;
  border: 1px solid #d6cbe2;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(79, 57, 126, 0.12);
  color: #514b58;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.group-edit-tooltip-wrap:hover .group-edit-tooltip,
.group-edit-tooltip-wrap:focus-within .group-edit-tooltip {
  display: block;
}

.group-edit-submit {
  min-height: 54px;
  margin-top: 6px;
  border: 1.5px solid #7156ad !important;
  border-radius: 14px !important;
  background: #7156ad !important;
  box-shadow: none !important;
  filter: none !important;
  clip-path: none !important;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  transform: none;
}

.group-edit-submit:active {
  box-shadow: none !important;
  transform: scale(0.98);
}

.group-edit-complete {
  border: 1.5px solid #d6cbe2;
  border-radius: 14px;
  background: #f3eff9;
  color: #60418f;
}

.reject-input-wrap {
  position: relative;
}

.reject-form .reject-input-wrap textarea {
  display: block;
  width: 100%;
  min-height: 112px;
  box-sizing: border-box;
  padding: 14px 14px 34px;
  border: 2px solid #ded3eb;
  border-radius: 14px;
  background: #faf7ff;
  box-shadow: none;
  clip-path: none;
  color: #2f2a34;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
}

.reject-form .reject-input-wrap textarea:focus {
  border-color: #8c6bc4;
  outline: 3px solid rgba(140, 107, 196, 0.14);
}

.reject-form .reject-input-wrap textarea::placeholder {
  color: #aaa2b0;
}

.reject-character-count {
  position: absolute;
  right: 14px;
  bottom: 10px;
  color: #8c8492;
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
}

/* 상단 모임통장 버튼과 동일한 형태로 유지합니다. */
.round-overview-heading .expand-button.account-button {
  display: inline-flex;
  width: 100px;
  height: auto;
  min-width: 0;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 22px;
  position: relative;
  border: 1.5px solid #7156ad;
  border-radius: 10px;
  background: #fff;
  box-shadow: none;
  clip-path: none;
  color: #60418f;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.round-overview-heading .expand-button.account-button:active {
  box-shadow: none;
  transform: scale(0.97);
}

.round-overview-heading .expand-button.account-button > span {
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  transform: translate(-5px, 1px);
}

.round-overview-heading .expand-button.account-button > svg {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}

@media (max-width: 767px) {
  .group-edit-category > div {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
}

.past-verification {
  cursor: default;
  pointer-events: none;
  opacity: 0.75;
}

.join-request-panel {
  margin-bottom: 18px;
  padding: 16px;
  border: 2px solid var(--yl-ink);
  background: var(--yl-paper);
  box-shadow: 5px 5px 0 var(--yl-purple);
}

.join-request-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.join-request-panel__header > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.join-request-panel__header strong {
  font-size: 15px;
  font-weight: 800;
}

.join-request-panel__header span {
  display: grid;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  place-items: center;
  box-sizing: border-box;
  background: #eee8fa;
  color: var(--yl-purple-dark);
  font-size: 11px;
  font-weight: 800;
}

.join-request-list {
  display: grid;
  gap: 10px;
}

.join-request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  border: 1.5px solid #d6cbe2;
  background: #f8f5fc;
}

.join-request-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.join-request-avatar {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  overflow: hidden;
  border: 2px solid var(--yl-ink);
  background: #eee8fa;
  font-size: 13px;
  font-weight: 800;
}

.join-request-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.join-request-user > div:last-child {
  display: grid;
  gap: 2px;
}

.join-request-user strong {
  font-size: 13px;
}

.join-request-user span {
  color: #8b8195;
  font-size: 11px;
}

.join-request-actions {
  display: flex;
  gap: 6px;
}

.join-request-actions button {
  min-height: 34px;
  padding: 0 11px;
  border: 2px solid var(--yl-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.join-request-reject {
  background: #fff;
  color: var(--yl-ink);
}

.join-request-approve {
  background: var(--yl-purple);
  color: #fff;
}

.join-request-actions button:disabled {
  opacity: 0.45;
  cursor: default;
}

.join-request-loading {
  margin: 0;
  color: #8b8195;
  font-size: 12px;
}
</style>
