use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
#[cfg(not(target_os = "macos"))]
use tauri::{PhysicalSize, Position};

#[cfg(target_os = "macos")]
use tauri::{ActivationPolicy, TitleBarStyle};

#[tauri::command]
fn toggle_overlay(app_handle: tauri::AppHandle) -> Result<String, String> {
    let new_label = do_toggle_overlay(&app_handle)?;
    app_handle
        .menu()
        .ok_or("Menu not available")?
        .get(TOGGLE_ID)
        .ok_or("Menu item not found")?
        .as_menuitem()
        .ok_or("Item is not a menu item")?
        .set_text(&new_label)
        .map_err(|_| "Failed to set label".to_string())?;

    Ok(new_label)
}

fn resize_window_to_monitor(window: &WebviewWindow) -> Result<(), String> {
    #[cfg(not(target_os = "macos"))]
    {
        if let Ok(Some(monitor)) = window.current_monitor() {
            let physical_size: PhysicalSize<u32> = *monitor.size();
            // reduce height by 40 pixels (typical taskbar height on Windows)
            let height = physical_size.height.saturating_sub(60);

            let size = tauri::Size::Physical(tauri::PhysicalSize {
                width: physical_size.width,
                height,
            });
            window.set_size(size).unwrap();
            window
                .set_position(Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }))
                .unwrap();
        }
    }
    Ok(())
}

fn do_toggle_overlay(app_handle: &tauri::AppHandle) -> Result<String, String> {
    let window = app_handle
        .get_webview_window("main")
        .ok_or_else(|| "Failed to get main webview".to_string())?;

    if window.is_visible().map_err(|e| e.to_string())? {
        window.hide().map_err(|e| e.to_string())?;
        Ok("Show".to_string())
    } else {
        resize_window_to_monitor(&window)?;
        window.show().map_err(|e| e.to_string())?;
        Ok("Hide".to_string())
    }
}

const QUIT_ID: &str = "quit";
const TOGGLE_ID: &str = "toggle";
const SETTINGS_ID: &str = "settings";
const DEVTOOLS_ID: &str = "devtools";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .ok_or_else(|| "Failed to get main webview")?;
            window.set_ignore_cursor_events(true)?;
            // https://github.com/tauri-apps/tauri/issues/6562
            window.set_decorations(false)?;
            window.set_skip_taskbar(true)?;
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(ActivationPolicy::Accessory);
            }

            window.maximize().expect("Failed to maximize window");
            resize_window_to_monitor(&window)?;

            let quit_i = MenuItem::with_id(app, QUIT_ID, "Quit", true, None::<&str>)?;
            let toggle_i = MenuItem::with_id(app, TOGGLE_ID, "Show", true, None::<&str>)?;
            let settings_i =
                MenuItem::with_id(app, SETTINGS_ID, "Settings...", true, None::<&str>)?;
            #[cfg(debug_assertions)]
            let devtools_i =
                MenuItem::with_id(app, DEVTOOLS_ID, "Open DevTools", true, None::<&str>)?;
            let item_sep = PredefinedMenuItem::separator(app)?;
            #[cfg(debug_assertions)]
            let menu = Menu::with_items(
                app,
                &[&toggle_i, &settings_i, &item_sep, &devtools_i, &quit_i],
            )?;

            #[cfg(not(debug_assertions))]
            let menu = Menu::with_items(app, &[&toggle_i, &settings_i, &item_sep, &quit_i])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .menu(&menu)
                .build(app)?
                .on_menu_event(move |app, ev| match ev.id.as_ref() {
                    QUIT_ID => app.exit(0),
                    TOGGLE_ID => {
                        let new_label = do_toggle_overlay(&app).expect("Toggle overlay failed");
                        toggle_i.set_text(new_label).expect("Failed to set label");
                    }
                    SETTINGS_ID => {
                        let settings_menu = Menu::with_items(app, &[]).unwrap();
                        if app.get_webview_window("settings").is_none() {
                            let mut settings_window = WebviewWindowBuilder::new(
                                app,
                                "settings",
                                WebviewUrl::App("settings.html".into()),
                            )
                            .title("")
                            .menu(settings_menu)
                            .always_on_top(true);

                            #[cfg(target_os = "macos")]
                            {
                                settings_window =
                                    settings_window.title_bar_style(TitleBarStyle::Overlay);
                            }
                            let settings_window = settings_window.build().unwrap();

                            // Hide overlay window and disable toggle
                            window.hide().unwrap();
                            toggle_i.set_enabled(false).unwrap();
                            toggle_i.set_text("Show").unwrap();
                            app.emit_to("main", "settings-opened", ()).unwrap();

                            // Re-enable toggle when settings is closed
                            let toggle_i_clone = toggle_i.clone();
                            let app_clone = app.clone();
                            settings_window.on_window_event(move |event| {
                                if let tauri::WindowEvent::CloseRequested { .. } = event {
                                    toggle_i_clone.set_enabled(true).unwrap();
                                    app_clone.emit_to("main", "settings-closed", ()).unwrap();
                                }
                            });
                        } else {
                            let settings_window = app.get_webview_window("settings").unwrap();
                            settings_window.set_menu(settings_menu).unwrap();
                            settings_window.show().unwrap();
                            window.hide().unwrap();
                            toggle_i.set_enabled(false).unwrap();
                            toggle_i.set_text("Show").unwrap();
                            app.emit_to("main", "settings-opened", ()).unwrap();
                            let toggle_i_clone = toggle_i.clone();
                            let app_clone = app.clone();

                            settings_window.on_window_event(move |event| {
                                if let tauri::WindowEvent::CloseRequested { .. } = event {
                                    toggle_i_clone.set_enabled(true).unwrap();
                                    app_clone.emit_to("main", "settings-closed", ()).unwrap();
                                }
                            });
                        }
                    }
                    #[cfg(debug_assertions)]
                    DEVTOOLS_ID => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.set_always_on_top(false).unwrap();
                            window.open_devtools();
                        }
                    }
                    _ => println!("menu item {:?} not handled", ev.id),
                });
            app.set_menu(menu)?;
            Ok(())
        })
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![toggle_overlay])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
