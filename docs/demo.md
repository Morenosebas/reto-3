# Guion de sustentación de Reutiliza

**Duración prevista: 12 minutos.**

La exposición presenta el dominio, demuestra el CRUD y explica la aplicación de Factory Method y Singleton mediante los diagramas de clases y el código. El informe técnico se encuentra en [Actividad 4](actividad-4.md); este documento organiza exclusivamente la sustentación.

## Preparación del entorno

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
npm run start
```

La aplicación se abre en `http://localhost:3000`. Con el servidor activo, `npm run test:http` permite ejecutar las pruebas de integración. Los diagramas están disponibles en [Factory Method](uml/factory-method.svg) y [Singleton](uml/singleton.svg).

Durante el recorrido CRUD se utiliza una única instancia del servidor. Su reinicio elimina los datos de la sesión y restaura las publicaciones de ejemplo.

## Secuencia de exposición

| Tiempo | Contenido | Recurso de apoyo |
| --- | --- | --- |
| 0:00–1:00 | Problema de reutilización y modalidades de entrega | Descripción del proyecto |
| 1:00–3:30 | Publicar una donación, consultar el catálogo, editar título y estado, y eliminar; presentar intercambio y venta | Interfaz y API |
| 3:30–5:00 | Validación de contraprestación y precio; rechazo de fracciones, booleanos, arrays y cuerpos JSON inválidos | Suites de pruebas y reglas del dominio |
| 5:00–7:00 | Factory Method: creador abstracto, método protegido, creadores concretos, productos y clientes | UML, `ResourceCreator.ts`, `SaleResourceCreator.ts`, `UpdateResource.ts` |
| 7:00–8:30 | Singleton: constructor privado, operación estática, almacén e inyección | UML, `InMemoryResourceRepository.ts`, `resourceModule.ts` |
| 8:30–10:30 | Flujo entre capas y aplicación de SOLID | Informe técnico y estructura del módulo |
| 10:30–12:00 | Resultados de pruebas, límites de persistencia y alcance de la solución; preguntas | Registro de pruebas |

## Escenarios de demostración

| Modalidad | Datos | Resultado esperado |
| --- | --- | --- |
| Donación | “Mesa de estudio”, descripción de al menos diez caracteres, categoría muebles, ubicación “Medellín” | Publicación sin precio ni contraprestación |
| Intercambio | “Libros de cálculo”, contraprestación “Libros de programación” | Publicación con el dato `wantedInReturn` |
| Venta solidaria | “Retazos de madera”, precio 15000 COP | Publicación con precio válido |
| Venta fuera del rango | Precio 500001 COP | Rechazo de la publicación |
| Venta en el límite | Precio 500000 COP | Publicación aceptada |

Las categorías de estos ejemplos corresponden a `furniture`, `books` y `materials` en la API. El formulario muestra sus etiquetas en español.

La consulta de un recurso desde peticiones sucesivas ilustra el acceso al mismo almacén del servidor. El reinicio del proceso permite explicar la pérdida de datos propia de la persistencia en memoria. Estas observaciones se circunscriben a una instancia de ejecución.

## Distribución de contenidos

Para un equipo de tres integrantes, la exposición puede distribuirse en dominio y CRUD; Factory Method y UML; y Singleton, SOLID y pruebas. El recorrido mantiene la relación entre problema, decisión de diseño, implementación y resultado para cada patrón.
