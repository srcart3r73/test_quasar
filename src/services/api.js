// src/services/api.js
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

// Single generic API function
export const api = {
  // Get all records
  async getAll(endpoint) {
    const response = await apiClient.get(`/${endpoint}`)
    return response.data
  },

  // Get single record
  async getById(endpoint, id) {
    const response = await apiClient.get(`/${endpoint}?id=${id}`)
    return response.data
  },

  // Create new record
  async create(endpoint, data) {
    const response = await apiClient.post(`/${endpoint}`, data)
    return response.data
  },

  // Update record
  async update(endpoint, id, data) {
    const response = await apiClient.put(`/${endpoint}/${id}`, data)
    return response.data
  },

  // Delete record
  async delete(endpoint, id) {
    const response = await apiClient.delete(`/${endpoint}/${id}`)
    return response.data
  },

  // Generic query with parameters
  async query(endpoint, params = {}) {
    const response = await apiClient.get(`/${endpoint}`, { params })
    return response.data
  },

  // Get related records (for nested endpoints)
  async getRelated(endpoint, id, relation) {
    const response = await apiClient.get(`/${endpoint}/${id}/${relation}`)
    return response.data
  },

  // Create related record
  async createRelated(endpoint, id, relation, data) {
    const response = await apiClient.post(`/${endpoint}/${id}/${relation}`, data)
    return response.data
  },

  // Delete related record
  async deleteRelated(endpoint, id, relation, relatedId) {
    const response = await apiClient.delete(`/${endpoint}/${id}/${relation}/${relatedId}`)
    return response.data
  },

  // Special method for linking tables
  async createLink(linkEndpoint, primaryId, relatedId, primaryKey = 'transaction_id', relatedKey = 'building_id') {
    const payload = {
      [primaryKey]: primaryId,
      [relatedKey]: relatedId
    }
    
    console.log('🔗 Creating link with:')
    console.log('  Endpoint:', linkEndpoint)
    console.log('  Primary ID:', primaryId)
    console.log('  Related ID:', relatedId)
    console.log('  Primary Key:', primaryKey)
    console.log('  Related Key:', relatedKey)
    console.log('  Payload:', payload)
    
    const response = await apiClient.post(`/${linkEndpoint}`, payload)
    
    console.log('✅ Link created, response:', response.data)
    return response.data
  },

  // Delete link by IDs
  async deleteLink(linkEndpoint, primaryId, relatedId) {
    const response = await apiClient.delete(`/links/${primaryId}/${relatedId}`)
    return response.data
  }
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

export default api