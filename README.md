# Reutiliza

Plataforma para publicar, consultar, editar y eliminar recursos destinados a **donación, intercambio y venta solidaria**. La aplicación integra una interfaz React y una API HTTP mediante un monolito modular con Next.js. El módulo de recursos implementa los patrones creacionales **Factory Method** y **Singleton** y los patrones estructurales **Facade**, **Proxy** y **Adapter**.

## Integrantes

Daniel Parra · Johan Sebastián González · Sebastián Vargas

## Requisitos e instalación

- Node.js 20.9 o superior.
- npm y acceso al registro de paquetes, o una caché completa de dependencias.

```bash
npm ci
npm run dev
```

La aplicación está disponible en `http://localhost:3000`. Para cargar las tres publicaciones de demostración, primero inicia el servidor y luego ejecuta `npm run seed` en otra terminal. El script consulta la API y omite las muestras que ya existen.

## Uso

El catálogo ocupa toda la página. El botón **Publicar un recurso** abre un panel lateral con el formulario: modalidad, datos del recurso y el **WhatsApp** de quien publica (celular colombiano; el +57 se agrega solo). Arriba del formulario, una **vista previa** muestra la etiqueta tal como quedará mientras se escribe, con el color de la modalidad y el precio ya formateado; el título y la descripción tienen contador de caracteres. Si algún dato no es válido, el error aparece junto al campo.

El catálogo permite buscar por texto (sin distinguir mayúsculas ni tildes), filtrar por categoría y modalidad. Lo **entregado** no aparece en el catálogo porque ya no le sirve a nadie: se consulta con el filtro **Entregados** o por su enlace directo. El filtro **Solo disponibles** oculta además lo reservado; en lo reservado, quien visita ve "Apartado para otra persona". Los filtros quedan en la URL, así que una búsqueda se puede compartir. Cada título enlaza a la página del recurso (`/recursos/[id]`), que también se puede compartir.

Quien visita ve el botón **Escribir por WhatsApp** en lo que sigue disponible. Abre directamente la conversación con el número guardado (+57) y un mensaje ya escrito sobre la publicación: en el celular, la app de WhatsApp (`wa.me`); en el computador, WhatsApp Web (`web.whatsapp.com/send`). Quien publica tiene el enlace **Abrir mi chat en WhatsApp** para comprobar que su número quedó bien. Lo disponible aparece primero; lo reservado y lo entregado, después.

Solo quien publicó un recurso ve sus acciones: el número al que le escribirán, cambiar el estado con un clic (Disponible, Reservado, Entregado), editarlo y eliminarlo, con confirmación previa. Cada acción muestra un aviso con el resultado.

Al publicar por primera vez, el servidor asigna al navegador una clave anónima de publicante en una cookie `httpOnly`. Esa clave identifica las publicaciones propias; si se borran las cookies, ya no se pueden gestionar. Los recursos cargados con `npm run seed` no pertenecen a ningún visitante, así que nadie puede editarlos desde la interfaz.

Las publicaciones se guardan en archivos dentro de `.data/` y se conservan al reiniciar el servidor.

| Variable | Valor por defecto | Efecto |
| --- | --- | --- |
| `RESOURCE_STORAGE` | (vacía) | Con `memory`, los datos se guardan en memoria y se pierden al reiniciar |
| `RESOURCE_DATA_DIR` | `.data` | Carpeta de los archivos de datos |

## Compilación y pruebas

```bash
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
npm run start
```

El comando de compilación anterior utiliza Webpack, con el que se completó la validación de producción. `npm run build` utiliza Turbopack de forma predeterminada; las condiciones del entorno evaluado y los resultados se detallan en el [registro de pruebas](docs/verificacion.md).

Con un servidor local en ejecución:

```bash
npm run test:http
```

Para utilizar otro puerto: `TEST_BASE_URL=http://127.0.0.1:3187 npm run test:http`.

| Comando | Función |
| --- | --- |
| `npm run lint` | Análisis estático con ESLint |
| `npm run typecheck` | Generación de tipos de rutas y comprobación TypeScript |
| `npm test` | Pruebas de dominio, aplicación, repositorio, patrones estructurales, serialización y seed |
| `npm run test:http` | Pruebas de integración de la API contra un servidor local |
| `npm run seed` | Carga muestras de demostración mediante la API local activa |

Las pruebas TypeScript se compilan en `.test-build/` y se ejecutan con `node:test`. La suite HTTP crea datos temporales y elimina los recursos que genera.

## API

| Método | Ruta | Operación | Respuestas principales |
| --- | --- | --- | --- |
| GET | `/api/resources` | Listar por fecha de creación descendente; admite `?q=` (texto), `?categoria=`, `?disponibles=1` y `?entregados=1`; sin filtro de estado lista todos los estados | 200 |
| POST | `/api/resources` | Publicar un recurso | 201, 400 |
| GET | `/api/resources/:id` | Consultar un recurso | 200, 404 |
| PATCH | `/api/resources/:id` | Actualizar parcialmente | 200, 400, 403, 404 |
| DELETE | `/api/resources/:id` | Eliminar un recurso | 204, 403, 404 |

Cada recurso de la respuesta incluye `canManage`, que indica si el visitante puede editarlo o eliminarlo. `POST` crea la cookie `reutiliza_publisher` si el visitante aún no la tiene. `PATCH` y `DELETE` responden 403 cuando el recurso existe pero lo publicó otra persona.

POST y PATCH reciben objetos JSON. Los cuerpos malformados, `null`, arrays, primitivas y datos que incumplen las reglas producen una respuesta 400. En PATCH, los campos omitidos conservan su valor; un objeto vacío reconstruye el recurso sin cambiar sus datos de negocio y actualiza `updatedAt`.

Ejemplo de publicación de intercambio:

```json
{
  "modality": "exchange",
  "title": "Bicicleta rin 16",
  "description": "Bicicleta infantil en buen estado",
  "category": "other",
  "location": "Suba, Bogotá",
  "wantedInReturn": "Patines",
  "contactPhone": "300 123 4567"
}
```

## Reglas del recurso

| Atributo o modalidad | Restricción |
| --- | --- |
| Título | Entre 3 y 80 caracteres |
| Descripción | Entre 10 y 500 caracteres |
| Ubicación | Entre 3 y 120 caracteres |
| Categoría | `clothing`, `electronics`, `furniture`, `books`, `home`, `materials` u `other` |
| Estado | `available`, `reserved` o `delivered`; `available` por defecto |
| WhatsApp (`contactPhone`) | Celular colombiano de 10 dígitos que empieza por 3; admite espacios, guiones o el prefijo +57 y se guarda normalizado. Obligatorio en el formulario y opcional en la API, por compatibilidad con publicaciones anteriores |
| Donación | Sin precio ni contraprestación |
| Intercambio | `wantedInReturn` entre 3 y 120 caracteres |
| Venta solidaria | Precio entero entre 1 y 500.000 COP |

Los textos se validan después de eliminar espacios exteriores. El precio admite un número entero o texto de dígitos decimales con espacios exteriores opcionales; rechaza fracciones, booleanos, arrays y objetos. La construcción no redondea precios.

## Arquitectura

### Motivos de elección

Se eligió un monolito modular full-stack con Next.js App Router para mantener la interfaz y la API en un mismo proyecto, compartir tipos y contratos TypeScript y reducir la complejidad inicial del reto. Los Route Handlers permiten integrar la API sin administrar un servidor independiente. El alcance actual no requiere microservicios, colas ni múltiples despliegues.

La división por módulos y capas separa presentación, coordinación de casos de uso, reglas de negocio y almacenamiento. Esta organización facilita incorporar capacidades de forma gradual. El contrato `ResourceRepository` permite sustituir el almacén temporal por una implementación persistente manteniendo las reglas de construcción en el dominio.

```text
src/app/(catalogo)/                     Catálogo: página, búsqueda y loading.tsx
src/app/recursos/[id]/                  Página de detalle y not-found.tsx
src/app/recursos/actions.ts             Server Actions de la interfaz
src/app/api/resources/                  Adaptadores HTTP
src/components/resources/              Formulario, catálogo, etiquetas y acciones
src/components/shared/                 Diálogo de confirmación y avisos
src/modules/resources/
  domain/                              Entidades, contratos y creadores
  application/                         Casos de uso CRUD
  catalog/                             Facade, Proxy y Data Access Layer
  infrastructure/                      Adapter de unstorage y almacén en memoria
  presentation/                        DTO, cliente HTTP y formato
  resourceModule.ts                    Composición e inyección de dependencias
```

Los casos de uso reciben el contrato `ResourceRepository`. La raíz de composición selecciona `UnstorageResourceRepository`, o `InMemoryResourceRepository` con `RESOURCE_STORAGE=memory`, y construye la fachada `CommunityCatalog`. La página y los Route Handlers acceden a los datos solo mediante `catalogAccess.ts`, que entrega el catálogo protegido por `OwnerProtectedCatalog`. `ResourceSchemas.ts` valida los objetos de entrada con Zod en la capa de aplicación: los campos desconocidos se descartan, los conocidos conservan tipos estrictos y los errores esperados se traducen a `ValidationError`. Los creadores del dominio mantienen las reglas de construcción de cada modalidad. Las páginas obtienen los datos en el servidor y las acciones de la interfaz usan Server Actions, que también pasan por la Data Access Layer; la API HTTP queda disponible para otros clientes y para las pruebas. El dominio es independiente de React, Next.js y Zod.

### Elección de patrones creacionales

**Factory Method.** Donación, intercambio y venta solidaria comparten atributos, pero requieren productos y reglas específicas. `ResourceCreator` concentra las reglas comunes y la identidad; `createResource` delega la construcción en los creadores concretos. `CreateResource` y `UpdateResource` reutilizan este mecanismo para aplicar las mismas reglas al publicar y editar. Una nueva modalidad puede conservar el algoritmo común, aunque requiere ampliar los tipos, el registro de creadores, los esquemas de entrada y la interfaz.

**Singleton.** La primera entrega almacenaba publicaciones en memoria; esta implementación se conserva como opción con `RESOURCE_STORAGE=memory`. Instancias independientes del repositorio producirían almacenes distintos y podrían impedir que una publicación creada por un consumidor apareciera en las consultas de otro. `InMemoryResourceRepository` expone `getInstance()` y conserva la referencia en `globalThis`; la raíz de composición inyecta esa instancia compartida en los casos de uso. Su unicidad se limita al mismo contexto de ejecución: no proporciona persistencia entre reinicios ni sincronización entre procesos, workers o instancias serverless.

El [informe técnico](docs/actividad-4.md) amplía la justificación, los participantes y el alcance de SOLID. Los [diagramas UML](docs/uml/README.md) representan sus clases y relaciones.

### Elección de patrones estructurales

**Facade.** La página y los cinco Route Handlers repetían la coordinación de casos de uso y la conversión a DTO. `CommunityCatalog` ofrece cinco operaciones del catálogo (`browse`, `find`, `publish`, `edit` y `withdraw`) y oculta el subsistema. Se expone como Data Access Layer de Next.js en `catalogAccess.ts`, marcado con `server-only`.

**Proxy.** Cualquier visitante podía editar o eliminar publicaciones ajenas. `OwnerProtectedCatalog` implementa la misma interfaz que la fachada y solo delega la edición y el retiro cuando la huella de la cookie del visitante coincide con la de quien publicó; en otro caso responde 403.

**Adapter.** Las publicaciones se perdían al reiniciar. `UnstorageResourceRepository` adapta el almacén clave-valor de unstorage al contrato `ResourceRepository`: guarda JSON plano y reconstruye cada entidad con el Factory Method.

El [informe de patrones estructurales](docs/patrones-estructurales.md) desarrolla los problemas, la justificación, la correspondencia con los diagramas y la verificación.

## Tecnologías

Next.js 16.3.6, React 19.2.8, TypeScript, Zod 4.6.5, unstorage 1.17, Tailwind CSS 4 y ESLint 9. Las fuentes Anybody y Atkinson Hyperlegible Next están autoalojadas en `src/app/fonts` (licencia OFL) y se cargan con `next/font/local`, así que la compilación no descarga fuentes externas y la tipografía es la misma en todos los equipos.

## Alcance y limitaciones

El almacén en archivos (`fs-lite`) sirve para un único servidor; un despliegue con varias instancias requiere un driver compartido de unstorage, como Redis. En modo `memory`, el repositorio comparte un `Map` dentro del mismo contexto de ejecución y no conserva datos entre reinicios. La propiedad de las publicaciones se basa en una clave anónima por navegador, no en cuentas de usuario; su alcance corresponde a un prototipo académico.

## Documentación

- [Informe técnico: arquitectura, patrones creacionales y SOLID](docs/actividad-4.md).
- [Informe de patrones estructurales: Facade, Proxy y Adapter](docs/patrones-estructurales.md).
- [Diagramas de clases UML](docs/uml/README.md).
- [Registro de pruebas](docs/verificacion.md).
- [Guion de sustentación](docs/demo.md).
