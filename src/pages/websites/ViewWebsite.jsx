import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import websitesAPI from "../../api/websites";

const ViewWebsite = () => {
  const { id } = useParams();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const websiteRes = await websitesAPI.getById(id);
        const websiteData = websiteRes.data.data;

        let compiledHtml = "";
        let compiledCss = "";

        if (websiteData.website_data) {
          try {
            const parsed =
              typeof websiteData.website_data === "string"
                ? JSON.parse(websiteData.website_data)
                : websiteData.website_data;
            compiledHtml = parsed.compiled_html || "";
            compiledCss = parsed.compiled_css || "";
          } catch (e) {
            console.error("Failed to parse website_data", e);
          }
        }

        setWebsite({
          ...websiteData,
          compiled_html: compiledHtml,
          compiled_css: compiledCss,
        });
      } catch (err) {
        console.error("Failed to fetch website", err);
        setError("Failed to load website");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Website not found"}</p>
          <Link
            to="/websites"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Websites
          </Link>
        </div>
      </div>
    );
  }

  const displayHtml = website.compiled_html || "";
  const displayCss = website.compiled_css || "";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-auto">
        {displayHtml ? (
          <iframe
            srcDoc={`<!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: system-ui, -apple-system, sans-serif; }
                    ${displayCss}
                  </style>
                  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                </head>
                <body>
                  ${displayHtml}
                </body>
              </html>`}
            className="w-full h-screen border-0"
            sandbox="allow-same-origin allow-scripts allow-top-navigation allow-popups"
            title="Website Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">No content to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewWebsite;
