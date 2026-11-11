# Guion de demostración de patrones estructurales

**Equipo:** Daniel Parra · Johan Sebastián González · Sebastián Vargas

La demostración relaciona tres problemas de Reutiliza con **Facade**, **Proxy** y **Adapter**, sus participantes UML y el código que los implementa. El [informe de patrones estructurales](patrones-estructurales.md) contiene la justificación, la investigación del framework y SOLID. Este guion no establece una duración obligatoria ni un reparto individual.

## Preparación

Usar la versión que contiene los patrones estructurales, no una versión anterior de la entrega creacional.

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
npm run start
```

Abrir `http://localhost:3000`. Para comprobar la API, ejecutar `npm run test:http` en otra terminal. Los resultados y sus límites están en el [registro de pruebas](verificacion.md).

Usar un solo servidor con almacenamiento en archivos, sin `RESOURCE_STORAGE=memory`, y la misma carpeta `.data/` antes y después del reinicio. Disponer de una segunda sesión de navegador privada para demostrar la ausencia de permiso. No borrar las cookies de la sesión que publica durante la prueba.

## Recorrido

| Paso | Demostración | Relación con el diseño |
| --- | --- | --- |
| 1. Problemas | Explicar la coordinación repetida del CRUD, la modificación de publicaciones ajenas y la pérdida de datos al reiniciar | Tres problemas y justificación de patrones |
| 2. Facade | Publicar “Mesa de estudio”, con descripción válida, categoría muebles, ubicación Medellín y un número de demostración de formato válido; consultar, buscar y editar | `CommunityCatalog` coordina casos de uso mediante `ResourceCatalog`; los puntos de entrada no orquestan el subsistema |
| 3. Proxy | Mostrar que el navegador que publicó puede editar; abrir el enlace del recurso en una sesión privada y comprobar que no ofrece gestión. La suite HTTP comprueba también el rechazo 403 a edición y eliminación por otro visitante | `OwnerProtectedCatalog`, `ResourceCatalog`, `PublisherRegistry` y `CommunityCatalog` |
| 4. Adapter | Conservar el enlace, detener el servidor y volver a iniciarlo con la misma carpeta de datos. Volver a consultar la publicación | `UnstorageResourceRepository` adapta `Storage` al contrato `ResourceRepository`; fechas y entidades se reconstruyen desde JSON |
| 5. UML y código | Mostrar cada diagrama y localizar sus clases, contratos y raíz de composición | [Facade](uml/facade.svg), [Proxy](uml/proxy.svg), [Adapter](uml/adapter.svg) y [diagrama integrado](uml/patrones-estructurales.svg) |
| 6. Framework y SOLID | Explicar DAL con `server-only`, cookies, Server Actions y revalidación; relacionar cada mecanismo con el código | Informe, secciones 4.2 y 4.3 |
| 7. Evidencia y límites | Mostrar los resultados realmente ejecutados, diferenciar historial de ejecución actual y retirar la publicación de demostración | Registro de pruebas y alcance del prototipo |

## Archivos para mostrar

- `src/modules/resources/catalog/CommunityCatalog.ts`: fachada y coordinación.
- `src/modules/resources/catalog/OwnerProtectedCatalog.ts`: autorización antes de editar o retirar.
- `src/modules/resources/catalog/ResourceCatalog.ts` y `PublisherRegistry.ts`: contratos.
- `src/modules/resources/infrastructure/UnstorageResourceRepository.ts`: adaptación de entidades y JSON; `toRecord` y `toResource` son funciones del módulo.
- `src/modules/resources/resourceModule.ts` y `catalog/catalogAccess.ts`: composición, selección del repositorio e identidad del visitante.
- `tests/structural-patterns.test.ts`: evidencia automatizada de los patrones.

## Límites que deben explicarse

La cookie identifica un navegador, no una cuenta personal. Borrarla implica perder la capacidad de gestionar publicaciones propias. La persistencia en archivos se limita a un servidor; no se presenta como solución distribuida. El modo en memoria y los patrones creacionales se conservan como antecedente, pero no son el foco de esta entrega. No se deben atribuir al profesor los tiempos ni las decisiones de organización de este guion.
