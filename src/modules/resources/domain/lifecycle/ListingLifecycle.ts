import type { ResourceStatus } from "../ResourceAttributes";

/** Estado concreto del ciclo de vida de una publicación. */
export interface ListingLifecycle {
  readonly code: ResourceStatus;
  allowsVisitorContact(): boolean;
  noticeForVisitor(): string | null;
  canMoveTo(next: ResourceStatus): boolean;
  allowedMoves(): ResourceStatus[];
}
