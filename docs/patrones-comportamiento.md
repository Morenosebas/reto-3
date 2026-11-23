# Reutiliza: patrones de comportamiento

**PADISOFT · Patrones de comportamiento**

**Integrantes:** Daniel Parra · Johan Sebastián González · Sebastián Vargas

## 1. Contexto

Reutiliza es una plataforma para publicar objetos en donación, intercambio o venta solidaria. En entregas anteriores se aplicaron patrones creacionales (Factory Method, Singleton) y estructurales (Facade, Proxy, Adapter).

Esta entrega aborda dos problemas de comportamiento en tiempo de ejecución: el ciclo de vida del estado de una publicación y la variación de textos según la modalidad.

---

## Parte A. Problemas y justificación

### Problema 1: el estado de la publicación decide qué se puede hacer → State

**Situación.** Cada recurso tiene un estado (`available`, `reserved`, `delivered`). Ese valor condiciona el contacto por WhatsApp, el aviso al visitante y los cambios de estado que puede hacer quien publicó. Antes, esas reglas estaban repartidas en `if` y `switch` en la interfaz y en el caso de uso de actualización.

**Consecuencia.** Agregar o restringir una transición obligaba a revisar varios archivos. Era fácil dejar botones que permitían un salto inválido (por ejemplo, de entregado a reservado) o mostrar el botón de WhatsApp cuando el objeto ya no estaba disponible.

**Patrón.** State encapsula el comportamiento que cambia según el estado interno. `PublicationStatus` actúa como contexto y delega en `AvailableListing`, `ReservedListing` y `DeliveredListing`, que implementan `ListingLifecycle`.

**Por qué resuelve el problema.**

- Cada estado conoce sus propias reglas de contacto y de transición.
- `UpdateResource` valida el cambio con `transitionTo` antes de persistir.
- La interfaz solo ofrece los estados permitidos (`allowedMoves`).
- Abrir o cerrar una transición se hace en una clase, sin tocar el resto del flujo.

### Problema 2: donación, intercambio y venta hablan distinto → Strategy

**Situación.** El mensaje de WhatsApp, el texto de “cómo se entrega” y el valor destacado en la etiqueta dependen de la modalidad. Eso se resolvía con `switch (modality)` en componentes de presentación.

**Consecuencia.** Cualquier ajuste al tono del mensaje o a la etiqueta obligaba a modificar varios puntos. El Factory Method ya construye el producto correcto; no define cómo se comunica ese producto al visitante.

**Patrón.** Strategy define una familia de algoritmos intercambiables. `ModalityOutreach` es la interfaz; `DonationOutreach`, `ExchangeOutreach` y `SaleOutreach` son las estrategias. `outreachFor(modality)` selecciona la estrategia en tiempo de ejecución.

**Por qué resuelve el problema.**

- Cada modalidad concentra su redacción en una clase.
- Contacto, detalle y etiqueta usan la misma estrategia.
- Agregar una modalidad nueva implica una estrategia nueva, sin reabrir los `switch` de la UI.
- No se confunde con Factory Method: uno crea el recurso; el otro varía el algoritmo de presentación.

---

## Parte B. Diagramas UML y participantes

Los diagramas editables están en Draw.io:

| Patrón | Archivo |
| --- | --- |
| State | [uml-state.drawio](uml-state.drawio) |
| Strategy | [uml-strategy.drawio](uml-strategy.drawio) |

### Correspondencia — State

| Participante GoF | Clase en Reutiliza |
| --- | --- |
| Context | `PublicationStatus` |
| State | `ListingLifecycle` |
| ConcreteState | `AvailableListing`, `ReservedListing`, `DeliveredListing` |
| Cliente | `UpdateResource`, `ContactButton`, `OwnerActions` |

### Correspondencia — Strategy

| Participante GoF | Clase en Reutiliza |
| --- | --- |
| Strategy | `ModalityOutreach` |
| ConcreteStrategy | `DonationOutreach`, `ExchangeOutreach`, `SaleOutreach` |
| Context / selector | `outreachFor` |
| Cliente | `ContactButton`, `ResourceTag`, página de detalle |

---

## Parte C. Implementación

### State

```
src/modules/resources/domain/lifecycle/
  ListingLifecycle.ts
  AvailableListing.ts
  ReservedListing.ts
  DeliveredListing.ts
  PublicationStatus.ts
```

Transiciones permitidas:

- disponible → reservado, entregado
- reservado → disponible, entregado
- entregado → disponible

### Strategy

```
src/modules/resources/presentation/outreach/
  ModalityOutreach.ts
  DonationOutreach.ts
  ExchangeOutreach.ts
  SaleOutreach.ts
  index.ts
```

### SOLID

- **S:** cada estado y cada estrategia tienen una responsabilidad.
- **O:** nuevas modalidades o reglas de estado se agregan como clases.
- **L:** los estados concretos respetan el contrato `ListingLifecycle`.
- **I:** interfaces pequeñas (`ListingLifecycle`, `ModalityOutreach`).
- **D:** los clientes dependen de abstracciones; `UpdateResource` usa `PublicationStatus`, no condicionales por estado.

### Pruebas

`tests/behavioral-patterns.test.ts` cubre transiciones, rechazo de saltos inválidos y mensajes por modalidad. Se ejecuta con `npm test`.

---

## Repositorio

https://github.com/Morenosebas/reto-3
