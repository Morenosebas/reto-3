import { z } from "zod";
import { CONTACT_PHONE_MESSAGE, toColombianMobile } from "../domain/contactPhone";
import { ValidationError } from "../domain/errors";
import {
  MAX_SALE_PRICE,
  RESOURCE_CATEGORIES,
  RESOURCE_MODALITIES,
  RESOURCE_STATUSES,
} from "../domain/ResourceAttributes";

const titleSchema = z
  .string({ error: "El título debe ser texto" })
  .trim()
  .min(3, { error: "El título debe tener entre 3 y 80 caracteres" })
  .max(80, { error: "El título debe tener entre 3 y 80 caracteres" });

const descriptionSchema = z
  .string({ error: "La descripción debe ser texto" })
  .trim()
  .min(10, { error: "La descripción debe tener entre 10 y 500 caracteres" })
  .max(500, { error: "La descripción debe tener entre 10 y 500 caracteres" });

const locationSchema = z
  .string({ error: "La ubicación debe ser texto" })
  .trim()
  .min(3, { error: "La ubicación debe tener entre 3 y 120 caracteres" })
  .max(120, { error: "La ubicación debe tener entre 3 y 120 caracteres" });

const wantedInReturnSchema = z
  .string({ error: "La contraprestación debe ser texto" })
  .trim()
  .min(3, { error: "La contraprestación debe tener entre 3 y 120 caracteres" })
  .max(120, { error: "La contraprestación debe tener entre 3 y 120 caracteres" });

const salePriceSchema = z
  .union(
    [
      z.number({ error: "El precio debe ser un número entero de pesos" }),
      z
        .string({ error: "El precio debe ser un número entero de pesos" })
        .trim()
        .regex(/^\d+$/, {
          error: "El precio debe ser un número entero de pesos",
        })
        .transform(Number),
    ],
    { error: "El precio debe ser un número entero de pesos" },
  )
  .pipe(
    z
      .number({ error: "El precio debe ser un número entero de pesos" })
      .int({ error: "El precio debe ser un número entero de pesos" })
      .min(1, { error: `El precio debe estar entre 1 y ${MAX_SALE_PRICE} COP` })
      .max(MAX_SALE_PRICE, {
        error: `El precio debe estar entre 1 y ${MAX_SALE_PRICE} COP`,
      }),
  );

const contactPhoneSchema = z
  .string({ error: CONTACT_PHONE_MESSAGE })
  .refine((value) => toColombianMobile(value) !== null, { error: CONTACT_PHONE_MESSAGE })
  .transform((value) => toColombianMobile(value) as string);

const commonCreationFields = {
  title: titleSchema,
  description: descriptionSchema,
  category: z.enum(RESOURCE_CATEGORIES, {
    error: "La categoría no es válida",
  }),
  location: locationSchema,
  status: z
    .enum(RESOURCE_STATUSES, { error: "El estado no es válido" })
    .optional(),
  contactPhone: contactPhoneSchema.optional(),
};

export const resourceCreationSchema = z.discriminatedUnion("modality", [
  z.object({
    ...commonCreationFields,
    modality: z.literal("donation"),
    wantedInReturn: wantedInReturnSchema.optional(),
    price: salePriceSchema.optional(),
  }),
  z.object({
    ...commonCreationFields,
    modality: z.literal("exchange"),
    wantedInReturn: wantedInReturnSchema,
    price: salePriceSchema.optional(),
  }),
  z.object({
    ...commonCreationFields,
    modality: z.literal("sale"),
    wantedInReturn: wantedInReturnSchema.optional(),
    price: salePriceSchema,
  }),
]);

export const resourcePatchSchema = z.object({
  modality: z.enum(RESOURCE_MODALITIES, { error: "La modalidad no es válida" }).optional(),
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  category: z
    .enum(RESOURCE_CATEGORIES, { error: "La categoría no es válida" })
    .optional(),
  location: locationSchema.optional(),
  status: z.enum(RESOURCE_STATUSES, { error: "El estado no es válido" }).optional(),
  wantedInReturn: wantedInReturnSchema.optional(),
  price: salePriceSchema.optional(),
  contactPhone: contactPhoneSchema.optional(),
});

export type ResourceCreationInput = z.input<typeof resourceCreationSchema>;
export type ValidatedResourceCreation = z.output<typeof resourceCreationSchema>;
export type ResourcePatchInput = z.input<typeof resourcePatchSchema>;
export type ValidatedResourcePatch = z.output<typeof resourcePatchSchema>;

export function parseResourceCreation(input: unknown): ValidatedResourceCreation {
  const result = resourceCreationSchema.safeParse(input);
  if (!result.success) throw validationError(result.error, "crear");
  return result.data;
}

export function parseResourcePatch(input: unknown): ValidatedResourcePatch {
  const result = resourcePatchSchema.safeParse(input);
  if (!result.success) throw validationError(result.error, "actualizar");
  return result.data;
}

function validationError(error: z.ZodError, action: "crear" | "actualizar") {
  const issue = error.issues[0];
  if (!issue || issue.path.length === 0) {
    return new ValidationError("El cuerpo debe ser un objeto JSON");
  }
  const fieldErrors = fieldErrorsOf(error);
  if (issue.path[0] === "modality") {
    return new ValidationError("La modalidad no es válida", fieldErrors);
  }
  return new ValidationError(
    issue.message || `Los datos no son válidos para ${action} el recurso`,
    fieldErrors,
  );
}

function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || field in fieldErrors) continue;
    fieldErrors[field] = field === "modality" ? "La modalidad no es válida" : issue.message;
  }
  return fieldErrors;
}
