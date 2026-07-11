import { env } from "./env";

export const corsConfig = {
  origin: env.NODE_ENV === "production"
    ? env.CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean)
    : ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
