/**
 * Usuarios de prueba del sistema.
 * En producción real esto sería una base de datos con contraseñas hasheadas.
 * Para este prototipo las contraseñas se comparan en texto plano.
 */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  /** Clave de publicante: se usa como cookie reutiliza_publisher para vincular sus recursos. */
  publisherKey: string;
}

interface StoredUser extends AppUser {
  password: string;
}

const USERS: StoredUser[] = [
  {
    id: "user-001",
    name: "Ana Gómez",
    email: "ana@reutiliza.co",
    password: "Ana1234",
    publisherKey: "publisher-ana-gomez",
  },
  {
    id: "user-002",
    name: "Carlos Martínez",
    email: "carlos@reutiliza.co",
    password: "Carlos1234",
    publisherKey: "publisher-carlos-martinez",
  },
  {
    id: "user-003",
    name: "Laura Pérez",
    email: "laura@reutiliza.co",
    password: "Laura1234",
    publisherKey: "publisher-laura-perez",
  },
  {
    id: "user-004",
    name: "Sebastián Vargas",
    email: "sebastian@reutiliza.co",
    password: "Sebas1234",
    publisherKey: "seed-demo-publisher-key",
  },
  {
    id: "user-005",
    name: "Valentina Torres",
    email: "valentina@reutiliza.co",
    password: "Vale1234",
    publisherKey: "publisher-valentina-torres",
  },
];

/** Valida credenciales y retorna el usuario sin la contraseña, o null si no coincide. */
export function validateCredentials(email: string, password: string): AppUser | null {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

/** Retorna el usuario por id sin la contraseña, o null si no existe. */
export function findUserById(id: string): AppUser | null {
  const user = USERS.find((u) => u.id === id);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

/** Lista todos los usuarios de prueba (sin contraseñas) para mostrar en la página de login. */
export function getDemoUsers(): Omit<AppUser, "publisherKey">[] {
  return USERS.map(({ id, name, email }) => ({ id, name, email }));
}
