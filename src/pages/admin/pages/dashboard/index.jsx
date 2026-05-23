import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dashboardAPI from "../../../../api/dashboard";
import { LineChart } from "../../../../components/charts/LineChart";
import { BarChart } from "../../../../components/charts/BarChart";
import {
  PlusIcon,
  UsersIcon,
  WebsitesIcon,
  LinkIcon,
  TemplatesIcon,
} from "../../../../assets/icons";
import { useAuth } from "../../../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWebsites: 0,
    totalConnectedAccounts: 0,
    totalTemplates: 0,
    monthlyRegistrations: [],
    monthlyWebsites: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      const data = response.data.data;
      setStats({
        totalUsers: data.total_users || 0,
        totalWebsites: data.total_websites || 0,
        totalConnectedAccounts: data.total_connected_accounts || 0,
        totalTemplates: data.total_templates || 0,
        monthlyRegistrations: data.monthly_registrations || [],
        monthlyWebsites: data.monthly_websites || [],
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <UsersIcon className="w-8 h-8 text-indigo-600" />,
    },
    {
      label: "Total Websites",
      value: stats.totalWebsites,
      icon: <WebsitesIcon className="w-8 h-8 text-indigo-600" />,
    },
    {
      label: "Connected Accounts",
      value: stats.totalConnectedAccounts,
      icon: <LinkIcon className="w-8 h-8 text-indigo-600" />,
    },
    {
      label: "Total Templates",
      value: stats.totalTemplates,
      icon: <TemplatesIcon className="w-8 h-8 text-indigo-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner with gradient */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 min-h-44 bg-indigo-600 flex flex-col justify-center p-6"
        style={{
          background:
            "linear-gradient(90.15deg, #4f46e5 0.15%, #7c3aed 50%, #ec4899 99.88%)",
        }}
      >
        <div className="absolute inset-0 bg-black/10" aria-hidden />
        <div className="relative z-10">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back, {user?.full_name ?? "Admin"} 👋
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Here's what's happening with your platform today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Add Template Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/admin/templates/builder")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Add Template
        </button>
      </div>

      {/* Charts - Single Column */}
      <div className="space-y-6">
        {/* Line Chart - Monthly Signups */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Signup Users
          </h2>
          {loading ? (
            <div className="h-55 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <LineChart data={stats.monthlyRegistrations} label="Signups" />
          )}
        </div>

        {/* Bar Chart - Monthly Websites Created */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Websites</h2>
          {loading ? (
            <div className="h-70 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <BarChart websitesData={stats.monthlyWebsites} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
