import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "preact/hooks";
import { useKeymapStore } from "./hooks/store";

const getListItemClass = (isSelected, isDragOver) => {
  const classes = [];
  if (isSelected) classes.push("selected");
  if (isDragOver) classes.push("drag-over");
  return classes.join(" ");
};

export default function LayerList({ selectedId, setSelectedId }) {
  const [layers, setLayers] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { settingsStore, keymapStore, addKeymapLayers } = useKeymapStore();

  useEffect(() => {
    (async () => {
      const saved = await settingsStore.get("keymap-layers");
      if (Array.isArray(saved)) setLayers(saved);
    })();
  }, []);

  useEffect(() => {
    const changeHandler = settingsStore.onKeyChange("keymap-layers", (nv) => {
      const isSame =
        nv.length === layers.length &&
        nv.every((v, i) => {
          const other = layers[i];
          return v.id === other.id && v.name === other.name;
        });
      if (!isSame) {
        setLayers(nv);
      }
    });
    return async () => {
      const changeUnlisten = await changeHandler;
      changeUnlisten();
    };
  }, [layers]);

  const addLayer = async () => {
    const selected = await open({
      multiple: true,
      directory: false,
      filters: [{ name: "SVG Images", extensions: ["svg"] }],
    });
    if (selected) {
      const files = Array.isArray(selected) ? selected : [selected];
      const newLayers = await addKeymapLayers(files);
      const newSelectedIndex = layers.length;
      setLayers(newLayers);
      setSelectedId(newLayers[newSelectedIndex].id);
    }
  };

  const removeLayer = () => {
    if (layers.length > 0) {
      const updated = [...layers];
      const selectedIndex = updated.findIndex((layer) => layer.id === selectedId);
      updated.splice(selectedIndex, 1);
      const newselectedIndex = Math.max(0, selectedIndex - 1);
      setLayers(updated);
      settingsStore.set("keymap-layers", updated);
      keymapStore.delete(selectedId);
      setSelectedId(updated?.[newselectedIndex]?.id);
    }
  };
  const onMouseDown = (index) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const onMouseEnter = (index) => {
    if (isDragging && index !== draggedIndex) {
      setHoveredIndex(index);
    }
  };

  const moveUp = () => {
    const selectedIndex = layers.findIndex((layer) => layer.id === selectedId);
    if (selectedIndex > 0) {
      const updated = [...layers];
      const [movedItem] = updated.splice(selectedIndex, 1);
      updated.splice(selectedIndex - 1, 0, movedItem);
      setLayers(updated);
      settingsStore.set("keymap-layers", updated);
      setSelectedId(updated[selectedIndex - 1].id);
    }
  };

  const moveDown = () => {
    const selectedIndex = layers.findIndex((layer) => layer.id === selectedId);
    if (selectedIndex < layers.length - 1) {
      const updated = [...layers];
      const [movedItem] = updated.splice(selectedIndex, 1);
      updated.splice(selectedIndex + 1, 0, movedItem);
      setLayers(updated);
      settingsStore.set("keymap-layers", updated);
      setSelectedId(updated[selectedIndex + 1].id);
    }
  };

  const onMouseUp = () => {
    if (draggedIndex !== null && hoveredIndex !== null && draggedIndex !== hoveredIndex) {
      const updated = [...layers];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(hoveredIndex, 0, movedItem);
      setLayers(updated);
      settingsStore.set("keymap-layers", updated);
      setSelectedId(updated[hoveredIndex].id);
    }

    setDraggedIndex(null);
    setHoveredIndex(null);
    setIsDragging(false);
  };

  return (
    <>
      <ul>
        {layers?.map((layer, idx) => (
          <li
            key={layer.id}
            className={getListItemClass(
              selectedId === layer.id,
              isDragging && hoveredIndex === idx
            )}
            onMouseDown={() => onMouseDown(idx)}
            onMouseEnter={() => onMouseEnter(idx)}
            onMouseUp={onMouseUp}
            onClick={() => setSelectedId(layer.id)}
          >
            {layer.name || `layer ${idx + 1}`}
          </li>
        ))}
      </ul>
      <div className="controls">
        <div>
          <button onClick={addLayer}>＋</button>
          <button
            onClick={removeLayer}
            disabled={layers.length <= 0 || !selectedId || selectedId === "general"}
          >
            −
          </button>
        </div>
        <div>
          <button onClick={moveUp} disabled={selectedId == null}>
            ↑
          </button>
          <button onClick={moveDown} disabled={selectedId == null}>
            ↓
          </button>
        </div>
      </div>
    </>
  );
}
