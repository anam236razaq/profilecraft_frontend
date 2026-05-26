import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import presetWebpage from "grapesjs-preset-webpage";
import customCode from "grapesjs-custom-code";
import templatesAPI from "../../../../../api/templates";

const TemplateBuilder = () => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");

  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("portfolio");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // Fetch existing template data when editing
  useEffect(() => {
    if (!templateId) return;

    const fetchTemplate = async () => {
      try {
        const response = await templatesAPI.getById(templateId);
        const template = response.data.data;

        if (template) {
          setTemplateName(template.name || "");
          setTemplateCategory(template.category || "portfolio");
          setTemplateDescription(template.description || "");
          setIsPremium(template.is_premium == 1);
          if (template.thumbnail_url) {
            setThumbnailPreview(template.thumbnail_url);
          }

          // Set editor content if available
          if (editorRef.current && template.html_template) {
            editorRef.current.setComponents(template.html_template);
            if (template.css_styles) {
              editorRef.current.setStyle(template.css_styles);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch template:", err);
        toast.error("Failed to load template");
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleThumbnailChange = (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
      }
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  const removeThumbnail = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  useEffect(() => {
    let editor;

    const init = () => {
      const container = containerRef.current;

      if (!container) {
        console.warn("Container not ready, retrying...");
        requestAnimationFrame(init);
        return;
      }

      if (editorRef.current) return;

      editor = grapesjs.init({
        container,
        height: "100%",
        width: "100%",

        fromElement: false,
        storageManager: false,
        undoManager: true,
        noticeOnUnload: false,

        plugins: [presetWebpage, customCode],

        deviceManager: {
          devices: [
            { id: "desktop", name: "Desktop", width: "" },
            {
              id: "tablet",
              name: "Tablet",
              width: "768px",
              widthMedia: "992px",
            },
            {
              id: "mobile",
              name: "Mobile",
              width: "320px",
              widthMedia: "480px",
            },
          ],
        },

        canvas: {
          styles: [
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
          ],
        },
      });

      editorRef.current = editor;

      // Add blocks to BASIC category
      editor.BlockManager.add("1-column", {
        label: "1 Column",
        category: "Basic",
        content: `<div class="row"><div class="col-12 p-3 bg-light border">Column content here</div></div>`,
        attributes: { class: "fa fa-th" },
      });

      editor.BlockManager.add("2-columns", {
        label: "2 Columns",
        category: "Basic",
        content: `<div class="row"><div class="col-6 p-3 bg-light border">Left Column</div><div class="col-6 p-3 bg-light border">Right Column</div></div>`,
        attributes: { class: "fa fa-th-large" },
      });

      editor.BlockManager.add("3-columns", {
        label: "3 Columns",
        category: "Basic",
        content: `<div class="row"><div class="col-4 p-3 bg-light border">Col 1</div><div class="col-4 p-3 bg-light border">Col 2</div><div class="col-4 p-3 bg-light border">Col 3</div></div>`,
        attributes: { class: "fa fa-columns" },
      });

      editor.BlockManager.add("2-columns-3-7", {
        label: "2 Columns 3/7",
        category: "Basic",
        content: `<div class="row"><div class="col-3 p-3 bg-light border">Small</div><div class="col-7 p-3 bg-light border">Large</div></div>`,
        attributes: { class: "fa fa-columns" },
      });

      editor.BlockManager.add("text-block", {
        label: "Text",
        category: "Basic",
        content: `<div class="text-content"><p>Enter your text here</p></div>`,
        attributes: { class: "fa fa-font" },
      });

      editor.BlockManager.add("link-block", {
        label: "Link",
        category: "Basic",
        content: `<a href="#" class="btn btn-primary">Click Here</a>`,
        attributes: { class: "fa fa-link" },
      });

      editor.BlockManager.add("image-block", {
        label: "Image",
        category: "Basic",
        content: `<div class="image-container"><img src="https://via.placeholder.com/400x300" alt="Image" class="img-fluid"></div>`,
        attributes: { class: "fa fa-image" },
      });

      editor.BlockManager.add("video-block", {
        label: "Video",
        category: "Basic",
        content: `<div class="video-container"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe></div></div>`,
        attributes: { class: "fa fa-video-camera" },
      });

      editor.BlockManager.add("map-block", {
        label: "Map",
        category: "Basic",
        content: `<div class="map-container"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076794379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c65b95f%3A0x52963a5addd52a99!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2s!4v1619618245628!5m2!1sen!2s" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe></div>`,
        attributes: { class: "fa fa-map-marker" },
      });

      editor.BlockManager.add("link-block-item", {
        label: "Link Block",
        category: "Basic",
        content: `<div class="link-block"><a href="#" class="d-block p-3 bg-light mb-2 rounded">Link Item 1</a><a href="#" class="d-block p-3 bg-light mb-2 rounded">Link Item 2</a><a href="#" class="d-block p-3 bg-light rounded">Link Item 3</a></div>`,
        attributes: { class: "fa fa-external-link" },
      });

      editor.BlockManager.add("quote-block", {
        label: "Quote",
        category: "Basic",
        content: `<blockquote class="blockquote bg-light p-4 rounded"><p class="mb-0">"The only way to do great work is to love what you do."</p><footer class="blockquote-footer">Steve Jobs</footer></blockquote>`,
        attributes: { class: "fa fa-quote-left" },
      });

      editor.BlockManager.add("text-section", {
        label: "Text Section",
        category: "Basic",
        content: `<section class="text-section py-4"><div class="container"><h2>Section Title</h2><p>This is a text section where you can add your content. It uses Bootstrap's container and spacing classes.</p></div></section>`,
        attributes: { class: "fa fa-file-text" },
      });

      // Add blocks to FORMS category
      editor.BlockManager.add("form-block", {
        label: "Contact Form",
        category: "Forms",
        content: `<form class="p-3"><div class="mb-3"><input type="text" class="form-control" placeholder="Name"></div><div class="mb-3"><input type="email" class="form-control" placeholder="Email"></div><div class="mb-3"><textarea class="form-control" placeholder="Message"></textarea></div><button type="submit" class="btn btn-primary">Send</button></form>`,
        attributes: { class: "fa fa-edit" },
      });

      editor.BlockManager.add("input-field", {
        label: "Input",
        category: "Forms",
        content: `<div class="mb-3"><input type="text" class="form-control" placeholder="Enter text"></div>`,
        attributes: { class: "fa fa-font" },
      });

      editor.BlockManager.add("select-field", {
        label: "Select",
        category: "Forms",
        content: `<div class="mb-3"><select class="form-select"><option value="">Choose an option</option><option value="1">Option 1</option><option value="2">Option 2</option><option value="3">Option 3</option></select></div>`,
        attributes: { class: "fa fa-caret-square-o-down" },
      });

      editor.BlockManager.add("radio-field", {
        label: "Radio",
        category: "Forms",
        content: `<div class="form-check"><input type="radio" class="form-check-input" id="radio1" name="radioGroup"><label class="form-check-label" for="radio1">Radio Option</label></div>`,
        attributes: { class: "fa fa-dot-circle-o" },
      });

      editor.BlockManager.add("checkbox-field", {
        label: "Checkbox",
        category: "Forms",
        content: `<div class="form-check"><input type="checkbox" class="form-check-input" id="checkbox1"><label class="form-check-label" for="checkbox1">Checkbox Option</label></div>`,
        attributes: { class: "fa fa-check-square-o" },
      });

      editor.BlockManager.add("label-field", {
        label: "Label",
        category: "Forms",
        content: `<div class="mb-3"><label class="form-label">Field Label</label></div>`,
        attributes: { class: "fa fa-tag" },
      });

      editor.BlockManager.add("textarea-field", {
        label: "Textarea",
        category: "Forms",
        content: `<div class="mb-3"><textarea class="form-control" rows="4" placeholder="Enter message"></textarea></div>`,
        attributes: { class: "fa fa-comment" },
      });

      editor.BlockManager.add("button-block", {
        label: "Button",
        category: "Forms",
        content: `<button class="btn btn-primary">Click Me</button>`,
        attributes: { class: "fa fa-hand-pointer-o" },
      });

      // Open the block manager sidebar
      editor.on("load", () => {
        // Add custom CSS to increase icon size and center icons for all manually added blocks
        const style = document.createElement("style");
        style.innerHTML = `
          .gjs-block__media {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .gjs-block__media svg {
            width: 32px !important;
            height: 32px !important;
          }
          .gjs-block {
            min-height: 70px;
          }
          .gjs-block-label {
            font-size: 11px;
          }
        `;
        document.head.appendChild(style);

        // Ensure sidebar is open
        const sidebar = editor.Panels.getPanel("views");
        if (sidebar) {
          sidebar.open();
        }

        // Open block manager
        const blockPanel = editor.Panels.getPanel("block-manager");
        if (blockPanel) {
          blockPanel.open();
        }
      });

      // Only set default content if not editing an existing template
      if (!templateId) {
        editor.setComponents(`
          <header style="background:#2563eb;color:white;padding:40px;text-align:center;">
            <h1 style="font-size:32px;">My Portfolio</h1>
          </header>

          <section style="padding:40px;background:#f3f4f6;">
            <h2>About Section</h2>
            <p>Start building your template</p>
          </section>
        `);
      }
    };

    init();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name.");
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", templateName);
      formData.append("category", templateCategory);
      formData.append("description", templateDescription);
      formData.append("is_premium", isPremium ? "1" : "0");
      formData.append("html_template", editor.getHtml());
      formData.append("css_styles", editor.getCss());

      if (thumbnail instanceof File && thumbnail.size > 0) {
        formData.append("thumbnail_url", thumbnail, thumbnail.name);
      }

      if (templateId) {
        await templatesAPI.update(templateId, formData);
        toast.success("Template has been updated successfully!");
      } else {
        await templatesAPI.create(formData);
        toast.success("Template has been added successfully!");
      }

      navigate("/admin/templates");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="bg-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Template Builder
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and customize your portfolio templates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : templateId ? "Update" : "Save"}
        </button>
      </div>

      {/* Template Details Form */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-row gap-4">
          {/* Template Name */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="portfolio">Portfolio</option>
              <option value="blog">Blog</option>
              <option value="business">Business</option>
              <option value="personal">Personal</option>
              <option value="minimal">Minimal</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            placeholder="Describe your template"
            rows={2}
            className="w-full border border-gray-300 px-3 py-2 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Premium Toggle */}
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Premium Template</span>
          </label>
        </div>

        {/* Thumbnail Upload */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail
          </label>

          {thumbnailPreview ? (
            <div className="relative w-full">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-40 object-cover rounded border border-gray-300"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 w-full">
              <div className="flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 min-h-0 z-1080 lg:z-1200">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default TemplateBuilder;
