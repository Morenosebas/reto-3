# Reutiliza

Plataforma para publicar, consultar, editar y eliminar recursos destinados a **donación, intercambio y venta solidaria**. La aplicación integra una interfaz React y una API HTTP mediante un monolito modular con Next.js. El módulo de recursos implementa los patrones creacionales **Factory Method** y **Singleton**.

## Requisitos e instalación

- Node.js 20.9 o superior.
- npm y acceso al registro de paquetes, o una caché completa de dependencias.

```bash
npm ci
npm run dev
```

La aplicación está disponible en `http://localhost:3000`. Al iniciar el servidor se cargan tres publicaciones de ejemplo: una donación, un intercambio y una venta.

## Uso

El formulario permite seleccionar una modalidad, completar los datos del recurso y publicarlo. El catálogo muestra las publicaciones y permite filtrarlas por modalidad. Cada tarjeta ofrece acciones para editar y eliminar el recurso; la edición también permite actualizar su estado.

Las publicaciones se almacenan en memoria. Al reiniciar el servidor se pierden los cambios y se restauran los ejemplos iniciales.

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
| `npm test` | Pruebas de dominio, aplicación, repositorio y serialización |
| `npm run test:http` | Pruebas de integración de la API contra un servidor local |

Las pruebas TypeScript se compilan en `.test-build/` y se ejecutan con `node:test`. La suite HTTP crea datos temporales y elimina los recursos que genera.

## API

| Método | Ruta | Operación | Respuestas principales |
| --- | --- | --- | --- |
| GET | `/api/resources` | Listar por fecha de creación descendente | 200 |
| POST | `/api/resources` | Publicar un recurso | 201, 400 |
| GET | `/api/resources/:id` | Consultar un recurso | 200, 404 |
| PATCH | `/api/resources/:id` | Actualizar parcialmente | 200, 400, 404 |
| DELETE | `/api/resources/:id` | Eliminar un recurso | 204, 404 |

POST y PATCH reciben objetos JSON. Los cuerpos malformados, `null`, arrays, primitivas y datos que incumplen las reglas producen una respuesta 400. En PATCH, los campos omitidos conservan su valor; un objeto vacío reconstruye el recurso sin cambiar sus datos de negocio y actualiza `updatedAt`.

Ejemplo de publicación de intercambio:

```json
{
  "modality": "exchange",
  "title": "Bicicleta rin 16",
  "description": "Bicicleta infantil en buen estado",
  "category": "other",
  "location": "Suba, Bogotá",
  "wantedInReturn": "Patines"
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
| Donación | Sin precio ni contraprestación |
| Intercambio | `wantedInReturn` entre 3 y 120 caracteres |
| Venta solidaria | Precio entero entre 1 y 500.000 COP |

Los textos se validan después de eliminar espacios exteriores. El precio admite un número entero o texto de dígitos decimales con espacios exteriores opcionales; rechaza fracciones, booleanos, arrays y objetos. La construcción no redondea precios.

## Arquitectura

```text
src/app/page.tsx                         Página principal y carga inicial
src/components/resources/              Formulario, catálogo y tarjetas
src/app/api/resources/                  Adaptadores HTTP
src/modules/resources/
  domain/                              Entidades, contratos y creadores
  application/                         Casos de uso CRUD
  infrastructure/                      Almacén en memoria
  presentation/                        DTO, cliente HTTP y formato
  resourceModule.ts                    Composición e inyección de dependencias
```

Los casos de uso reciben el contrato `ResourceRepository`. La raíz de composición selecciona `InMemoryResourceRepository` e inyecta la instancia compartida. `ResourceSchemas.ts` valida los objetos de entrada con Zod en la capa de aplicación: los campos desconocidos se descartan, los conocidos conservan tipos estrictos y los errores esperados se traducen a `ValidationError`. Los creadores del dominio mantienen las reglas de construcción de cada modalidad. La página obtiene la lista inicial en el servidor y las acciones de la interfaz utilizan la API. El dominio es independiente de React, Next.js y Zod.

## Tecnologías

Next.js 16.3.6, React 19.2.8, TypeScript, Zod 4.6.5, Tailwind CSS 4 y ESLint 9. La interfaz utiliza familias tipográficas del sistema con alternativas explícitas, por lo que la compilación no descarga fuentes externas. La tipografía exacta depende de las fuentes disponibles en cada equipo.

## Alcance y limitaciones

El repositorio en memoria comparte un `Map` dentro del mismo contexto de ejecución mediante `globalThis`. No proporciona persistencia entre reinicios ni sincronización entre procesos, workers o instancias serverless. La aplicación no incluye autenticación ni control de propiedad de publicaciones; su alcance corresponde a un prototipo académico.

## Documentación

- [Informe técnico: arquitectura, patrones creacionales y SOLID](docs/actividad-4.md).
- [Diagramas de clases UML](docs/uml/README.md).
- [Registro de pruebas](docs/verificacion.md).
- [Guion de sustentación](docs/demo.md).
