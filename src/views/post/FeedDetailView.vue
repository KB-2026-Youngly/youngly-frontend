<template>
  <section class="post-detail-page">
    <div class="post-detail-content">
      <button class="back-button" type="button" @click="$router.go(-1)">← 뒤로</button>

      <article class="post-detail-card">
        <div class="post-image-wrap">
          <img :src="post.image" :alt="`${post.author} 인증 사진`" />
          <div class="post-image-shade"></div>
          <div class="post-author"><span>{{ post.initial }}</span><b>{{ post.author }}</b></div>
          <p>{{ post.message }}</p>
        </div>

        <div class="post-body">
          <div class="reaction-summary">
            <div>
              <strong>좋아요 {{ likes.length }}</strong>
              <span>{{ likes.join(', ') }}</span>
            </div>
            <div>
              <strong>싫어요 {{ dislikes.length }}</strong>
              <span>{{ dislikes.join(', ') }}</span>
            </div>
          </div>

          <div class="post-status">승인 {{ post.approvalCount }}/{{ post.memberCount }}명 · 과반수 승인 완료</div>
        </div>
      </article>

      <section class="comments-section" aria-label="댓글">
        <h2>댓글 <small>{{ comments.length }}</small></h2>
        <ul>
          <li v-for="commentItem in comments" :key="commentItem.id">
            <span>{{ commentItem.initial }}</span>
            <p><b>{{ commentItem.author }}</b>{{ commentItem.text }}</p>
          </li>
        </ul>

        <form class="comment-form" @submit.prevent="addComment">
          <input v-model.trim="newComment" maxlength="100" placeholder="따뜻한 응원 댓글을 남겨보세요" />
          <button type="submit" :disabled="!newComment">등록</button>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import verificationImage from '@/assets/photos/excercise/KakaoTalk_Photo_2026-08-08-01-50-24.jpeg'

const post = {
  author: '허경민',
  initial: '허',
  image: verificationImage,
  message: '운오완',
  approvalCount: 4,
  memberCount: 6,
}
const likes = ['김민준', '신성욱', '여강휘', '김효민']
const dislikes = ['김상우']
const comments = ref([
  { id: 1, initial: '김', author: '김민준', text: ' 오늘도 운동 완료! 멋져요 🙌' },
  { id: 2, initial: '신', author: '신성욱', text: ' 꾸준함이 최고입니다!' },
  { id: 3, initial: '여', author: '여강휘', text: ' 내일도 같이 달려요!' },
])
const newComment = ref('')

const addComment = () => {
  if (!newComment.value) return
  comments.value.push({ id: Date.now(), initial: '김', author: '김민준', text: ` ${newComment.value}` })
  newComment.value = ''
}
</script>

<style scoped>
.post-detail-page { min-height: 100%; background: #e6dcf6; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif; }
.post-detail-content { width: min(100%, 720px); margin: 0 auto; padding: 24px 20px 112px; box-sizing: border-box; }.back-button { padding: 0; border: 0; background: transparent; color: #7156ad; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }.post-detail-card { margin-top: 16px; overflow: hidden; border-radius: 22px; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.07); }.post-image-wrap { position: relative; height: min(80vw, 470px); min-height: 310px; background: #222; }.post-image-wrap img { width: 100%; height: 100%; object-fit: cover; }.post-image-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.55), transparent 44%, rgba(0,0,0,.7)); }.post-author { position: absolute; top: 18px; left: 18px; z-index: 1; display: flex; align-items: center; gap: 8px; color: #fff; }.post-author span { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; background: #7156ad; font-size: 12px; font-weight: 800; }.post-author b { font-size: 15px; }.post-image-wrap p { position: absolute; right: 20px; bottom: 18px; left: 20px; margin: 0; color: #fff; font-size: 22px; font-weight: 800; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,.75); }.post-body { padding: 18px; }.reaction-summary { display: grid; gap: 13px; }.reaction-summary div { display: grid; gap: 3px; }.reaction-summary strong { color: #222; font-size: 14px; }.reaction-summary span { color: #666; font-size: 13px; }.post-status { margin-top: 16px; padding-top: 14px; border-top: 1px solid #ece8f2; color: #7156ad; font-size: 13px; font-weight: 700; }.comments-section { margin-top: 18px; padding: 20px; border-radius: 20px; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.05); }.comments-section h2 { margin: 0 0 16px; color: #222; font-size: 18px; }.comments-section h2 small { color: #7156ad; font-size: 14px; }.comments-section ul { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }.comments-section li { display: grid; grid-template-columns: 30px 1fr; gap: 9px; align-items: start; }.comments-section li > span { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 50%; background: #e5e2fa; color: #554873; font-size: 11px; font-weight: 800; }.comments-section li p { margin: 3px 0 0; color: #555; font-size: 14px; line-height: 1.4; }.comments-section li b { margin-right: 7px; color: #222; }.comment-form { display: flex; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #ece8f2; }.comment-form input { flex: 1; min-width: 0; height: 42px; box-sizing: border-box; border: 1px solid #d9d3e4; border-radius: 12px; padding: 0 12px; font: inherit; font-size: 13px; }.comment-form button { min-width: 58px; border: 0; border-radius: 12px; background: #7156ad; color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }.comment-form button:disabled { opacity: .5; cursor: not-allowed; }
</style>
