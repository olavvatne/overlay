import { useState, useEffect, useCallback } from "preact/hooks";
import { useKeymapStore } from "../hooks/store";
import { debounce } from "../utils/debounce";

export default function ColorPickerInput({ storeKey, initialColor }) {
  const [color, setColor] = useState(initialColor);
  const { settingsStore } = useKeymapStore();

  const debounceColorChange = useCallback(
    debounce(async (newColor) => {
      await settingsStore.set(storeKey, newColor);
    }, 500),
    []
  );

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    debounceColorChange(newColor);
  };

  useEffect(() => {
    (async () => {
      const storedColor = await settingsStore.get(storeKey);
      if (storedColor) {
        setColor(storedColor);
      }
    })();
  }, []);

  return (
    <input
      type="color"
      value={color}
      onInput={handleColorChange}
      style={{ minHeight: "32px" }}
    />
  );
}
