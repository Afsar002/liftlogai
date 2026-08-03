import { db } from "../../../database/db";

export class ProfileRepository {
  static async getTemplates() {
    return db.templates.toArray();
  }
}