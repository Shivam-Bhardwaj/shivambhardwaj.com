# Use the official Rust image as a builder
FROM rustlang/rust:nightly as builder

# Install cargo-binstall for easy tool installation
RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash

# Install cargo-leptos
RUN cargo binstall cargo-leptos -y

# Add the WASM target
RUN rustup target add wasm32-unknown-unknown

# Create a new empty shell project
WORKDIR /app
COPY . .

# Build the application (this builds both the SSR binary and the WASM frontend)
RUN cargo leptos build --release

# Runtime image (Debian Slim is smaller/safer than full Ubuntu)
FROM debian:bookworm-slim

WORKDIR /app

# Install OpenSSL (often needed for HTTP clients)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder
COPY --from=builder /app/target/release/server /app/server

# Copy the static assets (JS/WASM/CSS) built by cargo-leptos
COPY --from=builder /app/target/site /app/site

# Expose the port (default Leptos port is 3000)
EXPOSE 3000

# Set environment variables
ENV LEPTOS_SITE_ADDR="0.0.0.0:3000"
ENV LEPTOS_SITE_ROOT="site"

# Run the server
CMD ["./server"]

