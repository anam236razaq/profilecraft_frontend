import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import templatesAPI from "../../../../api/templates";
import Pagination from "../../../../components/Pagination";
import { SkeletonCard } from "../../../../components/Skeleton";
import { PlusIcon } from "../../../../assets/icons";

const AdminTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    templateId: null,
  });
  const navigate = useNavigate();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await templatesAPI.getAdminAll({
        search,
        page,
        per_page: 12,
      });
      const result = response.data.data;
      setTemplates(result.data || []);
      setTotalPages(result.total_pages || 1);
    } catch {
      console.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchTemplates]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleAddTemplate = () => {
    navigate("/admin/templates/builder");
  };

  const handleEditTemplate = (templateId) => {
    navigate(`/admin/templates/builder?id=${templateId}`);
  };

  const handleDeleteTemplate = async () => {
    const { templateId } = deleteModal;
    if (!templateId) return;

    setDeleting(templateId);
    try {
      await templatesAPI.delete(templateId);
      toast.success("Template deleted successfully");
      setDeleteModal({ open: false, templateId: null });
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    } finally {
      setDeleting(null);
    }
  };

  const openDeleteModal = (templateId) => {
    setDeleteModal({ open: true, templateId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, templateId: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage website templates for users.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-80">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search templates..."
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={handleAddTemplate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Add Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : templates.length > 0 ? (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className={`text-5xl ${template.thumbnail_url ? "hidden" : ""}`}
                >
                  {template.category === "portfolio"
                    ? "🖼️"
                    : template.category === "blog"
                      ? "📝"
                      : template.category === "business"
                        ? "💼"
                        : template.category === "personal"
                          ? "👤"
                          : template.category === "minimal"
                            ? "✨"
                            : "🎨"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  {template.is_premium == 1 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {template.description || "No description available."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                    {template.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTemplate(template.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(template.id)}
                      disabled={deleting === template.id}
                      className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      {deleting === template.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No templates yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add templates for users to choose from.
            </p>
            <button
              onClick={handleAddTemplate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              + Add First Template
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-1200 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Template
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this template? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;
