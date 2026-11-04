import type { ResourceDTO } from "./ResourceDTO";
import type { ResourceModality } from "../domain/ResourceAttributes";
import { formatPrice } from "./labels";

/**
 * Descriptor tipado que devuelve extraFields() cuando la modalidad
 * tiene campos adicionales en el formulario. El componente ResourceForm
 * lo recibe y renderiza los campos correspondientes.
 */
export type ExchangeFieldsDescriptor = {
  type: "exchange-fields";
  wantedInReturn: string;
  onChangeWantedInReturn: (value: string) => void;
  inputClass: string;
};

export type SaleFieldsDescriptor = {
  type: "sale-fields";
  price: string;
  onChangePrice: (value: string) => void;
  inputClass: string;
};

export type ExtraFieldsDescriptor =
  | ExchangeFieldsDescriptor
  | SaleFieldsDescriptor
  | null;

/**
 * Bridge — Implementador abstracto.
 *
 * Define la interfaz que encapsula todo lo específico de una modalidad:
 * cómo se muestra su valor en una tarjeta, qué descriptor de campos extra
 * necesita el formulario y qué campos extra incluye el payload.
 *
 * Los componentes de UI (ResourceCard, ResourceForm) son la "abstracción"
 * del Bridge y delegan en esta interfaz en lugar de usar switch/condicionales.
 *
 * Agregar una nueva modalidad = escribir un nuevo ModalityPresenter;
 * los componentes no se modifican.
 */
export interface ModalityPresenter {
  /** Texto que resume el valor de la modalidad (ej: "Gratis", "$15.000"). */
  valueDisplay(dto: ResourceDTO): string;

  /**
   * Descriptor con los datos necesarios para renderizar los campos extra
   * del formulario. Retorna null si la modalidad no tiene campos extra.
   */
  extraFields(
    values: { wantedInReturn: string; price: string },
    update: (field: "wantedInReturn" | "price", value: string) => void,
    inputClass: string,
  ): ExtraFieldsDescriptor;

  /**
   * Campos extra que se incluyen en el payload enviado a la API.
   * Retorna un objeto vacío si la modalidad no tiene campos extra.
   */
  toExtraPayload(values: { wantedInReturn: string; price: string }): Record<string, unknown>;
}

// ─── Implementadores concretos ────────────────────────────────────────────────

/**
 * Bridge — Implementador concreto para donaciones.
 * No tiene campos extra: se regala sin condiciones.
 */
export class DonationPresenter implements ModalityPresenter {
  valueDisplay(): string {
    return "Gratis";
  }

  extraFields(): null {
    return null;
  }

  toExtraPayload(): Record<string, unknown> {
    return {};
  }
}

/**
 * Bridge — Implementador concreto para intercambios.
 * Requiere especificar qué se busca a cambio.
 */
export class ExchangePresenter implements ModalityPresenter {
  valueDisplay(dto: ResourceDTO): string {
    return `Lo cambio por ${dto.wantedInReturn ?? ""}`;
  }

  extraFields(
    values: { wantedInReturn: string; price: string },
    update: (field: "wantedInReturn" | "price", value: string) => void,
    inputClass: string,
  ): ExchangeFieldsDescriptor {
    return {
      type: "exchange-fields",
      wantedInReturn: values.wantedInReturn,
      onChangeWantedInReturn: (value) => update("wantedInReturn", value),
      inputClass,
    };
  }

  toExtraPayload(values: { wantedInReturn: string }): Record<string, unknown> {
    return { wantedInReturn: values.wantedInReturn };
  }
}

/**
 * Bridge — Implementador concreto para ventas solidarias.
 * Requiere un precio dentro del límite permitido.
 */
export class SalePresenter implements ModalityPresenter {
  valueDisplay(dto: ResourceDTO): string {
    return formatPrice(dto.price ?? 0);
  }

  extraFields(
    values: { wantedInReturn: string; price: string },
    update: (field: "wantedInReturn" | "price", value: string) => void,
    inputClass: string,
  ): SaleFieldsDescriptor {
    return {
      type: "sale-fields",
      price: values.price,
      onChangePrice: (value) => update("price", value),
      inputClass,
    };
  }

  toExtraPayload(values: { price: string }): Record<string, unknown> {
    return { price: values.price };
  }
}

// ─── Registro de presentadores ────────────────────────────────────────────────

/**
 * Mapa de modalidad → implementador concreto del Bridge.
 * Los componentes consultan aquí en lugar de tener switch propios.
 */
export const MODALITY_PRESENTERS: Record<ResourceModality, ModalityPresenter> = {
  donation: new DonationPresenter(),
  exchange: new ExchangePresenter(),
  sale: new SalePresenter(),
};
