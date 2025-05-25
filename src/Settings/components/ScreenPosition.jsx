import { useEffect, useState } from "preact/hooks";
import { useKeymapStore } from "../hooks/store";

import "./ScreenPosition.css";

const positions = [
  ["↖", "↑", "↗"],
  ["←", "∘", "→"],
  ["↙", "↓", "↘"],
];

const labels = [
  ["top-left", "top", "top-right"],
  ["left", "center", "right"],
  ["bottom-left", "bottom", "bottom-right"],
];

const positionStyles = {
  "top-left": { justifyContent: "flex-start", alignItems: "flex-start" },
  top: { justifyContent: "flex-start", alignItems: "center" },
  "top-right": { justifyContent: "flex-start", alignItems: "flex-end" },
  left: { justifyContent: "center", alignItems: "flex-start" },
  center: { justifyContent: "center", alignItems: "center" },
  right: { justifyContent: "center", alignItems: "flex-end" },
  "bottom-left": { justifyContent: "flex-end", alignItems: "flex-start" },
  bottom: { justifyContent: "flex-end", alignItems: "center" },
  "bottom-right": { justifyContent: "flex-end", alignItems: "flex-end" },
};

export default function ScreenPosition() {
  const [selected, setSelected] = useState(undefined);
  const { settingsStore } = useKeymapStore();
  const handleClick = async (label) => {
    setSelected(label);
    await settingsStore.set("keymap-position", { label: label, css: positionStyles[label] });
  };

  useEffect(async () => {
    const position = await settingsStore.get("keymap-position");
    if (position?.label) {
      setSelected(position.label);
    }
  }, []);

  return (
    <div className="screen-position-container">
      {positions.flat().map((symbol, i) => {
        const label = labels.flat()[i];
        const isSelected = selected === label;
        return (
          <button
            key={label}
            onClick={() => handleClick(label)}
            className={`screen-position-button ${isSelected ? "selected" : ""}`}
            title={label}
          >
            {symbol}
          </button>
        );
      })}
    </div>
  );
}
