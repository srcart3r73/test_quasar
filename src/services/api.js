import axios from 'axios'

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API service for transactions
export const transactionsAPI = {
  // Get all transactions
  async getAll() {
    const response = await apiClient.get('/transactions')
    return response.data
  },

  // Get single transaction
  async getById(id) {
    const response = await apiClient.get(`/transactions?id=${id}`)
    return response.data
  },

  // Create new transaction
  async create(data) {
    const response = await apiClient.post('/transactions', data)
    return response.data
  },

  // Update transaction
  async update(id, data) {
    const response = await apiClient.put(`/transactions/${id}`, data)
    return response.data
  },

  // Delete transaction
  async delete(id) {
    const response = await apiClient.delete(`/transactions/${id}`)
    return response.data
  },

  // Get buildings linked to a transaction
  async getLinkedBuildings(transactionId) {
    const response = await apiClient.get(`/transactions/${transactionId}/buildings`)
    return response.data
  },
}

// API service for buildings
export const buildingsAPI = {
  // Get all buildings
  async getAll() {
    const response = await apiClient.get('/buildings')
    return response.data
  },

  // Get single building
  async getById(id) {
    const response = await apiClient.get(`/buildings?id=${id}`)
    return response.data
  },

  // Create new building
  async create(data) {
    const response = await apiClient.post('/buildings', data)
    return response.data
  },

  // Update building
  async update(id, data) {
    const response = await apiClient.put(`/buildings/${id}`, data)
    return response.data
  },

  // Delete building
  async delete(id) {
    const response = await apiClient.delete(`/buildings/${id}`)
    return response.data
  },
}

// API service for linking transactions and buildings
export const linkTransactionsBuildingsAPI = {
  // Get all links
  async getAll() {
    const response = await apiClient.get('/link_transactions_buildings')
    return response.data
  },

  // Get links for a specific transaction
  async getByTransactionId(transactionId) {
    const response = await apiClient.get(`/link_transactions_buildings?transaction_id=${transactionId}`)
    return response.data
  },

  // Get links for a specific building
  async getByBuildingId(buildingId) {
    const response = await apiClient.get(`/link_transactions_buildings?building_id=${buildingId}`)
    return response.data
  },

  // Create new link
  async create(transactionId, buildingId) {
    const response = await apiClient.post('/link_transactions_buildings', {
      transaction_id: transactionId,
      building_id: buildingId
    })
    return response.data
  },

  // Delete link
  async delete(id) {
    const response = await apiClient.delete(`/link_transactions_buildings/${id}`)
    return response.data
  },

  // Delete link by transaction and building IDs
  async deleteByIds(transactionId, buildingId) {
    const response = await apiClient.delete(`/links/${transactionId}/${buildingId}`)
    return response.data
  },
}

// API service for priorities
export const prioritiesAPI = {
  // Get all priorities
  async getAll() {
    const response = await apiClient.get('/priorities')
    return response.data
  },

  // Get single priority
  async getById(id) {
    const response = await apiClient.get(`/priorities?id=${id}`)
    return response.data
  },

  // Create new priority
  async create(data) {
    const response = await apiClient.post('/priorities', data)
    return response.data
  },

  // Update priority
  async update(id, data) {
    const response = await apiClient.put(`/priorities/${id}`, data)
    return response.data
  },

  // Delete priority
  async delete(id) {
    const response = await apiClient.delete(`/priorities/${id}`)
    return response.data
  },
}

// API service for participants
export const participantsAPI = {
  // Get all participants
  async getAll() {
    const response = await apiClient.get('/participants')
    return response.data
  },

  // Get single participant
  async getById(id) {
    const response = await apiClient.get(`/participants?id=${id}`)
    return response.data
  },

  // Create new participant
  async create(data) {
    const response = await apiClient.post('/participants', data)
    return response.data
  },

  // Update participant
  async update(id, data) {
    const response = await apiClient.put(`/participants/${id}`, data)
    return response.data
  },

  // Delete participant
  async delete(id) {
    const response = await apiClient.delete(`/participants/${id}`)
    return response.data
  },
}

// Error handler utility
export const handleAPIError = (error) => {
  console.error('API Error:', error)
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.message || error.response.data?.detail || 'Server error'
    
    switch (status) {
      case 400:
        return { error: 'Bad Request', message }
      case 401:
        return { error: 'Unauthorized', message: 'Authentication required' }
      case 403:
        return { error: 'Forbidden', message: 'Access denied' }
      case 404:
        return { error: 'Not Found', message: 'Resource not found' }
      case 422:
        return { error: 'Validation Error', message }
      case 500:
        return { error: 'Server Error', message: 'Internal server error' }
      default:
        return { error: 'API Error', message }
    }
  } else if (error.request) {
    // Network error
    return { error: 'Network Error', message: 'Unable to connect to server' }
  } else {
    // Other error
    return { error: 'Error', message: error.message }
  }
}

export default {
  transactionsAPI,
  buildingsAPI,
  linkTransactionsBuildingsAPI,
  prioritiesAPI,
  participantsAPI,
  handleAPIError,
}
