<template>
  <div class="home-container">
    <!-- 최상단 인증 알림 카드 -->
    <section class="alert-section">
      <div class="alert-card-shadow yl-stepped-card-shadow">
        <div class="alert-card yl-card-frame pixel-step-card pixel-step-solid">
          <div class="alert-card-surface pixel-step-surface">
            <div class="alert-content">
              <div class="alert-icon-wrap">
                <span class="alert-icon">!</span>
              </div>
              <div class="alert-text">
                <h3>오늘 인증이 {{ unverifiedCount }}개 남았어요!</h3>
                <p>마감 전 인증을 완료하세요</p>
              </div>
            </div>
            <button class="action-btn">
              <span>인증하기</span>
              <ArrowRight :size="15" :stroke-width="2.4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasUnpaidDeposit" class="deposit-alert-card-shadow yl-stepped-card-shadow">
        <div class="deposit-alert-card yl-card-frame pixel-step-card pixel-step-solid">
          <div class="deposit-alert-card-surface pixel-step-surface">
            <div class="alert-content">
              <div class="deposit-alert-icon-wrap">
                <CircleAlert :size="18" :stroke-width="2.2" aria-hidden="true" />
              </div>
              <div class="deposit-alert-text">
                <h3>예치금 미입금</h3>
                <p>챌린지 시작 전 입금이 필요해요</p>
              </div>
            </div>
            <button class="deposit-action-btn" type="button" @click="goToDeposit">
              <span>입금하기</span>
              <ArrowRight :size="15" :stroke-width="2.4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 그룹 리스트 섹션 -->
    <section class="group-section">
      <h3 class="section-title">그룹</h3>

      <div class="group-list">
        <div v-if="groupsLoading" class="group-list-state" role="status">
          그룹 목록 불러오는 중
        </div>

        <div v-else-if="groupsError" class="group-list-state group-list-state--error" role="alert">
          <span>{{ groupsError }}</span>
          <button type="button" @click="loadGroups">다시 시도</button>
        </div>

        <div v-else-if="groups.length === 0" class="group-list-state">
          참여 그룹 없음
        </div>

        <div v-for="group in groups" :key="group.id" class="group-card-shadow yl-stepped-card-shadow">
          <div
            class="group-card yl-card-frame pixel-step-card pixel-step-solid"
            :class="{ 'is-completed': group.isCompleted, 'is-pending': group.isPending }"
            @click="goToGroupDetail(group.id)"
          >
            <div class="group-card-surface pixel-step-surface">
            <!-- 좌측: 크기를 1/3로 줄인 오버랩 프로필 -->
            <div class="profiles-wrap">
              <div
                class="profile-circle"
                v-for="(profile, index) in group.profiles.slice(0, 2)"
                :key="index"
                :style="{ '--profile-fill': getProfileColor(index) }"
              >
                {{ profile }}
              </div>
              <div v-if="group.profiles.length > 2" class="profile-circle profile-circle--more">+{{ group.profiles.length - 2 }}</div>
              <div v-if="(group.status === '팀원 모집중' || group.isPending) && group.vacancyCount" class="profile-circle profile-circle--empty">+{{ group.vacancyCount }}</div>
            </div>

            <!-- 중앙: 텍스트 정보 -->
            <div class="group-info">
              <div class="tags">
                <span class="tag category-tag">{{ group.category }}</span>
                <span class="tag status-tag" :class="{ 'completed': group.isCompleted }">
                  {{ group.status }}
                </span>
                <span class="member-count-label">
                  <UserRound :size="11" :stroke-width="2.5" aria-hidden="true" />
                  {{ participantLabel(group) }}
                </span>
              </div>
              <h4 class="group-title">{{ group.title }}</h4>
              <p class="group-subtitle" :class="{ 'highlight': !group.isCompleted }">
                {{ group.subtitle }}
              </p>
            </div>

            <!-- 우측: 화살표 -->
            <div v-if="!group.isPending" class="group-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="floating-add">
      <button
        class="floating-add-button pixel-step-circle"
        type="button"
        aria-label="그룹 메뉴 열기"
        @click="groupActionModalOpen = true"
      >
        +
      </button>
    </div>

    <BaseModal
      v-model="groupActionModalOpen"
      modal-class="youngly-modal home-group-action-modal"
      title="그룹 참여하기"
      size="small"
    >
      <div class="group-action-buttons">
        <button type="button" class="group-action-button group-action-button--primary" @click="openCreateModal">
          <span aria-hidden="true">＋</span> 그룹 생성하기
        </button>
        <button type="button" class="group-action-button" @click="openJoinModal">
          <ClipboardPaste :size="18" aria-hidden="true" /> 코드로 입장하기
        </button>
      </div>
    </BaseModal>

    <BaseModal
      v-model="groupModalOpen"
      modal-class="youngly-modal home-group-modal"
      :title="`새로운 그룹 만들기`"
      size="large"
    >
      <form class="group-create-form" @submit.prevent="openAccountConnect">
        <label class="form-field form-field--full">
          <span class="form-field-heading">
            <span>그룹 이름</span>
            <small aria-live="polite">{{ newGroup.title.length }}/20</small>
          </span>
          <input v-model.trim="newGroup.title" required maxlength="20" aria-label="그룹 이름" />
        </label>

        <fieldset class="category-field">
          <legend>카테고리</legend>
          <div class="category-options">
            <button
              v-for="category in categories"
              :key="category.name"
              type="button"
              :class="{ active: newGroup.category === category.name }"
              @click="newGroup.category = category.name"
            >
              <component :is="category.icon" :size="16" :stroke-width="2" aria-hidden="true" />
              <span>{{ category.name }}</span>
            </button>
          </div>
        </fieldset>

        <div class="form-row">
          <label class="form-field">
            <span>모집 인원</span>
            <span class="number-input-control">
              <input v-model.number="newGroup.memberLimit" type="number" min="2" max="100" step="1" required inputmode="numeric" placeholder="2~100" aria-label="모집 인원" />
              <small>명</small>
            </span>
          </label>
          <label class="form-field">
            <span>매주 몇 번</span>
            <select v-model.number="newGroup.weeklyCount">
              <option v-for="count in 7" :key="count" :value="count">주 {{ count }}회</option>
            </select>
          </label>
        </div>

        <label class="form-field form-field--full">
          <span class="form-field-heading">
            <span>챌린지 목표</span>
            <small aria-live="polite">{{ newGroup.goal.length }}/20</small>
          </span>
          <input v-model.trim="newGroup.goal" maxlength="20" />
        </label>

        <label class="form-field form-field--full">
          <span>1인당 최소 예치금</span>
          <input
            class="yl-money"
            :value="formatDeposit(newGroup.deposit)"
            type="text"
            inputmode="numeric"
            required
            placeholder="50,000"
            @input="updateDeposit"
          />
        </label>

        <label class="form-field form-field--full">
          <span class="field-label-with-tooltip">
            실패 면제권
            <button class="tooltip-trigger" type="button" aria-label="실패 면제권 안내" aria-describedby="failure-pass-tooltip">?</button>
            <span id="failure-pass-tooltip" class="field-tooltip" role="tooltip">하루 챌린지를 하지 못했을 때 해당 날짜를 면제합니다.</span>
          </span>
          <select v-model.number="newGroup.failurePassCount">
            <option v-for="count in 9" :key="count - 1" :value="count - 1">{{ count - 1 }}개</option>
          </select>
        </label>

        <label class="form-field form-field--full">
          <span>추가 규칙 <em>(선택)</em></span>
          <textarea
            v-model.trim="newGroup.additionalRule"
            maxlength="120"
            placeholder="예: 이번 달 꼴찌가 모든 참여자에게 커피 쏘기"
          ></textarea>
        </label>

        <button class="create-group-button" type="submit">모임통장 연결하기</button>
      </form>
    </BaseModal>

    <BaseModal
      v-model="accountConnectModalOpen"
      modal-class="youngly-modal home-account-connect-modal"
      title="모임통장 연결하기"
      size="small"
      @close="resetAccountSelection"
    >
      <form class="account-connect-form" @submit.prevent="createGroup">
        <p>그룹 예치금을 관리할 모임통장을 선택해 주세요.</p>
        <fieldset class="account-options">
          <legend>연결할 모임통장</legend>
          <p v-if="groupAccountsLoading" class="sheet-state-message" role="status">모임통장 불러오는 중</p>
          <p v-else-if="groupAccountsError" class="sheet-state-message sheet-state-message--error" role="alert">{{ groupAccountsError }}</p>
          <p v-else-if="groupAccounts.length === 0" class="sheet-state-message">연결 가능한 모임통장 없음</p>
          <label v-for="account in groupAccounts" :key="account.id" class="account-option" :class="{ active: selectedAccountId === account.id, disabled: account.isConnected }">
            <input v-model="selectedAccountId" type="radio" name="group-account" :value="account.id" :disabled="account.isConnected" />
            <span class="account-option__bank">{{ account.bank }}</span>
            <span class="account-option__info">
              <strong>{{ account.name }}</strong>
              <small v-if="account.isConnected">다른 그룹에 이미 연결됨</small>
              <small v-else>{{ account.number }} · <span class="yl-money">{{ account.balance }}</span></small>
            </span>
            <span class="account-option__check" aria-hidden="true">✓</span>
          </label>
        </fieldset>
        <p v-if="groupCreateError" class="sheet-state-message sheet-state-message--error" role="alert">{{ groupCreateError }}</p>
        <button class="create-group-button" type="submit" :disabled="!selectedAccountId || groupCreating">
          {{ groupCreating ? '그룹 생성 중' : '그룹 만들기 완료' }}
        </button>
      </form>
    </BaseModal>

    <BaseModal
      v-model="groupCreatedModalOpen"
      modal-class="youngly-modal home-group-created-modal"
      title="초대 코드"
      size="small"
    >
      <div class="group-created-content">
        <p>친구 초대</p>
        <button class="created-invite-code" type="button" aria-label="초대 코드 복사" @click="copyCreatedInviteCode">
          <strong>{{ createdInviteCode }}</strong>
          <span>{{ inviteCodeCopied ? '✓ 복사됨' : '⌘ 복사' }}</span>
        </button>
        <button class="share-invite-button" type="button" @click="shareCreatedInvite">
          ↗ 공유
        </button>
      </div>
    </BaseModal>

    <BaseModal
      v-model="joinGroupModalOpen"
      modal-class="youngly-modal home-join-group-modal"
      title="코드로 입장하기"
      size="small"
    >
      <form class="join-group-form" @submit.prevent="requestJoin">
        <p>초대 코드를 입력하면 그룹장에게 참여 요청을 보냅니다.</p>
        <label class="form-field form-field--full">
          <span>초대 코드</span>
          <span class="invite-code-control">
            <input
              v-model.trim="inviteCode"
              class="invite-code-input"
              required
              maxlength="6"
              autocomplete="off"
              placeholder="예: A1B2C3"
              @input="inviteCode = inviteCode.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
            <button class="paste-code-button" type="button" aria-label="초대 코드 붙여넣기" @click="pasteInviteCode"><ClipboardPaste :size="19" aria-hidden="true" /></button>
          </span>
        </label>
        <p v-if="joinRequestSent" class="join-request-message" role="status">초대 요청을 보냈습니다. 그룹장의 승인을 기다려주세요!</p>
        <p v-if="joinRequestError" class="sheet-state-message sheet-state-message--error" role="alert">{{ joinRequestError }}</p>
        <button class="create-group-button" type="submit" :disabled="inviteCode.length !== 6 || joinRequesting">
          {{ joinRequesting ? '요청 전송 중' : '초대 요청하기' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import {
  BookOpen,
  ArrowRight,
  CalendarCheck2,
  CircleAlert,
  ClipboardPaste,
  Dumbbell,
  GraduationCap,
  Shapes,
  UserRound,
} from 'lucide-vue-next';

import { useRouter } from 'vue-router';
import BaseModal from '@/components/base/BaseModal.vue';
import { createGroup as createGroupRequest, getGroupDetail, getGroups, getGroupUsers, joinGroup } from '@/api/group';
import { getMoimAccounts } from '@/api/account';

const router = useRouter();

// 그룹 카드를 누르면 해당 ID의 상세 페이지로 이동
const goToGroupDetail = (groupId) => {
  if (groups.value.find((group) => group.id === groupId)?.isPending) return;
  router.push(`/groups/${groupId}`);
};

const goToDeposit = () => {
  router.push({ path: '/asset', query: { tab: 'group' } });
};

// 상단 인증 개수 상태
const unverifiedCount = ref(1);
const hasUnpaidDeposit = ref(true);
const groupActionModalOpen = ref(false);
const groupModalOpen = ref(false);
const accountConnectModalOpen = ref(false);
const groupCreatedModalOpen = ref(false);
const joinGroupModalOpen = ref(false);
const inviteCode = ref('');
const joinRequestSent = ref(false);
const createdInviteCode = ref('KP7A2Q');
const inviteCodeCopied = ref(false);
const groupCreating = ref(false);
const groupCreateError = ref('');
const joinRequesting = ref(false);
const joinRequestError = ref('');
const groupAccountsLoading = ref(false);
const groupAccountsError = ref('');
const categories = [
  { name: '운동', icon: Dumbbell },
  { name: '독서', icon: BookOpen },
  { name: '공부', icon: GraduationCap },
  { name: '습관', icon: CalendarCheck2 },
  { name: '기타', icon: Shapes },
];
const newGroup = ref({
  title: '',
  category: '운동',
  memberLimit: null,
  weeklyCount: 5,
  goal: '',
  deposit: 50000,
  failurePassCount: 0,
  additionalRule: '',
});
const selectedAccountId = ref('');
const groupAccounts = ref([]);

const groups = ref([]);
const groupsLoading = ref(false);
const groupsError = ref('');

const categoryLabels = {
  EXERCISE: '운동',
  READING: '독서',
  STUDY: '공부',
  HABIT: '습관',
  CUSTOM: '기타',
  DRAFT: '기타',
};

const statusLabels = {
  RECRUITING: '팀원 모집중',
  ONGOING: '진행 중',
  FINISHED: '종료',
};

const categoryValues = {
  운동: 'EXERCISE',
  독서: 'READING',
  공부: 'STUDY',
  습관: 'HABIT',
  기타: 'CUSTOM',
};

const getStoredInitial = () => {
  try {
    const user = JSON.parse(localStorage.getItem('youngly_user') || '{}');
    return String(user.nickname || user.loginId || '나').trim().slice(0, 1) || '나';
  } catch {
    return '나';
  }
};

const toInitial = (member) => String(member?.nickname || member?.userId || '').trim().slice(0, 1);

const getGroupLoadErrorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return '로그인 정보 확인 필요';
  if (status >= 500) return '그룹 목록 서버 오류';
  return error?.response?.data?.message || '그룹 목록 조회 실패';
};

const buildGroupCard = async (group) => {
  const isPending = group.myMembershipStatus === 'PENDING_APPROVAL';
  const [detailResult, usersResult] = await Promise.allSettled([
    getGroupDetail(group.groupId),
    getGroupUsers(group.groupId),
  ]);
  const detail = detailResult.status === 'fulfilled' ? detailResult.value.data : {};
  const members = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value.data)
    ? usersResult.value.data
    : [];
  const profiles = members.map(toInitial).filter(Boolean);
  if (profiles.length === 0) profiles.push(getStoredInitial());

  const memberLimit = Number(detail.groupCount ?? group.groupCount ?? 0);
  const joinedCount = Number(group.memberCount ?? members.length ?? profiles.length) || profiles.length;
  const rawStatus = detail.groupStatus || group.groupStatus;
  const status = isPending ? '승인 대기' : (statusLabels[rawStatus] || rawStatus || '상태 확인 중');
  const isRecruiting = rawStatus === 'RECRUITING';

  return {
    id: group.groupId,
    moimAccountId: group.moimAccountId,
    profiles,
    memberCount: joinedCount,
    category: categoryLabels[detail.challengeType || group.challengeType] || '기타',
    status,
    title: detail.groupName || group.groupName || '이름 없는 그룹',
    subtitle: isPending
      ? '그룹장 승인 대기 중'
      : isRecruiting
      ? `팀원 ${joinedCount}/${memberLimit}명 모집 완료`
      : rawStatus === 'FINISHED' ? '챌린지 종료' : '인증 진행 중',
    memberLimit,
    vacancyCount: isRecruiting ? Math.max(memberLimit - joinedCount, 0) : 0,
    isCompleted: rawStatus === 'FINISHED',
    isPending,
  };
};

const loadGroups = async () => {
  groupsLoading.value = true;
  groupsError.value = '';
  try {
    const response = await getGroups();
    const groupList = Array.isArray(response.data) ? response.data : [];
    groups.value = await Promise.all(groupList.map(buildGroupCard));
  } catch (error) {
    groups.value = [];
    groupsError.value = getGroupLoadErrorMessage(error);
    console.error('그룹 목록 조회 실패:', error);
  } finally {
    groupsLoading.value = false;
  }
};

// 프로필 배경색 지정 함수
const getProfileColor = (index) => {
  const colors = ['#D1C4E9', '#C5CAE9', '#BBDEFB', '#B2EBF2'];
  return colors[index % colors.length];
};

const participantLabel = (group) => {
  const joinedCount = group.memberCount ?? group.profiles.length;
  return group.memberLimit
    ? `${joinedCount} / ${group.memberLimit}명`
    : `${joinedCount}명`;
};

const makeDepositRatioRule = (memberLimit) => Array.from(
  { length: Number(memberLimit) || 1 },
  (_, index) => `${index + 1}:${Math.min(40 + index * 20, 100)}`,
).join('/');

const resetNewGroup = () => {
  newGroup.value = {
    title: '',
    category: '운동',
    memberLimit: null,
    weeklyCount: 5,
    goal: '',
    deposit: 50000,
    failurePassCount: 0,
    additionalRule: '',
  };
};

const getApiErrorMessage = (error, fallback) => (
  error?.response?.data?.message || fallback
);

const createGroup = async () => {
  if (!selectedAccountId.value || groupCreating.value) return;
  groupCreating.value = true;
  groupCreateError.value = '';

  try {
    const response = await createGroupRequest({
      moimAccountId: selectedAccountId.value,
      groupName: newGroup.value.title,
      groupCount: Number(newGroup.value.memberLimit),
      customRule: newGroup.value.additionalRule || null,
      challengeType: categoryValues[newGroup.value.category],
      content: newGroup.value.goal || `${newGroup.value.title} 챌린지`,
      futureDepositRatioRule: makeDepositRatioRule(newGroup.value.memberLimit),
      durationDays: 7,
      minCount: Number(newGroup.value.weeklyCount),
      roundCycleDays: 28,
      baseDepositAmount: Number(newGroup.value.deposit),
    });

    createdInviteCode.value = response.data?.inviteCode || '';
    accountConnectModalOpen.value = false;
    groupModalOpen.value = false;
    selectedAccountId.value = '';
    resetNewGroup();
    inviteCodeCopied.value = false;
    await loadGroups();
    groupCreatedModalOpen.value = true;
  } catch (error) {
    groupCreateError.value = getApiErrorMessage(error, '그룹 생성에 실패했습니다.');
  } finally {
    groupCreating.value = false;
  }
};

const copyCreatedInviteCode = async () => {
  try {
    await navigator.clipboard.writeText(createdInviteCode.value);
    inviteCodeCopied.value = true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = createdInviteCode.value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    inviteCodeCopied.value = document.execCommand('copy');
    textarea.remove();
  }
};

const shareCreatedInvite = async () => {
  const shareText = `CHALLENGE PIXEL 그룹 초대 코드: ${createdInviteCode.value}`;
  const shareUrl = `${window.location.origin}/groups/join?code=${createdInviteCode.value}`;

  // 1. Web Share API 지원 여부 확인 (HTTPS 환경인지, 브라우저가 지원하는지)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'CHALLENGE PIXEL 그룹 초대',
        text: shareText,
        url: shareUrl
      });
      // 공유 성공하면 함수 종료
      return;
    } catch (error) {
      // 2. 사용자가 공유 창을 그냥 닫은 경우(AbortError) 무시하고 종료
      if (error.name === 'AbortError') {
        console.log('사용자가 공유를 취소했습니다.');
        return;
      }
      // 진짜 에러가 난 경우엔 아래 폴백 로직으로 넘어가도록 내버려 둠
      console.error('공유 중 에러 발생:', error);
    }
  }

  // Web Share API 미지원 또는 공유 오류 시 별도 창 없이 초대 코드만 복사합니다.
  await copyCreatedInviteCode();
};

const loadGroupAccounts = async () => {
  groupAccountsLoading.value = true;
  groupAccountsError.value = '';
  try {
    const response = await getMoimAccounts();
    const accounts = Array.isArray(response.data) ? response.data : [];
    const connectedAccountIds = new Set(groups.value.map((group) => group.moimAccountId).filter(Boolean));
    groupAccounts.value = accounts.map((account) => ({
      id: account.moimAccountId,
      bank: account.bankName || 'KB',
      name: account.accountName || '모임통장',
      number: account.accountNumber || '-',
      balance: `${Number(account.balance || 0).toLocaleString('ko-KR')}원`,
      isConnected: connectedAccountIds.has(account.moimAccountId),
    }));
  } catch (error) {
    groupAccounts.value = [];
    groupAccountsError.value = getApiErrorMessage(error, '모임통장을 불러오지 못했습니다.');
  } finally {
    groupAccountsLoading.value = false;
  }
};

const openAccountConnect = async () => {
  groupModalOpen.value = false;
  selectedAccountId.value = '';
  groupCreateError.value = '';
  accountConnectModalOpen.value = true;
  await loadGroupAccounts();
};

const resetAccountSelection = () => {
  if (!accountConnectModalOpen.value) selectedAccountId.value = '';
};

const openCreateModal = () => {
  groupActionModalOpen.value = false;
  groupModalOpen.value = true;
};

const openJoinModal = () => {
  groupActionModalOpen.value = false;
  joinRequestSent.value = false;
  joinRequestError.value = '';
  inviteCode.value = '';
  joinGroupModalOpen.value = true;
};

const requestJoin = async () => {
  if (inviteCode.value.length !== 6 || joinRequesting.value) return;
  joinRequesting.value = true;
  joinRequestError.value = '';

  try {
    await joinGroup(inviteCode.value);
    joinRequestSent.value = true;
    await loadGroups();
    window.setTimeout(() => {
      joinGroupModalOpen.value = false;
    }, 700);
  } catch (error) {
    joinRequestError.value = getApiErrorMessage(error, '그룹 참여 요청에 실패했습니다.');
  } finally {
    joinRequesting.value = false;
  }
};

const pasteInviteCode = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    inviteCode.value = clipboardText.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  } catch {
    // 브라우저 권한이 없는 경우 사용자가 직접 입력할 수 있도록 유지합니다.
  }
};

const formatDeposit = (value) => Number(value || 0).toLocaleString('ko-KR');

const updateDeposit = (event) => {
  newGroup.value.deposit = Number(event.target.value.replace(/[^0-9]/g, '')) || 0;
};

onMounted(loadGroups);
</script>

<style scoped>
/* 배경 설정 */
.home-container {
  margin: -20px;
  padding: 12px 20px 100px;
  min-height: 100vh;
  background-color: #E6DCF6;
  box-sizing: border-box;
  font-family: inherit;
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

.group-list-state {
  display: grid;
  min-height: 112px;
  place-items: center;
  padding: 18px;
  box-sizing: border-box;
  border: 2px dashed #b7a5d8;
  background: rgba(255, 255, 255, 0.46);
  color: #655b75;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.group-list-state--error {
  gap: 12px;
  border-color: #d99b9b;
  color: #a84242;
}

.group-list-state--error button {
  min-height: 34px;
  padding: 0 14px;
  border: 1.5px solid currentColor;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  font: inherit;
  cursor: pointer;
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

.group-card.is-pending {
  border: 2px dashed #9b8abf;
  background: rgba(255, 255, 255, 0.72);
  cursor: default;
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

.profile-circle--empty {
  border-style: dashed;
  border-color: #9b8abf;
  background: transparent !important;
  color: #7156ad;
}

.profile-circle--more {
  border-color: #7156ad;
  background: #7156ad !important;
  color: #fff;
}

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

.pending-label {
  padding: 6px 8px;
  border-radius: 8px;
  background: #e5e2fa;
  color: #69529f;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
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

.group-action-description,
.join-group-form > p {
  margin: 0;
  color: #625d69;
  font-size: 14px;
  line-height: 1.55;
}

.group-action-buttons {
  display: grid;
  gap: 10px;
  margin-top: 0;
}

.group-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 56px;
  border: 2px solid #222;
  border-radius: 14px;
  background: #f0ede8;
  color: #222;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.group-action-button--primary {
  border-color: #69529f;
  background: #69529f;
  color: #fff;
}

.join-group-form {
  display: grid;
  gap: 16px;
}

.sheet-state-message {
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f6f3fb;
  color: #625d69;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.sheet-state-message--error {
  border: 1px solid #e7a3a3;
  background: #fff2f2;
  color: #a64242;
}

.invite-code-control {
  position: relative;
  display: block;
}

.invite-code-control .invite-code-input {
  padding-right: 54px;
}

.paste-code-button {
  position: absolute;
  top: 50%;
  right: 8px;
  display: grid;
  width: 38px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  place-items: center;
  transform: translateY(-50%);
  background: #e5e2fa;
  color: #533b85;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.account-connect-form {
  display: grid;
  gap: 18px;
}

.account-connect-form > p {
  margin: 0;
  color: #625d69;
  font-size: 14px;
  line-height: 1.55;
}

.account-options {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}

.account-options legend {
  margin-bottom: 2px;
  color: #222;
  font-size: 14px;
  font-weight: 700;
}

.account-option {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 64px;
  padding: 10px 12px;
  border: 2px solid #222;
  border-radius: 14px;
  background: #f0ede8;
  cursor: pointer;
}

.account-option.active {
  border-color: #69529f;
  background: #e5e2fa;
}

.account-option.disabled {
  border-color: #ddd8df;
  background: #f6f4f2;
  cursor: not-allowed;
  opacity: 0.58;
}

.account-option input {
  position: absolute;
  opacity: 0;
}

.account-option__bank {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
  background: #eee8fa;
  color: var(--yl-purple-dark);
  font-family: Georgia, serif;
  font-size: 13px;
  font-weight: 800;
}

.account-option__info {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.account-option__info strong {
  color: #222;
  font-size: 14px;
}

.account-option__info small {
  overflow: hidden;
  color: #71717a;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-option__check {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 2px solid #b3acba;
  border-radius: 50%;
  color: transparent;
  font-size: 14px;
  font-weight: 800;
}

.account-option.active .account-option__check {
  border-color: #69529f;
  background: #69529f;
  color: #fff;
}

.group-created-content {
  display: grid;
  gap: 14px;
  text-align: center;
}

.share-fallback-content {
  display: grid;
  gap: 14px;
  text-align: center;
}

.share-fallback-content p {
  margin: 0;
  color: #625d69;
  font-size: 14px;
}

.group-created-content > p {
  margin: 0;
  color: #625d69;
  font-size: 14px;
}

.created-invite-code {
  display: grid;
  gap: 6px;
  padding: 20px;
  border: 2px solid #69529f;
  border-radius: 16px;
  background: #e5e2fa;
  color: #3f2c70;
  cursor: pointer;
}

.created-invite-code strong {
  letter-spacing: 0.16em;
  font-size: 25px;
}

.created-invite-code span {
  font-size: 12px;
  font-weight: 700;
}

.share-invite-button {
  min-height: 52px;
  border: 0;
  border-radius: 14px;
  background: #69529f;
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.invite-code-input {
  letter-spacing: 0.14em;
  text-align: center;
  text-transform: uppercase;
}

.join-request-message {
  padding: 10px 12px;
  border: 1px solid #69529f;
  border-radius: 10px;
  background: #e5e2fa;
  color: #533b85 !important;
  font-weight: 700;
  text-align: center;
}

.create-group-button:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

/* 새로운 그룹 만들기 팝업 */
.group-create-form {
  display: grid;
  gap: 18px;
  font-family: inherit;
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

.category-field legend {
  margin-bottom: 8px;
}

.form-field > span em {
  color: #8c8592;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
}

.form-field input,
.form-field select,
.form-field textarea {
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

.form-field textarea {
  height: 88px;
  padding-top: 12px;
  padding-bottom: 12px;
  line-height: 1.45;
  resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: 3px solid rgba(113, 86, 173, 0.28);
  border-color: #7156ad;
}

.number-input-control { position: relative; display: block; }
.number-input-control input { padding-right: 40px; }
.number-input-control small { position: absolute; top: 50%; right: 14px; color: #6f6875; font-size: 14px; font-weight: 700; pointer-events: none; transform: translateY(-50%); }
.field-label-with-tooltip { position: relative; display: inline-flex; align-items: center; width: fit-content; gap: 5px; }
.tooltip-trigger { display: inline-grid; width: 17px; height: 17px; padding: 0; place-items: center; border: 1.5px solid #7156ad; border-radius: 50%; background: #fff; color: #7156ad; font: inherit; font-size: 11px; font-weight: 800; line-height: 1; cursor: help; }
.field-tooltip { position: absolute; z-index: 5; top: calc(100% + 8px); left: 0; width: min(240px, 70vw); padding: 9px 10px; border: 2px solid var(--yl-ink); background: var(--yl-paper); box-shadow: 3px 3px 0 var(--yl-purple); color: var(--yl-ink); font-size: 12px; font-weight: 600; line-height: 1.4; opacity: 0; pointer-events: none; transform: translateY(-3px); transition: opacity .15s ease, transform .15s ease; }
.tooltip-trigger:hover + .field-tooltip, .tooltip-trigger:focus-visible + .field-tooltip { opacity: 1; transform: translateY(0); }

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

.create-step-actions {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
  margin-top: 6px;
}

.create-step-actions .create-group-button {
  margin-top: 0;
}

.back-step-button {
  min-height: 54px;
  border: 2px solid #69529f;
  border-radius: 14px;
  background: #fff;
  color: #69529f;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

:global(.home-group-modal) {
  border-radius: 24px;
  font-family: inherit;
}

:global(.home-group-action-modal),
:global(.home-join-group-modal),
:global(.home-account-connect-modal),
:global(.home-group-created-modal),
:global(.home-share-fallback-modal) {
  border-radius: 22px;
  font-family: inherit;
}

:global(.home-group-action-modal .base-modal__body),
:global(.home-join-group-modal .base-modal__body),
:global(.home-account-connect-modal .base-modal__body),
:global(.home-group-created-modal .base-modal__body),
:global(.home-share-fallback-modal .base-modal__body) {
  padding: 6px 22px 22px;
}

:global(.home-group-modal .base-modal__title) {
  color: #222;
  font-family: inherit;
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

  :global(.home-group-modal) {
    max-height: min(88dvh, 760px);
    margin: 0;
    border-radius: 0;
  }

  :global(.home-group-modal .base-modal__header) {
    padding: 27px 22px 10px;
  }

  :global(.home-group-modal .base-modal__body) {
    padding: 6px 20px 20px;
  }

  :global(.home-group-modal .base-modal__title) { font-size: 19px; }
}
/* /home pixel design — 공통 값은 src/styles/main.css의 --yl-* 토큰 사용 */
.home-container {
  color: var(--yl-ink);
  background: var(--yl-purple-light);
}

.alert-card {
  padding: 0;
  border: 0;
  border-radius: 0;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  --pixel-fill: var(--yl-purple);
  filter: none !important;
  box-shadow: none;
}

.alert-card-surface {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 18px;
  background: var(--yl-purple);
}

.alert-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}

.alert-icon-wrap {
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: #eee8fa;
  box-shadow: 2px 2px 0 var(--yl-ink);
}

.alert-icon {
  color: var(--yl-ink);
}

.action-btn {
  padding: 8px 12px;
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: var(--yl-purple-dark);
  color: #fff;
  box-shadow: 3px 3px 0 var(--yl-ink);
}

.action-btn:active,
.group-action-button:active,
.create-group-button:active,
.back-step-button:active,
.share-invite-button:active,
.paste-code-button:active,
.floating-add-button:active {
  box-shadow: 1px 1px 0 var(--yl-ink);
  transform: translate(2px, 2px);
}

.section-title {
  display: inline-block;
  margin: 0 0 18px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  font-size: 17px;
}

.group-list {
  gap: 16px;
}

.group-card,
.group-card.is-completed,
.group-card.is-pending {
  min-height: 96px;
  padding: 16px 18px;
  border: var(--yl-pixel-border);
  border-radius: 0;
  background: var(--yl-paper);
  box-shadow: 5px 5px 0 var(--yl-purple);
  transition: none;
}

.group-card:hover:not(.is-pending) {
  background: #faf7ff;
  box-shadow: 7px 7px 0 var(--yl-purple-dark);
  transform: translate(-2px, -2px);
}

.group-card:active:not(.is-pending) {
  box-shadow: 2px 2px 0 var(--yl-purple-dark);
  transform: translate(3px, 3px);
}

.group-card.is-completed {
  background: #f7f3ff;
  box-shadow: 5px 5px 0 #bca7dc;
}

.group-card.is-pending {
  border-style: dashed;
  box-shadow: 5px 5px 0 #9b8abf;
}

.profile-circle,
.profile-circle--more,
.profile-circle--empty {
  width: 34px;
  height: 34px;
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  color: var(--yl-ink);
  box-shadow: 2px 2px 0 var(--yl-ink);
}

.profile-circle--more {
  color: #fff;
}

.tag,
.pending-label {
  padding: 3px 6px;
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: #fff;
  color: var(--yl-ink);
}

.status-tag {
  background: #eee8fa;
}

.status-tag.completed {
  background: #dff2d7;
  color: #254f21;
}

.group-subtitle.highlight {
  color: var(--yl-purple-dark);
}

.group-arrow svg path {
  stroke: var(--yl-ink);
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.floating-add-button {
  border: var(--yl-pixel-border);
  border-radius: 0;
  background: var(--yl-purple);
  color: #fff;
  box-shadow: 5px 5px 0 var(--yl-ink);
  transition: none;
}

.floating-add-button:hover {
  box-shadow: 7px 7px 0 var(--yl-purple-dark);
  transform: translate(-2px, -2px);
}

.group-action-button,
.create-group-button,
.back-step-button,
.share-invite-button,
.paste-code-button {
  border: var(--yl-pixel-border);
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--yl-ink);
}

.group-action-button,
.back-step-button {
  background: var(--yl-paper);
  color: var(--yl-ink);
}

.group-action-button--primary,
.create-group-button,
.share-invite-button {
  border-color: var(--yl-ink);
  background: var(--yl-purple);
  color: #fff;
}

.create-group-button:hover {
  background: var(--yl-purple-dark);
}

.paste-code-button {
  background: #eee8fa;
  color: var(--yl-purple-dark);
}

.form-field input,
.form-field select,
.form-field textarea,
.category-options button,
.account-option,
.created-invite-code,
.join-request-message {
  border: var(--yl-pixel-border);
  border-radius: 0;
  background: var(--yl-paper);
  box-shadow: 3px 3px 0 var(--yl-purple);
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--yl-ink);
  outline: 3px solid #bca7dc;
  outline-offset: 2px;
}

.category-options button.active,
.account-option.active {
  border-color: var(--yl-ink);
  background: var(--yl-purple);
  color: #fff;
  box-shadow: 3px 3px 0 #bca7dc;
}

.account-option__bank,
.account-option__check {
  border: 2px solid var(--yl-ink);
  border-radius: 0;
}

.created-invite-code,
.join-request-message {
  background: #f3edff;
  color: var(--yl-purple-dark) !important;
}

:global(.youngly-modal) {
  border: var(--yl-pixel-border);
  border-radius: 0 !important;
  background: var(--yl-paper);
  box-shadow: 8px 8px 0 var(--yl-ink) !important;
}

:global(.youngly-modal .base-modal__header) {
  border-bottom: 0;
  background: var(--yl-paper);
}

:global(.youngly-modal .base-modal__title) {
  font-family: 'YounglyNeoPixel', monospace !important;
}

:global(.youngly-modal .base-modal__close) {
  border: 2px solid var(--yl-ink);
  border-radius: 0;
  background: #fff;
  color: var(--yl-ink);
  box-shadow: 2px 2px 0 var(--yl-ink);
}

@media (max-width: 767px) {
  .home-container {
    padding: 8px 14px 112px;
  }

  .alert-card {
    margin-bottom: 27px;
    box-shadow: 5px 5px 0 var(--yl-ink);
  }

  .group-card,
  .group-card.is-completed,
  .group-card.is-pending {
    min-height: 90px;
    padding: 14px 12px;
    gap: 11px;
  }

  .profiles-wrap {
    padding-left: 2px;
  }

  .profile-circle,
  .profile-circle--more,
  .profile-circle--empty {
    width: 30px;
    height: 30px;
  }

  .group-title {
    font-size: 13px;
  }

  :global(.youngly-modal) {
    width: 100vw;
    max-width: 100vw !important;
    max-height: min(88dvh, 760px);
    margin: 0;
    border-width: 3px 0 0;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}
/* Stepped pixel silhouettes */
.group-card,
.group-card.is-completed,
.group-card.is-pending {
  --card-shadow-color: var(--yl-purple);
  border-radius: 0;
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
  box-shadow: none;
  filter: drop-shadow(5px 5px 0 var(--card-shadow-color));
}

.group-card.is-completed {
  --card-shadow-color: #bca7dc;
}

.group-card.is-pending {
  --card-shadow-color: #9b8abf;
}

.group-card:hover:not(.is-pending) {
  box-shadow: none;
  filter: drop-shadow(7px 7px 0 var(--yl-purple-dark));
}

.group-card:active:not(.is-pending) {
  box-shadow: none;
  filter: drop-shadow(2px 2px 0 var(--yl-purple-dark));
}

.profile-circle,
.profile-circle--more,
.profile-circle--empty,
.floating-add-button {
  clip-path: polygon(
    37.5% 0,
    62.5% 0,
    62.5% 6.25%,
    75% 6.25%,
    75% 12.5%,
    87.5% 12.5%,
    87.5% 25%,
    93.75% 25%,
    93.75% 37.5%,
    100% 37.5%,
    100% 62.5%,
    93.75% 62.5%,
    93.75% 75%,
    87.5% 75%,
    87.5% 87.5%,
    75% 87.5%,
    75% 93.75%,
    62.5% 93.75%,
    62.5% 100%,
    37.5% 100%,
    37.5% 93.75%,
    25% 93.75%,
    25% 87.5%,
    12.5% 87.5%,
    12.5% 75%,
    6.25% 75%,
    6.25% 62.5%,
    0 62.5%,
    0 37.5%,
    6.25% 37.5%,
    6.25% 25%,
    12.5% 25%,
    12.5% 12.5%,
    25% 12.5%,
    25% 6.25%,
    37.5% 6.25%
  );
  border-radius: 0;
}

.profile-circle,
.profile-circle--more,
.profile-circle--empty {
  box-shadow: none;
  filter: drop-shadow(2px 2px 0 var(--yl-ink));
}

.floating-add-button {
  box-shadow: none;
  filter: drop-shadow(5px 5px 0 var(--yl-ink));
}

.floating-add-button:hover {
  box-shadow: none;
  filter: drop-shadow(7px 7px 0 var(--yl-purple-dark));
}

.floating-add-button:active {
  box-shadow: none;
  filter: drop-shadow(1px 1px 0 var(--yl-ink));
}
/* Solid stepped borders: black outer silhouette + inset fill */
.group-card,
.group-card.is-completed,
.group-card.is-pending {
  --card-fill: var(--yl-paper);
  position: relative;
  isolation: isolate;
  border: 0;
  background: var(--yl-ink);
}

.group-card.is-completed {
  --card-fill: #f7f3ff;
}

.group-card.is-pending {
  --card-fill: #f6f2fb;
}

.group-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  z-index: 0;
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
  background: var(--card-fill);
}

.group-card:hover:not(.is-pending)::before {
  background: #faf7ff;
}

.profile-circle,
.profile-circle--more,
.profile-circle--empty {
  --profile-fill: #fff;
  position: relative;
  isolation: isolate;
  border: 0;
  background: var(--yl-ink) !important;
}

.profile-circle::before {
  content: '';
  position: absolute;
  inset: 2px;
  z-index: -1;
  clip-path: inherit;
  background: var(--profile-fill);
}

.profile-circle--more {
  --profile-fill: var(--yl-purple);
  --pixel-fill: var(--yl-purple);
  color: #fff;
}

.profile-circle--empty {
  --profile-fill: var(--yl-purple-light);
  --pixel-fill: var(--yl-purple-light);
  color: var(--yl-purple-dark);
}

.floating-add-button {
  position: relative;
  isolation: isolate;
  border: 0;
  background: var(--yl-ink);
  color: #fff;
}

.floating-add-button::before {
  content: '';
  position: absolute;
  inset: 3px;
  z-index: -1;
  clip-path: inherit;
  background: #69529f;
}

.group-action-button {
  position: relative;
  isolation: isolate;
  border: 0;
  border-radius: 0;
  background: var(--yl-ink);
  box-shadow: none;
  filter: drop-shadow(4px 4px 0 var(--yl-ink));
  clip-path: polygon(
    7px 0, calc(100% - 7px) 0,
    calc(100% - 7px) 3px, calc(100% - 3px) 3px,
    calc(100% - 3px) 7px, 100% 7px,
    100% calc(100% - 7px), calc(100% - 3px) calc(100% - 7px),
    calc(100% - 3px) calc(100% - 3px), calc(100% - 7px) calc(100% - 3px),
    calc(100% - 7px) 100%, 7px 100%,
    7px calc(100% - 3px), 3px calc(100% - 3px),
    3px calc(100% - 7px), 0 calc(100% - 7px),
    0 7px, 3px 7px, 3px 3px, 7px 3px
  );
}

.group-action-button::before {
  content: '';
  position: absolute;
  inset: 3px;
  z-index: -1;
  clip-path: inherit;
  background: var(--yl-paper);
}

.group-action-button--primary::before {
  background: var(--yl-purple);
}

.group-action-button--primary {
  --pixel-fill: var(--yl-purple);
}

.floating-add-button {
  --pixel-fill: #69529f;
  --pixel-outline-color: #69529f;
  --pixel-outline-width: 0px;
  border: 0 !important;
  border-radius: 0 !important;
  clip-path: polygon(
    8px 0, calc(100% - 8px) 0,
    calc(100% - 8px) 3px, calc(100% - 3px) 3px,
    calc(100% - 3px) 8px, 100% 8px,
    100% calc(100% - 8px), calc(100% - 3px) calc(100% - 8px),
    calc(100% - 3px) calc(100% - 3px), calc(100% - 8px) calc(100% - 3px),
    calc(100% - 8px) 100%, 8px 100%,
    8px calc(100% - 3px), 3px calc(100% - 3px),
    3px calc(100% - 8px), 0 calc(100% - 8px),
    0 8px, 3px 8px, 3px 3px, 8px 3px
  ) !important;
  box-shadow: none !important;
  filter: none !important;
}

.floating-add-button:hover,
.floating-add-button:active {
  box-shadow: none !important;
  filter: none !important;
  transform: none;
}

.group-action-button:active {
  filter: drop-shadow(1px 1px 0 var(--yl-ink));
  transform: translate(3px, 3px);
}

/* 홈 그룹 카드는 외곽과 내부 면을 실제 요소로 분리해 선이 끊기지 않게 유지합니다. */
.group-card.pixel-step-solid {
  display: block;
  min-height: 96px;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  width: 100%;
  filter: none !important;
  box-sizing: border-box;
}

.group-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}

.group-card-surface {
  display: flex;
  min-height: 92px;
  align-items: center;
  gap: 14px;
  padding: 13px 15px;
}

.group-card:hover:not(.is-pending) .group-card-surface {
  background: #faf7ff;
}

.profile-circle.pixel-step-circle {
  --pixel-outline-width: 2px;
  background: var(--yl-ink) !important;
}

/* 바텀시트 내부: 모임통장 카드와 같은 부드러운 패널 디자인 */
:global(.youngly-modal .base-modal__header) {
  border-bottom: 0;
  background: #fff;
}

:global(.youngly-modal .base-modal__body) {
  background: transparent;
}

.group-action-description,
.account-connect-form > p,
.join-group-form > p,
.group-created-content > p,
.share-fallback-content > p {
  color: #8b8195;
}

.form-field input,
.form-field select,
.form-field textarea,
.category-options button,
.account-option,
.created-invite-code,
.join-request-message {
  border: 1.5px solid #d6cbe2;
  border-radius: 14px;
  background: #f8f5fc;
  box-shadow: none;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #8b6ab8;
  outline: 3px solid rgba(139, 106, 184, 0.16);
  outline-offset: 1px;
}

.category-options button {
  background: #fff;
  color: #71687b;
}

.category-options button.active,
.account-option.active {
  border-color: #8b6ab8;
  background: #eee8fa;
  color: #60418f;
  box-shadow: none;
}

.account-option {
  padding: 14px;
  background: #faf8fd;
}

.account-option.disabled {
  border-color: #ece7f0;
  background: #f7f5f8;
}

.account-option__bank,
.account-option__check {
  border: 0;
  border-radius: 12px;
  background: #e9e0f6;
  color: #60418f;
}

.group-action-button,
.create-group-button,
.back-step-button,
.share-invite-button,
.paste-code-button {
  border: 1.5px solid #8b6ab8;
  border-radius: 14px !important;
  box-shadow: none;
  filter: none;
  clip-path: none;
  transform: none;
}

.group-action-button::before {
  display: none;
}

.group-action-button,
.back-step-button,
.paste-code-button {
  background: #f8f5fc;
  color: #60418f;
}

.group-action-button--primary,
.create-group-button,
.share-invite-button {
  border-color: #7156ad;
  background: #7156ad;
  color: #fff;
}

.group-action-button:active,
.create-group-button:active,
.back-step-button:active,
.share-invite-button:active,
.paste-code-button:active {
  box-shadow: none;
  filter: none;
  transform: scale(0.98);
}

.created-invite-code,
.join-request-message {
  background: #f3eff9;
  color: #60418f !important;
}

.tooltip-trigger {
  border-color: #bca7dc;
  background: #f8f5fc;
  color: #7156ad;
}

.field-tooltip {
  border: 1px solid #d6cbe2;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(79, 57, 126, 0.12);
}

/* 그룹 카드 참여 상태 */
.profiles-wrap {
  width: 82px;
  min-width: 82px;
  box-sizing: border-box;
}

.member-count-label {
  display: inline-flex;
  align-self: center;
  align-items: center;
  gap: 3px;
  color: #7156ad;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.category-tag {
  border: 1px solid #d6cbe2;
  border-radius: 999px;
  background: #f4f1f8;
  color: #6f6479;
}

.status-tag,
.status-tag.completed {
  border: 1px solid #bca7dc;
  border-radius: 999px;
  background: #eee8fa;
  color: #60418f;
}

.profiles-wrap .profile-circle {
  position: relative;
  isolation: auto;
  border: 2px solid #fff !important;
  border-radius: 50% !important;
  background: var(--profile-fill, #d1c4e9) !important;
  box-shadow: none !important;
  filter: none !important;
  clip-path: none !important;
}

.profiles-wrap .profile-circle::before {
  display: none !important;
}

.profiles-wrap .profile-circle--more {
  --profile-fill: #7156ad;
  border-color: #fff !important;
  color: #fff;
}

.profiles-wrap .profile-circle.profile-circle--empty {
  --profile-fill: transparent !important;
  border: 2px dashed #8f79b8 !important;
  border-radius: 50% !important;
  background: transparent !important;
  box-shadow: none !important;
  clip-path: none !important;
  color: #7156ad;
}

.profiles-wrap .profile-circle.profile-circle--empty::before {
  display: none !important;
}

.group-card.is-pending.pixel-step-solid {
  --pixel-outline-width: 0px;
  --pixel-outline-color: transparent;
  padding: 0 !important;
  border: 2px dashed #8f79b8 !important;
  background: transparent !important;
}

.group-card.is-pending .group-card-surface {
  background: rgba(255, 255, 255, 0.8);
}

/* 오늘 인증을 끝낸 그룹은 옅은 회색 면으로 구분 */
.group-card.is-completed {
  --card-fill: #f1f1f3;
  --pixel-fill: #f1f1f3;
}

.group-card.is-completed .group-card-surface {
  background: #f1f1f3;
}

.group-card.is-completed .group-title,
.group-card.is-completed .profile-circle:not(.profile-circle--more) {
  color: #57545d;
}

.category-options button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.category-options button svg {
  flex: 0 0 auto;
  stroke: currentColor;
}

/* 상단 알림 카드 */
.alert-section {
  display: grid;
  gap: 12px;
  margin-bottom: 28px;
}

.alert-card {
  --pixel-outline-color: #5b438d;
  --pixel-fill: #7156ad;
  margin-bottom: 0;
  box-shadow: none !important;
}

.alert-card-surface {
  min-height: 82px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  background: #7156ad;
}

.alert-content {
  flex: 1;
  min-width: 0;
  gap: 11px;
}

.alert-icon-wrap {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border: 1.5px solid rgba(255, 255, 255, 0.48);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: none;
}

.alert-icon {
  color: #fff;
  font-size: 15px;
}

.alert-text h3 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 14px;
}

.alert-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
}

.action-btn {
  display: inline-flex;
  flex: 0 0 auto;
  align-self: center;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 9px 11px;
  border: 1.5px solid #fff;
  border-radius: 10px;
  background: #fff;
  color: #60418f;
  box-shadow: none;
  font-size: 12px;
}

.action-btn:active {
  box-shadow: none;
  transform: scale(0.97);
}

.deposit-alert-card {
  --pixel-outline-color: #dda0a0;
  --pixel-fill: #fff1f1;
  padding: 0;
  filter: none !important;
}

.deposit-alert-card-shadow {
  --yl-stepped-shadow-color: #efc8c8;
  --yl-stepped-shadow-offset: 5px;
}

.deposit-alert-card-surface {
  display: flex;
  min-height: 78px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #fff1f1;
}

.deposit-alert-icon-wrap {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1.5px solid #e0a0a0;
  border-radius: 10px;
  background: #ffe0e0;
  color: #a94747;
}

.deposit-alert-text h3 {
  margin: 0 0 4px;
  color: #7e3030;
  font-size: 14px;
  font-weight: 800;
}

.deposit-alert-text p {
  margin: 0;
  color: #a66565;
  font-size: 11px;
}

.deposit-action-btn {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 9px 11px;
  border: 1.5px solid #b75252;
  border-radius: 10px;
  background: #b75252;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.deposit-action-btn:active {
  transform: scale(0.97);
}

/* 초대 코드 입력창 안에는 별도 버튼 박스 없이 붙여넣기 아이콘만 노출 */
.invite-code-control .paste-code-button {
  top: 50%;
  right: 16px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  filter: none !important;
  clip-path: none !important;
  color: #7156ad;
  transform: translateY(-50%);
}

.invite-code-control .paste-code-button:active {
  transform: translateY(-50%) scale(0.94);
}

/* 그룹 생성 입력값 글자 수 및 드롭다운 표시 */
.form-field-heading {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-field-heading small {
  flex: 0 0 auto;
  color: #8c8492;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.form-field select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 46px;
  background-color: #f8f5fc;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%232f2935' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  background-size: 16px 16px;
}
</style>
