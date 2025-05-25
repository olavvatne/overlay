import "./GeneralDetails.css";
import { ScreenPosition, OverlayToggleInput } from "./components";

export default function GeneralDetails() {
  return (
    <>
      <section className="detail-section">
        <label>Toggle shortcut</label>
        <OverlayToggleInput />
      </section>
      <section>
        <ScreenPosition />
      </section>
    </>
  );
}
