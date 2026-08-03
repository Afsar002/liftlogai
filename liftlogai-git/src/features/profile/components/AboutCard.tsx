import {
  FiCode,
  FiCpu,
  FiDatabase,
  FiHeart,
  FiInfo,
} from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import ListRow from "../../../shared/components/ui/ListRow";
import SectionTitle from "../../../shared/components/ui/SectionTitle";

export default function AboutCard() {
  return (
    <Card>
      <SectionTitle

      title="About LiftLog AI"
      action={<FiInfo size={20}/>}
      />

      <div className="space-y-2">
        <ListRow
          icon={<FiInfo size={18} />}
          title="Version"
          value="1.0.0"
        />

        <ListRow
          icon={<FiCode size={18} />}
          title="Framework"
          value="React 19"
        />

        <ListRow
          icon={<FiCpu size={18} />}
          title="Language"
          value="TypeScript"
        />

        <ListRow
          icon={<FiDatabase size={18} />}
          title="Database"
          value="Dexie.js"
        />

        <ListRow
          icon={<FiHeart size={18} />}
          title="Made With"
          value="❤️ by Afsar"
        />
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          LiftLog AI helps you build stronger habits,
          track workouts and stay consistent.
        </p>
      </div>
    </Card>
  );
}