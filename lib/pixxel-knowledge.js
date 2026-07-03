const SECTION_KEYWORDS = [
  {
    title: "Pixxel Overview",
    keywords: ["pixxel", "app", "web app", "application", "platform", "built"],
  },
  {
    title: "Authentication and Access",
    keywords: ["login", "sign in", "sign up", "auth", "authentication", "access", "user id", "session"],
  },
  {
    title: "Dashboard",
    keywords: ["dashboard", "project", "projects", "folder", "search", "recent", "saved", "card"],
  },
  {
    title: "Editor Workspace",
    keywords: ["editor", "canvas", "tool", "toolbar", "layers", "zoom", "undo", "redo", "save"],
  },
  {
    title: "Basic Tools",
    keywords: ["crop", "resize", "adjust", "text", "brightness", "contrast", "saturation", "trim"],
  },
  {
    title: "AI Background Editing",
    keywords: ["background", "remove background", "bg", "blur", "shadow", "healing", "background removal"],
  },
  {
    title: "AI Editing",
    keywords: ["retouch", "upscale", "skin", "smooth", "enhance", "sharpen", "cloudinary", "imagekit"],
  },
  {
    title: "AI Extender",
    keywords: ["extend", "generative fill", "canvas expansion", "surrounding", "direction", "extend image"],
  },
  {
    title: "Advanced Enhancement",
    keywords: ["twilight", "water", "enhancer", "presets", "blue", "golden", "mauve", "emerald"],
  },
  {
    title: "Batch Editor",
    keywords: ["batch", "multiple images", "batch editor", "upload many", "projects", "manage multiple"],
  },
  {
    title: "Export and Storage",
    keywords: ["export", "save", "storage", "png", "jpg", "webp", "pdf", "canvas state", "cloudinary", "imagekit"],
  },
  {
    title: "Plans",
    keywords: ["plan", "free plan", "pro plan", "pricing", "cost", "subscription", "upgrade"],
  },
  {
    title: "Security",
    keywords: ["security", "data", "unauthorized", "access denied", "privacy", "user data", "project ownership"],
  },
  {
    title: "Technology Stack",
    keywords: ["technology", "stack", "next.js", "react", "convex", "clerk", "fabric.js", "cloudinary", "imagekit"],
  },
];

export const PIXEL_KNOWLEDGE_SECTIONS = [
  {
    title: "Pixxel Overview",
    content:
      "Pixxel is an AI-powered web image editor built with Next.js, React, Convex, Clerk, Fabric.js, ImageKit, and Cloudinary. Users sign in, upload images, create projects, edit on a browser canvas, save work to the dashboard, and export final images. The application is designed for simple professional editing without installing desktop software.",
  },
  {
    title: "Authentication and Access",
    content:
      "Users cannot access the dashboard, project data, or editor workspace without login. Clerk handles sign in, sign up, sessions, and user identity. Convex checks the authenticated user before returning projects or allowing project changes. Each project belongs to a specific userId.",
  },
  {
    title: "Dashboard",
    content:
      "The dashboard shows user profile, plan status, total projects, folders, recent projects, saved images, project cards, search, sorting, delete, move to folder, and project creation. Users can upload one or many photos from the New Project modal, and each photo becomes a separate dashboard project.",
  },
  {
    title: "Editor Workspace",
    content:
      "The editor page contains a Fabric.js canvas, top toolbar, side tool panel, bottom controls, layers panel, batch editor, export modal, compare mode, review/feedback, undo and redo, save project, and zoom controls. The canvas stores object state so edits can be reopened later.",
  },
  {
    title: "Basic Tools",
    content:
      "Basic tools include resize, crop, adjust, and text. Resize changes canvas dimensions and includes presets such as full screen. Crop allows image trimming and aspect ratio control. Adjust changes brightness, contrast, saturation, and other visual settings. Text adds editable text with fonts, colors, alignment, stroke, shadow, and passport photo layout support.",
  },
  {
    title: "AI Background Editing",
    content:
      "Background AI supports background removal, changing background color, adding background images, blur, shadow, and healing. ImageKit can remove backgrounds for ImageKit-hosted images, while Cloudinary supports other AI operations. Healing lets users brush over marks or unwanted spots and blend them with nearby pixels.",
  },
  {
    title: "AI Editing",
    content:
      "AI Editing includes AI Retouch, AI Upscale, Skin Tone and Smooth, Enhance and Sharpen, and Premium Quality. ImageKit transformations are used for AI Retouch, AI Upscale, contrast, and sharpening. Cloudinary is used for skin tone and smooth improvement. If an image is not hosted on ImageKit, the app uploads it before applying ImageKit AI transformations.",
  },
  {
    title: "AI Extender",
    content:
      "AI Image Extender expands an image canvas in selected directions using generative fill logic. The user chooses direction and amount, and the backend sends image and dimensions to the processing service so new surrounding content can be generated naturally.",
  },
  {
    title: "Advanced Enhancement",
    content:
      "Pixxel includes Twilight Enhance with Golden, Blush, Emerald, Mauve, and Blue presets. Users can control amount and exposure. Water Enhancer detects water-like regions using color and luminance logic, then applies amount, contrast, bluish, greenish, brightness, and original color protection only to detected water areas.",
  },
  {
    title: "Batch Editor",
    content:
      "The Batch Editor lets users manage multiple project images from the editor. Users can upload multiple photos, create separate projects, switch between them, save edits, remove items, and see the uploaded projects on the dashboard. Free plan limits still apply.",
  },
  {
    title: "Export and Storage",
    content:
      "Users can export edited images in formats such as PNG, JPG, WEBP, BMP, SVG, and PDF. Canvas state and image URLs are saved with the project. Convex stores project metadata and canvas state references. ImageKit stores uploaded images and provides optimized delivery URLs.",
  },
  {
    title: "Plans",
    content:
      "Free plan includes 3 projects, 20 exports per month, and basic tools such as resize, crop, adjust, and text. Pro plan includes unlimited projects, unlimited exports, batch editing, AI background tools, AI extender, AI editing, double exposure, selective color, twilight enhance, water enhancer, and premium workflow features.",
  },
  {
    title: "Security",
    content:
      "Pixxel protects user data through Clerk authentication, Convex user checks, project ownership checks, cloud storage URLs, and database access rules. A user can view and edit only their own projects. Unauthorized access returns no data or access denied.",
  },
  {
    title: "Technology Stack",
    content:
      "Next.js provides routing, pages, API routes, and full-stack structure. React builds the user interface. Convex provides backend database and server functions. Clerk handles authentication. Fabric.js powers the interactive canvas. ImageKit handles uploads, image storage, optimization, and transformations. Cloudinary supports selected AI image processing tasks.",
  },
];

export function getPixxelKnowledgeText() {
  return PIXEL_KNOWLEDGE_SECTIONS.map(
    (section) => `${section.title}: ${section.content}`
  ).join("\n\n");
}

function normalizeQuestion(question) {
  return question.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function findMappedSection(question) {
  const normalizedQuestion = normalizeQuestion(question);
  const terms = normalizedQuestion.split(/\s+/).filter(Boolean);

  const scoredSections = SECTION_KEYWORDS.map((section) => {
    const score = section.keywords.reduce((total, keyword) => {
      return terms.some((term) => term === keyword || keyword.includes(term))
        ? total + 3
        : total;
    }, 0);
    return { ...section, score };
  });

  const bestMatch = scoredSections.sort((a, b) => b.score - a.score)[0];
  return bestMatch && bestMatch.score > 0 ? bestMatch.title : null;
}

export function getRelevantPixxelSections(question, limit = 5) {
  const normalizedQuestion = normalizeQuestion(question);
  const terms = normalizedQuestion
    .split(/\s+/)
    .filter((term) => term.length > 2);

  return PIXEL_KNOWLEDGE_SECTIONS.map((section) => {
    const text = `${section.title} ${section.content}`.toLowerCase();
    const score = terms.reduce((total, term) => {
      if (text.includes(term)) return total + 2;
      return total;
    }, 0);
    return { ...section, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function summarizeAnswer(sections) {
  const content = sections.map((section) => section.content).join(" ");
  if (content.length <= 950) return content;

  const trimmed = content.slice(0, 950);
  const lastPeriod = trimmed.lastIndexOf(".");
  return lastPeriod > 0 ? trimmed.slice(0, lastPeriod + 1) : `${trimmed.trim()}...`;
}

export function buildLocalPixxelAnswer(question) {
  const mappedTitle = findMappedSection(question);
  if (mappedTitle) {
    const mappedSection = PIXEL_KNOWLEDGE_SECTIONS.find((section) => section.title === mappedTitle);
    if (mappedSection) {
      return mappedSection.content;
    }
  }

  const relevant = getRelevantPixxelSections(question).filter((item) => item.score > 0);
  if (relevant.length === 0) {
    return "I understand this Pixxel app and can answer questions about the dashboard, editor, AI tools, plans, or how the app works. Please ask a specific question about these features.";
  }

  return summarizeAnswer(relevant.slice(0, 3));
}
