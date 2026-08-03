import { db } from "../../../database/db";
import { defaultTemplates } from "../../workout/data/defaultTemplates";
import type { WorkoutTemplateDB } from "../../../database/types";

export class TemplateRepository {
  static async getAll() {
    return db.templates.toArray();
  }

  static async seedDefaults() {
    for (const template of defaultTemplates) {
      const existing = await db.templates
        .where("name")
        .equals(template.name)
        .first();

      if (existing) continue;

      await db.templates.add({
        name: template.name,
        exercises: template.exercises,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  static async getById(id: number) {
    return db.templates.get(id);
  }

  static async create(template: WorkoutTemplateDB) {
    return db.templates.add(template);
  }

  static async createBlank(name: string) {
    return db.templates.add({
      name,
      exercises: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  static async update(
    id: number,
    template: WorkoutTemplateDB
  ) {
    return db.templates.update(id, {
      ...template,
      updatedAt: new Date().toISOString(),
    });
  }

  static async delete(id: number) {
    return db.templates.delete(id);
  }

  static async duplicate(id: number) {
    const template = await db.templates.get(id);

    if (!template) return;

    return db.templates.add({
      ...template,
      id: undefined,
      name: `${template.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}