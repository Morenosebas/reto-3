import type { ResourceCategory } from "@/modules/resources/domain/ResourceAttributes";

/**
 * Imagen representativa por categoría.
 * Usa imágenes de Unsplash (licencia libre, sin clave de API).
 * El parámetro ?fit=crop&w=400&h=240&q=80 las recorta al tamaño de la tarjeta.
 */
export const CATEGORY_IMAGES: Record<ResourceCategory, { src: string; alt: string }> = {
  electronics: {
    src: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?fit=crop&w=400&h=240&q=80",
    alt: "Electrónica",
  },
  furniture: {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fit=crop&w=400&h=240&q=80",
    alt: "Muebles",
  },
  clothing: {
    src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?fit=crop&w=400&h=240&q=80",
    alt: "Ropa",
  },
  books: {
    src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?fit=crop&w=400&h=240&q=80",
    alt: "Libros",
  },
  home: {
    src: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?fit=crop&w=400&h=240&q=80",
    alt: "Hogar",
  },
  materials: {
    src: "https://images.unsplash.com/photo-1504148455328-c376907d081c?fit=crop&w=400&h=240&q=80",
    alt: "Materiales",
  },
  other: {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=400&h=240&q=80",
    alt: "Otros",
  },
};
