<template>
  <section class="verification-page">
    <div class="verification-content">
      <div class="verification-card-shadow yl-stepped-card-shadow">
      <form class="verification-form yl-card-frame pixel-step-card pixel-step-solid" @submit.prevent="submitVerification">
        <div class="verification-form-surface pixel-step-surface">
        <fieldset>
          <legend>인증할 그룹 선택 <small>(중복 선택 가능)</small></legend>
          <div v-for="group in groups" :key="group.id" class="verification-inner-shadow yl-stepped-card-shadow">
            <label class="group-option pixel-step-card pixel-step-solid" :class="{ selected: selectedGroupIds.includes(group.id) }">
              <span class="group-option-surface pixel-step-surface">
                <input v-model="selectedGroupIds" type="checkbox" :value="group.id" />
                <span>{{ group.icon }}</span>
                <strong>{{ group.name }}</strong>
                <b aria-hidden="true">✓</b>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>인증 사진 업로드</legend>
          <div class="verification-inner-shadow yl-stepped-card-shadow">
            <label class="photo-upload pixel-step-card pixel-step-solid" :class="{ 'has-image': imagePreview }">
              <span class="photo-upload-surface pixel-step-surface">
                <input type="file" accept="image/*" capture="environment" @change="handleImageChange" />
                <img v-if="imagePreview" :src="imagePreview" alt="업로드한 인증 사진 미리보기" />
                <template v-else>
                  <span class="camera-icon" aria-hidden="true">📷</span>
                  <strong>인증 사진 촬영 또는 업로드</strong>
                  <small>(클릭 시 카메라 또는 사진첩 열기)</small>
                </template>
              </span>
            </label>
          </div>
        </fieldset>

        <label class="comment-field">
          <span>오늘의 인증 소감</span>
          <span class="verification-inner-shadow yl-stepped-card-shadow">
            <span class="comment-input-frame pixel-step-card pixel-step-solid">
              <textarea class="pixel-step-surface" v-model.trim="comment" maxlength="120" placeholder="오늘의 챌린지 소감을 여기에 적어주세요!"></textarea>
            </span>
          </span>
          <small>{{ comment.length }}/120</small>
        </label>

        <button class="submit-button pixel-step-button" type="submit" :disabled="!canSubmit">🚀 인증 완료하고 올리기</button>
        </div>
      </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const groups = [
  { id: '1', name: '30일 매일 운동 챌린지', icon: '💪' },
  { id: '2', name: '한 달 독서 마라톤', icon: '📚' },
]
const requestedGroupId = String(route.query.groupId || '')
const selectedGroupIds = ref(groups.some((group) => group.id === requestedGroupId) ? [requestedGroupId] : [])
const imagePreview = ref('')
const comment = ref('')

const canSubmit = computed(() => selectedGroupIds.value.length > 0 && imagePreview.value && comment.value)

const handleImageChange = (event) => {
  const [file] = event.target.files || []
  if (!file) return

  const reader = new FileReader()
  reader.addEventListener('load', () => {
    imagePreview.value = String(reader.result || '')
  })
  reader.readAsDataURL(file)
}

const submitVerification = () => {
  const groupId = selectedGroupIds.value[0]
  localStorage.setItem(
    'youngly_group_verification',
    JSON.stringify({ groupId, image: imagePreview.value, comment: comment.value }),
  )
  router.push(`/groups/${groupId}`)
}
</script>

<style scoped>
.verification-page { min-height: 100%; margin: -20px; background: #e6dcf6; font-family: 'DungGeunMo', monospace; }
.verification-content { width: 100%; margin: 0 auto; padding: 12px 20px 112px; box-sizing: border-box; }
.verification-card-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 5px; }
.verification-inner-shadow { --yl-stepped-shadow-color: #c8b7e5; --yl-stepped-shadow-offset: 4px; }
.verification-form { width: 100%; --pixel-outline-width: 2px; --pixel-outline-color: #ac99d2; filter: none !important; }
.verification-form-surface { display: grid; gap: 24px; padding: 24px; background: #fff; }
fieldset { display: grid; gap: 12px; min-width: 0; margin: 0; padding: 0; border: 0; }
legend, .comment-field > span { padding: 0; color: #222; font-size: 17px; font-weight: 800; }
legend small { color: #71717a; font-size: 13px; }
.group-option { display: block; min-height: 64px; --pixel-outline-width: 2px; --pixel-outline-color: #ac99d2; --pixel-fill: #fff; filter: none !important; cursor: pointer; }
.group-option-surface { display: grid; grid-template-columns: 32px minmax(0, 1fr) 24px; gap: 10px; align-items: center; min-height: 60px; padding: 0 16px; }
.group-option.selected { --pixel-outline-color: #7156ad; --pixel-fill: #e5e2fa; }
.group-option input { position: absolute; opacity: 0; pointer-events: none; }
.group-option strong { color: #222; font-size: 17px; }
.group-option b { display: none; color: #7156ad; font-size: 22px; }
.group-option.selected b { display: block; }
.photo-upload { display: block; min-height: 210px; overflow: hidden; --pixel-outline-width: 2px; --pixel-outline-color: #ac99d2; --pixel-fill: #f0ede8; filter: none !important; color: #222; text-align: center; cursor: pointer; }
.photo-upload-surface { display: grid; min-height: 206px; place-content: center; gap: 9px; overflow: hidden; background: #f0ede8; }
.photo-upload input { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; }
.photo-upload.has-image { position: relative; display: block; --pixel-fill: #222; }
.photo-upload.has-image .photo-upload-surface { display: block; background: #222; }
.photo-upload img { width: 100%; height: 260px; display: block; object-fit: cover; }
.camera-icon { font-size: 40px; }.photo-upload strong { font-size: 17px; }.photo-upload small { color: #999; font-size: 13px; }
.comment-field { display: grid; gap: 10px; position: relative; }
.comment-input-frame { display: block; --pixel-outline-width: 2px; --pixel-outline-color: #ac99d2; --pixel-fill: #fff; filter: none !important; }
.comment-field textarea { width: 100%; min-height: 128px; resize: vertical; box-sizing: border-box; border: 0; border-radius: 0; padding: 16px; background: #fff; color: #222; font: inherit; font-size: 15px; }
.comment-field textarea:focus { outline: 3px solid rgba(113, 86, 173, 0.24); border-color: #7156ad; }
.comment-field small { justify-self: end; margin-top: -32px; margin-right: 12px; color: #888; font-size: 11px; pointer-events: none; }
.submit-button { min-height: 58px; border: 0; border-radius: 0; --pixel-outline-color: #ac99d2; --pixel-fill: #7156ad; background: #7156ad; color: #fff; font: inherit; font-size: 18px; font-weight: 800; cursor: pointer; }
.submit-button:disabled { cursor: not-allowed; opacity: 0.45; }
@media (max-width: 767px) { .verification-page { margin: 0; } .verification-content { padding: 8px 14px 112px; } .verification-form-surface { padding: 18px; } }
</style>
