import { open } from "@tauri-apps/plugin-dialog";
import { useKeymapStore } from "./../hooks/store";
import "./EmptyLayer.css";

export default function EmptyLayer() {
  const { addKeymapLayers } = useKeymapStore();

  const addLayer = async () => {
    const selected = await open({
      multiple: true,
      directory: false,
      filters: [{ name: "SVG Images", extensions: ["svg"] }],
    });
    if (selected) {
      const files = Array.isArray(selected) ? selected : [selected];
      await addKeymapLayers(files);
    }
  };
  return (
    <div className="empty-layer">
      <p>No keymaps added yet.</p>
      <button className="empty-add-button" onClick={addLayer}>
        Add Keymaps
      </button>
    </div>
  );
}
