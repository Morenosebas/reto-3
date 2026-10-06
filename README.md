# Reutiliza · Reto 3

Repositorio base para el Reto 3: diseñar una plataforma que facilite el intercambio, la reutilización y el aprovechamiento de objetos, materiales y productos que todavía tienen valor para otras personas.

> Esta primera entrega contiene únicamente el proyecto base de Next.js, la decisión arquitectónica y la estructura de carpetas. La funcionalidad se implementará en una siguiente etapa.

## Arquitectura elegida

Se eligió una **arquitectura de monolito modular full-stack con Next.js App Router**.

### Motivo de elección

- **Un solo repositorio:** frontend y backend evolucionan juntos, lo que reduce la complejidad inicial del proyecto universitario.
- **Separación por responsabilidades:** las rutas de Next.js, los componentes visuales y la lógica de negocio tienen ubicaciones diferentes.
- **Fácil de comenzar y de escalar:** se puede iniciar con una aplicación sencilla y agregar módulos sin convertir el proyecto en una estructura desordenada.
- **TypeScript compartido:** frontend y backend pueden usar los mismos tipos y contratos, disminuyendo errores de integración.
- **Backend integrado:** Next.js App Router permite crear Route Handlers para la API sin administrar un servidor independiente en esta fase.
- **Evolución gradual:** la infraestructura inicial puede conectarse más adelante a una base de datos, autenticación y servicios externos sin mover la lógica de negocio.
- **Menor costo operativo:** para el alcance del reto no es necesario introducir microservicios, colas o múltiples despliegues.

Se eligió un monolito **modular**, no una aplicación sin límites: cada capacidad del negocio tendrá su propio módulo y las dependencias entre capas serán explícitas.

## Estructura de carpetas

```text
reto-3-reutiliza/
├── public/                              # Recursos estáticos públicos
├── src/
│   ├── app/                             # Capa de entrada de Next.js (App Router)
│   │   ├── api/                         # Backend HTTP mediante Route Handlers
│   │   │   └── resources/               # Endpoints del módulo de recursos
│   │   ├── globals.css                  # Estilos globales
│   │   ├── layout.tsx                   # Layout raíz de la aplicación
│   │   └── page.tsx                     # Página principal
│   │
│   ├── components/                      # Componentes reutilizables de presentación
│   │   ├── layout/                      # Header, navegación y footer
│   │   └── shared/                      # Botones, inputs, estados y UI común
│   │
│   └── modules/                         # Módulos orientados al negocio
│       └── resources/                   # Intercambio y reutilización de recursos
│           ├── domain/                  # Entidades, reglas y contratos del dominio
│           ├── application/             # Casos de uso y servicios de aplicación
│           ├── infrastructure/          # Base de datos, repositorios e integraciones
│           └── presentation/           # Adaptadores del módulo para la UI
│
├── package.json                          # Dependencias y scripts
└── README.md                             # Decisión arquitectónica y guía del proyecto
```

## Responsabilidad de cada capa

| Carpeta | Responsabilidad | No debería contener |
| --- | --- | --- |
| `src/app` | Routing, layouts, metadata y endpoints HTTP de Next.js. | Reglas de negocio complejas. |
| `src/components` | Componentes visuales reutilizables y composición de la interfaz. | Consultas directas a la base de datos. |
| `modules/*/domain` | Modelo del negocio, entidades, value objects y contratos. | Dependencias de React o Next.js. |
| `modules/*/application` | Casos de uso como publicar, buscar, intercambiar o solicitar un recurso. | Detalles de almacenamiento o presentación. |
| `modules/*/infrastructure` | Implementaciones técnicas: persistencia, repositorios y servicios externos. | Componentes visuales. |
| `modules/*/presentation` | Mapeadores, view models y adaptadores específicos del módulo. | Acceso directo no abstraído a infraestructura. |

## Flujo esperado de una funcionalidad

```text
Interfaz / Route Handler
          ↓
Caso de uso (application)
          ↓
Contrato del dominio (domain)
          ↓
Implementación técnica (infrastructure)
```

Por ejemplo, una futura búsqueda de recursos entraría por una página o endpoint de `src/app`, ejecutaría un caso de uso de `src/modules/resources/application`, usaría un contrato definido en `domain` y resolvería los datos mediante un repositorio de `infrastructure`.

## CRUD de recursos y patrones creacionales

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/resources` | Listar recursos |
| `POST` | `/api/resources` | Publicar un recurso |
| `GET` | `/api/resources/:id` | Consultar un recurso |
| `PATCH` | `/api/resources/:id` | Actualizar los campos enviados |
| `DELETE` | `/api/resources/:id` | Eliminar un recurso |

Ejemplo de cuerpo para `POST`:

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

### Factory Method: `modules/resources/domain/factories`

Un recurso se publica en una de tres modalidades, cada una con reglas propias: **donación** (gratis), **intercambio** (exige `wantedInReturn`) y **venta solidaria** (exige `price`, con un tope). `ResourceCreator` define el algoritmo común (validar los campos compartidos y asignar identidad) y delega en el método de fábrica `createResource` la decisión de qué subclase de `Resource` instanciar. `DonationResourceCreator`, `ExchangeResourceCreator` y `SaleResourceCreator` son los creadores concretos. Los casos de uso `CreateResource` y `UpdateResource` solo piden el creador de la modalidad y no conocen las subclases, así que agregar una modalidad (por ejemplo, préstamo) no modifica el código existente.

### Singleton: `modules/resources/infrastructure/InMemoryResourceRepository.ts`

Mientras no haya base de datos, los recursos se guardan en memoria, y todos los endpoints deben compartir el mismo almacén. Si no fuera así, un recurso creado con `POST` no aparecería en el `GET`. El repositorio tiene constructor privado y solo se obtiene con `getInstance()`. La instancia se guarda en `globalThis` porque el hot reload de `next dev` vuelve a evaluar los módulos y una propiedad estática se perdería en cada recarga. Los datos se pierden al reiniciar el servidor.

## Tecnologías base

- Next.js con App Router
- React
- TypeScript
- Tailwind CSS
- ESLint

## Inicio rápido

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run lint      # Revisión estática
npm run build     # Build de producción
npm run start     # Servidor de producción
```

## Próximos pasos

1. Definir las historias de usuario y el modelo de `Resource`.
2. Crear los casos de uso del módulo `resources`.
3. Elegir la base de datos y construir los repositorios.
4. Diseñar las pantallas para explorar y publicar recursos.
5. Incorporar autenticación, solicitudes de intercambio y moderación.
