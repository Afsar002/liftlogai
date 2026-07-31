import TemplateCard from "./TemplateCard";
import type { WorkoutTemplateDB } from "../../../database/types";

interface Props {
  templates: WorkoutTemplateDB[];

  onStart: (template: WorkoutTemplateDB) => void;
  onEdit: (template: WorkoutTemplateDB) => void;
  onDuplicate: (template: WorkoutTemplateDB) => void;
  onDelete: (template: WorkoutTemplateDB) => void;
}

export default function TemplateList({
  templates,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <div className="space-y-5">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onStart={() => onStart(template)}
          onEdit={() => onEdit(template)}
          onDuplicate={() => onDuplicate(template)}
          onDelete={() => onDelete(template)}
        />
      ))}
    </div>
  );
}