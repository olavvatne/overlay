import { useState, useEffect, useCallback } from "preact/hooks";
import { useKeymapStore } from "./hooks/store";
import "./LayerDetails.css";
import { ShortcutInput } from "./components";
import { debounce } from "./utils/debounce";

function KeyMapPreview({ selectedId }) {
  const { keymapStore, settingsStore } = useKeymapStore();
  const [svgContent, setSvgContent] = useState("");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [opacity, setOpacity] = useState(1);

  useEffect(async () => {
    const saved = await keymapStore.get(selectedId);
    if (saved) {
      setSvgContent(saved);
    }
    const fillColor = await settingsStore.get("keymap-fill-color");
    if (fillColor) {
      setFillColor(fillColor);
    }
    const textColor = await settingsStore.get("keymap-text-color");
    if (textColor) {
      setTextColor(textColor);
    }
    const opacity = await settingsStore.get("keymap-opacity");
    if (opacity) {
      setOpacity(opacity);
    }
  }, [selectedId]);
  return (
    <div
      style={{
        "--keymap-fill-color": fillColor,
        "--keymap-text-color": textColor,
        "--keymap-opacity": opacity,
      }}
      className="keymap-preview"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

export default function LayerDetails({ selectedId }) {
  const [details, setDetails] = useState(null);
  const [name, setName] = useState("");
  const [shortcut, setShortcut] = useState("");
  const { settingsStore } = useKeymapStore();

  useEffect(async () => {
    const saved = await settingsStore.get("keymap-layers");
    if (Array.isArray(saved)) {
      const index = saved.findIndex((s) => {
        return s.id == selectedId;
      });
      const layer = saved[index];
      setName(layer?.name || "");
      setShortcut(layer?.shortcut || "");
      setDetails(layer);
    }
  }, [selectedId]);

  const debounceSave = useCallback(
    debounce(async (key, value) => {
      const saved = await settingsStore.get("keymap-layers");
      if (Array.isArray(saved)) {
        const index = saved.findIndex((s) => s.id == selectedId);
        if (index !== -1) {
          const updatedLayer = { ...saved[index], [key]: value };
          saved[index] = updatedLayer;
          await settingsStore.set("keymap-layers", saved);
        }
      }
    }, 600),
    [selectedId]
  );
  const handleNameChange = (e) => {
    setName(debounceSave);
    debounceSave("name", e.target.value);
  };
  const handleShortcutChange = (combo) => {
    setShortcut(combo);
    debounceSave("shortcut", combo);
  };

  return (
    details && (
      <>
        <section className="detail-section">
          <label>Name</label>
          <input type="text" value={name} onInput={handleNameChange} />
          <span />
          <label>Shortcut</label>
          <ShortcutInput value={shortcut} onInput={handleShortcutChange} />
        </section>

        <section>
          <KeyMapPreview selectedId={selectedId} />
        </section>
      </>
    )
  );
}
