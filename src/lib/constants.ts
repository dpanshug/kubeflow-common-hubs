export const SITE_NAME = "Kubeflow Common Hubs";
export const SITE_DESCRIPTION =
  "The one-stop community hub for Kubeflow in India. Learn, contribute, and grow with the community.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kubeflowcommonhubs.in";

export const NAV_LINKS = [
  { label: "Events", href: "/events" },
  { label: "News", href: "/news" },
  { label: "CFPs", href: "/cfps" },
] as const;

export const POINT_VALUES = {
  COMPLETE_PROFILE: 10,
  ATTEND_EVENT: 20,
  SUBMIT_CFP: 30,
  CFP_APPROVED: 50,
  PR_MERGED: 25,
  CODE_REVIEW: 15,
  ISSUE_FILED: 10,
  PUBLISH_NEWS: 20,
  BADGE_BRONZE: 10,
  BADGE_SILVER: 25,
  BADGE_GOLD: 50,
  BADGE_PLATINUM: 100,
} as const;

export const LEVELS = [
  { level: 1, name: "Newcomer", minPoints: 0 },
  { level: 2, name: "Contributor", minPoints: 50 },
  { level: 3, name: "Active Member", minPoints: 150 },
  { level: 4, name: "Community Builder", minPoints: 400 },
  { level: 5, name: "Champion", minPoints: 1000 },
  { level: 6, name: "Legend", minPoints: 2500 },
] as const;

export const CFP_TALK_TYPES = [
  { value: "talk_30", label: "Talk (30 min)" },
  { value: "talk_45", label: "Talk (45 min)" },
  { value: "lightning_10", label: "Lightning Talk (10 min)" },
  { value: "workshop", label: "Workshop" },
  { value: "panel", label: "Panel Discussion" },
] as const;

export const INDIAN_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kochi",
  "Chandigarh",
  "Indore",
  "Bhopal",
  "Virtual",
  "Other",
] as const;

export const INTERESTS = [
  "ML Pipelines",
  "Model Serving",
  "Training Operators",
  "Notebooks",
  "AutoML",
  "Platform Engineering",
  "Documentation",
  "Community Events",
  "Security",
  "CI/CD for ML",
] as const;
