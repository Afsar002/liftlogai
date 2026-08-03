import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";
import TemplateEditor from "../components/TemplateEditor";

import { TemplateRepository } from "../services/TemplateRepository";

import type { WorkoutTemplateDB } from "../../../database/types";

export default function EditTemplatePage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [template, setTemplate] = useState<WorkoutTemplateDB | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;

      const data = await TemplateRepository.getById(Number(id));

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
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-56" />
          <Skeleton variant="card" className="h-44" />
          <Skeleton variant="card" className="h-44" />
          <Skeleton variant="card" className="h-44" />
        </div>
      </Layout>
    );
  }

  if (!template) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <TemplateEditor template={template} />
      </div>
    </Layout>
  );
}
