# Use the official Deno image
FROM denoland/deno:latest

# Set working directory
WORKDIR /app

# Copy the application files
COPY . .

# Cache dependencies (ignore errors if server.ts doesn't exist yet)
RUN deno cache server.ts || true

# Expose port (Render will provide PORT via env var, default to 10000)
EXPOSE 10000

# Run the server
# Render sets PORT automatically, but we need to read it from env
CMD deno run --allow-net --allow-env server.ts

