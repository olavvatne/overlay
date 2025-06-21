import { useState, useEffect, useCallback } from "preact/hooks";
import { useKeymapStore } from "../hooks/store";
import { debounce } from "../utils/debounce";
import "./SizeSliderInput.css";

export default function SizeSliderInput({ storeKey, initialSize = 1 }) {
  const [size, setSize] = useState(initialSize);
  const { settingsStore } = useKeymapStore();

  const debounceSizeChange = useCallback(
    debounce(async (newSize) => {
      await settingsStore.set(storeKey, newSize);
    }, 500),
    []
  );

  useEffect(() => {
    (async () => {
      const storedSize = await settingsStore.get(storeKey);
      if (storedSize != null) {
        setSize(Number(storedSize));
      }
    })();
  }, []);

  const handleSizeChange = (e) => {
    const newOpacity = Number(e.target.value);
    setSize(newOpacity);
    debounceSizeChange(newOpacity);
  };

  return (
    <div className="size-input">
      <input
        type="range"
        min="0.2"
        max="2"
        step="0.1"
        value={size}
        onInput={handleSizeChange}
        style={{ width: "150px" }}
      />
      <span>{Math.round(size * 100)}%</span>
    </div>
  );
}
