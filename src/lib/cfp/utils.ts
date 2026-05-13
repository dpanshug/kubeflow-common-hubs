const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export type CfpStatus = "draft" | "open" | "closed" | "reviewing" | "finalized";
export type CfpSubmissionStatus =
  | "submitted"
  | "in_review"
  | "shortlisted"
  | "approved"
  | "rejected"
  | "waitlisted";

export function daysUntil(deadline: Date | string): number {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return Math.max(
    0,
    Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

const cfpStatusVariant: Record<
  CfpStatus,
  "success" | "secondary" | "warning" | "destructive"
> = {
  open: "success",
  draft: "secondary",
  closed: "secondary",
  reviewing: "warning",
  finalized: "secondary",
};

const cfpStatusLabel: Record<CfpStatus, string> = {
  open: "Open",
  draft: "Draft",
  closed: "Closed",
  reviewing: "Under Review",
  finalized: "Finalized",
};

export function getCfpStatusBadge(status: CfpStatus) {
  return {
    variant: cfpStatusVariant[status],
    label: cfpStatusLabel[status],
  };
}

const submissionStatusVariant: Record<
  CfpSubmissionStatus,
  "success" | "secondary" | "warning" | "destructive" | "default" | "outline"
> = {
  submitted: "secondary",
  in_review: "warning",
  shortlisted: "default",
  approved: "success",
  rejected: "destructive",
  waitlisted: "outline",
};

const submissionStatusLabel: Record<CfpSubmissionStatus, string> = {
  submitted: "Submitted",
  in_review: "In Review",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
  waitlisted: "Waitlisted",
};

export function getSubmissionStatusBadge(status: CfpSubmissionStatus) {
  return {
    variant: submissionStatusVariant[status],
    label: submissionStatusLabel[status],
  };
}

export function isDeadlinePassed(deadline: Date | string): boolean {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return d.getTime() < Date.now();
}
