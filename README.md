# Overlay

Display ergo keyboard layers onscreen. Can be used for other purposes as well, where you want to display svg images overlays onscreen.

<p align="center">
  <img src="https://github.com/user-attachments/assets/032094ff-189f-46cd-a473-099144a34381" height="200" />
  <img src="https://github.com/user-attachments/assets/21d2f194-87e6-4423-ab69-0f82301448b8" height="200" />
  <img src="https://github.com/user-attachments/assets/decbae02-75ae-432c-b1ea-097ceb4debd1" height="200" />
</p>

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

## 📖 Other

### Register and pass shortcut on layer activation with QMK

Below is an example from `keymap.c` with layer activation similar to [Seniply keyboard layout](https://stevep99.github.io/seniply/).
In the example there is a dedicated toggle overlay key that is activated by `Command+Shift+F14`
And each layer activation sends along a shortcut, `Command+Shift+F15`, `Command+Shift+F16`, ... , `Command+Shift+FXX`.

```c

enum layer_names {
  _BASE,
  _EXT,
  _SYM,
  _NUM,
  _FUNC,
};

#define MO_EXT   MO(_EXT)
#define MO_SYM   MO(_SYM)
#define MO_NUM   MO(_NUM)
#define MO_FUNC   MO(_FUNC)


enum custom_keycodes {
    TOGGLE_OVERLAY = SAFE_RANGE,
};

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
  [_BASE] = LAYOUT_split_3x6_3(
TOGGLE_OVERLAY,    KC_Q,    KC_W,    KC_F,    KC_P,    KC_B,                     KC_J,    KC_L,    KC_U,    KC_Y,    KC_QUOT, TOGGLE_OVERLAY,
      XXXXXXX,    KC_A,    KC_R,    KC_S,    KC_T,    KC_G,                     KC_M,    KC_N,    KC_E,    KC_I,    KC_O,  XXXXXXX,
      XXXXXXX,    GUI_Z ,  ALT_X,   CTL_C,   SFT_D,   KC_V,                     KC_K,    SFT_H,   CTL_COMM,ALT_DOT, GUI_SLSH,MO_FUNC,
                                           KC_TAB, MO_EXT, KC_LSFT,    KC_SPC, MO_SYM, _______
  ),
  [_EXT] = ...
  [_SYM] = ...
  [_NUM] = ...
  [_FUNC] = ...
};

void send_super_shift_code(uint16_t keycode) {
    register_mods(MOD_BIT(KC_LSFT) | MOD_BIT(KC_LGUI));
    register_code(keycode);
    unregister_code(keycode);
    unregister_mods(MOD_BIT(KC_LSFT) | MOD_BIT(KC_LGUI));
}


layer_state_t layer_state_set_user(layer_state_t state) {
    state =  update_tri_layer_state(state, _SYM, _EXT, _NUM);

    int16_t layer = _BASE;
    switch (get_highest_layer(state)) {
        case _EXT:
            layer = _EXT;
            break;
        case _SYM:
            layer = _SYM;
            break;
        case _NUM:
            layer = _NUM;
            break;
        case _FUNC:
            layer = _FUNC;
            break;
        default:
            layer = _BASE;
            break;
    }
    // Communicate layer activation to OS
    send_super_shift_code(KC_F14 + layer);
    
    return state;
}

bool process_record_user(uint16_t keycode, keyrecord_t* record) {
    if (record->event.pressed) {
        switch(keycode) {
            case TOGGLE_OVERLAY:
            send_super_shift_code(KC_F13);
            return false;
        }
        snprintf(last_key_pressed, sizeof(last_key_pressed), "0x%04X", keycode);
    }
  return true;
}

```
