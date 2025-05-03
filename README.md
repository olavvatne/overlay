# Ergo Overlay

Display ergo keyboard layers onscreen.

## Generating svg keymap

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
