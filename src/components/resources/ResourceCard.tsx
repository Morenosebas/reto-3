"use client";

import type { ToastMessage } from "@/components/shared/Toast";
import type { CatalogEntry } from "@/modules/resources/presentation/ResourceDTO";
import { ContactButton } from "./ContactButton";
import { OwnerActions } from "./OwnerActions";
import { ResourceTag } from "./ResourceTag";

interface ResourceCardProps {
  resource: CatalogEntry;
  isEditing: boolean;
  justSaved: boolean;
  onEdit: () => void;
  onNotify: (message: string, tone: ToastMessage["tone"]) => void;
  onAnimationEnd: () => void;
}

export function ResourceCard({
  resource,
  isEditing,
  justSaved,
  onEdit,
  onNotify,
  onAnimationEnd,
}: ResourceCardProps) {
  return (
    <div
      onAnimationEnd={onAnimationEnd}
      className={`mb-6 break-inside-avoid transition-[filter,translate] duration-200 ${
        justSaved ? "hang-in" : ""
      } ${isEditing ? "-translate-y-1 drop-shadow-[5px_5px_0_var(--ink)]" : ""}`}
    >
      <ResourceTag resource={resource} href={`/recursos/${resource.id}`}>
        {resource.canManage ? (
          <OwnerActions
            resource={resource}
            isEditing={isEditing}
            onEdit={onEdit}
            onNotify={onNotify}
          />
        ) : (
          <ContactButton resource={resource} />
        )}
      </ResourceTag>
    </div>
  );
}
