FROM rust:latest as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM rust:latest
WORKDIR /app
COPY --from=builder /app/target/release/rust_code_executor .
CMD ["./rust_code_executor"]
