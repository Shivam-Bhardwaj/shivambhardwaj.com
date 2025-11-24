use leptos::prelude::*;
use leptos_meta::*;

mod components;
mod server_functions;
use components::canvas::SimulationCanvas;

#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen]
use wasm_bindgen::prelude::wasm_bindgen;
pub fn hydrate() {
    console_error_panic_hook::set_once();
    leptos::mount::hydrate_body(App);
}

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <AutoReload options=options.clone()/>
                <HydrationScripts options/>
                <MetaTags/>
            </head>
            <body class="bg-black">
                <App/>
                <script>
                    "// Start animation after WASM loads
                    window.addEventListener('load', function() {
                        setTimeout(function() {
                            if (typeof wasm_bindgen !== 'undefined' && wasm_bindgen.init_simulation) {
                                console.log('Starting simulation...');
                                if (wasm_bindgen.init_simulation('sim-canvas')) {
                                    setInterval(function() { wasm_bindgen.animation_tick(); }, 16);
                                    console.log('Animation loop started');
                                }
                            }
                        }, 500);
                    });"
                </script>
            </body>
        </html>
    }
}

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/antimony-labs.css"/>
        <Link rel="shortcut icon" type_="image/ico" href="/favicon.ico"/>
        <Meta name="description" content="Antimony Labs"/>

        <main class="relative min-h-screen text-white font-mono bg-black">
            <SimulationCanvas />

            <div class="relative z-20 pointer-events-none">
                <nav class="pointer-events-auto p-6 flex justify-between items-center">
                    <h1 class="text-2xl font-bold tracking-tighter">"ANTIMONY LABS"</h1>
                </nav>

                <div class="flex flex-col items-center justify-center min-h-[80vh] pointer-events-auto px-4">
                    <div class="text-center space-y-6 max-w-2xl backdrop-blur-sm bg-black/20 p-8 rounded-lg border border-white/5">
                        <h2 class="text-4xl md:text-6xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                            "ANTIMONY"
                        </h2>
                        <div class="h-px w-24 bg-green-500 mx-auto"></div>
                        <p class="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                            "ADVANCED ROBOTICS RESEARCH"
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-green-400 mt-8 text-left">
                           <div class="border border-green-900/30 p-3 bg-black/40">
                               <strong class="block text-white mb-1">"> EKF"</strong>
                               "State estimation with 80+ agents"
                           </div>
                           <div class="border border-green-900/30 p-3 bg-black/40">
                               <strong class="block text-white mb-1">"> APF"</strong>
                               "Artificial Potential Fields"
                           </div>
                           <div class="border border-green-900/30 p-3 bg-black/40">
                               <strong class="block text-white mb-1">"> D* LITE"</strong>
                               "Dynamic replanning"
                           </div>
                        </div>
                    </div>
                </div>

                <footer class="fixed bottom-0 w-full p-6 text-xs text-gray-500 flex justify-between pointer-events-auto bg-black/50 backdrop-blur-sm">
                    <div class="flex gap-4">
                        <span>"RUST"</span>
                        <span>"WASM"</span>
                        <span>"LEPTOS"</span>
                    </div>
                </footer>
            </div>
        </main>
    }
}
