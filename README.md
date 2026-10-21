# Reutiliza · PADISOFT

Reutiliza permite publicar, consultar, editar y eliminar recursos para **donación, intercambio y venta solidaria**. Continúa el Reto 3 como un **monolito modular full-stack**: interfaz React y API Next.js viven en este repositorio. La Actividad 4 documenta exactamente dos patrones creacionales: **Factory Method y Singleton**.

## Ejecutar y verificar

Requisitos: Node.js **20.9 o superior** y npm. La verificación local se realizó con Node 22.17.0. Desde la raíz:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Si Turbopack está limitado por el entorno, Next.js permite compilar con `npm run build -- --webpack`; esta alternativa pasó la verificación local. Ver [resultados y restricciones](docs/verificacion.md).

Para desarrollar: `npm run dev` y abrir `http://localhost:3000`. Para probar la API contra ese servidor: `npm run test:http`. Otro puerto local: `TEST_BASE_URL=http://127.0.0.1:3187 npm run test:http`.

`npm test` compila las pruebas TypeScript a `.test-build/` y ejecuta el runner incorporado de Node, sin añadir dependencias. Cubre dominio, casos de uso, contrato de entrada, repositorio y serialización. `test:http` comprueba rutas HTTP reales; crea y elimina únicamente sus propios recursos de prueba. Ninguno sustituye una prueba de interfaz en navegador.

El proyecto usa Next.js 16.3.6, React 19.2.8, TypeScript, Tailwind CSS 4 y ESLint 9. Las fuentes se resuelven con familias del sistema y fallbacks explícitos: la compilación no descarga Google Fonts. Se conservan colores, tarjetas, distribución y animaciones; la tipografía exacta depende del equipo. Una instalación nueva de dependencias sí requiere red o una caché npm completa.

## API y reglas

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/resources` | Lista ordenada por fecha de creación, 200 |
| POST | `/api/resources` | Crea recurso, 201 |
| GET | `/api/resources/:id` | Consulta recurso, 200 / 404 |
| PATCH | `/api/resources/:id` | Actualización parcial, 200 / 400 / 404 |
| DELETE | `/api/resources/:id` | Elimina recurso, 204 / 404 |

POST y PATCH requieren un objeto JSON: `null`, arrays y primitivas devuelven 400. Un PATCH `{}` conserva los campos y reconstruye el recurso, actualizando `updatedAt`. Los campos omitidos conservan su valor. JSON malformado y validaciones fallidas devuelven 400.

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

- Campos comunes: título de 3–80 caracteres, descripción de 10–500, ubicación de 3–120, categoría válida y estado válido. Se recortan espacios de textos.
- Donación: no tiene precio ni contraprestación; ignora esos datos adicionales.
- Intercambio: `wantedInReturn` de 3–120 caracteres.
- Venta: **pesos enteros entre 1 y 500.000 COP**, como número o texto de dígitos decimales (se permiten espacios exteriores). No se redondean fracciones ni se convierten booleanos, arrays u objetos.
- Estados: `available`, `reserved`, `delivered`. Crear asigna `available` cuando se omite el estado.

## Arquitectura implementada

```text
src/app/page.tsx                         Entrada de la interfaz / carga inicial
src/components/resources/              Formulario, tarjetas y gestión de UI
src/app/api/resources/                  Adaptadores HTTP de colección y recurso
src/modules/resources/
  domain/                              Entidades, contratos, reglas y Factory Method
  application/                         Cinco casos de uso CRUD e interpretación de entrada
  infrastructure/                      Repositorio Singleton en memoria
  presentation/                        DTO, cliente HTTP, etiquetas y formato
  resourceModule.ts                    Raíz de composición e inyección
```

Los casos de uso reciben el contrato `ResourceRepository`; la implementación concreta se selecciona en `resourceModule.ts`. La página carga la lista inicial en servidor; las acciones de la UI usan la API. El dominio no importa React ni Next.js.

## Documentación de Actividad 4

- [Arquitectura, SOLID y justificación de los dos patrones](docs/actividad-4.md).
- [UML editable y exportaciones revisadas](docs/uml/README.md).
- [Guion de demostración de 12 minutos](docs/demo.md).
- [Resultados y límites de la verificación local](docs/verificacion.md).

## Límites del prototipo y entrega

El almacén es un `Map` en memoria compartido dentro del mismo contexto de ejecución mediante `globalThis`. Reiniciar restaura tres ejemplos; no hay base de datos, sincronización entre procesos ni garantía entre workers o instancias serverless. No hay autenticación ni propiedad de publicaciones: esta demo no está preparada para producción pública.

La indicación docente menciona repositorios frontend y backend. Este proyecto contiene ambos componentes en **un solo repositorio**. No se afirma que eso equivalga al requisito de dos repositorios: debe aclararse con el docente antes de la entrega. No se ha dividido el proyecto ni creado un segundo repositorio.

Según los requisitos aportados: exactamente dos patrones, UML coherente, documentación Markdown/PDF, máximo tres integrantes y exposición de 10–15 minutos. La entrega indicada es el enlace en Campus el 21 de octubre a las 20:00 de Colombia. Esta preparación local no constituye una entrega ni publica cambios.
