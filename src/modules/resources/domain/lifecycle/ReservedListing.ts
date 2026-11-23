import type { ResourceStatus } from "../ResourceAttributes";
import type { ListingLifecycle } from "./ListingLifecycle";

export class ReservedListing implements ListingLifecycle {
  readonly code = "reserved" as const;

  allowsVisitorContact(): boolean {
    return false;
  }

  noticeForVisitor(): string | null {
    return "Apartado para otra persona.";
  }

  canMoveTo(next: ResourceStatus): boolean {
    return next === "available" || next === "delivered";
  }

  allowedMoves(): ResourceStatus[] {
    return ["available", "delivered"];
  }
}
