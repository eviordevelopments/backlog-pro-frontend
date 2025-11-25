export const TASK_STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
} as const;

export const TASK_PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
} as const;

export const TEAM_ROLES = [
  "Product Owner",
  "Scrum Master",
  "Developer",
  "DevOps",
] as const;

export const SPRINT_STATUS = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
} as const;

export const RISK_STATUS = {
  open: "Open",
  mitigated: "Mitigated",
  closed: "Closed",
} as const;

// DORA Metrics Elite Thresholds
export const DORA_ELITE_THRESHOLDS = {
  deploymentFrequency: 10, // per week
  leadTime: 1, // day
  mttr: 1, // hour
  changeFailureRate: 15, // percentage
};

export const DORA_HIGH_THRESHOLDS = {
  deploymentFrequency: 5, // per week
  leadTime: 7, // days
  mttr: 24, // hours
  changeFailureRate: 30, // percentage
};
