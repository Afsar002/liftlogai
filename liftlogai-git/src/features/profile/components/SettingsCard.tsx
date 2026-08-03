import {
  FiActivity,
  FiBell,
  FiClock,
  FiMoon,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useSettings } from "../../settings/hooks/SettingsProvider";
import Card from "../../../shared/components/ui/Card";
import ListRow from "../../../shared/components/ui/ListRow";
import { useState } from "react";
import SelectDialog from "../../../shared/components/ui/SelectDialog";
import SectionTitle from "../../../shared/components/ui/SectionTitle";





export default function SettingsCard() {
 const {settings,updateWeightUnit,updateTheme,updateRestTimer,updateNotifications}=useSettings();
 const [weightDialogOpen, setWeightDialogOpen] =useState(false);
 const [themeDialogOpen, setThemeDialogOpen] = useState(false);
const [timerDialogOpen, setTimerDialogOpen] = useState(false);



 return (
    <>
    <Card>
      <SectionTitle
title="Settings"
      action={<FiSettings size={20}/>}
/>
      <div className="space-y-2">
        <ListRow
          clickable
          icon={<FiActivity size={18} />}
          title="Weight Unit"
          
          value={settings?.weightUnit.toUpperCase() ?? "KG"}     
          onClick={() => setWeightDialogOpen(true)}
          />      
        <ListRow
          clickable
          icon={<FiClock size={18} />}
          title="Default Rest Timer"
          value={`${settings?.defaultRestTimer ?? 90} sec`}
          onClick={() => setTimerDialogOpen(true)}
        />

        <ListRow
          clickable
          icon={<FiMoon size={18} />}
          title="Theme"
value={settings?.theme ?? "dark"}       
   onClick={() => setThemeDialogOpen(true)}
        />

        <ListRow
          clickable
          icon={<FiBell size={18} />}
          title="Notifications"
value={  settings?.notifications? "On"    : "Off"}
          onClick={() =>updateNotifications!(settings?.notifications??true)}
        />
      </div>
    </Card>
  
<SelectDialog
  open={weightDialogOpen}
  title="Weight Unit"
  selected={settings?.weightUnit ?? "kg"}
  onClose={() => setWeightDialogOpen(false)}
  onSelect={updateWeightUnit}
  options={[
    {
      label: "Kilograms (KG)",
      value: "kg",
    },
    {
      label: "Pounds (LB)",
      value: "lb",
    },
  ]}
/>
      <SelectDialog
  open={themeDialogOpen}
  title="Theme"
  selected={settings?.theme ?? "dark"}
  onClose={() => setThemeDialogOpen(false)}
  onSelect={(value) => updateTheme(value)}
  options={[
    {
      label: "Dark",
      value: "dark",
    },
    {
      label: "Light",
      value: "light",
    },
    {
      label: "System",
      value: "system",
    },
  ]}
/>

<SelectDialog
  open={timerDialogOpen}
  title="Default Rest Timer"
  selected={settings?.defaultRestTimer ?? 90}
  onClose={() => setTimerDialogOpen(false)}
  onSelect={(value) => updateRestTimer(Number(value))}
  options={[
    {
      label: "30 Seconds",
      value: 30,
    },
    {
      label: "45 Seconds",
      value: 45,
    },
    {
      label: "60 Seconds",
      value: 60,
    },
    {
      label: "90 Seconds",
      value: 90,
    },
    {
      label: "120 Seconds",
      value: 120,
    },
  ]}
/>



</>

);
}