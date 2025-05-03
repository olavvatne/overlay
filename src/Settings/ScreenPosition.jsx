import { LazyStore } from '@tauri-apps/plugin-store';
import { useEffect, useState } from 'preact/hooks';


import "./ScreenPosition.css";

const store = new LazyStore('settings.json');

const positions = [
  ['↖', '↑', '↗'],
  ['←', '∘', '→'],
  ['↙', '↓', '↘']
];

const labels = [
  ['top-left', 'top', 'top-right'],
  ['left', 'center', 'right'],
  ['bottom-left', 'bottom', 'bottom-right']
];

const positionStyles = {
  'top-left': { justifyContent: 'flex-start', alignItems: 'flex-start' },
  'top': { justifyContent: 'flex-start', alignItems: 'center' },
  'top-right': { justifyContent: 'flex-start', alignItems: 'flex-end' },
  'left': { justifyContent: 'center', alignItems: 'flex-start' },
  'center': { justifyContent: 'center', alignItems: 'center' },
  'right': { justifyContent: 'center', alignItems: 'flex-end' },
  'bottom-left': { justifyContent: 'flex-end', alignItems: 'flex-start' },
  'bottom': { justifyContent: 'flex-end', alignItems: 'center' },
  'bottom-right': { justifyContent: 'flex-end', alignItems: 'flex-end' },
};


export default function ScreenPosition() {
  const [selected, setSelected] = useState(undefined);

  const handleClick = async (label) => {
    setSelected(label);
    await store.set('keymap-position', { label: label, css: positionStyles[label] });
  };

  useEffect(async () => {
    const position = await store.get('keymap-position');
    if (position?.label) {
      setSelected(position.label);
    }
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 50px)',
      gridGap: '8px',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {positions.flat().map((symbol, i) => {
        const label = labels.flat()[i];
        const isSelected = selected === label;
        return (
          <button
            key={label}
            onClick={() => handleClick(label)}
            className={`screen-position-button ${isSelected ? 'selected' : ''}`}
            title={label}
          >
            {symbol}
          </button>
        );
      })}
    </div>
  );
}
