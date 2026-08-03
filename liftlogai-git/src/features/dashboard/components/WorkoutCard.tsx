import Card from "../../../shared/components/ui/Card";
import { FiPlayCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useWorkout } from "../../workout/context/WorkoutContext";
import { WorkoutSessionFactory } from "../../workout/services/WorkoutSessionFactory";
import { TemplateRepository } from "../../templates/services/TemplateRepository";

interface WorkoutCardProps {
  workout: string;
}

export default function WorkoutCard({
  workout,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const { session: currentSession, setSession } = useWorkout();

  async function startWorkout() {
    if (currentSession) {
      const confirmStart = window.confirm(
        "An active workout session is already in progress. Start a new workout and discard the current session?"
      );
      if (!confirmStart) return;
    }

    const templates = await TemplateRepository.getAll();

    if (templates.length === 0) {
      toast.error("No workout templates found.");
      navigate("/templates");
      return;
    }

    const template = templates[0];

    const session =
      WorkoutSessionFactory.create(template);

    setSession(session);

    toast.success(`${template.name} started`);

    navigate("/workout");
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 shadow-md hover:shadow-lg transition-all duration-200">
      <div
        className="flex cursor-pointer items-center justify-between p-5"
        onClick={startWorkout}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-100 uppercase tracking-wider">
            Today's Workout
          </p>
          <h2 className="text-2xl font-bold text-white">
            {workout}
          </h2>
        </div>

        <FiPlayCircle
          size={36}
          className="text-white/90"
        />
      </div>
    </Card>
  );
}