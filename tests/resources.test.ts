import assert from "node:assert/strict";
import { test } from "node:test";
import { ValidationError, ResourceNotFoundError } from "../src/modules/resources/domain/errors";
import { getResourceCreator } from "../src/modules/resources/domain/factories";
import { DonationResource, ExchangeResource, SaleResource } from "../src/modules/resources/domain/Resource";
import { InMemoryResourceRepository } from "../src/modules/resources/infrastructure/InMemoryResourceRepository";
import { CreateResource } from "../src/modules/resources/application/CreateResource";
import { ListResources } from "../src/modules/resources/application/ListResources";
import { GetResource } from "../src/modules/resources/application/GetResource";
import { UpdateResource } from "../src/modules/resources/application/UpdateResource";
import { DeleteResource } from "../src/modules/resources/application/DeleteResource";
import { parseResourcePatch } from "../src/modules/resources/application/ResourceSchemas";
import { toResourceDTO } from "../src/modules/resources/presentation/ResourceDTO";
import "./resource-schemas.test";

const base = { title: "Mesa reutilizable", description: "Mesa de madera en buen estado", category: "furniture", location: "Bogotá" };
const repository = InMemoryResourceRepository.getInstance();
const create = new CreateResource(repository);
const list = new ListResources(repository);
const get = new GetResource(repository);
const update = new UpdateResource(repository);
const remove = new DeleteResource(repository);

test("Singleton conserva identidad y recursos entre consumidores del mismo runtime", async () => {
  const second = InMemoryResourceRepository.getInstance();
  assert.equal(repository, second);
  const item = await create.execute({ ...base, modality: "donation" });
  try { assert.equal(await second.findById(item.id), item); }
  finally { await remove.execute(item.id); }
});

for (const [modality, details, Product] of [
  ["donation", {}, DonationResource],
  ["exchange", { wantedInReturn: "Libros" }, ExchangeResource],
  ["sale", { price: 500000 }, SaleResource],
] as const) {
  test(`CRUD completo: ${modality}, identidad estable, DTO y eliminación`, async () => {
    const item = await create.execute({ ...base, modality, ...details });
    try {
      assert.ok(item instanceof Product);
      assert.equal(item.status, "available");
      assert.equal((await get.execute(item.id)).id, item.id);
      assert.ok((await list.execute()).some((resource) => resource.id === item.id));
      const changed = await update.execute(item.id, { title: "Mesa restaurada", status: "reserved" });
      assert.equal(changed.id, item.id);
      assert.equal(changed.createdAt, item.createdAt);
      assert.equal(changed.description, item.description);
      assert.equal(changed.title, "Mesa restaurada");
      assert.equal(changed.status, "reserved");
      assert.deepEqual(changed.modalityDetails(), item.modalityDetails());
      assert.equal((await get.execute(item.id)).title, "Mesa restaurada");
      assert.equal(typeof toResourceDTO(changed).createdAt, "string");
    } finally { await remove.execute(item.id); }
    assert.equal(await repository.findById(item.id), null);
    await assert.rejects(get.execute(item.id), ResourceNotFoundError);
    await assert.rejects(remove.execute(item.id), ResourceNotFoundError);
    await assert.rejects(update.execute(item.id, { title: "Inexistente" }), ResourceNotFoundError);
  });
}

for (const price of [1, 500000, "1", "500000", " 20000 "]) {
  test(`Venta acepta pesos enteros dentro del rango: ${JSON.stringify(price)}`, () => {
    const resource = getResourceCreator("sale").create({ ...base, price }) as SaleResource;
    assert.equal(resource.price, Number(price));
  });
}
for (const price of [0.1, 0.49, 1.5, "0.1", 0, -1, 500001, true, false, [], [100], {}, null, undefined, "", " ", "abc", "1e3", "0x10", Infinity, NaN]) {
  test(`Venta rechaza precio inválido: ${String(price)} (${typeof price})`, () => {
    assert.throws(() => getResourceCreator("sale").create({ ...base, price }), ValidationError);
  });
}
for (const body of [null, [], [1], 42, true, "texto", undefined]) {
  test(`POST/PATCH rechazan cuerpo no objeto: ${JSON.stringify(body)}`, () => {
    assert.throws(() => parseResourcePatch(body), ValidationError);
  });
}

test("PATCH admite objeto vacío y conserva los campos", async () => {
  const item = await create.execute({ ...base, modality: "donation" });
  try { assert.equal((await update.execute(item.id, parseResourcePatch({}))).title, item.title); }
  finally { await remove.execute(item.id); }
});

test("Cambiar de modalidad aplica reglas nuevas y elimina detalles anteriores", async () => {
  const item = await create.execute({ ...base, modality: "sale", price: 15000 });
  try {
    await assert.rejects(update.execute(item.id, { modality: "exchange" }), ValidationError);
    assert.equal((await get.execute(item.id)).modality, "sale");
    const exchanged = await update.execute(item.id, { modality: "exchange", wantedInReturn: "Libros" });
    assert.ok(exchanged instanceof ExchangeResource);
    assert.deepEqual(exchanged.modalityDetails(), { wantedInReturn: "Libros" });
    const donated = await update.execute(item.id, { modality: "donation" });
    assert.deepEqual(donated.modalityDetails(), {});
  } finally { await remove.execute(item.id); }
});

test("PATCH inválido no altera un precio ya guardado", async () => {
  const item = await create.execute({ ...base, modality: "sale", price: 100 });
  try {
    await assert.rejects(update.execute(item.id, { price: 0.1 }), ValidationError);
    assert.deepEqual((await get.execute(item.id)).modalityDetails(), { price: 100 });
  } finally { await remove.execute(item.id); }
});

test("Modalidad, categoría, estado, texto y wantedInReturn se validan en dominio", () => {
  assert.throws(() => getResourceCreator("unknown"), ValidationError);
  for (const changes of [{ title: "x" }, { description: "corta" }, { category: "x" }, { status: "x" }, { location: " " }]) {
    assert.throws(() => getResourceCreator("donation").create({ ...base, ...changes }), ValidationError);
  }
  for (const wantedInReturn of [undefined, "", "ab", 42, "x".repeat(121)]) {
    assert.throws(() => getResourceCreator("exchange").create({ ...base, wantedInReturn }), ValidationError);
  }
});

test("Crear con datos inválidos no agrega recursos al almacén", async () => {
  const before = (await list.execute()).map((resource) => resource.id);
  await assert.rejects(create.execute({ ...base, modality: "sale", price: true }), ValidationError);
  assert.deepEqual((await list.execute()).map((resource) => resource.id), before);
});
