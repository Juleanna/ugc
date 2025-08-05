import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const apiService = {
  // Content endpoints
  async getHomePage() {
    return apiClient.get('/homepage/')
  },

  async getAboutPage() {
    return apiClient.get('/about/')
  },

  async getTeamMembers() {
    return apiClient.get('/team-members/')
  },

  async getManagement() {
    return apiClient.get('/team-members/?is_management=true')
  },

  // Services
  async getServices() {
    return apiClient.get('/services/')
  },

  async getService(id) {
    return apiClient.get(`/services/${id}/`)
  },

  async getServiceFeatures(id) {
    return apiClient.get(`/services/${id}/features/`)
  },

  // Projects
  async getProjectCategories() {
    return apiClient.get('/project-categories/')
  },

  async getProjects() {
    return apiClient.get('/projects/')
  },

  async getProject(slug) {
    return apiClient.get(`/projects/${slug}/`)
  },

  async getProjectImages(slug) {
    return apiClient.get(`/projects/${slug}/images/`)
  },

  async getCategoryProjects(categoryId) {
    return apiClient.get(`/project-categories/${categoryId}/projects/`)
  },

  // Jobs
  async getJobs() {
    return apiClient.get('/jobs/')
  },

  async getJob(slug) {
    return apiClient.get(`/jobs/${slug}/`)
  },

  async submitJobApplication(data) {
    return apiClient.post('/job-applications/', data)
  },

  async getWorkplacePhotos() {
    return apiClient.get('/workplace-photos/')
  },

  // Partners
  async getPartnershipInfo() {
    return apiClient.get('/partnership-info/')
  },

  async getWorkStages() {
    return apiClient.get('/work-stages/')
  },

  async submitPartnerInquiry(data) {
    return apiClient.post('/partner-inquiries/', data)
  },

  // Contacts
  async getOffices() {
    return apiClient.get('/offices/')
  },

  async submitContactInquiry(data) {
    return apiClient.post('/contact-inquiries/', data)
  },

  // Unified content (new centralized endpoints)
  async getStats() {
    return apiClient.get('/content/stats/')
  },

  async getFeaturedContent() {
    return apiClient.get('/content/featured/')
  },

  // Translations
  async getTranslations(lang) {
    return apiClient.get(`/translations/${lang}/`)
  },

  async getAllTranslations(lang) {
    return apiClient.get(`/translations/${lang}/all/`)
  },

  // Health check
  async healthCheck() {
    return apiClient.get('/health/')
  },

  // Cache management
  async getCacheStats() {
    return apiClient.get('/cache/')
  },

  async clearCache() {
    return apiClient.delete('/cache/')
  },
}

export default apiService