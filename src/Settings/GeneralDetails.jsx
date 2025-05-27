import "./GeneralDetails.css";
import {
  ScreenPosition,
  OverlayToggleInput,
  ColorPickerInput,
  OpacitySliderInput,
} from "./components";

export default function GeneralDetails() {
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
    </>
  );
}
