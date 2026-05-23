import api from "./axios";

const stripeAPI = {
  /**
   * Get all available plans
   */
  getPlans: async () => {
    const response = await api.get("/stripe/plans");
    return response.data;
  },

  /**
   * Create a Stripe checkout session for subscription
   * @param {string} planId - Plan ID (basic, pro, enterprise)
   */
  createCheckoutSession: async (planId) => {
    const response = await api.post("/stripe/checkout", { plan_id: planId });
    return response.data;
  },

  /**
   * Get current user's subscription status
   */
  getSubscription: async () => {
    const response = await api.get("/stripe/subscription");
    return response.data;
  },

  /**
   * Cancel current subscription
   */
  cancelSubscription: async () => {
    const response = await api.post("/stripe/cancel");
    return response.data;
  },
};

export default stripeAPI;