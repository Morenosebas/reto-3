# Justificación de patrones creacionales

## Contexto del proyecto

**Reutiliza** es una plataforma donde las personas publican objetos que ya no usan para que otros puedan aprovecharlos. Un objeto se puede publicar de tres formas distintas: como **donación** (se regala), como **intercambio** (se cambia por otra cosa) o como **venta solidaria** (se vende a precio bajo). A estas formas las llamamos _modalidades_.

Construir este sistema planteó dos problemas concretos que los patrones creacionales resuelven bien.

---

## Patrón 1 — Factory Method

### El problema

Cuando alguien publica un recurso, la aplicación necesita crear el objeto correcto según la modalidad elegida. El problema es que cada modalidad tiene reglas distintas:

- Una **donación** no necesita precio ni cosa a cambio.
- Un **intercambio** exige que el usuario indique qué quiere recibir.
- Una **venta** exige un precio mayor a cero y que no supere los $500.000 COP.

Sin un patrón, el código de creación terminaría lleno de condicionales (`if modality === "donation"`, `else if modality === "exchange"`…). Eso se vuelve frágil: si mañana se agrega una nueva modalidad hay que modificar ese bloque de condiciones, arriesgando romper lo que ya funciona.

### La solución

El patrón **Factory Method** separa _la decisión de qué crear_ del _algoritmo de cómo crearlo_.

Se define una clase base `ResourceCreator` con el método `create()`, que maneja todo lo que es común a cualquier recurso (validar título, descripción, categoría, ubicación). Luego, cada modalidad tiene su propio creador que extiende esa clase y solo se ocupa de lo que le corresponde:

- `DonationResourceCreator` construye un `DonationResource` sin campos extra.
- `ExchangeResourceCreator` valida que exista "qué busco a cambio" y construye un `ExchangeResource`.
- `SaleResourceCreator` valida el precio y construye un `SaleResource`.

Agregar una nueva modalidad en el futuro significa escribir un nuevo creador, sin tocar ninguno de los existentes. Eso reduce el riesgo de introducir errores.

### Por qué encaja aquí

La plataforma tiene exactamente el escenario para el que fue diseñado este patrón: un proceso de construcción compartido (validaciones comunes) con variaciones según el tipo de objeto a crear. El código queda ordenado, cada creador tiene una única responsabilidad y el sistema es fácil de extender.

---

## Patrón 2 — Singleton

### El problema

La aplicación guarda los recursos en memoria (un `Map` dentro del repositorio). En Next.js, cada llamada a la API podría ejecutarse en un contexto distinto y, con la recarga automática de código en modo desarrollo, los módulos se vuelven a evaluar con frecuencia.

Si cada petición creara su propia instancia del repositorio, el `Map` empezaría vacío en cada llamada. Eso significaría que un recurso guardado con `POST /api/resources` sería invisible para el siguiente `GET /api/resources`, porque cada uno estaría mirando su propio almacén independiente.

### La solución

El patrón **Singleton** garantiza que exista una única instancia del repositorio en todo el proceso. Se logra con tres reglas:

1. El constructor es **privado**: nadie puede hacer `new InMemoryResourceRepository()` desde afuera.
2. Existe un método estático `getInstance()` que es la única puerta de entrada.
3. La instancia se guarda en `globalThis` (el objeto global del proceso) para que sobreviva las recargas de módulos propias del entorno de desarrollo de Next.js.

Así, sin importar cuántas peticiones lleguen simultáneamente ni cuántas veces se recargue el código, todas comparten exactamente el mismo almacén de datos.

### Por qué encaja aquí

Un repositorio de datos es un recurso que debe ser compartido y consistente. Tener múltiples instancias no tiene sentido: generaría datos duplicados, inconsistentes o simplemente invisibles entre peticiones. El Singleton resuelve exactamente eso, y además la implementación con `globalThis` es la forma recomendada para este problema específico en aplicaciones Next.js con almacenamiento en memoria.
