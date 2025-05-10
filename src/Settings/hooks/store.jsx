import { readTextFile } from "@tauri-apps/plugin-fs";
import { LazyStore } from "@tauri-apps/plugin-store";
const settingsStore = new LazyStore("settings.json");
const keymapStore = new LazyStore("keymaps.svg");

export function useKeymapStore() {
  const addKeymapLayers = async (files) => {
    const existing = await settingsStore.get("keymap-layers");
    if (!Array.isArray(files)) return existing;
    const newLayers = files.map((filePath) => {
      const id = crypto.randomUUID();
      return {
        id,
        path: filePath,
        name: filePath.split("/").pop(),
        shortcut: "",
      };
    });

    await Promise.all(
      newLayers.map(async (curr) => {
        const content = await readTextFile(curr.path);
        await keymapStore.set(curr.id, content);
      })
    );

    const allNew = [...existing, ...newLayers];
    settingsStore.set("keymap-layers", allNew);
    return allNew;
  };

  return {
    settingsStore,
    keymapStore,
    addKeymapLayers,
  };
}
