use leptos::prelude::*;
use robotics_lib::boids::Boid;
use std::cell::RefCell;
use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

thread_local! {
    static STATE: RefCell<Option<SimState>> = const { RefCell::new(None) };
}

struct SimState {
    flock: Vec<Boid>,
    ctx: CanvasRenderingContext2d,
    width: f32,
    height: f32,
}

// Export this function for JS to call
#[wasm_bindgen]
pub fn animation_tick() {
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        let Some(s) = state.as_mut() else { return };

        // Physics
        let snapshot = s.flock.clone();
        for boid in s.flock.iter_mut() {
            boid.flock(&snapshot);
            boid.particle.update();
            boid.update_ekf(1.0 / 60.0);
            boid.edges(s.width, s.height);
        }

        // Render
        render(&s.ctx, &s.flock, s.width as f64, s.height as f64);
    });
}

fn render(ctx: &CanvasRenderingContext2d, flock: &[Boid], w: f64, h: f64) {
    // Trail effect
    ctx.set_fill_style_str("rgba(0, 0, 0, 0.12)");
    ctx.fill_rect(0.0, 0.0, w, h);

    // Boids
    for boid in flock {
        let x = boid.particle.position.x as f64;
        let y = boid.particle.position.y as f64;
        let vx = boid.particle.velocity.x as f64;
        let vy = boid.particle.velocity.y as f64;

        ctx.save();
        let _ = ctx.translate(x, y);
        let _ = ctx.rotate(vy.atan2(vx));

        // Triangle
        ctx.begin_path();
        ctx.move_to(12.0, 0.0);
        ctx.line_to(-6.0, 6.0);
        ctx.line_to(-6.0, -6.0);
        ctx.close_path();

        let speed = (vx * vx + vy * vy).sqrt();
        ctx.set_fill_style_str(&format!("hsl(140, 100%, {}%)", 45.0 + speed * 8.0));
        ctx.fill();
        ctx.set_stroke_style_str("#fff");
        ctx.set_line_width(0.5);
        ctx.stroke();
        ctx.restore();

        // EKF marker
        ctx.begin_path();
        let _ = ctx.arc(
            boid.ekf.state.x as f64,
            boid.ekf.state.y as f64,
            2.0,
            0.0,
            std::f64::consts::TAU,
        );
        ctx.set_fill_style_str("rgba(0,255,100,0.4)");
        ctx.fill();
    }

    // Connections
    ctx.set_line_width(0.3);
    for i in 0..flock.len() {
        for j in (i + 1)..flock.len() {
            let dx = flock[i].particle.position.x - flock[j].particle.position.x;
            let dy = flock[i].particle.position.y - flock[j].particle.position.y;
            let d2 = dx * dx + dy * dy;
            if d2 < 3600.0 {
                ctx.set_stroke_style_str(&format!(
                    "rgba(0,255,100,{})",
                    (1.0 - d2 / 3600.0) * 0.15
                ));
                ctx.begin_path();
                ctx.move_to(
                    flock[i].particle.position.x as f64,
                    flock[i].particle.position.y as f64,
                );
                ctx.line_to(
                    flock[j].particle.position.x as f64,
                    flock[j].particle.position.y as f64,
                );
                ctx.stroke();
            }
        }
    }
}

#[wasm_bindgen]
pub fn init_simulation(canvas_id: &str) -> bool {
    let win = match web_sys::window() {
        Some(w) => w,
        None => return false,
    };
    let doc = match win.document() {
        Some(d) => d,
        None => return false,
    };
    let canvas = match doc.get_element_by_id(canvas_id) {
        Some(c) => c,
        None => return false,
    };
    let canvas: web_sys::HtmlCanvasElement = match canvas.dyn_into() {
        Ok(c) => c,
        Err(_) => return false,
    };

    let width = win
        .inner_width()
        .ok()
        .and_then(|v| v.as_f64())
        .unwrap_or(800.0) as f32;
    let height = win
        .inner_height()
        .ok()
        .and_then(|v| v.as_f64())
        .unwrap_or(600.0) as f32;

    canvas.set_width(width as u32);
    canvas.set_height(height as u32);

    let ctx = match canvas.get_context("2d").ok().flatten() {
        Some(c) => match c.dyn_into::<CanvasRenderingContext2d>() {
            Ok(ctx) => ctx,
            Err(_) => return false,
        },
        None => return false,
    };

    // Clear
    ctx.set_fill_style_str("#000");
    ctx.fill_rect(0.0, 0.0, width as f64, height as f64);

    // Create boids
    let flock: Vec<Boid> = (0..80)
        .map(|i| {
            let x = (i % 10) as f32 * (width / 10.0) + (width / 20.0);
            let y = (i / 10) as f32 * (height / 10.0) + (height / 20.0);
            Boid::new(i, x, y)
        })
        .collect();

    web_sys::console::log_1(
        &format!(
            "✅ Initialized {} boids on {}x{}",
            flock.len(),
            width,
            height
        )
        .into(),
    );

    STATE.with(|s| {
        *s.borrow_mut() = Some(SimState {
            flock,
            ctx,
            width,
            height,
        });
    });

    true
}

#[component]
pub fn SimulationCanvas() -> impl IntoView {
    view! {
        <canvas
            id="sim-canvas"
            class="fixed inset-0 w-full h-full"
            style="z-index: 0; background: #000;"
        />
    }
}
