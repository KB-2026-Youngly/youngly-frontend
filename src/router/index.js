import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { pinia } from '@/stores'
import { useUserStore } from '@/stores/user'

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
    path: '/bank-home',
    name: 'BankHome',
    component: () => import('@/views/home/BankHomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding/terms',
    name: 'OnboardingIntro',
    component: () => import('@/views/onboarding/OnboardingIntroView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding/terms/agreements',
    name: 'OnboardingTerms',
    component: () => import('@/views/onboarding/OnboardingTermsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding/setup',
    name: 'OnboardingSetup',
    component: () => import('@/views/onboarding/OnboardingSetupView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/youngly-loading',
    name: 'YounglyLoading',
    component: () => import('@/views/home/YounglyLoadingView.vue'),
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true, mypageSurface: true },
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
      {
        path: 'accounts',
        name: 'AccountSettings',
        component: () => import('@/views/mypage/AccountSettingsView.vue'),
      },
      {
        path: 'settlements',
        name: 'SettlementHistory',
        component: () => import('@/views/mypage/SettlementHistoryView.vue'),
      },
      {
        path: 'password',
        name: 'PasswordChange',
        component: () => import('@/views/mypage/PasswordChangeView.vue'),
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
      {
        path: 'pension/survey',
        name: 'PensionSurvey',
        component: () => import('@/views/asset/SurveyView.vue'),
      },
    ],
  },
  {
    path: '/asset/pension/funds',
    name: 'PensionFundProducts',
    component: () => import('@/views/asset/PensionFundProductsView.vue'),
    meta: { requiresAuth: true },
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
    path: '/groups',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'GroupList',
        component: () => import('@/views/group/GroupListView.vue'),
      },
    ],
  },
  {
    path: '/groups/:id',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'GroupDetail',
        component: () => import('@/views/group/GroupDetailView.vue'),
      },
    ],
  },
  // --- develop 브랜치에서 추가한 라우트들 ---
  {
    path: '/point',
    alias: '/points',
    component: DefaultLayout,
    meta: { requiresAuth: true, mypageSurface: true },
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
    meta: { requiresAuth: true, mypageSurface: true },
    children: [
      {
        path: '',
        name: 'Characters',
        component: () => import('@/views/collectible/InventoryView.vue'),
      },
    ],
  },
  {
    path: '/demo-time',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DemoTimeControl',
        component: () => import('@/views/demo/DemoTimeControlView.vue'),
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

router.beforeEach(async (to) => {
  const userStore = useUserStore(pinia)
  const hasStoredToken = Boolean(localStorage.getItem('youngly_access_token'))
  const needsAuthentication = to.matched.some((record) => record.meta.requiresAuth)
  const shouldValidate = hasStoredToken && (needsAuthentication || to.name === 'Login')
  const isAuthenticated = shouldValidate
    ? await userStore.initializeAuth()
    : hasStoredToken

  if (needsAuthentication && !isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Login' && isAuthenticated) {
    return { name: 'BankHome' }
  }
})

export default router
