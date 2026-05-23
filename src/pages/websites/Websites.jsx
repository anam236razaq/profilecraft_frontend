import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import websitesAPI from "../../api/websites";

const Websites = () => {
  const toast = useToast();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    websiteId: null,
  });

  const fetchWebsites = async () => {
    try {
      const response = await websitesAPI.getAll();
      setWebsites(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch websites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadWebsites = async () => {
      await fetchWebsites();
    };
    loadWebsites();
  }, []);

  const handleDeleteClick = (websiteId) => {
    setDeleteModal({ open: true, websiteId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.websiteId) return;
    try {
      await websitesAPI.delete(deleteModal.websiteId);
      setWebsites(websites.filter((w) => w.id !== deleteModal.websiteId));
      setDeleteModal({ open: false, websiteId: null });
      toast.success("Website has been deleted successfully");
    } catch (err) {
      toast.error("Failed to delete website");
      console.error("Failed to delete website", err);
      setDeleteModal({ open: false, websiteId: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ open: false, websiteId: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Websites</h1>
            <p className="text-gray-500 mt-1">
              Manage all your portfolio websites
            </p>
          </div>
          <Link
            to="/websites/new"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Website
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : websites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No websites yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first website to get started
            </p>
            <Link
              to="/websites/new"
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Create Website
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                <div className="w-20 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-2xl text-white">
                    {website.template_id ? "🎨" : "📄"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {website.subdomain}.profilecraft.com
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${website.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {website.is_published ? "Published" : "Draft"}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(website.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <a
                    href={`/preview/${website.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDeleteClick(website.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Website
              </h2>
              <p className="text-gray-500">
                Are you sure you want to delete this website? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Websites;
