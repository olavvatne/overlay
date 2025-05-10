import "./Sidebar.css";

function Sidebar({ children }) {
  return <section className="sidebar">{children}</section>;
}

function SidebarGeneral({ selectedId, setSelectedId }) {
  return (
    <ul>
      <li
        className={`${selectedId === "general" ? "selected" : ""}`}
        onClick={() => setSelectedId("general")}
      >
        General
      </li>
    </ul>
  );
}

function SidebarSeparator() {
  return <div className="separator" />;
}

Sidebar.General = SidebarGeneral;
Sidebar.Separator = SidebarSeparator;

export default Sidebar;
