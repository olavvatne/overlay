export default function Titlebar() {
  return (
    <div
      data-tauri-drag-region
      style={{
        zIndex: 1,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "25px",
      }}
    ></div>
  );
}
