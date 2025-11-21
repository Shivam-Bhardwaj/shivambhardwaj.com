use app::*;
use axum::{
    extract::{State, WebSocketUpgrade, ws::{WebSocket, Message}},
    http::{HeaderValue, header},
    middleware,
    response::{IntoResponse, Response},
    routing::get, 
    Router
};
use leptos::*;
use leptos_axum::{generate_route_list, LeptosRoutes};
use tower_http::{
    compression::CompressionLayer,
    services::ServeDir,
};

#[tokio::main]
async fn main() {
    simple_logger::init_with_level(log::Level::Debug).expect("couldn't initialize logging");

    let conf = get_configuration(None).await.unwrap();
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
        .nest_service("/favicon.ico", ServeDir::new(&site_root))
        // Leptos routes (SSR)
        .leptos_routes(&leptos_options, routes, App)
        // Fallback to SSR rendering for unmatched routes
        .fallback(file_and_error_handler)
        // Apply compression layer
        .layer(CompressionLayer::new())
        // Apply security headers middleware
        .layer(middleware::from_fn(security_headers_middleware))
        .with_state(leptos_options);

    // Run it
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    log::info!("listening on http://{}", &addr);
    axum::serve(listener, app.into_make_service()).await.unwrap();
}

// WebSocket handler
async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

// Handle the WebSocket connection
async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        if let Ok(msg) = msg {
            if let Message::Text(t) = msg {
                // Echo logic or simulation processing
                // In a real vertical integration, we'd run a physics step here 
                // and send back telemetry.
                let response = format!("{{\"status\": \"processed\", \"input\": \"{}\"}}", t);
                if socket.send(Message::Text(response)).await.is_err() {
                    break;
                }
            }
        } else {
            break;
        }
    }
}

// Security headers middleware
async fn security_headers_middleware(
    req: axum::http::Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    // Extract path before request is moved
    let is_css = req.uri().path().ends_with(".css");
    let mut res = next.run(req).await;
    
    let headers = res.headers_mut();
    
    // Set correct Content-Type for CSS files
    if is_css {
        headers.insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("text/css; charset=utf-8"),
        );
    }
    
    // X-Content-Type-Options: Prevent MIME type sniffing
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    
    // X-Frame-Options: Prevent clickjacking
    headers.insert(
        header::HeaderName::from_static("x-frame-options"),
        HeaderValue::from_static("DENY"),
    );
    
    // Strict-Transport-Security: Force HTTPS (when behind proxy/load balancer)
    headers.insert(
        header::HeaderName::from_static("strict-transport-security"),
        HeaderValue::from_static("max-age=31536000; includeSubDomains"),
    );
    
    // Referrer-Policy: Control referrer information
    headers.insert(
        header::HeaderName::from_static("referrer-policy"),
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    
    // Content-Security-Policy: Basic strict policy
    // Allow 'self' for scripts/styles, 'unsafe-eval' for WASM/Leptos hydration
    headers.insert(
        header::HeaderName::from_static("content-security-policy"),
        HeaderValue::from_static(
            "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' ws: wss:;"
        ),
    );
    
    res
}

// Serve CSS file with correct Content-Type
async fn serve_css(State(options): State<LeptosOptions>) -> impl IntoResponse {
    use axum::response::Response;
    use axum::body::Body;
    use std::fs;
    
    let css_path = format!("{}/pkg/antimony-labs.css", options.site_root);
    match fs::read_to_string(&css_path) {
        Ok(css_content) => {
            Response::builder()
                .status(200)
                .header(header::CONTENT_TYPE, "text/css; charset=utf-8")
                .header(header::CACHE_CONTROL, "public, max-age=31536000")
                .body(Body::from(css_content))
                .unwrap()
        }
        Err(_) => {
            Response::builder()
                .status(404)
                .body(Body::from("CSS file not found"))
                .unwrap()
        }
    }
}

// Basic file handler fallback
async fn file_and_error_handler(_uri: axum::http::Uri, State(options): State<LeptosOptions>, req: axum::http::Request<axum::body::Body>) -> axum::response::Response {
    let handler = leptos_axum::render_app_to_stream(options.clone(), App);
    handler(req).await.into_response()
}
