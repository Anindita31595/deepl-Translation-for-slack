# Use the official Deno image
FROM denoland/deno:latest

# Set working directory
WORKDIR /app

# Copy all application files
COPY . .

# Verify files are present (for debugging)
RUN ls -la && ls -la functions/ || echo "Functions folder check"

# Cache dependencies
RUN deno cache server.ts

# Expose port (Render will provide PORT via env var, default to 10000)
EXPOSE 10000

# Run the server
# Render sets PORT automatically, but we need to read it from env
CMD ["deno", "run", "--allow-net", "--allow-env", "server.ts"]


