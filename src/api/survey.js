import apiClient from './client'

export function getSurveyQuestions() {
  return apiClient.get('/surveys/questions')
}

export function submitSurvey(answers) {
  return apiClient.post('/surveys/results', { answers })
}
