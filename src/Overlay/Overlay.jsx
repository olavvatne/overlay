import { invoke } from "@tauri-apps/api/core";
import {
  isRegistered,
  register,
  unregisterAll,
} from "@tauri-apps/plugin-global-shortcut";
import { useEffect, useState } from "preact/hooks";
import "./Overlay.css";
import { useKeymapStore } from "../Settings/hooks/store";
import { listen } from "@tauri-apps/api/event";

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log("dispose all shortcuts");
    unregisterAll();
  });
}

function Overlay() {
  const [activeLayer, setActiveLayer] = useState(null);
  const [fillColor, setFillColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [opacity, setOpacity] = useState(1);
  const [size, setSize] = useState(100);

  const [position, setPosition] = useState({
    alignItems: "center",
    justifyContent: "center",
  });
  const { settingsStore, keymapStore } = useKeymapStore();

  async function registerToggleShortcut(shortcut) {
    if (!shortcut) {
      return undefined;
    }
    const isReg = await isRegistered(shortcut);
    if (isReg) {
      return undefined;
    }

    await register(shortcut, (s) => {
      if (s.state === "Pressed") {
        invoke("toggle_overlay");
      }
    });
    return shortcut;
  }

  async function registerLayerShortcut(layer) {
    const shortcut = layer.shortcut;
    if (!shortcut) {
      return undefined;
    }
    const isReg = await isRegistered(shortcut);
    if (isReg) {
      return undefined;
    }
    await register(shortcut, (s) => {
      setActiveLayer(layer);
    });
    return shortcut;
  }

  async function setup() {
    const toggleShortcut = await settingsStore.get("keymap-toggle");
    await registerToggleShortcut(toggleShortcut);

    const position = await settingsStore.get("keymap-position");
    if (position?.css) {
      setPosition({
        alignItems: position.css.alignItems,
        justifyContent: position.css.justifyContent,
      });
    }
    const fillColor = await settingsStore.get("keymap-fill-color");
    if (fillColor) {
      setFillColor(fillColor);
    }
    const textColor = await settingsStore.get("keymap-text-color");
    if (textColor) {
      setTextColor(textColor);
    }

    const opacity = await settingsStore.get("keymap-opacity");
    if (opacity) {
      setOpacity(opacity);
    }

    const size = await settingsStore.get("keymap-size");
    if (size) {
      setSize(size);
    }

    const layers = await settingsStore.get("keymap-layers");
    if (layers?.length) {
      for (let layer of layers) {
        const id = layer.id;
        const svgText = await keymapStore.get(id);
        layer.svg = svgText;
        await registerLayerShortcut(layer);
      }
      setActiveLayer(layers[0]);
    }
  }
  async function cleanup() {
    await unregisterAll();
  }

  useEffect(() => {
    let openUnsub;
    let closeUnsub;
    let isMounted = true;
    (async () => {
      await setup();
      openUnsub = listen("settings-opened", cleanup);
      closeUnsub = listen("settings-closed", setup);
    })();
    return () => {
      isMounted = false;
      cleanup();
      if (openUnsub) openUnsub();
      if (closeUnsub) closeUnsub();
    };
  }, []);

  return (
    <main
      style={{
        ...position,
        "--keymap-fill-color": fillColor,
        "--keymap-text-color": textColor,
        "--keymap-opacity": opacity,
        "--keymap-size": size,
      }}
    >
      {!activeLayer && (
        <div className="overlay-empty-state">
          <p>Open settings to set up overlays</p>
        </div>
      )}
      {activeLayer?.id && (
        <>
          <div className="overlay-wrapper">
            <div dangerouslySetInnerHTML={{ __html: activeLayer?.svg }} />
          </div>
        </>
      )}
    </main>
  );
}

export default Overlay;
