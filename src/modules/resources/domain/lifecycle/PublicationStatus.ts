import { ValidationError } from "../errors";
import type { ResourceStatus } from "../ResourceAttributes";
import { AvailableListing } from "./AvailableListing";
import { DeliveredListing } from "./DeliveredListing";
import type { ListingLifecycle } from "./ListingLifecycle";
import { ReservedListing } from "./ReservedListing";

const LIFECYCLES: Record<ResourceStatus, ListingLifecycle> = {
  available: new AvailableListing(),
  reserved: new ReservedListing(),
  delivered: new DeliveredListing(),
};

/** Contexto del patrón State: delega el comportamiento al estado actual. */
export class PublicationStatus {
  private readonly lifecycle: ListingLifecycle;

  constructor(code: ResourceStatus) {
    this.lifecycle = LIFECYCLES[code];
  }

  get code(): ResourceStatus {
    return this.lifecycle.code;
  }

  allowsVisitorContact(): boolean {
    return this.lifecycle.allowsVisitorContact();
  }

  noticeForVisitor(): string | null {
    return this.lifecycle.noticeForVisitor();
  }

  allowedMoves(): ResourceStatus[] {
    return this.lifecycle.allowedMoves();
  }

  canMoveTo(next: ResourceStatus): boolean {
    return this.lifecycle.canMoveTo(next);
  }

  transitionTo(next: ResourceStatus): PublicationStatus {
    if (next === this.code) return this;
    if (!this.lifecycle.canMoveTo(next)) {
      throw new ValidationError(
        `No se puede pasar de ${STATUS_NAMES[this.code]} a ${STATUS_NAMES[next]}`,
        { status: `Desde ${STATUS_NAMES[this.code]} solo se permite: ${this.allowedMoves().map((s) => STATUS_NAMES[s]).join(", ")}` },
      );
    }
    return new PublicationStatus(next);
  }
}

export function listingLifecycleOf(code: ResourceStatus): ListingLifecycle {
  return LIFECYCLES[code];
}

const STATUS_NAMES: Record<ResourceStatus, string> = {
  available: "disponible",
  reserved: "reservado",
  delivered: "entregado",
};
