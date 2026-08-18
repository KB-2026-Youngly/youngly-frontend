import apiClient from './client'

export const getMyCertificationPosts = (params) => apiClient.get('/posts/mine', { params })
