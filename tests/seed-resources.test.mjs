import assert from "node:assert/strict";
import { test } from "node:test";
import { demoResources, seedResources } from "../scripts/seed-resources.mjs";

function createFetch() {
  const resources = [];
  return {
    resources,
    async fetch(_url, init = {}) {
      if (!init.method || init.method === "GET") return Response.json(resources);
      const resource = { id: `resource-${resources.length + 1}`, ...JSON.parse(init.body) };
      resources.push(resource);
      return Response.json(resource, { status: 201 });
    },
  };
}

test("the demo seed creates missing samples and is safe to run more than once", async () => {
  const api = createFetch();
  const options = { baseUrl: "http://localhost:3000/api/resources", fetchImpl: api.fetch };

  assert.deepEqual(await seedResources(options), { created: 3, skipped: 0 });
  assert.deepEqual(await seedResources(options), { created: 0, skipped: 3 });
  assert.equal(api.resources.length, demoResources.length);
});

test("the seed does not duplicate an existing sample", async () => {
  const api = createFetch();
  api.resources.push({ id: "existing-resource", ...demoResources[0] });

  assert.deepEqual(await seedResources({ fetchImpl: api.fetch }), { created: 2, skipped: 1 });
  assert.equal(api.resources.length, demoResources.length);
});

test("the seed reports API errors instead of silently succeeding", async () => {
  const fetchImpl = async () => Response.json({ error: "Unavailable" }, { status: 503 });
  await assert.rejects(seedResources({ fetchImpl }), /503/);
});
