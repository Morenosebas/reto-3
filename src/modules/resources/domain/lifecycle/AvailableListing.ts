import type { ResourceStatus } from "../ResourceAttributes";
import type { ListingLifecycle } from "./ListingLifecycle";

export class AvailableListing implements ListingLifecycle {
  readonly code = "available" as const;

  allowsVisitorContact(): boolean {
    return true;
  }

  noticeForVisitor(): string | null {
    return null;
  }

  canMoveTo(next: ResourceStatus): boolean {
    return next === "reserved" || next === "delivered";
  }

  allowedMoves(): ResourceStatus[] {
    return ["reserved", "delivered"];
  }
}
