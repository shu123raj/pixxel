// hooks/use-plan-access.js
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BASIC_TOOLS, PLAN_LIMITS, PRO_TOOLS } from "@/lib/plan-settings";

export function usePlanAccess() {
  const { has } = useAuth();
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const isPro = currentUser?.plan === "pro" || has?.({ plan: "pro" }) || false;
  const isFree = !isPro; // If not pro, then free (default)
  const currentPlan = isPro ? "pro" : "free";
  const limits = PLAN_LIMITS[currentPlan];

  // Define which tools are available for each plan
  const planAccess = Object.fromEntries([
    ...BASIC_TOOLS.map((toolId) => [toolId, true]),
    ...PRO_TOOLS.map((toolId) => [toolId, isPro]),
  ]);

  // Helper function to check if user has access to a specific tool
  const hasAccess = (toolId) => {
    return planAccess[toolId] === true;
  };

  // Get restricted tools that user doesn't have access to
  const getRestrictedTools = () => {
    return Object.entries(planAccess)
      .filter(([_, hasAccess]) => !hasAccess)
      .map(([toolId]) => toolId);
  };

  // Check if user has reached project limits
  const canCreateProject = (currentProjectCount) => {
    if (isPro) return true;
    return currentProjectCount < limits.maxProjects;
  };

  // Check if user has reached export limits
  const canExport = (currentExportsThisMonth) => {
    if (isPro) return true;
    return currentExportsThisMonth < limits.maxExportsPerMonth;
  };

  const getRemainingProjects = (currentProjectCount) => {
    if (isPro) return Infinity;
    return Math.max(0, limits.maxProjects - currentProjectCount);
  };

  return {
    userPlan: currentPlan,
    limits,
    isPro,
    isFree,
    hasAccess,
    planAccess,
    getRestrictedTools,
    canCreateProject,
    canExport,
    getRemainingProjects,
  };
}
