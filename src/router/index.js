import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/signup/terms',
    name: 'SignupTerms',
    component: () => import('@/views/auth/SignupTermsView.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/auth/SignupView.vue'),
  },
  {
    path: '/home',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/HomeView.vue'),
      },
    ],
  },
  {
    path: '/asset',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Asset',
        component: () => import('@/views/asset/AssetView.vue'),
      },
    ],
  },
  {
    path: '/calendar',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Calendar',
        component: () => import('@/views/calendar/CalendarView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const accessToken = localStorage.getItem('youngly_access_token')

  if (to.matched.some((record) => record.meta.requiresAuth) && !accessToken) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Login' && accessToken) {
    return { name: 'Home' }
  }
})

export default router
