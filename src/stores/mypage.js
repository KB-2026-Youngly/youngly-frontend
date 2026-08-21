import { defineStore } from 'pinia'
import { getGroups } from '@/api/group'
import { getMyCertificationPosts } from '@/api/post'
import { getGroupRounds, getRoundSettlements } from '@/api/round'

const POST_HISTORY_START_DATE = '1000-01-01'
const VIEWABLE_MEMBERSHIP_STATUSES = new Set(['ACTIVE', 'PENDING_DEPOSIT'])

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback

const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isViewableGroup = (group) =>
  Boolean(group?.leader) || VIEWABLE_MEMBERSHIP_STATUSES.has(group?.myMembershipStatus)

const settlementTimestamp = (settlement) => {
  const timestamp = new Date(settlement.createdAt).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

let activityRequest = null
let settlementRequest = null

export const useMyPageStore = defineStore('mypage', {
  state: () => ({
    approvedCount: null,
    rejectedCount: null,
    isActivityLoading: false,
    activityError: '',
    activityLoaded: false,
    settlementGroups: [],
    isSettlementLoading: false,
    settlementError: '',
    settlementWarning: '',
    settlementsLoadedForUserId: null,
  }),

  actions: {
    async fetchActivitySummary(force = false) {
      if (!force && this.activityLoaded) return true
      if (activityRequest) return activityRequest

      activityRequest = this.loadActivitySummary()
      try {
        return await activityRequest
      } finally {
        activityRequest = null
      }
    },

    async loadActivitySummary() {
      this.isActivityLoading = true
      this.activityError = ''

      try {
        const { data } = await getMyCertificationPosts({
          from: POST_HISTORY_START_DATE,
          to: formatLocalDate(new Date()),
        })
        const posts = Array.isArray(data) ? data : []

        this.approvedCount = posts.filter((post) => post?.postStatus === 'APPROVED').length
        this.rejectedCount = posts.filter((post) => post?.postStatus === 'REJECTED').length
        this.activityLoaded = true
        return true
      } catch (error) {
        this.approvedCount = null
        this.rejectedCount = null
        this.activityLoaded = false
        this.activityError = getErrorMessage(
          error,
          '승인 및 반려 횟수를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        return false
      } finally {
        this.isActivityLoading = false
      }
    },

    async fetchSettlementOverview(userId, force = false) {
      if (!userId) {
        this.settlementGroups = []
        this.settlementWarning = ''
        this.settlementError = '로그인 사용자 정보를 확인할 수 없어요.'
        return false
      }
      const normalizedUserId = String(userId)
      if (!force && this.settlementsLoadedForUserId === normalizedUserId) return true
      if (settlementRequest) return settlementRequest

      settlementRequest = this.loadSettlementOverview(normalizedUserId)
      try {
        return await settlementRequest
      } finally {
        settlementRequest = null
      }
    },

    async loadSettlementOverview(userId) {
      this.isSettlementLoading = true
      this.settlementError = ''
      this.settlementWarning = ''

      try {
        const { data: groupData } = await getGroups()
        const groups = Array.isArray(groupData)
          ? [
              ...new Map(
                groupData
                  .filter((group) => group?.groupId && isViewableGroup(group))
                  .map((group) => [String(group.groupId), group]),
              ).values(),
            ]
          : []

        const groupRoundResults = await Promise.allSettled(
          groups.map(async (group) => {
            const { data } = await getGroupRounds(group.groupId)
            return {
              group,
              rounds: Array.isArray(data) ? data : [],
            }
          }),
        )
        const groupRounds = groupRoundResults
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)
        const failedGroupRoundResults = groupRoundResults.filter(
          (result) => result.status === 'rejected',
        )

        if (groups.length && !groupRounds.length) throw failedGroupRoundResults[0].reason

        const roundsById = new Map()
        groupRounds.forEach(({ group, rounds }) => {
          rounds.forEach((round) => {
            if (round?.roundId == null || roundsById.has(String(round.roundId))) return
            roundsById.set(String(round.roundId), { groupId: group.groupId, round })
          })
        })

        const settlementResults = await Promise.allSettled(
          [...roundsById.values()].map(async ({ round }) => {
            const { data } = await getRoundSettlements(round.roundId)
            return [String(round.roundId), Array.isArray(data) ? data : []]
          }),
        )
        const successfulSettlementResults = settlementResults
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)
        const failedSettlementResults = settlementResults.filter(
          (result) => result.status === 'rejected',
        )

        if (roundsById.size && !successfulSettlementResults.length) {
          throw failedSettlementResults[0].reason
        }

        const settlementsByRoundId = new Map(successfulSettlementResults)

        const failedRequestCount = failedGroupRoundResults.length + failedSettlementResults.length
        if (failedRequestCount) {
          this.settlementWarning = `일부 정산 내역(${failedRequestCount}건)을 불러오지 못했어요.`
        }

        const seenSettlementIds = new Set()
        const settlementsByGroupId = new Map(groups.map((group) => [String(group.groupId), []]))

        roundsById.forEach(({ groupId, round }, roundId) => {
          const settlements = settlementsByRoundId.get(roundId) || []
          settlements.forEach((settlement) => {
            if (String(settlement?.userId) !== String(userId) || !settlement?.createdAt) return

            const settlementKey =
              settlement.settlementId == null
                ? [
                    roundId,
                    settlement.userId,
                    settlement.settlementAmount,
                    settlement.createdAt,
                    settlement.bankName,
                    settlement.maskedAccountNumber,
                  ].join('|')
                : String(settlement.settlementId)
            if (seenSettlementIds.has(settlementKey)) return
            seenSettlementIds.add(settlementKey)

            settlementsByGroupId.get(String(groupId))?.push({
              settlementId: settlement.settlementId,
              settlementAmount: settlement.settlementAmount,
              createdAt: settlement.createdAt,
              bankName: settlement.bankName,
              maskedAccountNumber: settlement.maskedAccountNumber,
              roundId: round.roundId,
              roundNo: round.roundNo,
            })
          })
        })

        this.settlementGroups = groups.map((group) => ({
          groupId: group.groupId,
          groupName: group.groupName,
          groupStatus: group.groupStatus,
          settlements: (settlementsByGroupId.get(String(group.groupId)) || []).sort(
            (a, b) =>
              settlementTimestamp(b) - settlementTimestamp(a) ||
              Number(b.settlementId ?? 0) - Number(a.settlementId ?? 0),
          ),
        }))
        this.settlementsLoadedForUserId = String(userId)
        return true
      } catch (error) {
        this.settlementGroups = []
        this.settlementsLoadedForUserId = null
        this.settlementWarning = ''
        this.settlementError = getErrorMessage(
          error,
          '정산 내역을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        return false
      } finally {
        this.isSettlementLoading = false
      }
    },
  },
})
