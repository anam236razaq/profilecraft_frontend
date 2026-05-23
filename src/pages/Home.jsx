import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  TemplatesIcon,
  UsersIcon,
  PricingIcon,
  SocialIcon,
  PhoneIcon,
} from "../assets/icons";
import templatesAPI from "../api/templates";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templatesAPI.getAll({ per_page: 3 });
        const result = response.data.data;
        setTemplates(result.data || []);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const features = [
    {
      icon: SocialIcon,
      title: "Social Integration",
      desc: "Connect Instagram, LinkedIn, GitHub, Twitter and more to import your content automatically.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: TemplatesIcon,
      title: "Beautiful Templates",
      desc: "Choose from a collection of professionally designed templates for any industry.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: PhoneIcon,
      title: "Mobile Responsive",
      desc: "Every website looks great on any device - desktop, tablet, or mobile.",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up Free",
      desc: "Create your account in seconds. No credit card required.",
      icon: UsersIcon,
    },
    {
      number: "02",
      title: "Choose a Template",
      desc: "Browse our templates and pick the one that suits your style.",
      icon: TemplatesIcon,
    },
    {
      number: "03",
      title: "Select a Plan",
      desc: "Start free or upgrade to unlock premium features and templates.",
      icon: PricingIcon,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-purple-800" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div
                  className={`transform transition-all duration-1000 ${
                    isVisible
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-12 opacity-0"
                  }`}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                    Create Your Perfect{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-200 to-indigo-200">
                      Portfolio Website
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-indigo-100 leading-relaxed mb-8 max-w-lg">
                    Connect your social media, import your content, and get a
                    stunning personal website in minutes. No coding required.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/register"
                      className="group px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-lg shadow-white/25 hover:shadow-white/40 hover:-translate-y-1"
                    >
                      <span className="flex items-center gap-2">
                        Start Free Today
                        <span className="group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </span>
                    </Link>
                    <Link
                      to="/templates"
                      className="px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:border-white"
                    >
                      View Templates
                    </Link>
                  </div>
                </div>

                {/* Browser Mockup */}
                <div
                  className={`transform transition-all duration-1000 delay-300 ${
                    isVisible
                      ? "translate-x-0 opacity-100"
                      : "translate-x-12 opacity-0"
                  }`}
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-linear-to-r from-purple-400 to-indigo-400 rounded-2xl blur-xl opacity-40" />
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                      <div className="flex gap-2 px-4 py-3 bg-gray-800">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="h-24 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl" />
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-linear-to-br from-purple-100 to-purple-200 rounded-lg" />
                          <div className="h-24 bg-linear-to-br from-indigo-100 to-indigo-200 rounded-lg" />
                          <div className="h-24 bg-linear-to-br from-pink-100 to-pink-200 rounded-lg" />
                        </div>
                        <div className="h-16 bg-gray-200 rounded-lg" />
                        <div className="h-12 bg-gray-200 rounded-lg w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                className="fill-indigo-50"
              />
            </svg>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 bg-linear-to-b from-white to-indigo-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Create your professional portfolio in just three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={i}
                    className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="pt-8">
                      <span className="text-sm font-semibold text-indigo-600 mb-2 block">
                        Step {step.number}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-linear-to-br from-indigo-900 via-purple-900 to-purple-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-indigo-200 max-w-2xl mx-auto">
                Powerful features to help you create the perfect portfolio
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={i}
                    className="group p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-indigo-200 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Templates Preview Section */}
        <section className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Beautiful Templates
              </h2>
              <p className="text-gray-600 mb-8">
                Choose from our collection of professionally designed templates
              </p>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <TemplatesIcon className="w-5 h-5" />
                Browse All Templates
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {loading ? (
                <p className="text-gray-500 col-span-3 text-center py-8">
                  Loading templates...
                </p>
              ) : templates.length > 0 ? (
                templates.slice(0, 3).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => isAuthenticated ? navigate(`/templates/${template.id}`) : navigate("/login")}
                    className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition relative"
                  >
                    <div className="h-40 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">
                          {{
                            portfolio: "🖼️",
                            blog: "📝",
                            business: "💼",
                            personal: "👤",
                            minimal: "✨",
                            creative: "🎨",
                          }[template.category] || "🎨"}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {(template.description || "No description available").slice(0, 100)}
                        {(template.description || "").length > 100 ? "..." : ""}
                      </p>
                      <span className="inline-block mt-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                        {template.category || "general"}
                      </span>
                    </div>
                    {template.is_premium && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-3 text-center py-8">
                  No templates available
                </p>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-7xl mx-auto">
              {[
                {
                  q: "How does ProfileCraft work?",
                  a: "ProfileCraft connects to your social media accounts (like GitHub, LinkedIn, Google) and automatically imports your profile information, projects, and content. You then choose a template, customize it, and publish your portfolio website — all without any coding.",
                },
                {
                  q: "What social accounts can I connect?",
                  a: "You can connect your GitHub, Google, and LinkedIn accounts. These provide your profile data, projects, work experience, education, and more to populate your portfolio automatically.",
                },
                {
                  q: "Can I use my own custom domain?",
                  a: "Yes! Pro and Enterprise plan users can connect their own domain (like yourname.com) to their portfolio for a more professional online presence.",
                },
                {
                  q: "How many websites can I create?",
                  a: "Basic plan allows 1 website, Pro plan allows 5 websites, and Enterprise plan allows unlimited websites.",
                },
                {
                  q: "Are premium templates available on the free plan?",
                  a: "Premium templates are exclusively available for Pro and Enterprise users. Free plan users can use basic templates only.",
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll keep access to your paid features until the end of your billing period and then revert to the Free plan.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group p-6 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 open:border-indigo-300 mb-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.q}
                    </h3>
                    <span className="text-indigo-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
