import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { useUserStore } from './stores/user'
import { getDemoTime } from './api/demoTime'
import { syncDemoTime } from './utils/demoTime'
import './styles/main.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

window.addEventListener('youngly:auth-expired', () => {
  useUserStore(pinia).clearAuth()
  const currentRoute = router.currentRoute.value
  if (currentRoute.name !== 'Login') {
    router.replace({ name: 'Login', query: { redirect: currentRoute.fullPath } })
  }
})

// 서버가 시연 날짜를 사용 중이면 새로고침하거나 다른 기기에서 접속해도
// 화면의 오늘 날짜 기준을 서버와 다시 맞춥니다.
getDemoTime()
  .then(({ data }) => syncDemoTime(data))
  .catch(() => {})

app.mount('#app')
