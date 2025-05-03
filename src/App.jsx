import { useEffect, useState } from "preact/hooks";
import { isRegistered, register } from '@tauri-apps/plugin-global-shortcut';
import "./App.css";
import { invoke } from '@tauri-apps/api/core';

const toggleShortcut = "CommandOrControl+Shift+F13";

const layerMap = {
  "base": {name: "base", index: 0, shortcut: "CommandOrControl+Shift+F14", path: "./assets/keymap.base.svg"},
  "extend": {name: "extend", index: 1, shortcut: "CommandOrControl+Shift+F15", path: "./assets/keymap.extend.svg"},
  "symbol": {name: "symbol", index: 2, shortcut: "CommandOrControl+Shift+F16", path: "./assets/keymap.symbol.svg"},
  "number":{name: "number", index: 3, shortcut: "CommandOrControl+Shift+F17", path: "./assets/keymap.number.svg"},
  "function": {name: "function", index: 4, shortcut: "CommandOrControl+Shift+F18", path: "./assets/keymap.function.svg"},
};

function App() {
  const [activeLayer, setActiveLayer] = useState(layerMap.base)


  useEffect(async () => {
    if (await isRegistered(toggleShortcut)) return;

    Object.values(layerMap).forEach(async ({name, index, shortcut, path}) => {
      if (!(await isRegistered(shortcut))) {
        register(shortcut, (s) => {
          setActiveLayer({name, index, shortcut, path})
          console.log("")
          console.log(s)
        });
      }
    });

    
    register(toggleShortcut, (s) => {
      if (s.state === "Pressed") {
        invoke('toggle_overlay');
      }
    });
  }, [])
  return (
    <main>
      {activeLayer?.name && <>
        <div className="overlay-wrapper">
          <img src={activeLayer.path}/>
        </div>
      </>}
    </main>
  );
}

export default App;
