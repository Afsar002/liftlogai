import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../../../shared/components/layout/Layout";
import TemplateEditor from "../components/TemplateEditor";

import { TemplateRepository } from "../services/TemplateRepository";

import type { WorkoutTemplateDB } from "../../../database/types";

export default function EditTemplatePage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [template, setTemplate] =
    useState<WorkoutTemplateDB | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;

      const data =
        await TemplateRepository.getById(Number(id));

      if (!data) {
        toast.error("Template not found");

        navigate("/templates");

        return;
      }

      setTemplate(data);

      setLoading(false);
    }

    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-zinc-400">
          Loading template...
        </div>
      </Layout>
    );
  }

  if (!template) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl p-4">
        <TemplateEditor
          template={template}
        />
      </div>
    </Layout>
  );
}