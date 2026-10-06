import type {
  ResourceCategory,
  ResourceModality,
  ResourceStatus,
} from "./ResourceAttributes";

/** Datos comunes a cualquier recurso, sin importar su modalidad. */
export interface BaseResourceProps {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  location: string;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Producto del Factory Method: un objeto, material o producto publicado
 * para que otra persona lo reutilice. Cada modalidad es una subclase.
 */
export abstract class Resource {
  abstract readonly modality: ResourceModality;

  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: ResourceCategory;
  readonly location: string;
  readonly status: ResourceStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  protected constructor(props: BaseResourceProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.location = props.location;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Datos propios de la modalidad, usados al actualizar o serializar. */
  abstract modalityDetails(): { wantedInReturn?: string; price?: number };
}

/** Se entrega gratis a quien lo necesite. */
export class DonationResource extends Resource {
  readonly modality = "donation" as const;

  constructor(props: BaseResourceProps) {
    super(props);
  }

  modalityDetails() {
    return {};
  }
}

/** Se entrega a cambio de otro objeto. */
export class ExchangeResource extends Resource {
  readonly modality = "exchange" as const;

  constructor(
    props: BaseResourceProps,
    readonly wantedInReturn: string,
  ) {
    super(props);
  }

  modalityDetails() {
    return { wantedInReturn: this.wantedInReturn };
  }
}

/** Se vende a un precio simbólico, con un tope máximo. */
export class SaleResource extends Resource {
  readonly modality = "sale" as const;

  constructor(
    props: BaseResourceProps,
    readonly price: number,
  ) {
    super(props);
  }

  modalityDetails() {
    return { price: this.price };
  }
}
