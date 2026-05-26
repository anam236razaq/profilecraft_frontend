import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import templatesAPI from "../../api/templates";
import Pagination from "../../components/Pagination";
import { SearchIcon } from "../../assets/icons";
import { useAuth } from "../../context/AuthContext";
import { SkeletonCard } from "../../components/Skeleton";

const Templates = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = [
    "all",
    "personal",
    "portfolio",
    "business",
    "blog",
    "minimal",
    "creative",
  ];

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await templatesAPI.getAll({
        search,
        page,
        per_page: 12,
        category: selectedCategory,
      });
      const result = response?.data?.data;
      if (result) {
        setTemplates(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.total_pages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    } finally {
      setLoading(false);
    }
  }, [search, page, selectedCategory]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchTemplates]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handlePreviewTemplate = (template) => {
    if (isAuthenticated) {
      navigate(`/templates/${template.id}`);
    } else {
      navigate("/login");
    }
  };

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const getIcon = (category) => {
    const icons = {
      portfolio: "🖼️",
      blog: "📝",
      business: "💼",
      personal: "👤",
      minimal: "✨",
      creative: "🎨",
    };
    return icons[category] || "🎨";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full px-12 py-8">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Website Templates
            </h1>
            <p className="text-gray-500 mt-1">
              Choose from our collection of beautiful templates
            </p>
          </div>
          <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search templates..."
                className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {total} template{total !== 1 ? "s" : ""} found
        </p>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handlePreviewTemplate(template)}
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
                      {getIcon(template.category)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {(template.description && template.description.length > 100)
                      ? template.description.substring(0, 100) + "..."
                      : template.description || "No description available"}
                  </p>
                  <span className="inline-block mt-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                    {template.category || "general"}
                  </span>
                </div>
                {template.is_premium == 1 && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                    Premium
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={loading}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Templates;
