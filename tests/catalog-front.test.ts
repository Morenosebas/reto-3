import assert from "node:assert/strict";
import { test } from "node:test";
import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { CreateResource } from "../src/modules/resources/application/CreateResource";
import { DeleteResource } from "../src/modules/resources/application/DeleteResource";
import { GetResource } from "../src/modules/resources/application/GetResource";
import { ListResources } from "../src/modules/resources/application/ListResources";
import { parseResourceCreation } from "../src/modules/resources/application/ResourceSchemas";
import { UpdateResource } from "../src/modules/resources/application/UpdateResource";
import { CommunityCatalog } from "../src/modules/resources/catalog/CommunityCatalog";
import { OwnerProtectedCatalog } from "../src/modules/resources/catalog/OwnerProtectedCatalog";
import { ValidationError } from "../src/modules/resources/domain/errors";
import { UnstoragePublisherRegistry } from "../src/modules/resources/infrastructure/UnstoragePublisherRegistry";
import { UnstorageResourceRepository } from "../src/modules/resources/infrastructure/UnstorageResourceRepository";
import {
  buildCatalogView,
  catalogHref,
  hasActiveFilters,
  hasStatusParam,
  NO_FILTERS,
  parseCatalogFilters,
  toSearchCriteria,
  type CatalogFilters,
} from "../src/modules/resources/presentation/catalogFilters";
import type { CatalogEntry } from "../src/modules/resources/presentation/ResourceDTO";
import { formatRelativeDate } from "../src/modules/resources/presentation/labels";
import { formatContactPhone, requestMessage, whatsappLinks } from "../src/modules/resources/presentation/contact";
import { toColombianMobile } from "../src/modules/resources/domain/contactPhone";

function catalogWithSamples() {
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
  return { catalog, publishers };
}

const common = { description: "Publicación de prueba del catálogo", status: "available" };

test("Búsqueda en la fachada: ignora mayúsculas y tildes, exige todas las palabras y filtra por categoría", async () => {
  const { catalog } = catalogWithSamples();
  await catalog.publish({ ...common, modality: "donation", title: "Cuna de madera", category: "furniture", location: "Bogotá" });
  await catalog.publish({ ...common, modality: "exchange", title: "Libros de cálculo", category: "books", location: "Medellín", wantedInReturn: "Novelas" });
  await catalog.publish({ ...common, modality: "sale", title: "Mesa de madera", category: "furniture", location: "Cali", price: 30000 });

  const titles = async (criteria: Parameters<typeof catalog.browse>[0]) =>
    (await catalog.browse(criteria)).map((entry) => entry.title).sort();

  assert.deepEqual(await titles({ text: "BOGOTA" }), ["Cuna de madera"]);
  assert.deepEqual(await titles({ text: "madera" }), ["Cuna de madera", "Mesa de madera"]);
  assert.deepEqual(await titles({ text: "madera cali" }), ["Mesa de madera"]);
  assert.deepEqual(await titles({ text: "novelas" }), ["Libros de cálculo"]);
  assert.deepEqual(await titles({ category: "books" }), ["Libros de cálculo"]);
  assert.equal((await catalog.browse({ text: "   " })).length, 3);
});

test("Vistas por estado: por defecto sin lo entregado, solo disponibles y entregados", async () => {
  const { catalog } = catalogWithSamples();
  const base = { ...common, modality: "donation", category: "furniture", location: "Bogotá" };
  await catalog.publish({ ...base, title: "Silla disponible" });
  const reserved = await catalog.publish({ ...base, title: "Silla reservada" });
  const delivered = await catalog.publish({ ...base, title: "Silla entregada" });
  await catalog.edit(reserved.id, { status: "reserved" });
  await catalog.edit(delivered.id, { status: "delivered" });

  const titlesFor = async (statusView: CatalogFilters["statusView"], text?: string) =>
    (await catalog.browse(toSearchCriteria({ ...NO_FILTERS, statusView, query: text ?? "" })))
      .map((entry) => entry.title);

  assert.deepEqual(await titlesFor("active"), ["Silla disponible", "Silla reservada"]);
  assert.deepEqual(await titlesFor("available"), ["Silla disponible"]);
  assert.deepEqual(await titlesFor("delivered"), ["Silla entregada"]);
  assert.deepEqual(await titlesFor("available", "reservada"), []);
  assert.equal((await catalog.browse()).length, 3, "sin criterios de estado se listan todos");
});

test("El proxy entrega los criterios de búsqueda al catálogo real", async () => {
  const { catalog, publishers } = catalogWithSamples();
  const ana = new OwnerProtectedCatalog(catalog, publishers, "huella-ana");
  await ana.publish({ ...common, modality: "donation", title: "Silla plegable", category: "furniture", location: "Envigado" });
  await ana.publish({ ...common, modality: "donation", title: "Chaqueta", category: "clothing", location: "Envigado" });

  const found = await ana.browse({ category: "clothing" });
  assert.deepEqual(found.map((entry) => [entry.title, entry.canManage]), [["Chaqueta", true]]);
});

test("Los errores de validación incluyen el mensaje de cada campo", () => {
  assert.throws(
    () => parseResourceCreation({ modality: "sale", title: "x", description: "corta", category: "books", location: "Cali", price: 0 }),
    (error: unknown) => {
      assert.ok(error instanceof ValidationError);
      assert.deepEqual(Object.keys(error.fieldErrors).sort(), ["description", "price", "title"]);
      assert.match(error.fieldErrors.price, /precio/i);
      return true;
    },
  );
});

test("Filtros de la URL: descarta valores desconocidos y se reconstruyen en el enlace", () => {
  const filters = parseCatalogFilters({ q: "  bici  ", categoria: "books", modalidad: "rent", disponibles: "1" });
  assert.deepEqual(filters, { query: "bici", category: "books", modality: null, statusView: "available" });
  assert.equal(catalogHref(filters), "/?q=bici&categoria=books&disponibles=1");
  assert.equal(
    catalogHref(filters, { modality: "sale", statusView: "delivered" }),
    "/?q=bici&categoria=books&modalidad=sale&entregados=1",
  );
  assert.deepEqual(toSearchCriteria(filters), { text: "bici", category: "books", statuses: ["available"] });
  assert.equal(parseCatalogFilters({ disponibles: "si" }).statusView, "active");
  assert.equal(parseCatalogFilters({ entregados: "1" }).statusView, "delivered");
  assert.deepEqual(toSearchCriteria(NO_FILTERS).statuses, ["available", "reserved"]);
  assert.equal(hasStatusParam({}), false);
  assert.equal(hasStatusParam({ entregados: "1" }), true);
  assert.equal(hasActiveFilters({ ...NO_FILTERS, statusView: "delivered" }), true);
  assert.equal(catalogHref(NO_FILTERS), "/");
  assert.deepEqual(parseCatalogFilters({ q: ["uno", "dos"] }).query, "uno");
  assert.equal(hasActiveFilters(NO_FILTERS), false);
  assert.equal(hasActiveFilters(filters), true);
});

test("Vista del catálogo: cuenta por modalidad y filtra la modalidad elegida", () => {
  const entry = (id: string, modality: CatalogEntry["modality"], canManage: boolean) =>
    ({ id, modality, canManage }) as CatalogEntry;
  const entries = [entry("1", "donation", true), entry("2", "sale", false), entry("3", "sale", true)];

  const all = buildCatalogView(entries, NO_FILTERS);
  assert.deepEqual(all.counts, { all: 3, donation: 1, exchange: 0, sale: 2 });
  assert.deepEqual(all.visible.map((item) => item.id), ["1", "2", "3"]);

  const sales = buildCatalogView(entries, { ...NO_FILTERS, modality: "sale" });
  assert.deepEqual(sales.visible.map((item) => item.id), ["2", "3"]);
  assert.deepEqual(sales.counts, all.counts);
});

test("Fechas relativas en español", () => {
  const now = Date.parse("2026-11-03T12:00:00.000Z");
  assert.equal(formatRelativeDate("2026-11-03T11:59:30.000Z", now), "hace un momento");
  assert.equal(formatRelativeDate("2026-11-03T11:15:00.000Z", now), "hace 45 minutos");
  assert.equal(formatRelativeDate("2026-11-02T12:00:00.000Z", now), "ayer");
  assert.equal(formatRelativeDate("2026-10-20T12:00:00.000Z", now), "hace 2 semanas");
});

test("Contacto: acepta celulares colombianos escritos de varias formas y guarda 10 dígitos", () => {
  for (const written of ["3001234567", "300 123 4567", "300-123-4567", "+57 300 123 4567", "573001234567"]) {
    assert.equal(toColombianMobile(written), "3001234567", written);
  }
  for (const invalid of ["2001234567", "300123456", "30012345678", "+1 300 123 4567", "teléfono"]) {
    assert.equal(toColombianMobile(invalid), null, invalid);
  }
  const parsed = parseResourceCreation({
    modality: "donation", title: "Silla", description: "Silla de madera en buen estado",
    category: "furniture", location: "Cali", contactPhone: "+57 310 555 1234",
  });
  assert.equal(parsed.contactPhone, "3105551234");
  assert.throws(
    () => parseResourceCreation({ ...parsed, contactPhone: "123" }),
    (error: unknown) => error instanceof ValidationError && /celular colombiano/.test(error.fieldErrors.contactPhone),
  );
});

test("Contacto: se guarda, viaja en el catálogo y se conserva al cambiar el estado", async () => {
  const { catalog } = catalogWithSamples();
  const entry = await catalog.publish({
    modality: "sale", title: "Lámpara", description: "Lámpara de escritorio con bombillo",
    category: "home", location: "Pasto", price: 20000, contactPhone: "315 000 1122",
  });
  assert.equal(entry.contactPhone, "3150001122");
  const reserved = await catalog.edit(entry.id, { status: "reserved" });
  assert.equal(reserved.contactPhone, "3150001122");
  assert.equal((await catalog.find(entry.id)).contactPhone, "3150001122");
  await assert.rejects(catalog.edit(entry.id, { contactPhone: "4150001122" }), ValidationError);
});

test("Contacto: enlaces a la conversación con +57, el número guardado y el mensaje", () => {
  assert.equal(formatContactPhone("3001234567"), "+57 300 123 4567");
  const links = whatsappLinks("3001234567", requestMessage("Cuna de madera"));
  assert.ok(links.app.startsWith("https://wa.me/573001234567?text="));
  assert.ok(links.web.startsWith("https://web.whatsapp.com/send?phone=573001234567&text="));
  for (const href of [links.app, links.web]) {
    assert.match(decodeURIComponent(href.split("text=")[1]), /«Cuna de madera»/);
  }
});

test("El catálogo muestra primero lo disponible, luego lo reservado y al final lo entregado", async () => {
  const { catalog } = catalogWithSamples();
  const base = { ...common, modality: "donation", category: "home", location: "Neiva" };
  const delivered = await catalog.publish({ ...base, title: "Entregado primero" });
  const reserved = await catalog.publish({ ...base, title: "Reservado después" });
  await catalog.publish({ ...base, title: "Disponible antiguo" });
  await catalog.edit(delivered.id, { status: "delivered" });
  await catalog.edit(reserved.id, { status: "reserved" });
  await catalog.publish({ ...base, title: "Disponible reciente" });

  const titles = (await catalog.browse()).map((entry) => entry.title);
  assert.deepEqual(titles.slice(0, 2).sort(), ["Disponible antiguo", "Disponible reciente"]);
  assert.deepEqual(titles.slice(2), ["Reservado después", "Entregado primero"]);
});
