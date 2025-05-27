import { useState, useEffect, useCallback } from "preact/hooks";
import { useKeymapStore } from "../hooks/store";
import { debounce } from "../utils/debounce";
import "./OpacitySliderInput.css";

export default function OpacitySliderInput({ storeKey, initialOpacity = 1 }) {
  const [opacity, setOpacity] = useState(initialOpacity);
  const { settingsStore } = useKeymapStore();

  const debounceOpacityChange = useCallback(
    debounce(async (newOpacity) => {
      await settingsStore.set(storeKey, newOpacity);
    }, 500),
    []
  );

  useEffect(() => {
    (async () => {
      const storedOpacity = await settingsStore.get(storeKey);
      if (storedOpacity != null) {
        setOpacity(Number(storedOpacity));
      }
    })();
  }, []);

  const handleOpacityChange = (e) => {
    const newOpacity = Number(e.target.value);
    setOpacity(newOpacity);
    debounceOpacityChange(newOpacity);
  };

  return (
    <div className="opacity-input">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={opacity}
        onInput={handleOpacityChange}
        style={{ width: "150px" }}
      />
      <span>{Math.round(opacity * 100)}%</span>
    </div>
  );
}
