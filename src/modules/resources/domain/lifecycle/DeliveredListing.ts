import type { ResourceStatus } from "../ResourceAttributes";
import type { ListingLifecycle } from "./ListingLifecycle";

export class DeliveredListing implements ListingLifecycle {
  readonly code = "delivered" as const;

  allowsVisitorContact(): boolean {
    return false;
  }

  noticeForVisitor(): string | null {
    return "Ya fue entregado.";
  }

  canMoveTo(next: ResourceStatus): boolean {
    return next === "available";
  }

  allowedMoves(): ResourceStatus[] {
    return ["available"];
  }
}
