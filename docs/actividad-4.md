# Actividad 4 · Reutiliza

La solución conserva el CRUD del Reto 3 y aplica **Factory Method y Singleton** a dos problemas distintos: crear recursos con reglas por modalidad y compartir el almacén temporal entre consumidores del mismo runtime. Son exactamente dos patrones creacionales; las tres modalidades no representan tres patrones.

## Arquitectura y flujo comprobable

El monolito modular full-stack separa entrada HTTP/UI, aplicación, dominio, infraestructura y presentación. `src/modules/resources/resourceModule.ts` conecta los cinco casos de uso al contrato del repositorio.

1. El formulario envía POST/PATCH mediante `presentation/resourceApi.ts`.
2. Los Route Handlers interpretan JSON, invocan casos de uso y traducen errores a HTTP.
3. `CreateResource` o `UpdateResource` seleccionan un creador por modalidad.
4. El creador valida y construye un producto `Resource` concreto.
5. El caso de uso guarda a través de `ResourceRepository`; el DTO serializa fechas para la UI.

Al actualizar se conservan `id` y `createdAt`; se reconstruye el objeto aplicando otra vez las reglas. Cambiar de modalidad exige los datos de la modalidad nueva. Las pruebas verifican que una actualización inválida no cambia el recurso guardado.

## Factory Method: construcción válida por modalidad

**Problema:** una donación no cobra, un intercambio exige qué recibir a cambio y una venta exige un precio entero dentro del tope solidario. Repetir esas reglas en cada endpoint permitiría diferencias entre crear y editar.

**Solución:** `ResourceCreator.create(draft, identity?)` concentra validación común e identidad; `protected abstract createResource(base, draft)` es el método de fábrica que las subclases implementan. Cada creador devuelve un producto concreto que satisface el contrato abstracto `Resource`.

| Participante | Clase / símbolo | Archivo bajo `src/modules/resources/` |
| --- | --- | --- |
| Creador abstracto | `ResourceCreator` | `domain/factories/ResourceCreator.ts` |
| Método de fábrica | `createResource(base, draft): Resource` | Mismo archivo; protegido y abstracto |
| Creadores concretos | `DonationResourceCreator`, `ExchangeResourceCreator`, `SaleResourceCreator` | Archivos homónimos en `domain/factories/` |
| Producto abstracto | `Resource` | `domain/Resource.ts` |
| Productos concretos | `DonationResource`, `ExchangeResource`, `SaleResource` | `domain/Resource.ts` |
| Clientes | `CreateResource`, `UpdateResource` | Archivos homónimos en `application/` |
| Selección de creador | `getResourceCreator`, registro `creators` | `domain/factories/index.ts` |

**Reglas concretas:** intercambio requiere `wantedInReturn` de 3–120 caracteres. Venta acepta únicamente un número entero o texto decimal entero entre 1 y 500.000 COP. No hay redondeo que convierta un positivo en cero ni coerción de booleanos/arrays. Donación descarta precio y contraprestación.

**OCP, alcance real:** añadir una modalidad puede conservar `ResourceCreator.create()` y ambos casos de uso, pero requiere extender el enum/unión de modalidades, el registro de creadores, etiquetas y estilos de UI. No se promete “cero cambios en código existente”. El registro selecciona implementaciones del Factory Method; no se presenta como un tercer patrón creacional.

**Límite:** los constructores concretos son públicos y podrían invocarse evitando la fábrica; el flujo actual de creación y actualización usa los creadores. Las pruebas protegen ese flujo. La solución no necesita una jerarquía adicional ni otro patrón para cumplir el objetivo.

## Singleton: almacén temporal compartido

**Problema:** si cada consumidor construyera un repositorio con un `Map` propio, publicar desde uno y listar desde otro podría mostrar datos distintos.

**Solución:** `InMemoryResourceRepository` tiene constructor privado y operación de clase `getInstance()`. La referencia se conserva en `globalThis.inMemoryResourceRepository`. La raíz de composición obtiene esa instancia e inyecta el contrato a los casos de uso.

| Participante | Clase / símbolo | Archivo bajo `src/modules/resources/` |
| --- | --- | --- |
| Singleton concreto | `InMemoryResourceRepository` | `infrastructure/InMemoryResourceRepository.ts` |
| Acceso estático | `getInstance(): InMemoryResourceRepository` | Mismo archivo |
| Estado | `resources: Map<string, Resource>` | Mismo archivo; privado |
| Inicialización | Constructor privado y `seed()` privado | Mismo archivo |
| Referencia global | `globalThis.inMemoryResourceRepository?` | Declarada en el mismo módulo; no es campo estático de la clase |
| Contrato | `ResourceRepository` | `domain/ResourceRepository.ts` |
| Composición | `resourceUseCases` | `resourceModule.ts` |
| Consumidores | Cinco casos de uso CRUD | `application/` |

`findById` devuelve `Promise<Resource | null>`; `save` devuelve `Promise<void>` y `delete`, `Promise<boolean>`. `GetResource` convierte la ausencia en `ResourceNotFoundError`, luego HTTP la transforma en 404.

**Alcance y coste:** una instancia por contexto de ejecución compartido. `globalThis` puede sobrevivir a reevaluaciones de módulos dentro de ese contexto, pero no promete sobrevivir a todas las recargas de desarrollo ni comunicar procesos. Reiniciar pierde los datos. No sincroniza workers, múltiples servidores ni funciones serverless. Es un prototipo académico, no persistencia durable.

La dependencia global queda confinada a infraestructura/composición; los casos de uso reciben una interfaz. Un repositorio durable futuro implementaría ese contrato y se conectaría en la composición. La inyección explícita de una instancia también permitiría compartirla: Singleton es una elección pedagógica para este prototipo, no la única solución posible.

## SOLID: evidencia y límites

| Principio | Evidencia actual | Límite explícito |
| --- | --- | --- |
| SRP | Casos de uso por operación; entidades y creadores en dominio; HTTP y DTO separados | El repositorio también siembra ejemplos: responsabilidad de inicialización del prototipo |
| OCP | Variantes mediante subclases; algoritmo común estable | Registro, tipos y UI deben ampliarse al añadir modalidad |
| LSP | Productos exponen `modalityDetails()`; creadores devuelven `Resource` | Debe preservarse ese contrato en futuras variantes; pruebas actuales cubren las tres |
| ISP | `ResourceRepository` solo define cuatro operaciones de almacenamiento | Casos de uso individuales usan subconjuntos; separar interfaces si aparecen consumidores con necesidades distintas |
| DIP | Casos de uso dependen de `ResourceRepository`, recibido por constructor | El selector de creadores sigue siendo una función importada; la composición conoce infraestructura |

No se afirma cumplimiento perfecto por la existencia de carpetas. Las pruebas y los puntos de dependencia permiten comprobar las decisiones.

## UML y documentación

Las [revisiones UML](uml/README.md) muestran participantes concretos, abstracciones, visibilidad y retornos. Se generaron desde el código porque no se pudieron descargar los `.drawio` aportados. No reemplazan ni modifican esos originales. Las fuentes `.dot` son editables y sus SVG se incluyen para revisión visual.

## Correspondencia con la rúbrica

| Criterio | Peso | Evidencia que se debe mostrar |
| --- | --- | --- |
| Justificación | 20 % | Problema real, decisión, participantes y límites de cada patrón en este documento |
| UML | 20 % | Dos diagramas y correspondencia exacta con archivos y firmas |
| Implementación y SOLID | 60 % | CRUD real, fábrica usada al crear/editar, inyección del repositorio, pruebas y casos inválidos |

El enunciado docente menciona repositorios frontend/backend; aquí ambos están integrados en un único repositorio desde el Reto 3. Esa diferencia sigue pendiente de aclaración. No se declara equivalencia ni se divide el sistema sin una decisión explícita.
