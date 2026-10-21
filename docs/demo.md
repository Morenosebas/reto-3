# Guion de demostración · 12 minutos

Objetivo: demostrar CRUD, dos problemas de creación resueltos con Factory Method y Singleton, UML y separación de responsabilidades. Equipo de máximo tres personas. Diapositivas opcionales; priorizar aplicación, diagramas y código.

## Preparación

1. Ejecutar `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`.
2. Iniciar `npm run start` y abrir `http://localhost:3000`. No reiniciar durante la demo: el almacén es temporal.
3. Ejecutar `npm run test:http` contra esa instancia local y comprobar el resultado.
4. Abrir los dos SVG de `docs/uml/` y los archivos de creadores, repositorio y composición.
5. Preparar el enlace del repositorio y documentación. No confundir esta preparación con envío a Campus.

## Secuencia

| Tiempo | Demostración | Evidencia |
| --- | --- | --- |
| 0:00–1:00 | Reutiliza: donar, intercambiar y vender recursos con valor de reutilización | README y alcance del dominio |
| 1:00–3:30 | Crear una donación; verificar lista, editar título/estado y eliminar. Crear intercambio y venta | Interfaz; operaciones CRUD y mensajes |
| 3:30–5:00 | Intercambio sin contraprestación y venta fuera de rango fallan. Mostrar prueba de `0.1`, `true`, arrays y PATCH `null` | `npm test`, `npm run test:http`, reglas en dominio |
| 5:00–7:00 | Factory Method: producto abstracto, tres creadores, método protegido, clientes | UML y `ResourceCreator.ts`, `SaleResourceCreator.ts`, `UpdateResource.ts` |
| 7:00–8:30 | Singleton: constructor privado, acceso estático, Map e inyección | UML y `InMemoryResourceRepository.ts`, `resourceModule.ts` |
| 8:30–10:30 | Recorrer UI → API → aplicación → contrato → infraestructura; ejemplos SOLID y límites de OCP | `docs/actividad-4.md` y código |
| 10:30–12:00 | Resultados de pruebas, pérdida de datos al reiniciar, un runtime, tema de repositorios pendiente y preguntas | `docs/verificacion.md` y README |

Si hay tres integrantes: distribuir dominio/CRUD, Factory Method/UML y Singleton/SOLID/pruebas. Con menos integrantes, mantener el mismo recorrido.

## Datos sugeridos

- Donación: “Mesa de estudio”, descripción de al menos diez caracteres, categoría muebles y ubicación “Medellín”.
- Intercambio: “Libros de cálculo”, contraprestación “Libros de programación”.
- Venta solidaria: “Retazos de madera”, precio 15000 COP. Mostrar máximo 500000 y rechazo de 500001.

Los nombres de categorías en API son `furniture`, `books`, `materials`; el formulario presenta etiquetas en español. Para comprobar memoria, consultar el mismo recurso desde otra petición del mismo servidor. No afirmar que eso demuestra sincronización entre procesos.

## Cierre de entrega

Según los requisitos aportados: enlace en Campus el 21 de octubre a las 20:00 Colombia, exposición 10–15 minutos, máximo tres integrantes y exactamente dos patrones. Antes de enviar, confirmar integrantes, acceso al enlace, documentación incluida y la discrepancia entre el monolito en un repositorio y la indicación docente de dos repositorios. El envío debe hacerlo el responsable autorizado; este trabajo local no lo realiza.
