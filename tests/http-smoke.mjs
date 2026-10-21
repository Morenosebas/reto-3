import assert from 'node:assert/strict';

// Ejecutar únicamente contra la instancia local de demostración.
const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';
const url = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
  throw new Error('TEST_BASE_URL debe apuntar a una instancia local de prueba');
}
const owned = new Set();
let checks = 0;
const expect = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
async function request(method, path, body) {
  const response = await fetch(new URL(path, baseUrl), {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}
const base = { title: 'Recurso de prueba HTTP', description: 'Prueba temporal del CRUD local', category: 'other', location: 'Bogotá' };
try {
  expect((await request('GET', '/api/resources')).status, 200);
  for (const [modality, details] of [['donation', {}], ['exchange', { wantedInReturn: 'Libros' }], ['sale', { price: 500000 }]]) {
    const created = await request('POST', '/api/resources', { ...base, modality, ...details });
    expect(created.status, 201);
    owned.add(created.body.id);
    const path = `/api/resources/${created.body.id}`;
    expect((await request('GET', path)).body.id, created.body.id);
    expect((await request('GET', '/api/resources')).body.some((item) => item.id === created.body.id), true);
    const updated = await request('PATCH', path, { title: 'Recurso HTTP editado' });
    expect(updated.status, 200);
    expect(updated.body.createdAt, created.body.createdAt);
    expect((await request('GET', path)).body.title, 'Recurso HTTP editado');
    for (const body of [null, [], 42, true]) expect((await request('PATCH', path, body)).status, 400);
    expect((await request('DELETE', path)).status, 204);
    owned.delete(created.body.id);
    expect((await request('GET', path)).status, 404);
    expect((await request('DELETE', path)).status, 404);
  }
  for (const price of [0.1, true, [100], 0, 500001]) {
    expect((await request('POST', '/api/resources', { ...base, modality: 'sale', price })).status, 400);
  }
  expect((await request('POST', '/api/resources', { ...base, modality: 'exchange' })).status, 400);
  const malformed = await fetch(new URL('/api/resources', baseUrl), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  expect(malformed.status, 400);
  console.log(`${checks} comprobaciones HTTP correctas; recursos de prueba eliminados.`);
} finally {
  for (const id of owned) {
    const response = await request('DELETE', `/api/resources/${id}`);
    if (response.status !== 204) throw new Error(`No se pudo limpiar el recurso de prueba ${id}`);
  }
}
