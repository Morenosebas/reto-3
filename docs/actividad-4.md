# Reutiliza: arquitectura y patrones creacionales

**PADISOFT · Actividad 4**

## 1. Descripción y objetivo

Reutiliza es una plataforma de publicación de objetos, materiales y productos que conservan valor de uso. Permite ofrecer recursos mediante donación, intercambio o venta solidaria y gestionar su ciclo básico de publicación con operaciones de creación, consulta, actualización y eliminación.

El diseño aplica dos patrones creacionales: **Factory Method**, para construir recursos con reglas específicas por modalidad, y **Singleton**, para compartir el repositorio temporal dentro de un contexto de ejecución. Ambos se integran en una arquitectura modular que separa las reglas de negocio de la interfaz y del almacenamiento.

## 2. Modelo del dominio

La entidad abstracta `Resource` reúne identidad, título, descripción, categoría, ubicación, estado y fechas de creación y actualización. Las especializaciones representan las condiciones de entrega:

| Entidad | Modalidad | Regla específica |
| --- | --- | --- |
| `DonationResource` | Donación | No contiene precio ni contraprestación |
| `ExchangeResource` | Intercambio | Requiere `wantedInReturn`, entre 3 y 120 caracteres |
| `SaleResource` | Venta solidaria | Requiere un precio entero entre 1 y 500.000 COP |

Las reglas comunes exigen título de 3–80 caracteres, descripción de 10–500 y ubicación de 3–120, después de recortar espacios exteriores. Categoría y estado deben pertenecer a los valores definidos en `ResourceAttributes.ts`. El estado inicial es `available` cuando no se proporciona otro valor válido.

Los atributos de las entidades son de solo lectura. Una actualización reconstruye el recurso, conserva `id` y `createdAt`, y asigna `updatedAt`. El cambio de modalidad utiliza las reglas de la modalidad de destino; una actualización inválida no reemplaza el objeto almacenado.

## 3. Arquitectura

La solución es un **monolito modular full-stack** con Next.js App Router. La interfaz y la API comparten tipos TypeScript y se organizan alrededor del módulo `resources`.

| Capa | Responsabilidad | Ubicación |
| --- | --- | --- |
| Entrada HTTP | Interpretación de solicitudes, códigos de respuesta y manejo de errores | `src/app/api/resources/` |
| Interfaz | Formulario, catálogo, filtros y acciones de publicación | `src/components/resources/` |
| Aplicación | Coordinación de los casos de uso CRUD | `src/modules/resources/application/` |
| Dominio | Entidades, contratos y reglas de construcción | `src/modules/resources/domain/` |
| Infraestructura | Implementación del almacenamiento en memoria | `src/modules/resources/infrastructure/` |
| Presentación del módulo | DTO, cliente HTTP y formatos de visualización | `src/modules/resources/presentation/` |
| Composición | Selección del repositorio e inyección en los casos de uso | `src/modules/resources/resourceModule.ts` |

### Flujo de creación y actualización

1. La interfaz envía los datos mediante `resourceApi.ts`.
2. El Route Handler interpreta el objeto JSON e invoca el caso de uso.
3. `CreateResource` o `UpdateResource` selecciona el creador de la modalidad.
4. El creador valida los datos y construye una especialización de `Resource`.
5. El caso de uso guarda el resultado mediante `ResourceRepository`.
6. `toResourceDTO` transforma la entidad en una representación serializable; las fechas se expresan como cadenas ISO.

Las respuestas HTTP distinguen creación (201), consulta o actualización (200), eliminación (204), entrada inválida (400) y recurso inexistente (404).

## 4. Factory Method

### Problema de diseño

Las tres modalidades comparten atributos, pero tienen condiciones de construcción diferentes. Distribuir estas validaciones entre formularios, endpoints y casos de uso produciría duplicación y permitiría que la creación y la edición aplicaran reglas distintas.

### Decisión e implementación

`ResourceCreator.create(draft, identity?)` define la validación común y la asignación de identidad. El método protegido y abstracto `createResource(base, draft): Resource` constituye el punto de extensión: cada creador concreto decide qué producto instanciar y valida los datos propios de su modalidad.

| Participante | Clase o símbolo | Archivo relativo a `src/modules/resources/` |
| --- | --- | --- |
| Creador abstracto | `ResourceCreator` | `domain/factories/ResourceCreator.ts` |
| Método de fábrica | `createResource(base, draft): Resource` | `domain/factories/ResourceCreator.ts` |
| Creador de donaciones | `DonationResourceCreator` | `domain/factories/DonationResourceCreator.ts` |
| Creador de intercambios | `ExchangeResourceCreator` | `domain/factories/ExchangeResourceCreator.ts` |
| Creador de ventas | `SaleResourceCreator` | `domain/factories/SaleResourceCreator.ts` |
| Producto abstracto | `Resource` | `domain/Resource.ts` |
| Productos concretos | `DonationResource`, `ExchangeResource`, `SaleResource` | `domain/Resource.ts` |
| Clientes | `CreateResource`, `UpdateResource` | `application/CreateResource.ts`, `application/UpdateResource.ts` |
| Selección de creador | `getResourceCreator`, registro `creators` | `domain/factories/index.ts` |

`DonationResourceCreator` construye una donación sin datos adicionales. `ExchangeResourceCreator` valida la contraprestación. `SaleResourceCreator` acepta números enteros o texto decimal entero dentro del rango permitido; rechaza fracciones y conversiones implícitas de booleanos, arrays u objetos.

### Justificación y alcance

La variación de productos queda encapsulada en los creadores concretos. Los casos de uso operan con `Resource` y reutilizan la construcción validada tanto al publicar como al editar. El selector permite obtener el creador sin incorporar condiciones de modalidad en cada caso de uso.

Una nueva modalidad puede conservar el algoritmo común y los casos de uso existentes, aunque requiere ampliar los tipos de modalidad, el registro de creadores y la presentación correspondiente. Este es el alcance de extensión del diseño; el principio abierto/cerrado no implica que todo el sistema permanezca inalterado.

Los constructores de los productos concretos son públicos. Por tanto, la aplicación de las reglas depende de utilizar los creadores como vía de construcción en los flujos de negocio, como ocurre en los casos de uso implementados.

## 5. Singleton

### Problema de diseño

Un repositorio en memoria mantiene sus datos en un `Map`. Si cada consumidor dispusiera de una instancia independiente, una publicación creada desde un caso de uso podría no aparecer en las consultas de otro.

### Decisión e implementación

`InMemoryResourceRepository` restringe su construcción mediante un constructor privado y expone la operación estática `getInstance()`. La instancia se conserva en `globalThis.inMemoryResourceRepository`. La raíz de composición obtiene esa referencia y la inyecta en los cinco casos de uso.

| Participante | Clase o símbolo | Archivo relativo a `src/modules/resources/` |
| --- | --- | --- |
| Singleton | `InMemoryResourceRepository` | `infrastructure/InMemoryResourceRepository.ts` |
| Acceso estático | `getInstance(): InMemoryResourceRepository` | `infrastructure/InMemoryResourceRepository.ts` |
| Estado privado | `resources: Map<string, Resource>` | `infrastructure/InMemoryResourceRepository.ts` |
| Inicialización | Constructor privado y `seed()` | `infrastructure/InMemoryResourceRepository.ts` |
| Referencia compartida | `globalThis.inMemoryResourceRepository?` | `infrastructure/InMemoryResourceRepository.ts` |
| Contrato | `ResourceRepository` | `domain/ResourceRepository.ts` |
| Composición | `resourceUseCases` | `resourceModule.ts` |
| Consumidores | `CreateResource`, `ListResources`, `GetResource`, `UpdateResource`, `DeleteResource` | Archivos homónimos en `application/` |

El contrato define `findAll(): Promise<Resource[]>`, `findById(id): Promise<Resource | null>`, `save(resource): Promise<void>` y `delete(id): Promise<boolean>`. `GetResource` transforma el resultado nulo en `ResourceNotFoundError`, que la capa HTTP representa mediante el estado 404.

### Justificación y alcance

El patrón proporciona un punto de acceso a la instancia compartida durante la ejecución del prototipo. La referencia global permite conservarla entre reevaluaciones de módulos que comparten ese contexto. La dependencia concreta queda localizada en infraestructura y composición; los casos de uso reciben la interfaz del repositorio.

La unicidad se limita al contexto de ejecución: no sincroniza procesos, workers, servidores ni instancias serverless. Tampoco proporciona persistencia; al reiniciar se pierden las publicaciones y se cargan nuevamente los ejemplos iniciales. La continuidad ante recargas depende de que se mantenga el mismo contexto global.

La inyección de una instancia compartida también permitiría resolver la consistencia entre consumidores. Singleton es la alternativa elegida para gestionar el acceso al almacén temporal; un almacenamiento durable puede incorporarse implementando `ResourceRepository` y modificando la raíz de composición.

## 6. Aplicación de SOLID

| Principio | Aplicación en Reutiliza | Alcance y consideraciones |
| --- | --- | --- |
| Responsabilidad única (SRP) | Casos de uso por operación; separación entre entidades, HTTP, DTO e infraestructura | El repositorio incorpora la carga inicial de ejemplos como parte de su inicialización |
| Abierto/cerrado (OCP) | Nuevos creadores y productos extienden las modalidades sin modificar el algoritmo común | El registro, los tipos y la interfaz requieren la extensión correspondiente |
| Sustitución de Liskov (LSP) | Los productos exponen el contrato de `Resource`, incluido `modalityDetails()`; los creadores devuelven productos compatibles | Las especializaciones deben conservar ese contrato; las pruebas cubren las tres modalidades actuales |
| Segregación de interfaces (ISP) | `ResourceRepository` concentra cuatro operaciones de almacenamiento | Cada caso de uso utiliza un subconjunto; una evolución con consumidores distintos puede requerir contratos más específicos |
| Inversión de dependencias (DIP) | Los casos de uso reciben `ResourceRepository` por constructor | La composición conoce la implementación concreta; la selección de creadores se realiza mediante una función del dominio |

## 7. Diagramas de clases

Los [diagramas UML](uml/README.md) representan los creadores, productos, repositorio, contrato y consumidores del módulo. Las fuentes editables y sus exportaciones SVG se incluyen junto al código.

- [Factory Method](uml/factory-method.svg): jerarquías de creadores y productos, selección y dependencias de creación.
- [Singleton](uml/singleton.svg): operación estática, referencia compartida, realización del contrato e inyección en los casos de uso.

## 8. Validación y limitaciones

El [registro de pruebas](verificacion.md) documenta 42 pruebas de dominio y aplicación, 47 comprobaciones HTTP y una compilación de producción completada con Webpack. Incluye validaciones de las tres modalidades, actualización parcial, errores, conservación de identidad y acceso compartido al repositorio.

La evidencia disponible cubre reglas y API; no incluye pruebas de interfaz en navegador, accesibilidad o comportamiento entre múltiples procesos. La ausencia de persistencia durable, autenticación y control de propiedad limita el alcance de la aplicación a un prototipo académico.
