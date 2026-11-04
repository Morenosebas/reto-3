import assert from "node:assert/strict";
import { test } from "node:test";
import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { CreateResource } from "../src/modules/resources/application/CreateResource";
import { DeleteResource } from "../src/modules/resources/application/DeleteResource";
import { GetResource } from "../src/modules/resources/application/GetResource";
import { ListResources } from "../src/modules/resources/application/ListResources";
import { UpdateResource } from "../src/modules/resources/application/UpdateResource";
import { CommunityCatalog } from "../src/modules/resources/catalog/CommunityCatalog";
import { OwnerProtectedCatalog } from "../src/modules/resources/catalog/OwnerProtectedCatalog";
import {
  NotResourcePublisherError,
  ResourceNotFoundError,
  ValidationError,
} from "../src/modules/resources/domain/errors";
import { getResourceCreator } from "../src/modules/resources/domain/factories";
import { ExchangeResource, SaleResource } from "../src/modules/resources/domain/Resource";
import { UnstoragePublisherRegistry } from "../src/modules/resources/infrastructure/UnstoragePublisherRegistry";
import { UnstorageResourceRepository } from "../src/modules/resources/infrastructure/UnstorageResourceRepository";

const base = {
  title: "Bicicleta infantil",
  description: "Bicicleta rin 16 en buen estado",
  category: "other",
  location: "Medellín",
};

function setUp() {
  const storage = createStorage({ driver: memoryDriver() });
  const repository = new UnstorageResourceRepository(storage);
  const catalog = new CommunityCatalog({
    list: new ListResources(repository),
    get: new GetResource(repository),
    create: new CreateResource(repository),
    update: new UpdateResource(repository),
    delete: new DeleteResource(repository),
  });
  const publishers = new UnstoragePublisherRegistry(storage);
  const as = (visitorId: string | null) => new OwnerProtectedCatalog(catalog, publishers, visitorId);
  return { storage, repository, catalog, publishers, as };
}

// Adapter

test("Adapter: guarda JSON plano y reconstruye la subclase con sus fechas", async () => {
  const { storage, repository } = setUp();
  const sale = getResourceCreator("sale").create({ ...base, price: 12000 });

  await repository.save(sale);
  const stored = await storage.getItem<Record<string, unknown>>(`resources:${sale.id}`);
  assert.equal(stored?.modality, "sale");
  assert.equal(stored?.createdAt, sale.createdAt.toISOString());

  const restored = await repository.findById(sale.id);
  assert.ok(restored instanceof SaleResource);
  assert.equal(restored.price, 12000);
  assert.equal(restored.createdAt.getTime(), sale.createdAt.getTime());
  assert.equal(restored.updatedAt.getTime(), sale.updatedAt.getTime());
});

test("Adapter: cumple el contrato del repositorio para listar y eliminar", async () => {
  const { repository } = setUp();
  const exchange = getResourceCreator("exchange").create({ ...base, wantedInReturn: "Patines" });
  await repository.save(exchange);

  const all = await repository.findAll();
  assert.equal(all.length, 1);
  assert.ok(all[0] instanceof ExchangeResource);
  assert.equal(await repository.delete(exchange.id), true);
  assert.equal(await repository.delete(exchange.id), false);
  assert.equal(await repository.findById(exchange.id), null);
});

test("Adapter: un id con forma de ruta nunca llega al almacén", async () => {
  const { repository } = setUp();
  assert.equal(await repository.findById("../secretos"), null);
  assert.equal(await repository.delete("a:b"), false);
});

test("Adapter: un registro corrupto se informa como error interno, no como dato inválido del usuario", async () => {
  const { storage, repository } = setUp();
  await storage.setItem("resources:roto", { id: "roto", modality: "sale", ...base, price: -1 });
  await assert.rejects(repository.findById("roto"), (error: unknown) =>
    error instanceof Error && !(error instanceof ValidationError),
  );
});

// Facade

test("Facade: publica, consulta, edita y retira devolviendo entradas del catálogo", async () => {
  const { catalog } = setUp();
  const entry = await catalog.publish({ ...base, modality: "donation" });
  assert.equal(typeof entry.createdAt, "string");
  assert.equal(entry.canManage, true);

  assert.equal((await catalog.find(entry.id)).title, base.title);
  assert.deepEqual((await catalog.browse()).map((item) => item.id), [entry.id]);
  assert.equal((await catalog.edit(entry.id, { status: "reserved" })).status, "reserved");

  await catalog.withdraw(entry.id);
  await assert.rejects(catalog.find(entry.id), ResourceNotFoundError);
});

test("Facade: conserva las validaciones del subsistema", async () => {
  const { catalog } = setUp();
  await assert.rejects(catalog.publish({ ...base, modality: "exchange" }), ValidationError);
});

// Proxy

test("Proxy: quien publica puede editar y retirar su recurso", async () => {
  const { as, publishers } = setUp();
  const ana = as("huella-ana");
  const entry = await ana.publish({ ...base, modality: "donation" });

  assert.equal(await publishers.publisherOf(entry.id), "huella-ana");
  assert.equal((await ana.edit(entry.id, { title: "Bicicleta restaurada" })).title, "Bicicleta restaurada");
  await ana.withdraw(entry.id);
  assert.equal(await publishers.publisherOf(entry.id), null);
});

test("Proxy: otra persona no puede editar ni retirar, y el recurso no cambia", async () => {
  const { as } = setUp();
  const entry = await as("huella-ana").publish({ ...base, modality: "donation" });

  for (const visitor of [as("huella-beto"), as(null)]) {
    await assert.rejects(visitor.edit(entry.id, { title: "Título ajeno" }), NotResourcePublisherError);
    await assert.rejects(visitor.withdraw(entry.id), NotResourcePublisherError);
  }
  assert.equal((await as("huella-ana").find(entry.id)).title, base.title);
});

test("Proxy: indica en el catálogo qué recursos puede gestionar cada visitante", async () => {
  const { as } = setUp();
  const deAna = await as("huella-ana").publish({ ...base, modality: "donation" });
  const deBeto = await as("huella-beto").publish({ ...base, modality: "sale", price: 5000 });

  const vistaDeAna = await as("huella-ana").browse();
  assert.equal(vistaDeAna.find((item) => item.id === deAna.id)?.canManage, true);
  assert.equal(vistaDeAna.find((item) => item.id === deBeto.id)?.canManage, false);
  assert.ok((await as(null).browse()).every((item) => !item.canManage));
});

test("Proxy: sin clave de publicante no se puede publicar", async () => {
  const { as, catalog } = setUp();
  await assert.rejects(as(null).publish({ ...base, modality: "donation" }), NotResourcePublisherError);
  assert.deepEqual(await catalog.browse(), []);
});

test("Proxy: un recurso inexistente sigue respondiendo como no encontrado", async () => {
  const { as } = setUp();
  await assert.rejects(as("huella-ana").edit("no-existe", { title: "Nada" }), ResourceNotFoundError);
  await assert.rejects(as("huella-ana").withdraw("no-existe"), ResourceNotFoundError);
});
