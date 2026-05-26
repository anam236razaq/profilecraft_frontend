import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import templatesAPI from "../../api/templates";

const ViewTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await templatesAPI.getById(id);
        setTemplate(response.data.data);
      } catch (err) {
        console.error("Failed to fetch template", err);
        setError("Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  // Auto-resize iframe to fit content
  useEffect(() => {
    if (!template || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const resizeIframe = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        const height =
          doc.body?.scrollHeight || doc.documentElement?.scrollHeight || 600;
        iframe.style.height = Math.max(height, 600) + "px";
      }
    };

    // Resize after content loads
    const timeout = setTimeout(resizeIframe, 200);
    return () => clearTimeout(timeout);
  }, [template]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Template not found"}</p>
          <button
            onClick={() => navigate("/templates")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:justify-between px-6 py-4 bg-gray-900 border-b border-gray-700 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/templates")}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {template.name}
            </h1>
            <p className="text-sm text-gray-400">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full capitalize">
            {template.category}
          </span>
          {template.is_premium == 1 && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full font-medium">
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Template Preview - single scrollbar, iframe auto-resizes to content height */}
      <div
        className="flex-1 bg-gray-100 p-6 overflow-auto"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <div
          className="mx-auto rounded-xl overflow-hidden bg-white shadow-2xl"
          style={{ maxWidth: "1200px" }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={`<!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    html, body { height: auto; overflow: visible; }
                    body { font-family: system-ui, -apple-system, sans-serif; }
                    ${template.css_styles || ""}
                  </style>
                  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                  <script>
                    document.addEventListener('click', function(e) {
                      var link = e.target.closest('a[href="#"]');
                      if (link) {
                        e.preventDefault();
                      }
                    }, false);
                  </script>
                </head>
                <body>
                    ${template.html_template || '<div class="p-5 text-center">No content</div>'}
                </body>
              </html>`}
            className="w-full border-0"
            scrolling="no"
            sandbox="allow-same-origin allow-scripts"
            title="Template Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewTemplate;
