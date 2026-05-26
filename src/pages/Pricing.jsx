import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import stripeAPI from "../api/stripe";
import { CheckIcon, XIcon } from "../assets/icons";
import Dialog from "../components/Dialog";

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const success = searchParams.get("success");
  const planParam = searchParams.get("plan");
  const canceled = searchParams.get("canceled");

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await stripeAPI.getPlans();
      if (response && response.success && response.data?.plans) {
        setPlans(response.data.plans);
        setError(null);
      } else if (response && response.success && response.data?.data?.plans) {
        setPlans(response.data.data.plans);
        setError(null);
      } else {
        setError(response?.message || "Failed to load plans");
        setPlans([]);
      }
    } catch (err) {
      console.error("Error response:", err.response);
      let errorMsg = "Failed to load plans";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          try {
            const parsed = JSON.parse(err.response.data);
            errorMsg = parsed.message || parsed.error || err.response.data;
          } catch {
            errorMsg = err.response.data;
          }
        } else {
          errorMsg =
            err.response.data.message || err.response.data.error || errorMsg;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      console.error("Final error message:", errorMsg);
      setError(errorMsg);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await stripeAPI.getSubscription();
      if (response && response.success && response.data?.active) {
        setCurrentPlan(response.data.plan);
      } else if (response && response.success) {
        setCurrentPlan(response.data?.plan || "basic");
      } else {
        setCurrentPlan("basic");
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setCurrentPlan("basic");
    }
  }, []);

  useEffect(() => {
    const fetchData = async() => {
      fetchPlans();
    }
    fetchData();
  }, [fetchPlans]);
  
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSubscription();
    }
  }, [fetchSubscription, isAuthenticated]);
  

  // Clear success/canceled params from URL after 4 seconds
  useEffect(() => {
    if (success || canceled) {
      const timer = setTimeout(() => {
        const newParams = new URLSearchParams();
        if (currentPlan) newParams.set("plan", currentPlan);
        navigate("/pricing?" + newParams.toString(), { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled, currentPlan, navigate]);

  // Refresh subscription after successful Stripe checkout
  useEffect(() => {
    if (success === "true" && isAuthenticated) {
      const timer = setTimeout(() => {
        fetchSubscription();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, isAuthenticated, fetchSubscription]);

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    if (plan.price === 0) {
      setLoadingPlanId(plan.id);
      try {
        await stripeAPI.createCheckoutSession(plan.id);
        setCurrentPlan(plan.id);
      } catch (err) {
        console.error("Failed to select free plan:", err);
      } finally {
        setLoadingPlanId(null);
      }
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const response = await stripeAPI.createCheckoutSession(plan.id);
      if (response.data?.url) {
        window.location.assign(response.data.url);
      }
    } catch (err) {
      console.error("Failed to create checkout:", err);
      setLoadingPlanId(null);
    }
  };

  const handleCancelSubscription = async () => {
    setShowCancelDialog(false);
    setLoadingPlanId("cancel");
    try {
      await stripeAPI.cancelSubscription();
      await fetchSubscription();
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const formatPrice = (cents) => {
    if (cents === 0) return "Free";
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-indigo-50">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start for free and upgrade as you grow.
        </p>

        {success && (
          <div className="mt-6 max-w-md mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              Payment successful! Your plan has been upgraded to{" "}
              {planParam || "Pro"}.
            </p>
          </div>
        )}
        {canceled && (
          <div className="mt-6 max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              Payment was canceled. No charges were made.
            </p>
          </div>
        )}
        {error && (
          <div className="mt-6 max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {plansLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No plans available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isPro = plan.id === "pro";

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isPro ? "ring-2 ring-indigo-600 scale-105" : ""
                  }`}
                >
                  {isPro && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    <div className="text-center mb-6">
                      <span className="text-5xl font-bold text-gray-900">
                        {formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckIcon className="w-5 h-5 text-green-500 shrink-0" />
                          <span className="text-gray-600 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.limits && !plan.limits.premium_templates && (
                        <li className="flex items-center gap-3">
                          <XIcon className="w-5 h-5 text-gray-300 shrink-0" />
                          <span className="text-gray-400 text-sm">
                            Premium Templates
                          </span>
                        </li>
                      )}
                      {plan.limits && !plan.limits.custom_domain && (
                        <li className="flex items-center gap-3">
                          <XIcon className="w-5 h-5 text-gray-300 shrink-0" />
                          <span className="text-gray-400 text-sm">
                            Custom Domain
                          </span>
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loadingPlanId !== null || isCurrent}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        isCurrent
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isPro
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {loadingPlanId === plan.id
                        ? "Processing..."
                        : isCurrent
                          ? "Current Plan"
                          : plan.price === 0
                            ? "Get Started Free"
                            : "Subscribe Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Current Plan Info & Cancel */}
        {isAuthenticated && currentPlan && currentPlan !== "basic" && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              You are currently on the{" "}
              <span className="font-semibold capitalize">{currentPlan}</span>{" "}
              plan.
            </p>
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={loadingPlanId !== null}
              className="text-red-600 hover:text-red-700 underline text-sm"
            >
              {loadingPlanId === "cancel"
                ? "Processing..."
                : "Cancel Subscription"}
            </button>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel Subscription"
        onConfirm={handleCancelSubscription}
        confirmText="Cancel Subscription"
      >
        <p>Are you sure you want to cancel your subscription? You will lose access to your premium plan at the end of the current billing period.</p>
      </Dialog>
    </div>
  );
};

export default Pricing;
