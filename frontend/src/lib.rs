use app::App;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn hydrate() {
    console_error_panic_hook::set_once();
    
    // Log to verify WASM is running
    web_sys::console::log_1(&"🔥 WASM Loaded - hydrate() called!".into());
    
    leptos::mount::hydrate_body(App);
    
    web_sys::console::log_1(&"✅ Leptos hydration complete!".into());
}
