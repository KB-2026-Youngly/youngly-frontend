import apiClient from './client'

export function getNotifications() {
  return apiClient.get('/notifications')
}

export function readNotification(notificationId) {
  return apiClient.put(`/notifications/${notificationId}/read`)
}
