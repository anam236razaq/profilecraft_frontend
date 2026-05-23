import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import templatesAPI from "../api/templates";
import socialAPI from "../api/social";
import websitesAPI from "../api/websites";
import api from "../api/axios";

const CreateWebsite = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);

  const [subdomain, setSubdomain] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [importOptions, setImportOptions] = useState({
    about: true,
    portfolio: true,
    socialLinks: true,
  });

  const [socialData, setSocialData] = useState(null);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [userPlan, setUserPlan] = useState("basic");

  useEffect(() => {
    api.get("/stripe/subscription")
      .then(res => res.data)
      .then(data => {
        if (data.success && data.data?.plan) {
          setUserPlan(data.data.plan);
        }
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, accountsRes] = await Promise.all([
        templatesAPI.getAll({}),
        socialAPI.getAll(),
      ]);
      setTemplates(templatesRes.data.data.data || []);
      const connected = (accountsRes.data.data || []).filter(
        (a) => a.is_connected,
      );
      setSocialAccounts(connected);
      if (connected.length > 0) {
        setSelectedAccount(connected[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialData = async (accountId, retryCount = 0) => {
    setLoadingSocial(true);
    try {
      const [profileRes, projectsRes] = await Promise.all([
        socialAPI.getProfile(accountId),
        socialAPI.getProjects(accountId),
      ]);
      const profile = profileRes.data.data?.account;

      // If profile_url is missing and this is a Google account, retry once after a short delay
      // (Google有时候需要一点时间才能返回profile_image_url)
      if (!profile?.profile_image_url && retryCount === 0 && profile?.provider === 'google') {
        setTimeout(() => {
          fetchSocialData(accountId, 1);
        }, 1500);
        return;
      }

      setSocialData({
        profile: profile,
        projects: projectsRes.data.data || [],
      });
    } catch (err) {
      console.error("Failed to fetch social data", err);
    } finally {
      setLoadingSocial(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;

    const loadSocialData = async () => {
      await fetchSocialData(selectedAccount);
    };

    loadSocialData();
  }, [selectedAccount]);

  // Compile template with social data (replace placeholders)
  const compileTemplate = (templateHtml, profile, projects) => {
    if (!templateHtml) return "";

    let html = templateHtml;

    // Helper to get nested value from object
    const getValue = (obj, path, defaultValue = "") => {
      if (!obj) return defaultValue;
      const keys = path.split(".");
      let value = obj;
      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          return defaultValue;
        }
      }
      return value || defaultValue;
    };

    // Map of data-field to profile paths
    const fieldMappings = {
      // Simple text fields
      name:
        getValue(profile, "display_name") ||
        getValue(profile, "provider_username") ||
        "",
      headline: getValue(profile, "headline") || "",
      bio: getValue(profile, "bio") || "",
      location: getValue(profile, "location") || "",
      website: getValue(profile, "website_url") || "",
      email: getValue(profile, "metadata.email") || "",
      phone: getValue(profile, "metadata.phone") || "",
      availability: getValue(profile, "metadata.availability") || "",
      experience: getValue(profile, "metadata.experience") || "",
      education: getValue(profile, "metadata.education") || "",
      // Avatar special handling
      avatar: getValue(profile, "profile_image_url") || "",
      // Counts
      followers: getValue(profile, "follower_count") || 0,
      following: getValue(profile, "following_count") || 0,
      // Social links
      github: getValue(profile, "profile_url") || "",
      linkedin: getValue(profile, "profile_url") || "",
      // Username for display
      username:
        getValue(profile, "username") ||
        getValue(profile, "provider_username") ||
        "",
      // Company
      company: getValue(profile, "metadata.company") || "",
    };

    // Replace content in elements with data-field and data-demo attributes
    // For text content (innerHTML)
    // Text fields to replace (avatar is handled separately because it's an img tag)
    const textFields = [
      "name",
      "headline",
      "bio",
      "location",
      "website",
      "email",
      "phone",
      "availability",
      "experience",
      "education",
      "username",
      "company",
      "followers",
      "following",
      "github",
      "linkedin",
      "youtube",
      "twitter",
    ];

    textFields.forEach((field) => {
      const fieldValue = fieldMappings[field];
      if (fieldValue) {
        if (field === "email" || field === "linkedin") {
          const textRegex = new RegExp(
            `(<span[^>]*data-field="${field}"[^>]*>)([^<]*)`,
            "gi",
          );
          html = html.replace(textRegex, (match, openTag) => {
            return openTag + fieldValue;
          });

          // Second: update href for link elements
          if (field === "email") {
            if (fieldValue) {
              // Use Gmail web mailto format for universal compatibility
              // This works even without a desktop email client
              const encodedEmail = encodeURIComponent(fieldValue);
              html = html.replace(
                /href="[^"]*"[^>]*data-field="email"/gi,
                'href="https://mail.google.com/mail/?view=cm&fs=1&to=' +
                  encodedEmail +
                  '" data-field="email" target="_blank"',
              );
            } else {
              // No email data - keep href as placeholder #
              html = html.replace(
                /href="[^"]*"[^>]*data-field="email"/gi,
                'href="#" data-field="email"',
              );
            }
          }
          if (field === "linkedin") {
            if (fieldValue) {
              html = html.replace(
                /href="[^"]*"[^>]*data-field="linkedin"/gi,
                'href="' + fieldValue + '" data-field="linkedin"',
              );
            } else {
              // No linkedin data - keep href as placeholder #
              html = html.replace(
                /href="[^"]*"[^>]*data-field="linkedin"/gi,
                'href="#" data-field="linkedin"',
              );
            }
          }
        } else {
          // Replace innerHTML for elements with matching data-field
          const elementRegex = new RegExp(
            `(<([^>]+)[^>]*data-field="${field}"[^>]*>)([^<]*)`,
            "gi",
          );
          html = html.replace(elementRegex, (match, openTag) => {
            return openTag + fieldValue;
          });
        }
      }
    });

    // Handle avatar separately because it's an img tag with src attribute
    const avatarValue = fieldMappings.avatar;
    if (avatarValue) {
      // Find the img tag with data-field="avatar" and replace its src
      const imgRegex = /<img[^>]*data-field="avatar"[^>]*>/gi;
      html = html.replace(imgRegex, (match) => {
        // Replace existing src with new avatar value
        return match.replace(/src="[^"]*"/, `src="${avatarValue}"`);
      });
      // Also handle case where data-field="avatar" comes after src
      const imgRegex2 = /<img[^>]*src="[^"]*"[^>]*data-field="avatar"[^>]*>/gi;
      html = html.replace(imgRegex2, (match) => {
        return match.replace(/src="[^"]*"/, `src="${avatarValue}"`);
      });
      // Replace data-demo attribute for avatar field
      html = html.replace(
        /data-field="avatar"[^>]*data-demo="[^"]*"/gi,
        `data-field="avatar" data-demo="${avatarValue}"`,
      );
    }

    // Handle projects array - data-field="projects" with data-demo-index
    // Supports 'projects-section' (modern-gradient/personal), 'projects-list' (business-portfolio), 'projects-grid' (blog-portfolio/minimal)

    const hasProjectsSection = html.includes("projects-section");
    const hasProjectsList = html.includes("projects-list");
    const hasProjectsGrid = html.includes("projects-grid");
    // minimal/creative templates use projects-grid with project-image class
    const hasProjectImage = html.includes("project-image");
    // creative-portfolio uses section-bg-gradient class for project section background
    const hasSectionBgGradient = html.includes("section-bg-gradient");

    if (
      (hasProjectsSection || hasProjectsList || hasProjectsGrid) &&
      projects &&
      projects.length > 0
    ) {
      // Determine the section regex and structure based on template type
      let sectionRegex;
      let targetContainer;

      // Personal template detection must come FIRST because it has both section and projects-section
      if (hasProjectsSection && html.includes("<section") && html.includes('id="projects"')) {
        // personal-template uses <section id="projects" class="projects-section"> (order may vary)
        // Support any order of class and id attributes
        sectionRegex = /<section[^>]*id="projects"[^>]*class="projects-section"[^>]*>[\s\S]*?<\/section>/i;
        if (!html.match(sectionRegex)) {
          // Try the reverse order too
          sectionRegex = /<section[^>]*class="projects-section"[^>]*id="projects"[^>]*>[\s\S]*?<\/section>/i;
        }
        targetContainer = "personal";
      } else if (hasProjectsSection) {
        // modern-gradient uses projects-section as a div
        sectionRegex = /<div[^>]*class="projects-section"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i;
        targetContainer = "section";
      } else if (hasProjectsList) {
        // business-portfolio uses projects-list inside section#projects
        sectionRegex = /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-list"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
        targetContainer = "list";
      } else if (hasProjectsGrid && hasProjectImage && hasSectionBgGradient) {
        // creative-portfolio uses projects-grid with project-image and section-bg-gradient
        sectionRegex = /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
        targetContainer = "creative";
      } else if (hasProjectsGrid && hasProjectImage) {
        // minimal-portfolio uses projects-grid with project-image class
        sectionRegex = /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
        targetContainer = "minimal";
      } else {
        // blog-portfolio uses projects-grid without project-image
        sectionRegex = /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
        targetContainer = "grid";
      }

      const sectionMatch = html.match(sectionRegex);

      if (sectionMatch) {
        // Render each real project as a complete card
        const renderedProjects = projects
          .slice(0, 6)
          .map((p, idx) => {
            const projectFields = {
              title: p.title || "Project",
              description: p.description || "",
              url: p.url || "#",
              language: p.language || "",
              stars: String(p.stars_count || 0),
              forks: String(p.forks_count || 0),
            };
            if (targetContainer === "personal" || targetContainer === "section") {
              // personal-template and modern-gradient structure (same card format)
              return `
              <div data-field="projects" data-demo-index="${idx}" class="project-card">
                <div class="project-header">
                  <h3 class="project-title" data-field="projects[${idx}].title" data-demo="${projectFields.title}">${projectFields.title}</h3>
                  <span class="project-language" data-field="projects[${idx}].language" data-demo="${projectFields.language}">${projectFields.language}</span>
                </div>
                <p class="project-description" data-field="projects[${idx}].description" data-demo="${projectFields.description}">${projectFields.description}</p>
                <div class="project-stats">
                  <span class="project-stat">⭐ <span data-field="projects[${idx}].stars" data-demo="${projectFields.stars}">${projectFields.stars}</span></span>
                  <span class="project-stat">🍴 <span data-field="projects[${idx}].forks" data-demo="${projectFields.forks}">${projectFields.forks}</span></span>
                </div>
                <a href="${projectFields.url}" target="_blank" rel="noopener noreferrer" data-field="projects[${idx}].url" data-demo="${projectFields.url}" class="project-link">View Project →</a>
              </div>
            `;
            } else if (targetContainer === "list") {
              // business-portfolio structure
              return `
              <div data-field="projects" data-demo-index="${idx}" class="project-card">
                <div class="project-info">
                  <div class="project-header">
                    <h3 class="project-title" data-field="projects[${idx}].title" data-demo="${projectFields.title}">${projectFields.title}</h3>
                    <span class="project-language" data-field="projects[${idx}].language" data-demo="${projectFields.language}">${projectFields.language}</span>
                  </div>
                  <p class="project-description" data-field="projects[${idx}].description" data-demo="${projectFields.description}">${projectFields.description}</p>
                  <p class="project-tech"><strong>Tech Stack:</strong> ${projectFields.language || "Various technologies"}</p>
                  <a href="${projectFields.url}" target="_blank" rel="noopener noreferrer" data-field="projects[${idx}].url" data-demo="${projectFields.url}" class="project-link">View Project →</a>
                </div>
                <div class="project-stats">
                  <div class="project-stat">
                    <div class="number" data-field="projects[${idx}].stars" data-demo="${projectFields.stars}">${projectFields.stars}</div>
                    <div class="label">Stars</div>
                  </div>
                  <div class="project-stat">
                    <div class="number" data-field="projects[${idx}].forks" data-demo="${projectFields.forks}">${projectFields.forks}</div>
                    <div class="label">Forks</div>
                  </div>
                </div>
              </div>
            `;
            } else if (targetContainer === "minimal") {
              // minimal-portfolio structure with project image
              const projectImage = p.image || `https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop`;
              return `
              <div data-field="projects" data-demo-index="${idx}" class="project-card">
                <img data-field="projects[${idx}].image" data-demo="${projectImage}" src="${projectImage}" alt="${projectFields.title}" class="project-image" />
                <div class="project-content">
                  <div class="project-header">
                    <h3 class="project-title" data-field="projects[${idx}].title" data-demo="${projectFields.title}">${projectFields.title}</h3>
                    <span class="project-language" data-field="projects[${idx}].language" data-demo="${projectFields.language}">${projectFields.language}</span>
                  </div>
                  <p class="project-description" data-field="projects[${idx}].description" data-demo="${projectFields.description}">${projectFields.description}</p>
                  <div class="project-stats">
                    <span>⭐ <span data-field="projects[${idx}].stars" data-demo="${projectFields.stars}">${projectFields.stars}</span></span>
                    <span>🍴 <span data-field="projects[${idx}].forks" data-demo="${projectFields.forks}">${projectFields.forks}</span></span>
                  </div>
                  <a href="${projectFields.url}" target="_blank" rel="noopener noreferrer" data-field="projects[${idx}].url" data-demo="${projectFields.url}" class="project-link">View Case Study →</a>
                </div>
              </div>
            `;
            } else if (targetContainer === "creative") {
              // creative-portfolio structure with project image
              const projectImage = p.image || `https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&h=300&fit=crop`;
              return `
              <div data-field="projects" data-demo-index="${idx}" class="project-card">
                <img data-field="projects[${idx}].image" data-demo="${projectImage}" src="${projectImage}" alt="${projectFields.title}" class="project-image" />
                <div class="project-content">
                  <div class="project-header">
                    <h3 class="project-title" data-field="projects[${idx}].title" data-demo="${projectFields.title}">${projectFields.title}</h3>
                    <span class="project-language" data-field="projects[${idx}].language" data-demo="${projectFields.language}">${projectFields.language}</span>
                  </div>
                  <p class="project-description" data-field="projects[${idx}].description" data-demo="${projectFields.description}">${projectFields.description}</p>
                  <div class="project-stats">
                    <span>⭐ <span data-field="projects[${idx}].stars" data-demo="${projectFields.stars}">${projectFields.stars}</span></span>
                    <span>🍴 <span data-field="projects[${idx}].forks" data-demo="${projectFields.forks}">${projectFields.forks}</span></span>
                  </div>
                  <a href="${projectFields.url}" target="_blank" rel="noopener noreferrer" data-field="projects[${idx}].url" data-demo="${projectFields.url}" class="project-link">View Case Study →</a>
                </div>
              </div>
            `;
            } else {
              // blog-portfolio structure
              return `
              <div data-field="projects" data-demo-index="${idx}" class="project-card">
                <div class="project-header">
                  <div class="project-icon">📚</div>
                  <h3 class="project-title" data-field="projects[${idx}].title" data-demo="${projectFields.title}">${projectFields.title}</h3>
                </div>
                <p class="project-description" data-field="projects[${idx}].description" data-demo="${projectFields.description}">${projectFields.description}</p>
                <div class="project-tech">
                  <span data-field="projects[${idx}].language" data-demo="${projectFields.language}">${projectFields.language}</span>
                </div>
                <a href="${projectFields.url}" target="_blank" rel="noopener noreferrer" data-field="projects[${idx}].url" data-demo="${projectFields.url}" class="project-link">View Project →</a>
              </div>
            `;
            }
          })
          .join("");

        // Replace the entire projects section with rendered projects
        if (targetContainer === "personal") {
          // personal-template - section-based projects-section with title and subtitle
          // Support both attribute orders
          const projectsSectionRegex =
            /<section[^>]*id="projects"[^>]*class="projects-section"[^>]*>[\s\S]*?<\/section>/i;
          html = html.replace(
            projectsSectionRegex,
            `<section id="projects" class="projects-section"><div><h2 class="section-title">Featured Projects</h2><p class="section-subtitle">Some of my recent work</p><div class="projects-grid">${renderedProjects}</div></div></section>`,
          );
        } else if (targetContainer === "section") {
          // modern-gradient
          const projectsSectionRegex =
            /<div[^>]*class="projects-section"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i;
          html = html.replace(
            projectsSectionRegex,
            `<div class="projects-section"><h2 class="section-title">Featured Projects</h2><div class="projects-grid">${renderedProjects}</div></div>`,
          );
        } else if (targetContainer === "list") {
          // business-portfolio
          const projectsSectionRegex =
            /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-list"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
          html = html.replace(
            projectsSectionRegex,
            `<section id="projects" class="section"><div class="section-header"><div class="section-label">Portfolio</div><h2 class="section-title">Featured Projects</h2><div class="section-divider"></div></div><div class="projects-list">${renderedProjects}</div></section>`,
          );
        } else if (targetContainer === "minimal") {
          // minimal-portfolio - preserve the original structure with white background
          const projectsSectionRegex =
            /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
          html = html.replace(
            projectsSectionRegex,
            `<section id="projects" class="section" style="background: white; width: 100%"><div class="section-inner"><div class="section-header"><div class="section-label">Portfolio</div><h2 class="section-title">Selected Projects</h2></div><div class="projects-grid">${renderedProjects}</div></div></section>`,
          );
        } else if (targetContainer === "creative") {
          // creative-portfolio - preserve the section-bg-gradient background
          const projectsSectionRegex =
            /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
          html = html.replace(
            projectsSectionRegex,
            `<section id="projects" class="section section-bg-gradient"><div class="section-inner"><div class="section-header"><div class="section-label">Portfolio</div><h2 class="section-title">Selected Work</h2><div class="section-divider"></div></div><div class="projects-grid">${renderedProjects}</div></div></section>`,
          );
        } else {
          // blog-portfolio - preserve the original structure
          const projectsSectionRegex =
            /<section[^>]*id="projects"[^>]*>[\s\S]*?<div class="projects-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i;
          html = html.replace(
            projectsSectionRegex,
            `<section id="projects" class="section" style="background: #fffbeb;"><div style="width: 100%"><div class="section-header"><div class="section-label">Portfolio</div><h2 class="section-title">Featured Projects</h2><div class="section-divider"></div></div><div class="projects-grid">${renderedProjects}</div></div></section>`,
          );
        }
      }
    }
    // If no projects, leave the dummy project cards as-is in the template

    // Handle skills - multiple elements with same data-field
    if (profile && profile.skills) {
      const skills = Array.isArray(profile.skills)
        ? profile.skills
        : [profile.skills];
      // Replace data-demo in skill tags
      skills.forEach((skill) => {
        const skillRegex = new RegExp(
          `(<span[^>]*data-field="skills"[^>]*>)[^<]*(</span>)`,
          "gi",
        );
        html = html.replace(skillRegex, (match, openTag, closeTag) => {
          return openTag + skill + closeTag;
        });
      });
    }

    // Clean up any remaining data-demo attributes
    // This ensures imported data shows correctly
    html = html.replace(/data-demo="([^"]*)"/g, (match) => {
      return match;
    });

    return html;
  };

  const handleCreate = async () => {
    if (!subdomain.trim()) {
      toast.error("Please enter a subdomain");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    setCreating(true);
    try {
      // Get template to compile
      let compiledHtml = "";
      let templateStyles = "";
      const templateRes = await templatesAPI.getById(selectedTemplate.id);
      const templateData = templateRes.data.data;

      if (templateData.html_template) {
        compiledHtml = compileTemplate(
          templateData.html_template,
          socialData?.profile,
          socialData?.projects || [],
        );
        templateStyles = templateData.css_styles || "";
      }

      const websiteData = {
        subdomain: subdomain
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-"),
        template_id: selectedTemplate.id,
        template_name: selectedTemplate.name,
        template_slug: selectedTemplate.slug,
        website_data: JSON.stringify({
          sections: [],
          theme: {},
          compiled_html: compiledHtml,
          compiled_css: templateStyles,
        }),
      };

      const response = await websitesAPI.create(websiteData);
      const newWebsite = response.data.data;

      // Publish the website immediately after creation
      await websitesAPI.publish(newWebsite.id);

      toast.success("Website has been created successfully");
      // Navigate to websites list page
      navigate("/websites");
    } catch (err) {
      console.error("Failed to create website", err);
      toast.error(err.response?.data?.message || "Failed to create website");
    } finally {
      setCreating(false);
    }
  };

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

  const validateSubdomain = (value) => {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (loadingSocial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading social data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Steps Indicator */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-0">
            {["Domain", "Template", "Import", "Review"].map((label, idx) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    step > idx + 1
                      ? "bg-green-500 text-white"
                      : step === idx + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > idx + 1 ? "✓" : idx + 1}
                </div>
                <span
                  className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
                    step === idx + 1 ? "text-indigo-600" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
                {idx < 3 && (
                  <div
                    className={`hidden sm:block w-8 sm:w-12 lg:w-16 h-0.5 mx-2 sm:mx-3 lg:mx-4 ${
                      step > idx + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose Your Domain
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdomain
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) =>
                    setSubdomain(validateSubdomain(e.target.value))
                  }
                  placeholder="my-portfolio"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                  .profilecraft.com
                </span>
              </div>
            </div>
            <button
              onClick={() => subdomain && setStep(2)}
              disabled={!subdomain}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose a Template
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((template) => {
                const isLocked = template.is_premium && userPlan === "basic";
                return (
                <div
                  key={template.id}
                  onClick={() => !isLocked && setSelectedTemplate(template)}
                  className={`cursor-pointer rounded-xl border-2 overflow-hidden transition ${
                    selectedTemplate?.id === template.id
                      ? "border-indigo-600 ring-2 ring-indigo-100"
                      : isLocked
                        ? "border-gray-200 opacity-60 cursor-not-allowed"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="h-40 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">PRO</span>
                      </div>
                    )}
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className={`w-full h-full object-cover ${isLocked ? "opacity-50" : ""}`}
                      />
                    ) : (
                      <span className="text-5xl">
                        {getIcon(template.category)}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {(template.description && template.description.length > 100)
                        ? template.description.substring(0, 100) + "..."
                        : template.description || template.category}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Back
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTemplate}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Import Your Data
            </h2>

            {/* Account Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Account
              </label>
              <select
                value={selectedAccount || ""}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {socialAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.provider} - {account.provider_username}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Preview */}
            {socialData?.profile && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">
                  Data to Import
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        socialData.profile.profile_image_url ||
                        socialData.profile.provider_avatar_url
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {socialData.profile.display_name ||
                          socialData.profile.provider_username}
                      </p>
                      {socialData.profile.bio && (
                        <p className="text-sm text-gray-500">
                          {socialData.profile.bio}
                        </p>
                      )}
                      {socialData.profile.metadata?.email && (
                        <p className="text-xs text-gray-400">
                          Email: {socialData.profile.metadata.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {socialData.profile.provider && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Provider:{" "}
                        <span className="capitalize">
                          {socialData.profile.provider}
                        </span>
                      </p>
                    </div>
                  )}
                  {!socialData.profile.provider && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Provider: <span className="capitalize">Google</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Import Options */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Import Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.about}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        about: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    About/Bio (name, avatar, bio, email)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.portfolio}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        portfolio: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    Portfolio/Projects (GitHub repos)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.socialLinks}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        socialLinks: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    Social Links (profile URL)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Back
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review & Create
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Domain</h3>
                <p className="text-indigo-600">{subdomain}.profilecraft.com</p>
              </div>
              <div>
                <h3 className="font-medium text-indigo-900 mb-3">Template</h3>
                <p className="text-gray-600 capitalize">
                  {selectedTemplate?.name}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Data Source</h3>
                <p className="text-gray-600 capitalize">
                  {socialData.profile.provider_username ||
                    socialAccounts.find((a) => a.id === selectedAccount)
                      ?.provider ||
                    "Google"}
                </p>
                {socialData?.profile?.metadata?.email && (
                  <p className="text-sm text-gray-500 mt-1">
                    Email: {socialData.profile.metadata.email}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Import Summary
                </h3>
                <ul className="text-gray-600">
                  {importOptions.about && <li>✓ Name, Avatar, Bio, Email</li>}
                  {importOptions.portfolio && <li>✓ Projects/Repos</li>}
                  {importOptions.socialLinks && <li>✓ Profile Link</li>}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Back
              </button>
              <div className="flex-1" />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Website"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWebsite;
