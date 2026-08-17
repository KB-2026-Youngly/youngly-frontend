import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('youngly_access_token')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('youngly_access_token')
      localStorage.removeItem('youngly_user')
      window.dispatchEvent(new CustomEvent('youngly:auth-expired'))
    }
    return Promise.reject(error)
  },
)

export default apiClient
