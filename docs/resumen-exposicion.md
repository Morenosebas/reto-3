# Reutiliza — Resumen para exposición

## ¿Qué es el proyecto?

Plataforma web para publicar objetos que ya no se usan: donarlos, intercambiarlos o venderlos a precio solidario. Construida con Next.js y TypeScript.

---

## Patrón Proxy — "Controla quién puede modificar"

**El problema:** cualquiera podía editar o borrar la publicación de otra persona.

**La clase:** `OwnerProtectedCatalog` — se pone entre el usuario y el catálogo real. Tiene la misma interfaz, así que el sistema no nota la diferencia.

**Cómo funciona en el código:**
```ts
async edit(id: string, changes: unknown) {
  await this.assertIsPublisher(id);  // primero verifica
  return { ...(await this.catalog.edit(id, changes)), canManage: true };
}
```
Primero verifica la propiedad. Si no es el dueño, responde con error 403. Solo después deja pasar la edición.

**Identidad anónima:** una cookie en el navegador identifica al publicante. No hace falta registrarse.

---

## Patrón Adapter — "Conserva los datos aunque se reinicie el servidor"

**El problema:** todo vivía en memoria y se perdía al reiniciar.

**La clase:** `UnstorageResourceRepository` — traduce entre lo que el dominio entiende (objetos `Resource` con subclases y fechas) y lo que el sistema de archivos entiende (JSON plano con texto).

**Cómo funciona en el código:**
```ts
async save(resource: Resource): Promise<void> {
  await this.storage.setItem(keyOf(resource.id), toRecord(resource));
}
```
`save` convierte el objeto del dominio a JSON y lo guarda en disco. Al leerlo, lo reconstruye con la fábrica del dominio.

**Resultado:** los datos persisten en archivos. Cambiar a otra base de datos solo requiere cambiar el driver, sin tocar el resto del sistema.

---

## Frase para cerrar

> El Proxy protege quién puede actuar. El Adapter protege que los datos no se pierdan. Ninguno de los dos modifica las reglas del negocio — solo organizan cómo se accede y cómo se guarda.

---

## Explicación detallada — Identidad anónima

Cuando alguien publica un recurso por primera vez, el sistema genera un código aleatorio (como un número de ticket) y lo guarda en una cookie del navegador. No hay registro, no hay contraseña.

La próxima vez que esa persona entra, el navegador envía esa cookie automáticamente y el sistema la reconoce como el dueño de sus publicaciones.

En el servidor nunca se guarda el código tal cual. Se guarda una "huella" (SHA-256), que es una versión cifrada que no se puede revertir. Así, aunque alguien accediera al almacén, no podría robar la identidad de nadie.

**La limitación:** si borras las cookies o usas otro navegador, pierdes acceso a tus publicaciones. No hay forma de recuperarlas porque no hay cuenta. El sistema identifica al navegador, no a la persona.

---

## Explicación detallada — Diagrama del Proxy

El diagrama muestra cuatro piezas:

- `OwnerProtectedCatalog` es el Proxy. Tiene tres cosas adentro: el catálogo real, el registro de publicantes y el id del visitante actual.
- Cuando llega una petición de editar o borrar, primero le pregunta a `PublisherRegistry`: ¿quién publicó este recurso? Si no coincide con el visitante, bloquea con error 403.
- Si sí coincide, delega al `CommunityCatalog` (el catálogo real, la Facade).
- Tanto el Proxy como la Facade implementan la misma interfaz `ResourceCatalog`, por eso quien los usa no distingue entre uno y otro.

```
OwnerProtectedCatalog  →  PublisherRegistry (consulta propietario)
        ↓ delega
  ResourceCatalog (interfaz)
        ↑ implementa
  CommunityCatalog (catálogo real)
```

---

## Explicación detallada — Diagrama del Adapter

El diagrama muestra tres niveles:

- Los casos de uso solo conocen la interfaz `ResourceRepository` con cuatro operaciones: `findAll`, `findById`, `save`, `delete`.
- `UnstorageResourceRepository` es el Adapter: implementa esa interfaz por arriba y habla con `Storage` de unstorage por abajo, que tiene una API completamente diferente: `getKeys`, `getItem`, `setItem`, `hasItem`, `removeItem`.
- El Adapter hace la traducción entre los dos mundos. Los casos de uso nunca saben que hay un sistema de archivos detrás.

```
Casos de uso → ResourceRepository (interfaz)
                      ↑ implementa
         UnstorageResourceRepository (Adapter)
                      ↓ adapta
                   Storage (unstorage)
              getKeys · getItem · setItem · hasItem · removeItem
```

---

## Frase para cerrar la exposición

> El Proxy decide quién puede hacer algo. El Adapter decide cómo se guarda. Los dos son intermediarios invisibles — el resto del sistema no los nota.
