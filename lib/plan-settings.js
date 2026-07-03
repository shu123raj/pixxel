export const PLAN_LIMITS = {
  free: {
    label: "Free",
    maxProjects: 3,
    maxExportsPerMonth: 20,
    maxBatchUpload: 3,
    maxUploadSizeMb: 20,
  },
  pro: {
    label: "Pro",
    maxProjects: Infinity,
    maxExportsPerMonth: Infinity,
    maxBatchUpload: 20,
    maxUploadSizeMb: 50,
  },
};

export const BASIC_TOOLS = ["resize", "crop", "adjust", "text"];

export const PRO_TOOLS = [
  "background",
  "ai_extender",
  "ai_edit",
  "double_exposure",
  "batch_editor",
  "twilight_enhance",
  "water_enhancer",
  "selective_color",
];

export function getProjectLimitText(plan = "free") {
  const limit = PLAN_LIMITS[plan]?.maxProjects ?? PLAN_LIMITS.free.maxProjects;
  return limit === Infinity ? "Unlimited projects" : `${limit} projects`;
}

export function getExportLimitText(plan = "free") {
  const limit = PLAN_LIMITS[plan]?.maxExportsPerMonth ?? PLAN_LIMITS.free.maxExportsPerMonth;
  return limit === Infinity ? "Unlimited exports" : `${limit} exports/month`;
}
