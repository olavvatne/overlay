import { getVersion } from "@tauri-apps/api/app";
import "./GeneralDetails.css";
import {
  ScreenPosition,
  OverlayToggleInput,
  ColorPickerInput,
  OpacitySliderInput,
} from "./components";
import { useEffect, useState } from "preact/hooks";

export default function GeneralDetails() {
  const [version, setVersion] = useState(null);
  useEffect(async () => {
    const v = await getVersion();
    setVersion(v);
  });
  return (
    <>
      <section className="detail-section">
        <label>Toggle shortcut</label>
        <OverlayToggleInput />
        <span />
        <label>Fill color</label>
        <ColorPickerInput storeKey="keymap-fill-color" initialColor="#ffffff" />
        <span />
        <label>Text color</label>
        <ColorPickerInput storeKey="keymap-text-color" initialColor="#000000" />
        <span />
        <label>Opacity</label>
        <OpacitySliderInput storeKey="keymap-opacity" initialColor={1} />
      </section>
      <section>
        <ScreenPosition />
      </section>
      {version && (
        <section className="detail-section">
          <p>Version</p>
          <p style={{ textAlign: "end" }}>v{version}</p>
        </section>
      )}
    </>
  );
}
