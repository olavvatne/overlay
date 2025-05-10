import { useEffect, useState } from "preact/hooks";
import { listen } from "@tauri-apps/api/event";
import "./drop.css";
import { useKeymapStore } from "./store";

export function useKeymapDrop() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropKey, setDropKey] = useState(0);
  const { addKeymapLayers } = useKeymapStore();
  useEffect(() => {
    const enterHandler = listen("tauri://drag-enter", () => {
      setIsDragOver(true);
    });
    const leaveHandler = listen("tauri://drag-leave", () => {
      setIsDragOver(false);
    });
    const dropHandler = listen("tauri://drag-drop", async (e) => {
      if (e.payload?.paths) {
        await addKeymapLayers(e.payload.paths);
      }
      setIsDragOver(false);
      setDropKey(dropKey + 1);
    });
    return async () => {
      const enterUnlisten = await enterHandler;
      const leaveUnlisten = await leaveHandler;
      const dropUnlisten = await dropHandler;
      dropUnlisten();
      enterUnlisten();
      leaveUnlisten();
    };
  }, [dropKey]);

  const className = isDragOver ? "drag-over-zone" : "";
  return { className, dropKey: `drop-${dropKey}` };
}
