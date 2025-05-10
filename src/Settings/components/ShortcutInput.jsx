import { useEffect, useRef, useState } from "preact/hooks";
import "./ShortcutInput.css";

export default function ShortcutInput({ value, onInput }) {
  const dialogRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [combos, setCombos] = useState([]);

  const openDialog = () => {
    dialogRef.current?.showModal();
    setRecording(true);
    setCombos([]);
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setRecording(false);
  };

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e) => {
      e.preventDefault();

      const parts = [];
      if (e.ctrlKey) parts.push("Control");
      if (e.metaKey) parts.push("Command");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");

      const key = e.key.toUpperCase();
      if (!["CONTROL", "SHIFT", "ALT", "META"].includes(key)) {
        parts.push(key);
      } else {
        return;
      }

      const combo = parts.join("+");

      setCombos((prev) => {
        if (prev.includes(combo)) return prev;
        return [...prev, combo];
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [recording]);

  return (
    <>
      <div className="shortcut-input">
        <input
          type="text"
          value={value}
          onChange={(e) => onInput?.(e.target.value)}
          placeholder="Enter shortcut or record..."
          disabled={recording}
        />
        <button
          type="button"
          onClick={openDialog}
          className={`record-button ${recording ? "recording" : ""}`}
        >
          <div className="record-dot" />
        </button>
      </div>

      <dialog ref={dialogRef} className="shortcut-dialog" onCancel={closeDialog}>
        <h3>Press keys to record shortcuts</h3>
        {combos.length === 0 && <p>Press any key combo...</p>}

        <ul className="combo-list">
          {combos.map((combo) => (
            <li key={combo}>
              <button
                type="button"
                className="combo-button"
                onClick={() => {
                  onInput?.(combo);
                  closeDialog();
                }}
              >
                {combo}
              </button>
            </li>
          ))}
        </ul>

        <div className="dialog-actions">
          <button type="button" onClick={closeDialog}>
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
}
