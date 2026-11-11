import assert from 'node:assert/strict';

const baseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';
const url = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
  throw new Error('TEST_BASE_URL debe apuntar a una instancia local de prueba');
}
const owned = new Set();
let checks = 0;
const expect = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
// La API reconoce a quien publica por una cookie httpOnly; la prueba la
// guarda como lo haría el navegador. `asStranger` simula a otro visitante.
let publisherCookie = '';
async function request(method, path, body, { asStranger = false } = {}) {
  const cookie = asStranger ? '' : publisherCookie;
  const response = await fetch(new URL(path, baseUrl), {
    method, headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && !asStranger) publisherCookie = setCookie.split(';')[0];
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
    expect(created.body.canManage, true);
    expect((await request('GET', path, undefined, { asStranger: true })).body.canManage, false);
    expect((await request('PATCH', path, { title: 'Título ajeno' }, { asStranger: true })).status, 403);
    expect((await request('DELETE', path, undefined, { asStranger: true })).status, 403);
    expect((await request('GET', path)).body.id, created.body.id);
    expect((await request('GET', '/api/resources')).body.some((item) => item.id === created.body.id), true);
    expect((await request('GET', '/api/resources?q=recurso%20de%20prueba%20http')).body.some((item) => item.id === created.body.id), true);
    expect((await request('GET', '/api/resources?q=texto-que-no-existe-en-ninguna-parte')).body.length, 0);
    const availableOnly = '/api/resources?disponibles=1&q=recurso%20de%20prueba%20http';
    expect((await request('GET', availableOnly)).body.some((item) => item.id === created.body.id), true);
    expect((await request('PATCH', path, { status: 'reserved' })).status, 200);
    expect((await request('GET', availableOnly)).body.some((item) => item.id === created.body.id), false);
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
  const transitions = await request('POST', '/api/resources', { ...base, modality: 'donation' });
  expect(transitions.status, 201);
  owned.add(transitions.body.id);
  const transitionPath = `/api/resources/${transitions.body.id}`;
  expect((await request('PATCH', transitionPath, { modality: null })).status, 400);
  expect((await request('PATCH', transitionPath, { modality: 'sale' })).status, 400);
  const sale = await request('PATCH', transitionPath, { modality: 'sale', price: '1' });
  expect(sale.status, 200);
  expect(sale.body.price, 1);
  const protectedFields = await request('PATCH', transitionPath, {
    title: 'Recurso con campos extra', id: 'identidad-forjada', createdAt: 'fecha-forjada', customField: true,
  });
  expect(protectedFields.status, 200);
  expect(protectedFields.body.id, transitions.body.id);
  expect(protectedFields.body.price, 1);
  expect((await request('PATCH', transitionPath, { price: true })).status, 400);
  expect((await request('DELETE', transitionPath)).status, 204);
  owned.delete(transitions.body.id);

  for (const price of [0.1, true, [100], 0, 500001]) {
    expect((await request('POST', '/api/resources', { ...base, modality: 'sale', price })).status, 400);
  }
  const invalidDetail = await request('POST', '/api/resources', { ...base, modality: 'donation', price: true });
  expect(invalidDetail.status, 400);
  expect(typeof invalidDetail.body.error, 'string');
  expect((await request('POST', '/api/resources', { ...base, modality: 'exchange' })).status, 400);
  const withContact = await request('POST', '/api/resources', { ...base, modality: 'donation', contactPhone: '+57 300 123 4567' });
  expect(withContact.status, 201);
  owned.add(withContact.body.id);
  expect(withContact.body.contactPhone, '3001234567');
  expect((await request('POST', '/api/resources', { ...base, modality: 'donation', contactPhone: '123' })).status, 400);
  expect((await request('DELETE', `/api/resources/${withContact.body.id}`)).status, 204);
  owned.delete(withContact.body.id);
  const malformed = await fetch(new URL('/api/resources', baseUrl), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  expect(malformed.status, 400);
  expect(typeof (await malformed.json()).error, 'string');
  console.log(`${checks} comprobaciones HTTP correctas; recursos de prueba eliminados.`);
} finally {
  for (const id of owned) {
    const response = await request('DELETE', `/api/resources/${id}`);
    if (response.status !== 204) throw new Error(`No se pudo limpiar el recurso de prueba ${id}`);
  }
}
