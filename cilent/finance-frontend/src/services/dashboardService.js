import api from './api';

export const dashboardService = {
  /**
   * Get balance summary (income, expense, balance)
   * @returns {Promise<{success: boolean, data: {income: number, expense: number, balance: number}}>}
   */
  getBalance: async () => {
    const response = await api.get('/dashboard/balance');
    return response.data;
  },

  /**
   * Get category-wise stats
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  getCategoryStats: async () => {
    const response = await api.get('/dashboard/category');
    return response.data;
  },

  /**
   * Get monthly trends
   * @param {number} [months=12]
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  getMonthlyTrends: async (months = 12) => {
    const response = await api.get('/dashboard/trends', { params: { months } });
    return response.data;
  },
};
