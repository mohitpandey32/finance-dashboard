import api from './api';

export const recordService = {
  /**
   * Get all records with optional filters
   * @param {object} [filters] - { type, category, startDate, endDate }
   * @returns {Promise<{success: boolean, count: number, data: Array}>}
   */
  getRecords: async (filters = {}) => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const response = await api.get('/records', { params });
    return response.data;
  },

  /**
   * Get a single record by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  getRecordById: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  /**
   * Create a new record (Admin only)
   * @param {object} data - { amount, type, category, date?, note? }
   * @returns {Promise<{success: boolean, data: object}>}
   */
  createRecord: async (data) => {
    const response = await api.post('/records', data);
    return response.data;
  },

  /**
   * Update a record (Admin only)
   * @param {string} id
   * @param {object} data - subset of { amount, type, category, date, note }
   * @returns {Promise<{success: boolean, data: object}>}
   */
  updateRecord: async (id, data) => {
    const response = await api.patch(`/records/${id}`, data);
    return response.data;
  },

  /**
   * Delete a record (Admin only)
   * @param {string} id
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteRecord: async (id) => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },
};
