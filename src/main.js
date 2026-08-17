import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { useUserStore } from './stores/user'
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

app.mount('#app')
