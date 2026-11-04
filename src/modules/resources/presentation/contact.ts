import { COLOMBIA_DIAL_CODE } from "../domain/contactPhone";

/** "3001234567" → "+57 300 123 4567" */
export function formatContactPhone(phone: string): string {
  return `+${COLOMBIA_DIAL_CODE} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}

/** Mensaje con el que quien visita pide el objeto. */
export function requestMessage(title: string): string {
  return `Hola, vi tu publicación «${title}» en Reutiliza. ¿Sigue disponible?`;
}

export interface WhatsAppLinks {
  /** wa.me: en el celular abre la app directo en la conversación. */
  app: string;
  /** WhatsApp Web: en el computador abre la conversación sin la página intermedia de wa.me. */
  web: string;
}

/** Enlaces a la conversación con el número guardado (+57) y el mensaje ya escrito. */
export function whatsappLinks(phone: string, text: string): WhatsAppLinks {
  const number = `${COLOMBIA_DIAL_CODE}${phone}`;
  const encodedText = encodeURIComponent(text);
  return {
    app: `https://wa.me/${number}?text=${encodedText}`,
    web: `https://web.whatsapp.com/send?phone=${number}&text=${encodedText}`,
  };
}
