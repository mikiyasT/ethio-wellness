import type { Request, Response } from "express";

export function unspecifiedContract(area: string) {
  return (_req: Request, res: Response) => {
    res.status(501).json({
      error: "unspecified_contract",
      message:
        `The UI spec does not define an API contract for ${area}. This module is scaffolded only.`,
    });
  };
}
