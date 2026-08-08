<template>
  <section class="verification-page">
    <div class="verification-content">
      <form class="verification-form" @submit.prevent="submitVerification">
        <fieldset>
          <legend>인증할 그룹 선택 <small>(중복 선택 가능)</small></legend>
          <label v-for="group in groups" :key="group.id" class="group-option" :class="{ selected: selectedGroupIds.includes(group.id) }">
            <input v-model="selectedGroupIds" type="checkbox" :value="group.id" />
            <span>{{ group.icon }}</span>
            <strong>{{ group.name }}</strong>
            <b aria-hidden="true">✓</b>
          </label>
        </fieldset>

        <fieldset>
          <legend>인증 사진 업로드</legend>
          <label class="photo-upload" :class="{ 'has-image': imagePreview }">
            <input type="file" accept="image/*" capture="environment" @change="handleImageChange" />
            <img v-if="imagePreview" :src="imagePreview" alt="업로드한 인증 사진 미리보기" />
            <template v-else>
              <span class="camera-icon" aria-hidden="true">📷</span>
              <strong>인증 사진 촬영 또는 업로드</strong>
              <small>(클릭 시 카메라 또는 사진첩 열기)</small>
            </template>
          </label>
        </fieldset>

        <label class="comment-field">
          <span>오늘의 인증 소감</span>
          <textarea v-model.trim="comment" maxlength="120" placeholder="오늘의 챌린지 소감을 여기에 적어주세요!"></textarea>
          <small>{{ comment.length }}/120</small>
        </label>

        <button class="submit-button" type="submit" :disabled="!canSubmit">🚀 인증 완료하고 올리기</button>
      </form>
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
.verification-page { min-height: 100%; background: #e6dcf6; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif; }
.verification-content { width: min(100%, 720px); margin: 0 auto; padding: 24px 20px 112px; box-sizing: border-box; }
.verification-form { display: grid; gap: 24px; padding: 26px; border-radius: 24px; background: #fff; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); }
fieldset { display: grid; gap: 12px; min-width: 0; margin: 0; padding: 0; border: 0; }
legend, .comment-field > span { padding: 0; color: #222; font-size: 17px; font-weight: 800; }
legend small { color: #71717a; font-size: 13px; }
.group-option { display: grid; grid-template-columns: 32px minmax(0, 1fr) 24px; gap: 10px; align-items: center; min-height: 64px; padding: 0 18px; border: 2px solid #222; border-radius: 16px; background: #fff; cursor: pointer; }
.group-option.selected { border-color: #7156ad; background: #e5e2fa; }
.group-option input { position: absolute; opacity: 0; pointer-events: none; }
.group-option strong { color: #222; font-size: 17px; }
.group-option b { display: none; color: #7156ad; font-size: 22px; }
.group-option.selected b { display: block; }
.photo-upload { display: grid; min-height: 210px; place-content: center; gap: 9px; overflow: hidden; border: 3px dashed #444; border-radius: 18px; background: #f0ede8; color: #222; text-align: center; cursor: pointer; }
.photo-upload input { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; }
.photo-upload.has-image { position: relative; display: block; border-style: solid; background: #222; }
.photo-upload img { width: 100%; height: 260px; display: block; object-fit: cover; }
.camera-icon { font-size: 40px; }.photo-upload strong { font-size: 17px; }.photo-upload small { color: #999; font-size: 13px; }
.comment-field { display: grid; gap: 10px; position: relative; }
.comment-field textarea { min-height: 128px; resize: vertical; box-sizing: border-box; border: 2px solid #222; border-radius: 16px; padding: 16px; color: #222; font: inherit; font-size: 15px; }
.comment-field textarea:focus { outline: 3px solid rgba(113, 86, 173, 0.24); border-color: #7156ad; }
.comment-field small { justify-self: end; margin-top: -32px; margin-right: 12px; color: #888; font-size: 11px; pointer-events: none; }
.submit-button { min-height: 58px; border: 0; border-radius: 16px; background: #7156ad; color: #fff; font: inherit; font-size: 18px; font-weight: 800; cursor: pointer; }
.submit-button:disabled { cursor: not-allowed; opacity: 0.45; }
@media (max-width: 767px) { .verification-content { padding: 22px 20px 112px; } .verification-form { padding: 20px; } }
</style>
