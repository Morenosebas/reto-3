"use client";

import type { ComponentProps } from "react";

/**
 * Select que envía su formulario al cambiar. Sin JavaScript sigue siendo un
 * select normal y el botón "Buscar" del formulario hace el envío.
 */
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(event) => event.currentTarget.form?.requestSubmit()} />;
}
