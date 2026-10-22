import type {
  ResourceCategory,
  ResourceModality,
  ResourceStatus,
} from "./ResourceAttributes";

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

  abstract modalityDetails(): { wantedInReturn?: string; price?: number };
}

export class DonationResource extends Resource {
  readonly modality = "donation" as const;

  constructor(props: BaseResourceProps) {
    super(props);
  }

  modalityDetails() {
    return {};
  }
}

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
