import apiClient from './client'

/** @typedef {'SURVEY_REQUIRED' | 'GENERATING' | 'READY' | 'SAFE_DEFAULT'} PersonalInsightStatus */

/**
 * @typedef {Object} PensionInsightResponse
 * @property {{ settledAmountThisMonth?: number|null, expectedMinAmount?: number|null, expectedAmount?: number|null, expectedMaxAmount?: number|null, ongoingExpectedAmount?: number|null, ongoingExpectedMaxAmount?: number|null, nextDepositDate?: string|null }|null} [forecast]
 * @property {{ headline?: string|null, detail?: string|null }|null} [marketSummary]
 * @property {{ investment?: string[], general?: string[] }|null} [userInterests]
 * @property {PersonalInsightStatus} personalInsightStatus
 * @property {{ intro?: string|null, strategy?: string|null }|null} [personalInsight]
 */

export function getPensionInsight(userId) {
  return apiClient.get(`/pension/insight/${encodeURIComponent(userId)}`)
}
