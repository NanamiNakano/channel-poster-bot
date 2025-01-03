FROM denoland/deno:latest

WORKDIR /app
USER deno

COPY . .

RUN ls
RUN deno install --allow-import
RUN deno cache ./src/main.ts --allow-import

CMD ["run", "-A", "--unstable-kv", "./src/main.ts"]
