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
    path: '/mypage',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'MyPage',
        component: () => import('@/views/mypage/MyPageView.vue'),
      },
      {
        path: 'profile',
        name: 'ProfileEdit',
        component: () => import('@/views/mypage/ProfileEditView.vue'),
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
      {
        path: 'moim/:moimAccountId',
        name: 'MoimAccountDetail',
        component: () => import('@/views/asset/MoimAccountDetailView.vue'),
      },
      {
        path: 'pension/insight',
        name: 'PensionInsight',
        component: () => import('@/views/asset/PensionInsightView.vue'),
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
  // --- feature 브랜치에서 추가한 라우트들 ---
  {
    path: '/feed/write',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'FeedWrite',
        component: () => import('@/views/post/FeedWriteView.vue'),
      },
    ],
  },
  {
    path: '/posts/:id',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'FeedDetail',
        component: () => import('@/views/post/FeedDetailView.vue'),
      },
    ],
  },
  {
    path: '/groups',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'GroupList',
        component: () => import('@/views/group/GroupListView.vue')
      }
    ]
  },
  {
    path: '/groups/:id',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'GroupDetail',
        component: () => import('@/views/group/GroupDetailView.vue')
      }
    ]
  },
  // --- develop 브랜치에서 추가한 라우트들 ---
  {
    path: '/point',
    alias: '/points',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Point',
        component: () => import('@/views/point/PointView.vue'),
      },
    ],
  },
  {
    path: '/characters',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Characters',
        component: () => import('@/views/collectible/InventoryView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
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
