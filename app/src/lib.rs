use leptos::*;
use leptos_meta::*;
use leptos_router::*;

mod components;
mod server_functions;
use components::canvas::SimulationCanvas;
use server_functions::get_blog_posts;

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/antimony-labs.css?v=1"/>
        // Use type_ instead of type to avoid keyword conflict
        <Link rel="shortcut icon" type_="image/ico" href="/favicon.ico"/>
        <Meta name="description" content="Antimony Labs - Robotics Portfolio"/>
        
        <Router>
            <main class="relative min-h-screen text-white font-mono">
                <SimulationCanvas />
                
                <div class="relative z-10 pointer-events-none">
                    <nav class="pointer-events-auto p-6 flex justify-between items-center mix-blend-difference">
                        <h1 class="text-2xl font-bold tracking-tighter">ANTIMONY LABS</h1>
                        <ul class="flex gap-6 text-sm">
                            <li><a href="/" class="hover:text-green-400">SIMULATION</a></li>
                            <li><a href="/about" class="hover:text-green-400">ABOUT</a></li>
                            <li><a href="/notes" class="hover:text-green-400">NOTES</a></li>
                            <li><a href="/blog" class="hover:text-green-400">LOGS</a></li>
                        </ul>
                    </nav>
                    
                    <Routes>
                        <Route path="" view=HomePage/>
                        <Route path="about" view=AboutPage/>
                        <Route path="notes" view=NotesPage/>
                        <Route path="blog" view=BlogPage/>
                    </Routes>
                    
                    <footer class="fixed bottom-0 w-full p-6 text-xs text-gray-500 flex justify-between pointer-events-auto bg-black/50 backdrop-blur-sm">
                        <div class="flex gap-4">
                            <span>RUST</span>
                            <span>WASM</span>
                            <span>LEPTOS</span>
                            <span>AXUM</span>
                        </div>
                        <div class="flex gap-4">
                            <a href="https://twitter.com/your_handle" target="_blank" rel="noreferrer" class="hover:text-white">X (TWITTER)</a>
                            <a href="https://linkedin.com/in/your_profile" target="_blank" rel="noreferrer" class="hover:text-white">LINKEDIN</a>
                            <a href="https://github.com/your_username" target="_blank" rel="noreferrer" class="hover:text-white">GITHUB</a>
                        </div>
                    </footer>
                </div>
            </main>
        </Router>
    }
}

// ... HomePage, AboutPage, NotesPage ...

#[component]
fn HomePage() -> impl IntoView {
    view! {
        <div class="flex flex-col items-center justify-center min-h-[80vh] pointer-events-auto px-4 relative z-20">
            <div class="text-center space-y-6 max-w-2xl backdrop-blur-sm bg-black/20 p-8 rounded-lg border border-white/5">
                <h2 class="text-4xl md:text-6xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                    ANTIMONY
                </h2>
                
                <div class="h-px w-24 bg-green-500 mx-auto"></div>

                <p class="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                    ADVANCED ROBOTICS RESEARCH & DEVELOPMENT
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-green-400 mt-8 text-left">
                   <div class="border border-green-900/30 p-3 bg-black/40">
                       <strong class="block text-white mb-1">> EXTENDED KALMAN FILTER</strong>
                       State estimation active. Tracking 80+ agents with sensor noise simulation.
                   </div>
                   <div class="border border-green-900/30 p-3 bg-black/40">
                       <strong class="block text-white mb-1">> APF AVOIDANCE</strong>
                       Artificial Potential Fields preventing collisions and edge wrapping.
                   </div>
                   <div class="border border-green-900/30 p-3 bg-black/40">
                       <strong class="block text-white mb-1">> D* LITE PATHING</strong>
                       Dynamic replanning enabled for optimal trajectory generation.
                   </div>
                </div>

                <p class="text-xs text-gray-500 pt-8">
                    EST. 2025 // SHIVAM BHARDWAJ
                </p>
            </div>
        </div>
    }
}

#[component]
fn AboutPage() -> impl IntoView {
    view! {
        <div class="container mx-auto p-12 pt-24 pointer-events-auto bg-black/80 min-h-screen">
            <h2 class="text-4xl font-bold mb-8">OPERATOR PROFILE</h2>
            <div class="grid md:grid-cols-2 gap-12">
                <div>
                    <h3 class="text-xl text-green-400 mb-4">SHIVAM BHARDWAJ</h3>
                    <p class="mb-4 text-gray-300">
                        Robotics Engineer specializing in swarm intelligence, SLAM, and sensor fusion.
                        Passionate about vertical integration and high-performance systems code.
                    </p>
                    <div class="border-l-2 border-gray-700 pl-4 space-y-4 mt-8">
                        <div>
                            <div class="text-xs text-gray-500">2020 - PRESENT</div>
                            <div class="font-bold">SENIOR ROBOTICS ENGINEER</div>
                            <div class="text-sm text-gray-400">Leading autonomy stack development for mobile robots.</div>
                        </div>
                    </div>
                </div>
                <div class="border border-gray-800 p-6">
                    <h3 class="text-sm text-gray-500 mb-4">CORE COMPETENCIES</h3>
                    <ul class="space-y-2 text-sm">
                        <li>> RUST / C++ / PYTHON</li>
                        <li>> ROS2 / DOCKER</li>
                        <li>> COMPUTER VISION (OPENCV, YOLO)</li>
                        <li>> CONTROL THEORY (PID, MPC)</li>
                        <li>> SENSOR FUSION (KALMAN, EKF)</li>
                    </ul>
                </div>
            </div>
        </div>
    }
}

#[component]
fn NotesPage() -> impl IntoView {
    view! {
        <div class="container mx-auto p-12 pt-24 pointer-events-auto bg-black/80 min-h-screen">
             <h2 class="text-4xl font-bold mb-8">LAB NOTES / EXPERIMENTS</h2>
             <p class="text-gray-500">Live telemetry feeds and interactive WASM modules.</p>
        </div>
    }
}

#[component]
fn BlogPage() -> impl IntoView {
    let posts = create_resource(|| (), |_| async move { get_blog_posts().await });

    view! {
        <div class="container mx-auto p-12 pt-24 pointer-events-auto bg-black/80 min-h-screen">
             <h2 class="text-4xl font-bold mb-8">MISSION LOGS</h2>
             <Suspense fallback=move || view! { <p>"Loading logs..."</p> }>
                 {move || {
                     posts.get().map(|data| {
                         match data {
                             Ok(posts) => view! {
                                 <div class="space-y-8">
                                     {posts.into_iter().map(|post| view! {
                                         <article class="border-b border-gray-800 pb-8">
                                             <div class="flex justify-between text-xs text-gray-500 mb-2">
                                                 <span>{post.date}</span>
                                                 <span>LOG_ID: {post.slug}</span>
                                             </div>
                                             <h3 class="text-2xl font-bold mb-2 hover:text-green-400 cursor-pointer">{post.title}</h3>
                                             <div inner_html=post.content class="text-gray-400"/>
                                         </article>
                                     }).collect_view()}
                                 </div>
                             }.into_view(), // Match types using into_view()
                             Err(_) => view! { <p>"Error loading logs."</p> }.into_view()
                         }
                     })
                 }}
             </Suspense>
        </div>
    }
}
