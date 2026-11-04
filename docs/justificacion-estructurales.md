# Justificación de patrones estructurales

## Contexto del proyecto

**Reutiliza** es una plataforma para publicar objetos que ya no se usan. A medida que el proyecto crece, aparecen tres problemas de diseño concretos que los patrones estructurales resuelven: cómo traducir errores del dominio a respuestas HTTP sin acoplar las dos capas, cómo evitar que la lógica específica de cada modalidad se repita en varios componentes, y cómo añadir comportamiento al repositorio sin modificar su código.

---

## Patrón 1 — Adapter

### El problema

Cuando ocurre un error en la aplicación (por ejemplo, el usuario envía datos inválidos o pide un recurso que no existe), la capa de API necesita convertir ese error en una respuesta HTTP con el código correcto (400, 404, 500…).

El código original hacía esto directamente:

```ts
// http.ts original
import { ResourceNotFoundError, ValidationError } from "@/modules/resources/domain/errors";

if (error instanceof ValidationError)      return Response.json(..., { status: 400 });
if (error instanceof ResourceNotFoundError) return Response.json(..., { status: 404 });
```

Esto tiene un problema: la capa de API conoce los nombres concretos de los errores del dominio. Si se agrega un nuevo tipo de error (`ConflictError`, `ForbiddenError`), hay que volver a modificar `http.ts`. Si se agrega un segundo módulo (usuarios, pedidos), no se puede reutilizar esa función sin tocarla.

### La solución

El patrón **Adapter** introduce una interfaz común (`HttpMappable`) que actúa como puente entre los errores del dominio y lo que necesita la capa HTTP. Cada error del dominio declara su propio código HTTP, y la función `errorResponse` solo pregunta si el error "sabe" responder como HTTP, sin importar de qué clase sea.

```ts
// errors.ts — los errores se adaptan a la interfaz HTTP
export interface HttpMappable {
  readonly httpStatus: number;
}

export class ValidationError extends Error implements HttpMappable {
  readonly httpStatus = 400;
}

export class ResourceNotFoundError extends Error implements HttpMappable {
  readonly httpStatus = 404;
}

// http.ts — ya no conoce clases concretas
export function errorResponse(error: unknown): Response {
  if (isHttpMappable(error)) {
    return Response.json({ error: error.message }, { status: error.httpStatus });
  }
  return Response.json({ error: "Error interno del servidor" }, { status: 500 });
}
```

### Por qué encaja aquí

El Adapter resuelve exactamente la incompatibilidad de interfaz entre el dominio (que lanza errores con sus propias clases) y la capa HTTP (que necesita un código numérico). Ahora agregar un nuevo error solo requiere escribir esa clase con su `httpStatus`; `http.ts` no se modifica. El sistema cumple el principio Open/Closed.

---

## Patrón 2 — Bridge

### El problema

La plataforma tiene tres modalidades: donación, intercambio y venta. Cada una se comporta diferente: muestra un texto distinto en la tarjeta ("Gratis", "Lo cambio por…", precio en pesos), tiene campos distintos en el formulario (ninguno, "qué buscas a cambio", precio) y construye un payload distinto al guardar.

El código original resolvía esto con condicionales dispersos en dos componentes:

```ts
// ResourceCard.tsx
switch (resource.modality) {
  case "donation": return "Gratis";
  case "exchange": return `Lo cambio por ${resource.wantedInReturn}`;
  case "sale":     return formatPrice(resource.price ?? 0);
}

// ResourceForm.tsx
{values.modality === "exchange" && <Field ...wantedInReturn />}
{values.modality === "sale"     && <Field ...price />}
```

Si se agrega una nueva modalidad, hay que modificar `ResourceCard`, `ResourceForm` y varios otros archivos al mismo tiempo. Es un cambio en cascada que aumenta el riesgo de errores.

### La solución

El patrón **Bridge** separa la jerarquía de componentes visuales (la "abstracción") de la jerarquía de lógica por modalidad (el "implementador"). Se crea la interfaz `ModalityPresenter` con tres implementaciones concretas, una por modalidad. Los componentes delegan en el presentador en lugar de tener condicionales propios.

```ts
// ModalityPresenter.ts
interface ModalityPresenter {
  valueDisplay(dto: ResourceDTO): string;
  extraFields(values, update, inputClass): ReactNode;
  toExtraPayload(values): Record<string, unknown>;
}

class DonationPresenter implements ModalityPresenter { ... }  // retorna "Gratis", sin campos extra
class ExchangePresenter implements ModalityPresenter { ... }  // retorna "Lo cambio por...", campo wantedInReturn
class SalePresenter    implements ModalityPresenter { ... }   // retorna precio formateado, campo price

// ResourceCard.tsx — sin switch
const presenter = MODALITY_PRESENTERS[resource.modality];
presenter.valueDisplay(resource); // "Gratis" | "Lo cambio por..." | "$15.000"

// ResourceForm.tsx — sin condicionales
const extras = MODALITY_PRESENTERS[values.modality].toExtraPayload(values);
```

### Por qué encaja aquí

El Bridge desacopla las dos dimensiones que varían de forma independiente: cómo se ve algo (componente) y qué reglas tiene según su tipo (modalidad). Añadir una nueva modalidad `loan` significa crear `LoanPresenter`, registrarlo en `MODALITY_PRESENTERS` y no tocar `ResourceCard` ni `ResourceForm`. Se cumple el principio Open/Closed en ambas jerarquías.

---

## Patrón 3 — Decorator

### El problema

`InMemoryResourceRepository` almacena los recursos en memoria. Con el tiempo surgen necesidades transversales: registrar en consola cada operación de lectura y escritura (para auditoría o depuración), o evitar consultar el repositorio repetidamente cuando los datos no han cambiado (caché).

El problema es que ambas necesidades no tienen nada que ver con la lógica de persistencia. Si se añaden directamente dentro del repositorio, la clase mezcla responsabilidades. Y cuando se migre a una base de datos real, habrá que volver a añadir el logging y la caché en la nueva clase.

### La solución

El patrón **Decorator** envuelve el repositorio con otra clase que tiene la misma interfaz. El decorador recibe el repositorio original, le añade comportamiento antes o después de cada operación, y delega el trabajo real al interior. Se pueden apilar varios decoradores en cadena.

```ts
// LoggingRepositoryDecorator.ts
export class LoggingRepositoryDecorator implements ResourceRepository {
  constructor(private readonly inner: ResourceRepository) {}

  async save(resource: Resource): Promise<void> {
    await this.inner.save(resource);
    console.log(`[repo] save → ${resource.id} (${resource.modality})`);
  }
  // findAll, findById, delete siguen el mismo patrón
}

// CachingRepositoryDecorator.ts
export class CachingRepositoryDecorator implements ResourceRepository {
  private cache: Resource[] | null = null;

  async findAll(): Promise<Resource[]> {
    this.cache ??= await this.inner.findAll(); // usa caché si existe
    return this.cache;
  }

  async save(resource: Resource): Promise<void> {
    await this.inner.save(resource);
    this.cache = null; // invalida la caché al escribir
  }
}

// resourceModule.ts — se apilan en la raíz de composición
const base     = InMemoryResourceRepository.getInstance();
const cached   = new CachingRepositoryDecorator(base);
const repository = new LoggingRepositoryDecorator(cached);
```

### Por qué encaja aquí

El repositorio es el punto de acceso a todos los datos. El Decorator permite añadir logging y caché sin modificar ninguna clase existente y sin que los casos de uso (`CreateResource`, `ListResources`, etc.) se enteren del cambio. Cuando se migre a una base de datos real, los decoradores de logging y caché se reutilizan sin ninguna modificación. Se cumple el principio Open/Closed y el de Responsabilidad Única: cada clase hace una sola cosa.
