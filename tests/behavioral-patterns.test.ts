import assert from "node:assert/strict";
import { test } from "node:test";
import { CreateResource } from "../src/modules/resources/application/CreateResource";
import { DeleteResource } from "../src/modules/resources/application/DeleteResource";
import { GetResource } from "../src/modules/resources/application/GetResource";
import { ListResources } from "../src/modules/resources/application/ListResources";
import { UpdateResource } from "../src/modules/resources/application/UpdateResource";
import { CommunityCatalog } from "../src/modules/resources/catalog/CommunityCatalog";
import { ValidationError } from "../src/modules/resources/domain/errors";
import {
  AvailableListing,
  DeliveredListing,
  PublicationStatus,
  ReservedListing,
} from "../src/modules/resources/domain/lifecycle";
import { InMemoryResourceRepository } from "../src/modules/resources/infrastructure/InMemoryResourceRepository";
import {
  DonationOutreach,
  ExchangeOutreach,
  outreachFor,
  SaleOutreach,
} from "../src/modules/resources/presentation/outreach";

const base = {
  title: "Silla de oficina",
  description: "Silla ergonómica en buen estado",
  category: "furniture" as const,
  location: "Medellín",
};

test("State: cada estado concreto controla contacto y transiciones", () => {
  const available = new AvailableListing();
  assert.equal(available.allowsVisitorContact(), true);
  assert.equal(available.noticeForVisitor(), null);
  assert.deepEqual(available.allowedMoves(), ["reserved", "delivered"]);

  const reserved = new ReservedListing();
  assert.equal(reserved.allowsVisitorContact(), false);
  assert.match(reserved.noticeForVisitor() ?? "", /Apartado/);
  assert.deepEqual(reserved.allowedMoves(), ["available", "delivered"]);

  const delivered = new DeliveredListing();
  assert.equal(delivered.allowsVisitorContact(), false);
  assert.match(delivered.noticeForVisitor() ?? "", /entregado/i);
  assert.deepEqual(delivered.allowedMoves(), ["available"]);
});

test("State: PublicationStatus rechaza un salto inválido de entregado a reservado", () => {
  const status = new PublicationStatus("delivered");
  assert.throws(
    () => status.transitionTo("reserved"),
    (error: unknown) => error instanceof ValidationError && /status/.test(Object.keys(error.fieldErrors).join()),
  );
  assert.equal(status.transitionTo("available").code, "available");
});

test("State: UpdateResource aplica las reglas al cambiar el estado", async () => {
  const repository = InMemoryResourceRepository.getInstance();
  const update = new UpdateResource(repository);
  const create = new CreateResource(repository);
  const remove = new DeleteResource(repository);
  const item = await create.execute({ ...base, modality: "donation" });
  try {
    await update.execute(item.id, { status: "reserved" });
    const reopened = await update.execute(item.id, { status: "available" });
    assert.equal(reopened.status, "available");
    await update.execute(item.id, { status: "delivered" });
    await assert.rejects(update.execute(item.id, { status: "reserved" }), ValidationError);
  } finally {
    await remove.execute(item.id);
  }
});

test("Strategy: cada modalidad compone un mensaje distinto", () => {
  const details = { title: "Bicicleta", wantedInReturn: "Patines", price: 25000 };
  assert.match(outreachFor("donation").composeRequest(details), /donación/);
  const exchangeMsg = outreachFor("exchange").composeRequest(details);
  assert.match(exchangeMsg, /intercambio/);
  assert.match(exchangeMsg, /Patines/);
  assert.match(outreachFor("sale").composeRequest(details), /venta/);
  assert.equal(outreachFor("donation").tagValue(details), "Gratis");
  assert.match(outreachFor("exchange").tagValue(details), /Patines/);
  assert.match(outreachFor("sale").tagValue(details), /25/);
});

test("Strategy: outreachFor devuelve la estrategia concreta por modalidad", () => {
  assert.ok(outreachFor("donation") instanceof DonationOutreach);
  assert.ok(outreachFor("exchange") instanceof ExchangeOutreach);
  assert.ok(outreachFor("sale") instanceof SaleOutreach);
});

test("Strategy: describeHandoff varía el texto de entrega", () => {
  assert.match(
    outreachFor("donation").describeHandoff("Cali", { title: "Mesa" }),
    /regala.*Cali/,
  );
  assert.match(
    outreachFor("exchange").describeHandoff("Cali", { title: "Mesa", wantedInReturn: "Sillas" }),
    /Sillas.*Cali/,
  );
  assert.match(
    outreachFor("sale").describeHandoff("Cali", { title: "Mesa", price: 10000 }),
    /solidario.*Cali/,
  );
});

test("State + Facade: el catálogo respeta las transiciones al editar", async () => {
  const repository = InMemoryResourceRepository.getInstance();
  const catalog = new CommunityCatalog({
    list: new ListResources(repository),
    get: new GetResource(repository),
    create: new CreateResource(repository),
    update: new UpdateResource(repository),
    delete: new DeleteResource(repository),
  });
  const entry = await catalog.publish({ ...base, modality: "sale", price: 15000 });
  try {
    assert.equal((await catalog.edit(entry.id, { status: "delivered" })).status, "delivered");
    await assert.rejects(catalog.edit(entry.id, { status: "reserved" }), ValidationError);
  } finally {
    await catalog.withdraw(entry.id);
  }
});
