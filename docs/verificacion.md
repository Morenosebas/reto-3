# Registro de pruebas de Reutiliza

**Fecha de ejecución: 21 de octubre de 2026.**  
**Referencia de implementación:** [9105e54](https://github.com/Morenosebas/reto-3/commit/9105e5418335690b1b424cbf8bdf769e2a955a8d).

## Objetivo y entorno

La validación comprueba las reglas de construcción de recursos, los casos de uso CRUD, el contrato de entrada, la serialización, la consistencia del repositorio en un contexto de ejecución y las respuestas de la API HTTP.

| Componente | Versión o configuración |
| --- | --- |
| Node.js | 22.17.0 |
| npm | 10.9.2 |
| Next.js | 16.3.6 |
| React | 19.2.8 |
| Pruebas de dominio y aplicación | TypeScript, `node:test` y `node:assert/strict` |
| Integración HTTP | Servidor local en `127.0.0.1:3187` |
| Compilación de producción completada | Webpack |

## Metodología

### Dominio y aplicación

`tests/resources.test.ts` se compila mediante `tsconfig.test.json` y se ejecuta con el runner de pruebas de Node. Los casos verifican:

- Construcción y CRUD de donaciones, intercambios y ventas.
- Conservación de identidad y fecha de creación durante la actualización.
- Cambio de modalidad y validación de sus datos específicos.
- Precio entero dentro de los límites y rechazo de valores o tipos inválidos.
- Rechazo de cuerpos que no son objetos JSON.
- Ausencia de cambios en el almacén tras una operación inválida.
- Identidad compartida del Singleton dentro del mismo contexto de ejecución.
- Recursos inexistentes y serialización de fechas en el DTO.

### Integración HTTP

`tests/http-smoke.mjs` realiza solicitudes GET, POST, PATCH y DELETE contra el servidor local. Verifica la visibilidad de publicaciones entre peticiones, las respuestas 201/200/204/400/404 y el rechazo de JSON malformado o datos inválidos. La suite solo admite destinos locales y elimina los recursos que crea al concluir.

### Análisis estático y compilación

ESLint comprueba el código; `next typegen` y TypeScript validan los tipos y las rutas. La compilación de producción con Webpack incluye la verificación TypeScript, la generación de páginas y las trazas de compilación.

## Resultados

| Comando | Resultado registrado |
| --- | --- |
| `npm run lint` | Completado sin errores |
| `npm run typecheck` | Completado sin errores |
| `npm test` | 42 pruebas aprobadas; 0 fallos |
| `TEST_BASE_URL=http://127.0.0.1:3187 npm run test:http` | 47 comprobaciones HTTP aprobadas |
| `npm run build -- --webpack` | Compilación de producción completada |
| `npm run build` | Turbopack no completó la compilación: restricción del entorno al abrir un puerto interno de procesamiento CSS (`EPERM`) |

Las comprobaciones de tipos permanecieron activas. El resultado satisfactorio de Webpack corresponde a una compilación completa, no a la omisión del análisis de TypeScript. La restricción de Turbopack caracteriza el entorno evaluado y no permite concluir su compatibilidad con otros entornos.

### Casos representativos

| Entrada o acción | Comportamiento comprobado |
| --- | --- |
| Venta de 1 o 500000 COP | Aceptación de los límites |
| Venta de 0, 0.1, 1.5 o 500001 COP | Rechazo |
| Precio booleano, array u objeto | Rechazo sin conversión implícita |
| Intercambio sin contraprestación válida | Rechazo |
| PATCH con `null`, array o primitiva | Rechazo; HTTP 400 en integración |
| PATCH con campos omitidos | Conservación de valores anteriores |
| Actualización inválida | Recurso almacenado sin modificación |
| Consulta o eliminación de recurso inexistente | Error de ausencia; HTTP 404 en integración |
| Creación seguida de consulta desde otra petición | Recurso visible en el mismo servidor |

## Reproducción

Desde la raíz del proyecto:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
```

Para repetir las pruebas HTTP, iniciar el servidor en una terminal:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3187
```

En otra terminal:

```bash
TEST_BASE_URL=http://127.0.0.1:3187 npm run test:http
```

El entorno debe permitir procesos de compilación y conexiones al servidor local. Las pruebas se ejecutan sobre datos de demostración.

## Alcance de la evidencia

Los resultados respaldan las reglas de negocio, los casos de uso y la integración HTTP dentro de una instancia. No incluyen una evaluación de interfaz en navegador, diseño adaptable, navegación por teclado o accesibilidad. Tampoco comprueban persistencia entre reinicios, sincronización multiproceso, carga o concurrencia distribuida.

El almacenamiento en memoria es deliberadamente temporal. La pérdida de datos al reiniciar y la ausencia de autenticación y control de propiedad forman parte de las limitaciones funcionales del prototipo.
