use app::{shell, App};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    http::{header, HeaderValue, StatusCode},
    middleware,
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use leptos::config::get_configuration;
use leptos::prelude::*;
use leptos_axum::{generate_route_list, LeptosRoutes};
use tower_http::{compression::CompressionLayer, services::ServeDir};

#[tokio::main]
async fn main() {
    simple_logger::init_with_level(log::Level::Debug).expect("couldn't initialize logging");

    let conf = get_configuration(None).unwrap();
    let leptos_options = conf.leptos_options.clone();
    let addr = leptos_options.site_addr;
    let routes = generate_route_list(App);

    // Get the site root directory for static file serving
    let site_root = leptos_options.site_root.clone();

    // Build our application with routes and middleware
    let app = Router::new()
        .route("/ws/experiment", get(ws_handler))
        // Serve CSS with explicit Content-Type header
        .route("/pkg/antimony-labs.css", get(serve_css))
        // Serve other static files (JS, WASM) from the site root
        .nest_service("/pkg", ServeDir::new(format!("{}/pkg", site_root)))
        .nest_service("/favicon.ico", ServeDir::new(site_root.to_string()))
        // Leptos routes (SSR)
        .leptos_routes(&leptos_options, routes, {
            let leptos_options = leptos_options.clone();
            move || shell(leptos_options.clone())
        })
        // Apply compression layer
        .layer(CompressionLayer::new())
        // Apply security headers middleware
        .layer(middleware::from_fn(security_headers_middleware))
        .with_state(leptos_options);

    // Run it
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    log::info!("listening on http://{}", &addr);
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        if let Ok(msg) = msg {
            if let Message::Text(t) = msg {
                let response = format!("{{\"status\": \"processed\", \"input\": \"{}\"}}", t);
                if socket.send(Message::Text(response.into())).await.is_err() {
                    break;
                }
            }
        } else {
            break;
        }
    }
}

async fn security_headers_middleware(
    req: axum::http::Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let is_css = req.uri().path().ends_with(".css");
    let mut res = next.run(req).await;

    let headers = res.headers_mut();

    if is_css {
        headers.insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("text/css; charset=utf-8"),
        );
    }

    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );

    res
}

async fn serve_css(State(options): State<LeptosOptions>) -> impl IntoResponse {
    let css_path = format!("{}/pkg/antimony-labs.css", options.site_root);
    let css_content = match tokio::fs::read_to_string(&css_path).await {
        Ok(content) => content,
        Err(_) => return StatusCode::NOT_FOUND.into_response(),
    };

    let headers = [
        (header::CONTENT_TYPE, "text/css; charset=utf-8"),
        (header::CACHE_CONTROL, "public, max-age=31536000"),
    ];
    (headers, css_content).into_response()
}
