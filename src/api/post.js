import apiClient from './client'

export const getMyCertificationPosts = (params) => apiClient.get('/posts/mine', { params })
export function getVerificationFeed({ roundId, date }) {
  return apiClient.get(`/posts/groups/${roundId}`, {
    params: { date },
  })
}

export function getVerificationPostDetail(postId) {
  return apiClient.get(`/posts/${postId}/details`)
}

export function deleteVerificationPost(postId) {
  return apiClient.delete(`/posts/${postId}`)
}

export function createPostComment({ postId, content }) {
  return apiClient.post(`/posts/${postId}/comments`, { content })
}

export function setPostReaction({ postId, reactionType }) {
  return apiClient.put(`/posts/${postId}/reaction`, { reactionType })
}

export function deletePostReaction(postId) {
  return apiClient.delete(`/posts/${postId}/reaction`)
}

export function createVerificationPost({ roundId, content, imageFile }) {
  const formData = new FormData()
  formData.append('roundId', String(roundId))
  formData.append('content', content || '')
  formData.append('imageFile', imageFile)

  return apiClient.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function reviewVerificationPost({ postId, approvalStatus, rejectReason = null }) {
  return apiClient.patch(`/posts/${postId}/approval`, {
    approvalStatus,
    rejectReason,
  })
}
