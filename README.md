# Overlay

Display ergo keyboard layers onscreen. Can be used for other purposes as well, where you want to display svg images overlays onscreen.

## ⚡ Usage

### Generating svg of your keymap

Navigate to your custom qmk setup, and:

```bash
python -m venv .venv 
source .venv/bin/activate
pip install keymap-drawer
qmk c2json ./keyboards/crkbd/rev1/keymaps/seniply/keymap.c | keymap parse --layer-names Base Extend Symbol Number Function  -c 12 -q - > keymap.yaml
keymap draw keymap.yaml --select-layers Base > keymap.base.svg
keymap draw keymap.yaml --select-layers Extend > keymap.extend.svg
keymap draw keymap.yaml --select-layers Symbol > keymap.symbol.svg
keymap draw keymap.yaml --select-layers Number > keymap.number.svg
keymap draw keymap.yaml --select-layers Function > keymap.function.svg
```

Alternatively, use web tool [keymap-drawer](https://keymap-drawer.streamlit.app/)

## 🔌 Installation

* Install [Node.js](https://nodejs.org/en/)

```bash
git clone git@github.com:olavvatne/overlay.git
npm install
```

## 📦 Commands

* `npm run tauri dev` - Run Overlap application in dev mode

## 🔒 License

This project is licensed under the MIT License
