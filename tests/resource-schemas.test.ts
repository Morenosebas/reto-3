import assert from "node:assert/strict";
import { test } from "node:test";
import { CreateResource } from "../src/modules/resources/application/CreateResource";
import { ListResources } from "../src/modules/resources/application/ListResources";
import { UpdateResource } from "../src/modules/resources/application/UpdateResource";
import {
  parseResourceCreation,
  parseResourcePatch,
} from "../src/modules/resources/application/ResourceSchemas";
import { ValidationError } from "../src/modules/resources/domain/errors";
import {
  DonationResource,
  ExchangeResource,
  SaleResource,
} from "../src/modules/resources/domain/Resource";
import { InMemoryResourceRepository } from "../src/modules/resources/infrastructure/InMemoryResourceRepository";

const base = {
  title: "Mesa reutilizable",
  description: "Mesa de madera en buen estado",
  category: "furniture",
  location: "Bogotá",
};
const repository = InMemoryResourceRepository.getInstance();
const create = new CreateResource(repository);
const update = new UpdateResource(repository);
const list = new ListResources(repository);

test("Zod acepta y normaliza las tres modalidades de creación", async () => {
  const donation = await create.execute({ ...base, modality: "donation" });
  const exchange = await create.execute({
    ...base,
    modality: "exchange",
    wantedInReturn: "Libros",
  });
  const sale = await create.execute({ ...base, modality: "sale", price: " 500000 " });
  try {
    assert.ok(donation instanceof DonationResource);
    assert.ok(exchange instanceof ExchangeResource);
    assert.ok(sale instanceof SaleResource);
    assert.equal(sale.price, 500000);
    assert.equal(donation.title, base.title);
  } finally {
    await repository.delete(donation.id);
    await repository.delete(exchange.id);
    await repository.delete(sale.id);
  }
});

test("Los esquemas descartan campos desconocidos e ignoran detalles válidos ajenos a la modalidad", async () => {
  const input = parseResourceCreation({
    ...base,
    modality: "donation",
    price: 400,
    wantedInReturn: "Libros",
    id: "identidad-forjada",
    customField: "ignorado",
  });
  assert.equal("customField" in input, false);

  const donation = await create.execute({
    ...base,
    modality: "donation",
    price: 400,
    wantedInReturn: "Libros",
    id: "identidad-forjada",
    createdAt: "fecha-forjada",
  });
  try {
    assert.ok(donation instanceof DonationResource);
    assert.notEqual(donation.id, "identidad-forjada");
    assert.deepEqual(donation.modalityDetails(), {});
  } finally {
    await repository.delete(donation.id);
  }
});

test("Zod no acepta cuerpos que no sean objetos para crear o actualizar", async () => {
  for (const body of [null, [], [1], 42, true, "texto", undefined]) {
    assert.throws(() => parseResourceCreation(body), ValidationError);
    assert.throws(() => parseResourcePatch(body), ValidationError);
    await assert.rejects(create.execute(body), ValidationError);
  }
});

test("Creación exige modalidad y datos propios de intercambio y venta", async () => {
  for (const body of [
    { ...base },
    { ...base, modality: "other" },
    { ...base, modality: "exchange" },
    { ...base, modality: "sale" },
  ]) {
    await assert.rejects(create.execute(body), ValidationError);
  }
});

test("Los campos conocidos mantienen tipo, límites y reglas de precio sin coerciones", async () => {
  for (const price of [
    0,
    -1,
    0.1,
    1.5,
    500001,
    true,
    false,
    [],
    [100],
    {},
    null,
    "",
    " ",
    "0.1",
    "1e3",
    "0x10",
    "999999999999999999999999999999999999",
  ]) {
    await assert.rejects(
      create.execute({ ...base, modality: "sale", price }),
      ValidationError,
    );
  }

  await assert.rejects(
    create.execute({ ...base, modality: "donation", price: true }),
    ValidationError,
  );
  await assert.rejects(
    create.execute({ ...base, modality: "exchange", wantedInReturn: 42 }),
    ValidationError,
  );
  await assert.rejects(
    create.execute({ ...base, title: 42, modality: "donation" }),
    ValidationError,
  );
});

test("PATCH conserva campos omitidos y descarta identificadores y propiedades desconocidas", async () => {
  const item = await create.execute({
    ...base,
    modality: "sale",
    status: "reserved",
    price: 25000,
  });
  try {
    const changed = await update.execute(item.id, {
      title: "Mesa recuperada",
      id: "identidad-forjada",
      createdAt: "fecha-forjada",
      customField: "ignorado",
    });
    assert.equal(changed.id, item.id);
    assert.equal(changed.createdAt, item.createdAt);
    assert.equal(changed.description, item.description);
    assert.equal(changed.status, "reserved");
    assert.deepEqual(changed.modalityDetails(), { price: 25000 });
  } finally {
    await repository.delete(item.id);
  }
});

test("PATCH diferencia modalidad omitida y null", async () => {
  const item = await create.execute({ ...base, modality: "donation" });
  try {
    const unchanged = await update.execute(item.id, { title: "Mesa cuidada" });
    assert.equal(unchanged.modality, "donation");
    await assert.rejects(update.execute(item.id, { modality: null }), ValidationError);
    assert.equal((await repository.findById(item.id))?.modality, "donation");
  } finally {
    await repository.delete(item.id);
  }
});

test("PATCH valida el recurso completo antes de guardar un cambio de modalidad", async () => {
  const sale = await create.execute({ ...base, modality: "sale", price: 15000 });
  try {
    await assert.rejects(update.execute(sale.id, { modality: "exchange" }), ValidationError);
    assert.deepEqual((await repository.findById(sale.id))?.modalityDetails(), {
      price: 15000,
    });

    const exchange = await update.execute(sale.id, {
      modality: "exchange",
      wantedInReturn: "Libros",
    });
    assert.ok(exchange instanceof ExchangeResource);
    assert.deepEqual(exchange.modalityDetails(), { wantedInReturn: "Libros" });

    const donation = await update.execute(sale.id, { modality: "donation" });
    assert.ok(donation instanceof DonationResource);
    assert.deepEqual(donation.modalityDetails(), {});
  } finally {
    await repository.delete(sale.id);
  }
});

test("PATCH hacia venta requiere precio y hacia intercambio exige contraprestación", async () => {
  const exchange = await create.execute({
    ...base,
    modality: "exchange",
    wantedInReturn: "Libros",
  });
  try {
    await assert.rejects(update.execute(exchange.id, { modality: "sale" }), ValidationError);
    assert.equal((await repository.findById(exchange.id))?.modality, "exchange");

    const sale = await update.execute(exchange.id, {
      modality: "sale",
      price: "1",
    });
    assert.ok(sale instanceof SaleResource);
    assert.equal(sale.price, 1);
    assert.deepEqual(sale.modalityDetails(), { price: 1 });
  } finally {
    await repository.delete(exchange.id);
  }
});

test("PATCH inválido no modifica el recurso y el objeto vacío conserva sus datos", async () => {
  const item = await create.execute({ ...base, modality: "sale", price: 100 });
  try {
    await assert.rejects(update.execute(item.id, { price: 0.1 }), ValidationError);
    await assert.rejects(update.execute(item.id, { price: true }), ValidationError);
    const unchanged = await repository.findById(item.id);
    assert.equal(unchanged?.title, item.title);
    assert.deepEqual(unchanged?.modalityDetails(), { price: 100 });

    const emptyPatch = await update.execute(item.id, {});
    assert.equal(emptyPatch.title, item.title);
    assert.deepEqual(emptyPatch.modalityDetails(), { price: 100 });
  } finally {
    await repository.delete(item.id);
  }
});

test("La validación de entrada no altera el tamaño del repositorio", async () => {
  const before = (await list.execute()).map((resource) => resource.id);
  await assert.rejects(
    create.execute({ ...base, modality: "sale", price: [100] }),
    ValidationError,
  );
  assert.deepEqual((await list.execute()).map((resource) => resource.id), before);
});
