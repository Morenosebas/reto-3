# Verificación local · 21 de octubre de 2026

Base revisada: `Morenosebas/reto-3`, commit remoto `7a3cf793987ecf43c6fb176ae16e0b2bee9b98b9`. Se preparó una copia aislada y se verificaron los hashes de sus 48 archivos contra GitHub antes de editar. La copia original atrasada en `54040a2` se conserva intacta. Durante esa verificación inicial no se hicieron commits, push, merges ni entrega a Campus. La publicación posterior se propone mediante PR en borrador; el merge queda a cargo del usuario.

## Correcciones

- Precio: números o texto decimal entero, 1–500000 COP; rechazo de fracciones, booleanos, arrays, objetos, vacíos y valores no finitos. Se elimina el redondeo silencioso.
- Entrada POST/PATCH: exige objeto JSON; rechaza `null`, arrays y primitivas con `ValidationError` → HTTP 400.
- Fuentes del sistema con fallback explícito: elimina la descarga de Google Fonts del build. La apariencia tipográfica puede variar según equipo; se conserva el diseño de componentes.
- Pruebas y documentación versionables; exactamente Factory Method y Singleton, con alcance y límites explícitos.

## Comandos y resultados

Entorno: Node 22.17.0, npm 10.9.2. Dependencias originales instaladas desde caché mediante `npm ci --offline --ignore-scripts --no-audit --no-fund` (con directorios de caché/logs explícitos). No se añadieron dependencias.

| Comando / comprobación | Resultado |
| --- | --- |
| `npm run lint` | Correcto |
| `npm run typecheck` | Correcto: `next typegen` y `tsc --noEmit --incremental false` |
| `npm test` | 42 pruebas correctas; 0 fallos |
| `TEST_BASE_URL=http://127.0.0.1:3187 npm run test:http` | 47 comprobaciones HTTP correctas, recursos temporales eliminados |
| `npm run build` (Turbopack) | Bloqueado por `EPERM` al abrir un puerto interno para procesar CSS, incluso tras el flujo normal de permisos |
| `npm run build -- --webpack` | Correcto con permisos del ejecutor: compilación, TypeScript, generación de páginas y trazas |
| `npm run dev -- --hostname 127.0.0.1 --port 3187` | Arrancó tras autorización normal del ejecutor; permitió pruebas HTTP reales |
| SVG de los dos UML → PNG | Exportados con Graphviz e inspeccionados visualmente |

El primer intento Webpack sin permisos adicionales falló al obtener la configuración de TypeScript desde un proceso hijo; con el flujo normal de permisos terminó correctamente. No se desactivaron comprobaciones TypeScript ni ESLint. Next.js emitió una advertencia sobre un `package-lock.json` ajeno en el directorio padre; no se modificó ese archivo ni configuración global.

## Qué prueban las suites

`tests/resources.test.ts` verifica los tres productos, CRUD por casos de uso, identidad/fecha conservadas, cambio de modalidad, validaciones y límites, cuerpo JSON, repositorio compartido dentro del runtime, errores por ausencia y DTO. Usa `node:test` y `node:assert/strict`; el compilador ya pertenece al proyecto.

`tests/http-smoke.mjs` verifica GET/POST/PATCH/DELETE reales, visibilidad del recurso entre peticiones, respuestas 201/200/204/400/404, JSON malformado y regresiones. Solo admite destino local y limpia los identificadores que creó. Requiere un servidor arrancado; no debe dirigirse a datos reales.

## Límites y pendientes

- **Interfaz no validada en navegador:** no hay navegadores conectados a las herramientas disponibles. No hay capturas de UI ni se afirma haber completado un recorrido visual.
- La tipografía del sistema debe revisarse visualmente en el equipo de exposición, también en móvil y navegación por teclado.
- Los `.drawio` originales no pudieron descargarse mediante la transferencia soportada. Se generaron revisiones nuevas `.dot` + SVG sin sobrescribir los originales; sí se inspeccionaron los píxeles de las revisiones.
- El Singleton sigue siendo memoria temporal por contexto; las pruebas no demuestran persistencia entre reinicios ni consistencia multiproceso.
- El docente menciona dos repositorios; el proyecto actual usa un monolito full-stack en uno. Pendiente aclaración, sin afirmar equivalencia.
- Este registro corresponde a la verificación local previa al PR. Antes del merge queda revisar la interfaz en el equipo de entrega. El PR en borrador no constituye aprobación académica ni envío a Campus.
