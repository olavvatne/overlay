import { useState, useEffect, useCallback } from "preact/hooks";
import { useKeymapStore } from "../hooks/store";
import { ShortcutInput } from ".";
import { debounce } from "../utils/debounce";

export default function OverlayToggleInput() {
  const [shortcut, setShortcut] = useState("");
  const { settingsStore } = useKeymapStore();

  const debounceToggle = useCallback(
    debounce(async (toggle) => {
      await settingsStore.set("keymap-toggle", toggle);
    }, 600),
    []
  );
  const handleShortcutChange = async (combo) => {
    setShortcut(combo);
    debounceToggle(combo);
  };

  useEffect(async () => {
    const overlayToggle = await settingsStore.get("keymap-toggle");
    setShortcut(overlayToggle);
  }, []);

  return <ShortcutInput value={shortcut} onInput={handleShortcutChange} />;
}
