/**
 * Pilot: professionals require manual approval before clients can book them.
 * // TODO: replace with real admin review API
 */

export type ProfessionalApprovalStatus = "pending" | "approved" | "rejected";

export interface ProfessionalApplication {
  professionalId: string;
  status: ProfessionalApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

/** Stub — always returns pending for newly submitted applications. */
export async function submitProfessionalApplication(
  professionalId: string,
): Promise<ProfessionalApplication> {
  return {
    professionalId,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
}

/** Stub — lookup would hit the backend; local pilot uses session.professionalStatus. */
export async function getProfessionalApprovalStatus(
  professionalId: string,
): Promise<ProfessionalApprovalStatus> {
  void professionalId;
  return "pending";
}

/** Stub — admin tooling will call this after human review. */
export async function approveProfessional(
  professionalId: string,
): Promise<ProfessionalApplication> {
  return {
    professionalId,
    status: "approved",
    submittedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  };
}
