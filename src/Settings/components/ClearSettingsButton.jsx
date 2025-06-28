import { useKeymapStore } from "../hooks/store";

export default function ClearSettingsButton() {
  const { clearStores } = useKeymapStore();

  async function clearAll() {
    const confirmed = await window.confirm(
      "Are you sure you want to clear all settings? This action cannot be undone."
    );
    if (confirmed) {
      await clearStores();
    }
  }
  return (
    <button style={{ justifySelf: "end" }} onClick={clearAll}>
      clear
    </button>
  );
}
