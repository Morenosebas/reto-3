"use client";

import type { MouseEvent, ReactNode } from "react";
import { whatsappLinks } from "@/modules/resources/presentation/contact";

interface WhatsAppLinkProps {
  phone: string;
  text: string;
  className?: string;
  children: ReactNode;
}

/**
 * Abre la conversación de WhatsApp con el número guardado.
 *
 * El enlace es wa.me, que en el celular abre la app directo en el chat y
 * funciona aunque no cargue JavaScript. En el computador, wa.me muestra una
 * página intermedia; por eso un clic normal abre WhatsApp Web ya en la
 * conversación. Ctrl o clic central conservan el comportamiento del enlace.
 */
export function WhatsAppLink({ phone, text, className, children }: WhatsAppLinkProps) {
  const links = whatsappLinks(phone, text);

  function openConversation(event: MouseEvent<HTMLAnchorElement>) {
    const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modified || isPhone()) return;
    event.preventDefault();
    window.open(links.web, "_blank", "noopener,noreferrer");
  }

  return (
    <a
      href={links.app}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openConversation}
      className={className}
    >
      {children}
    </a>
  );
}

function isPhone(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}
