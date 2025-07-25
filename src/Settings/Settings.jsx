import { useState } from "preact/hooks";
import LayerList from "./LayerList";
import "./Settings.css";
import LayerDetails from "./LayerDetails";
import { useKeymapDrop } from "./hooks/drop";
import { Details, Sidebar, Titlebar } from "./components";
import GeneralDetails from "./GeneralDetails";
import EmptyLayer from "./components/EmptyLayer";
import { platform } from "@tauri-apps/plugin-os";

function getDetails(selected) {
  if (selected === "general") {
    return <GeneralDetails />;
  } else if (!selected) {
    return <EmptyLayer />;
  } else {
    return <LayerDetails selectedId={selected} />;
  }
}
const currentPlatform = platform();

function Settings() {
  const [selectedId, setSelectedId] = useState("general");
  const { className, dropKey } = useKeymapDrop();
  return (
    <main className={`platform-${currentPlatform} ${className}`} key={dropKey}>
      <Titlebar />
      <Sidebar>
        <Sidebar.General
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
        <Sidebar.Separator />
        <LayerList selectedId={selectedId} setSelectedId={setSelectedId} />
      </Sidebar>
      <Details>{getDetails(selectedId)}</Details>
    </main>
  );
}

export default Settings;
