<template>
  <section class="verification-page">
    <div class="verification-content">
      <form class="verification-form" @submit.prevent="submitVerification">
        <div class="section-card-shadow yl-stepped-card-shadow">
          <section class="verification-section-card yl-card-frame pixel-step-card pixel-step-solid" :aria-busy="groupsLoading">
            <div class="verification-section-surface pixel-step-surface">
              <h2 class="section-title">인증할 그룹 선택 <small>(중복 선택 가능)</small></h2>
              <p v-if="groupsLoading" class="form-state">그룹을 불러오는 중...</p>
              <p v-else-if="groupsError" class="form-state form-state--error">{{ groupsError }}</p>
              <p v-else-if="groups.length === 0" class="form-state">현재 인증 가능한 그룹이 없습니다.</p>
              <div class="group-options">
                <label
                  v-for="group in groups"
                  :key="group.id"
                  class="group-option"
                  :class="{
                    selected: selectedGroupIds.includes(group.id),
                    'is-disabled': group.verifiedToday || group.verificationCheckFailed,
                  }"
                >
                  <input
                    v-model="selectedGroupIds"
                    type="checkbox"
                    :value="group.id"
                    :disabled="group.verifiedToday"
                  />
                  <span class="group-icon" aria-hidden="true">
                    <component :is="group.icon" :size="16" :stroke-width="2" />
                  </span>
                  <span class="group-option-copy">
                    <strong>{{ group.name }}</strong>
                    <small v-if="group.verifiedToday">오늘 인증 완료</small>
                    <small v-else-if="group.verificationCheckFailed">인증 여부 확인 필요</small>
                  </span>
                  <span v-if="group.verifiedToday" class="group-complete" aria-label="오늘 인증 완료">완료</span>
                  <span v-else class="group-check" aria-hidden="true">✓</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div class="section-card-shadow yl-stepped-card-shadow">
          <section class="verification-section-card yl-card-frame pixel-step-card pixel-step-solid">
            <div class="verification-section-surface pixel-step-surface">
              <h2 class="section-title">인증 사진 촬영</h2>
              <button class="photo-upload" :class="{ 'has-image': imagePreview }" type="button" @click="openCamera">
                <img v-if="imagePreview" :src="imagePreview" alt="촬영한 인증 사진 미리보기" />
                <template v-else>
                  <Camera class="camera-icon" :size="38" :stroke-width="1.8" aria-hidden="true" />
                  <small>카메라 열기</small>
                </template>
              </button>
              <input ref="nativeCameraInput" class="gallery-input" type="file" accept="image/*" capture="environment" @change="handleImageChange" />
            </div>
          </section>
        </div>

        <div class="section-card-shadow yl-stepped-card-shadow">
          <section class="verification-section-card yl-card-frame pixel-step-card pixel-step-solid">
            <div class="verification-section-surface comment-section pixel-step-surface">
              <div class="comment-heading">
                <h2>내용 작성</h2>
                <span aria-live="polite">{{ comment.length }}/20</span>
              </div>
              <textarea v-model="comment" maxlength="20" placeholder="인증 내용을 입력해 주세요"></textarea>
            </div>
          </section>
        </div>

        <p v-if="submitError" class="form-state form-state--error" role="alert">{{ submitError }}</p>
        <p v-if="submitComplete" class="form-state form-state--success" role="status">인증 게시글 등록 완료</p>
        <button class="submit-button pixel-step-button" type="submit" :disabled="!canSubmit">
          {{ submitting ? '업로드 중...' : '인증 완료하고 올리기' }}
        </button>
      </form>
    </div>

    <Teleport to="body">
      <div v-if="cameraOpen" class="camera-screen" role="dialog" aria-modal="true" aria-label="인증 사진 촬영">
        <header class="camera-header">
          <button type="button" aria-label="카메라 닫기" @click="closeCamera">
            <X :size="27" :stroke-width="2.2" />
          </button>
          <strong>인증 사진</strong>
          <span aria-hidden="true"></span>
        </header>

        <main class="camera-stage">
          <div class="camera-frame" :class="{ 'has-error': cameraError }">
            <video ref="cameraVideo" autoplay muted playsinline></video>
            <div class="camera-shade" aria-hidden="true"></div>
            <p v-if="cameraLoading" class="camera-message">카메라 준비 중...</p>
            <div v-else-if="cameraError" class="camera-error">
              <CameraOff :size="38" :stroke-width="1.8" aria-hidden="true" />
              <strong>카메라를 열 수 없어요</strong>
              <small>{{ cameraError }}</small>
            </div>
          </div>
          <p class="camera-guide">프레임 안에 인증 내용을 맞춰 주세요</p>
        </main>

        <footer class="camera-controls">
          <button class="camera-capture-button" type="button" aria-label="사진 촬영" :disabled="cameraLoading || !!cameraError" @click="capturePhoto">
            <span></span>
          </button>
          <button class="camera-side-button" type="button" aria-label="전후면 카메라 전환" :disabled="cameraLoading || !!cameraError" @click="switchCamera">
            <SwitchCamera :size="27" :stroke-width="2" />
            <span>전환</span>
          </button>
        </footer>
        <canvas ref="captureCanvas" class="capture-canvas" aria-hidden="true"></canvas>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BookOpen, CalendarCheck2, Camera, CameraOff, Dumbbell, GraduationCap, Shapes, SwitchCamera, X } from 'lucide-vue-next'
import { getGroups, getGroupDetail, getGroupRounds } from '@/api/group'
import { createVerificationPost, getVerificationFeed } from '@/api/post'

const route = useRoute()
const router = useRouter()
const requestedGroupId = String(route.query.groupId || '')
const groups = ref([])
const groupsLoading = ref(false)
const groupsError = ref('')
const selectedGroupIds = ref([])
const imageFile = ref(null)
const imagePreview = ref('')
const nativeCameraInput = ref(null)
const cameraVideo = ref(null)
const captureCanvas = ref(null)
const cameraOpen = ref(false)
const cameraLoading = ref(false)
const cameraError = ref('')
const cameraFacingMode = ref('environment')
let cameraStream = null
const comment = ref('')
const submitting = ref(false)
const submitError = ref('')
const submitComplete = ref(false)

const canSubmit = computed(() => (
  selectedGroupIds.value.length > 0
  && imageFile.value
  && !submitting.value
  && !groupsLoading.value
))

const categoryIcons = {
  EXERCISE: Dumbbell,
  READING: BookOpen,
  STUDY: GraduationCap,
  HABIT: CalendarCheck2,
  CUSTOM: Shapes,
  DRAFT: Shapes,
}

const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentUserIds = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('youngly_user') || '{}')
    return [currentUser.userId, currentUser.loginId]
      .filter(Boolean)
      .map((id) => String(id))
  } catch {
    return []
  }
}

const getApiErrorMessage = (error, fallback) => (
  error?.response?.data?.message || fallback
)

const canUseInlineCamera = () => {
  const { protocol, hostname } = window.location
  const isLocalhost = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'

  return (protocol === 'https:' || isLocalhost)
    && window.isSecureContext
    && !!navigator.mediaDevices?.getUserMedia
}

const loadVerificationGroups = async () => {
  groupsLoading.value = true
  groupsError.value = ''

  try {
    const response = await getGroups()
    const groupList = Array.isArray(response.data) ? response.data : []
    const ongoingGroups = groupList.filter((group) => group.groupStatus === 'ONGOING')

    const results = await Promise.allSettled(
      ongoingGroups.map(async (group) => {
        const [detailResponse, roundsResponse] = await Promise.all([
          getGroupDetail(group.groupId),
          getGroupRounds(group.groupId),
        ])
        const detail = detailResponse.data || {}
        const rounds = Array.isArray(roundsResponse.data) ? roundsResponse.data : []
        const ongoingRound = rounds.find((round) => round.roundStatus === 'ONGOING')

        if (!ongoingRound?.roundId) return null

        let verifiedToday = false
        let verificationCheckFailed = false
        try {
          const feedResponse = await getVerificationFeed({
            roundId: ongoingRound.roundId,
            date: formatLocalDate(new Date()),
          })
          const currentUserIds = getCurrentUserIds()
          const posts = Array.isArray(feedResponse.data) ? feedResponse.data : []
          verifiedToday = posts.some((post) => (
            currentUserIds.includes(String(post.userId || ''))
            && String(post.postStatus || '').toUpperCase() !== 'NONE'
            && Boolean(post.photoUrl)
          ))
        } catch (error) {
          verificationCheckFailed = true
          console.error(`${group.groupName || group.groupId} 인증 여부 확인 실패:`, error)
        }

        return {
          id: String(group.groupId),
          roundId: ongoingRound.roundId,
          name: detail.groupName || group.groupName || '이름 없는 그룹',
          icon: categoryIcons[detail.challengeType] || categoryIcons.CUSTOM,
          verifiedToday,
          verificationCheckFailed,
        }
      }),
    )

    groups.value = results
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => result.value)

    selectedGroupIds.value = selectedGroupIds.value.filter((groupId) => (
      groups.value.some((group) => group.id === groupId && !group.verifiedToday)
    ))

    if (requestedGroupId && groups.value.some((group) => (
      group.id === requestedGroupId && !group.verifiedToday
    ))) {
      selectedGroupIds.value = [requestedGroupId]
    }
  } catch (error) {
    groups.value = []
    groupsError.value = getApiErrorMessage(error, '인증할 그룹을 불러오지 못했습니다.')
    console.error('인증 그룹 조회 실패:', error)
  } finally {
    groupsLoading.value = false
  }
}

const cropImageFile = (file) => new Promise((resolve) => {
  const sourceUrl = URL.createObjectURL(file)
  const image = new Image()

  image.onload = () => {
    const targetRatio = 1.15
    const sourceRatio = image.naturalWidth / image.naturalHeight
    let sourceWidth = image.naturalWidth
    let sourceHeight = image.naturalHeight
    let sourceX = 0
    let sourceY = 0

    if (sourceRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio
      sourceX = (image.naturalWidth - sourceWidth) / 2
    } else {
      sourceHeight = image.naturalWidth / targetRatio
      sourceY = (image.naturalHeight - sourceHeight) / 2
    }

    const canvas = document.createElement('canvas')
    canvas.width = 1150
    canvas.height = 1000
    canvas.getContext('2d').drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    canvas.toBlob((blob) => {
      URL.revokeObjectURL(sourceUrl)
      resolve(blob
        ? new File([blob], `verification-${Date.now()}.jpg`, { type: 'image/jpeg' })
        : file)
    }, 'image/jpeg', 0.9)
  }

  image.onerror = () => {
    URL.revokeObjectURL(sourceUrl)
    resolve(file)
  }
  image.src = sourceUrl
})

const renderImagePreview = async (file) => {
  const previousPreview = imagePreview.value

  imagePreview.value = ''
  imageFile.value = file
  await nextTick()

  if (previousPreview?.startsWith('blob:')) {
    URL.revokeObjectURL(previousPreview)
  }

  imagePreview.value = URL.createObjectURL(file)
  await nextTick()

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })
}

const handleImageChange = async (event) => {
  const [file] = event.target.files || []
  if (!file) return

  const croppedFile = await cropImageFile(file)
  await renderImagePreview(croppedFile)
  event.target.value = ''
  submitError.value = ''
  submitComplete.value = false
  closeCamera()
}

const stopCameraStream = () => {
  cameraStream?.getTracks().forEach((track) => track.stop())
  cameraStream = null
  if (cameraVideo.value) cameraVideo.value.srcObject = null
}

const startCamera = async () => {
  stopCameraStream()
  cameraLoading.value = true
  cameraError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = '카메라 촬영은 HTTPS 또는 localhost 환경에서 이용할 수 있어요.'
    cameraLoading.value = false
    return
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: cameraFacingMode.value },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    })
    if (!cameraOpen.value) {
      stopCameraStream()
      return
    }
    if (cameraVideo.value) {
      cameraVideo.value.srcObject = cameraStream
      await cameraVideo.value.play()
    }
  } catch (error) {
    cameraError.value = error?.name === 'NotAllowedError'
      ? '카메라 권한을 허용해 주세요.'
      : '카메라 연결 상태를 확인해 주세요.'
  } finally {
    cameraLoading.value = false
  }
}

const openNativeCamera = () => {
  if (!nativeCameraInput.value) return
  nativeCameraInput.value.value = ''
  nativeCameraInput.value.click()
}

const setCameraNavigationHidden = (hidden) => {
  window.dispatchEvent(new CustomEvent('youngly-bottom-nav-visibility', {
    detail: { id: 'feed-write-camera', hidden },
  }))
}

const openCamera = async () => {
  // IP 주소로 접속한 HTTP 페이지에서는 getUserMedia가 차단되므로
  // 오류 화면 대신 운영체제의 카메라를 즉시 연다.
  if (!canUseInlineCamera()) {
    openNativeCamera()
    return
  }

  cameraOpen.value = true
  setCameraNavigationHidden(true)
  document.body.style.overflow = 'hidden'
  await nextTick()
  await startCamera()
}

const closeCamera = () => {
  stopCameraStream()
  cameraOpen.value = false
  setCameraNavigationHidden(false)
  cameraLoading.value = false
  document.body.style.overflow = ''
}


const switchCamera = async () => {
  cameraFacingMode.value = cameraFacingMode.value === 'environment' ? 'user' : 'environment'
  await startCamera()
}

const capturePhoto = () => {
  const video = cameraVideo.value
  const canvas = captureCanvas.value
  if (!video || !canvas || !video.videoWidth || !video.videoHeight) return

  const targetRatio = 1.15
  const sourceRatio = video.videoWidth / video.videoHeight
  let sourceWidth = video.videoWidth
  let sourceHeight = video.videoHeight
  let sourceX = 0
  let sourceY = 0

  if (sourceRatio > targetRatio) {
    sourceWidth = video.videoHeight * targetRatio
    sourceX = (video.videoWidth - sourceWidth) / 2
  } else {
    sourceHeight = video.videoWidth / targetRatio
    sourceY = (video.videoHeight - sourceHeight) / 2
  }

  canvas.width = 1150
  canvas.height = 1000
  const context = canvas.getContext('2d')
  context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
  canvas.toBlob(async (blob) => {
    if (!blob) return
    const capturedFile = new File([blob], `verification-${Date.now()}.jpg`, { type: 'image/jpeg' })
    await renderImagePreview(capturedFile)
    submitError.value = ''
    submitComplete.value = false
    closeCamera()
  }, 'image/jpeg', 0.9)
}

const submitVerification = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  submitError.value = ''
  submitComplete.value = false

  try {
    const selectedGroups = groups.value.filter((group) => selectedGroupIds.value.includes(group.id))

    await Promise.all(
      selectedGroups.map((group) => createVerificationPost({
        roundId: group.roundId,
        content: comment.value.trim(),
        imageFile: imageFile.value,
      })),
    )

    submitComplete.value = true
    const destinationGroupId = selectedGroups[0]?.id
    if (destinationGroupId) {
      window.setTimeout(() => router.push(`/groups/${destinationGroupId}`), 650)
    }
  } catch (error) {
    submitError.value = getApiErrorMessage(error, '인증 게시글 등록에 실패했습니다.')
    console.error('인증 게시글 등록 실패:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(loadVerificationGroups)
onBeforeUnmount(() => {
  stopCameraStream()
  setCameraNavigationHidden(false)
  document.body.style.overflow = ''
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})
</script>

<style scoped>
.verification-page {
  min-height: 100%;
  margin: -20px;
  background: #e6dcf6;
  font-family: 'YounglyNeoPixel', monospace;
}

.verification-content {
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 12px 20px 112px;
}

.verification-form {
  display: grid;
  gap: 20px;
  width: 100%;
}

.section-card-shadow {
  --yl-stepped-shadow-color: #c8b7e5;
  --yl-stepped-shadow-offset: 5px;
}

.verification-section-card {
  width: 100%;
  --pixel-outline-width: 2px;
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #fff;
  filter: none !important;
}

.verification-section-surface {
  display: grid;
  gap: 14px;
  padding: 20px;
  background: #fff;
}

.section-title,
.comment-heading h2 {
  margin: 0;
  padding: 0;
  color: #222;
  font: inherit;
  font-size: 17px;
  font-weight: 800;
}

.section-title small {
  color: #817a88;
  font-size: 12px;
}

.group-options {
  display: grid;
  gap: 10px;
}

.group-option {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 24px;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  box-sizing: border-box;
  padding: 8px 14px;
  border: 1.5px solid #d8cee8;
  border-radius: 14px;
  background: #faf8fd;
  cursor: pointer;
}

.group-option.selected {
  border-color: #8b6ab8;
  background: #eee8fa;
}

.group-option.is-disabled {
  border-color: #ddd7e3;
  background: #f1eef3;
  cursor: not-allowed;
  opacity: 0.72;
}

.group-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.group-icon {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  background: #eee8fa;
  color: #7156ad;
  font-size: 14px;
}

.group-option-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.group-option-copy strong {
  overflow: hidden;
  color: #222;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-option-copy small {
  color: #77717c;
  font-size: 11px;
  font-weight: 700;
}

.group-check {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1.5px solid #d6cbe2;
  border-radius: 50%;
  color: transparent;
  font-size: 13px;
  font-weight: 800;
}

.group-option.selected .group-check {
  border-color: #7156ad;
  background: #7156ad;
  color: #fff;
}

.group-complete {
  justify-self: end;
  padding: 5px 7px;
  border: 1px solid #bdb4c6;
  border-radius: 999px;
  background: #e5e1e8;
  color: #6e6873;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.photo-upload {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 0;
  aspect-ratio: 1.15 / 1;
  box-sizing: border-box;
  place-content: center;
  gap: 8px;
  overflow: hidden;
  border: 1.5px dashed #9f8abc;
  border-radius: 16px;
  background: #f7f3fa;
  color: #222;
  text-align: center;
  cursor: pointer;
  font: inherit;
}

.gallery-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.photo-upload.has-image {
  display: block;
  border-style: solid;
  background: #222;
}

.photo-upload img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-icon {
  justify-self: center;
  font-size: 38px;
}
.photo-upload strong { font-size: 16px; }
.photo-upload small { color: #8c8492; font-size: 12px; }

.camera-screen {
  position: fixed;
  z-index: 3000;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  background: #f8f6fb;
  color: #222;
  font-family: 'YounglyNeoPixel', monospace;
}

.camera-header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  min-height: 64px;
  padding: max(8px, env(safe-area-inset-top)) 16px 6px;
}

.camera-header button,
.camera-side-button {
  display: grid;
  border: 0;
  background: transparent;
  color: #2d2832;
  font: inherit;
  cursor: pointer;
}

.camera-header button {
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 3px 14px rgba(38, 25, 57, 0.1);
}

.camera-header strong {
  overflow: hidden;
  font-size: 18px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.camera-stage {
  display: flex;
  min-height: 0;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 10px 18px;
}

.camera-frame {
  position: relative;
  width: min(100%, 720px);
  aspect-ratio: 1.15 / 1;
  overflow: hidden;
  border: 3px solid #ac99d2;
  border-radius: 0;
  background: #17141b;
  box-shadow: none;
  filter: drop-shadow(6px 7px 0 #c8b7e5);
  clip-path: polygon(
    12px 0, calc(100% - 12px) 0,
    calc(100% - 12px) 3px, calc(100% - 4px) 3px,
    calc(100% - 4px) 12px, 100% 12px,
    100% calc(100% - 12px), calc(100% - 4px) calc(100% - 12px),
    calc(100% - 4px) calc(100% - 4px), calc(100% - 12px) calc(100% - 4px),
    calc(100% - 12px) 100%, 12px 100%,
    12px calc(100% - 4px), 4px calc(100% - 4px),
    4px calc(100% - 12px), 0 calc(100% - 12px),
    0 12px, 4px 12px, 4px 3px, 12px 3px
  );
}

.camera-frame video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-shade {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 0;
  pointer-events: none;
}

.camera-message,
.camera-error {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  place-content: center;
  margin: 0;
  padding: 24px;
  background: #211d25;
  color: #fff;
  text-align: center;
}

.camera-message {
  font-size: 14px;
}

.camera-error {
  justify-items: center;
  gap: 10px;
}

.camera-error strong { font-size: 16px; }
.camera-error small { max-width: 280px; color: #c9c2cd; font-size: 12px; line-height: 1.5; }
.camera-error button {
  min-height: 40px;
  margin-top: 4px;
  padding: 0 16px;
  border: 1.5px solid #b99adb;
  border-radius: 12px;
  background: #fff;
  color: #60418f;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}

.camera-guide {
  margin: 0;
  color: #746d7a;
  font-size: 12px;
  text-align: center;
}

.camera-controls {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px max(18px, env(safe-area-inset-bottom));
}

.camera-side-button {
  position: absolute;
  right: 24px;

  justify-items: center;
  gap: 5px;
  min-width: 58px;
  padding: 8px;
}

.camera-side-button span {
  font-size: 10px;
  font-weight: 700;
}

.camera-side-button:disabled {
  opacity: 0.35;
}

.camera-capture-button {
  display: grid;
  width: 76px;
  height: 76px;
  padding: 6px;
  place-items: center;
  border: 3px solid #7156ad;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 0 #d0bce8;
  cursor: pointer;
}

.camera-capture-button span {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #7156ad;
}

.camera-capture-button:active:not(:disabled) {
  transform: scale(0.95);
}

.camera-capture-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.capture-canvas {
  position: fixed;
  width: 1px;
  height: 1px;
  pointer-events: none;
  opacity: 0;
}

.comment-section {
  gap: 10px;
}

.comment-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.comment-heading span {
  color: #817a88;
  font-size: 12px;
  font-weight: 700;
}

.comment-section textarea {
  width: 100%;
  min-height: 104px;
  box-sizing: border-box;
  padding: 14px;
  border: 1.5px solid #d8cee8;
  border-radius: 14px;
  outline: 0;
  background: #faf8fd;
  color: #222;
  font: inherit;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
}

.comment-section textarea:focus {
  border-color: #8b6ab8;
  outline: 3px solid rgba(139, 106, 184, 0.15);
}

.comment-section textarea::placeholder {
  color: #aaa2b0;
}

.submit-button {
  min-height: 58px;
  border: 0;
  border-radius: 0;
  --pixel-outline-color: #ac99d2;
  --pixel-fill: #7156ad;
  background: #7156ad;
  color: #fff;
  font: inherit;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.form-state {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #d8cee8;
  border-radius: 12px;
  background: #f8f5fc;
  color: #625d69;
  font-size: 13px;
  line-height: 1.45;
}

.form-state--error {
  border-color: #e5a3a3;
  background: #fff0f0;
  color: #a33b3b;
}

.form-state--success {
  border-color: #8fc7a4;
  background: #eefaf2;
  color: #277143;
  text-align: center;
}

@media (max-width: 767px) {
  .verification-page { margin: 0; }
  .verification-content { padding: 8px 14px 112px; }
  .verification-form { gap: 17px; }
  .verification-section-surface { padding: 17px; }
}

@media (orientation: landscape) and (max-height: 600px) {
  .camera-header { min-height: 48px; padding-top: 4px; }
  .camera-stage { padding-block: 4px; }
  .camera-frame { width: min(64vw, 620px); max-height: calc(100dvh - 145px); }
  .camera-guide { display: none; }
  .camera-controls { position: absolute; right: 16px; bottom: 10px; grid-template-columns: repeat(3, 64px); padding: 0; }
  .camera-capture-button { width: 58px; height: 58px; }
  .camera-capture-button span { width: 43px; height: 43px; }
}
</style>
