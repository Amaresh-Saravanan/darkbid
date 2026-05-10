FROM rust:bookworm AS builder

WORKDIR /app
COPY Cargo.toml ./
COPY src ./src
COPY migrations ./migrations

RUN cargo build --release

FROM debian:bookworm-slim

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/dbit /app/dbit
COPY migrations /app/migrations
COPY migrate.sh /app/migrate.sh
RUN chmod +x /app/migrate.sh

ENV SERVER_ADDR=0.0.0.0:8080
EXPOSE 8080

CMD ["/app/dbit"]
