/**
 * TEMP pilot switch: when true, new professionals are approved immediately
 * (no "Application under review" gate) and appear in client browse lists.
 * Set to `false` to restore manual approval.
 */
export const AUTO_APPROVE_PROFESSIONALS = false;

export function defaultProfessionalStatus(): "pending" | "approved" {
  return "pending";
}

export function isAwaitingApproval(status: string | undefined) {
  return status === "pending" || status === "rejected";
}
