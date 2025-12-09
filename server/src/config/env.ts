// Environment configuration
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  
  // File upload
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.string().default("10485760"), // 10MB
  ALLOWED_MIME_TYPES: z.string().default("application/pdf"),
  
  // AI Configuration
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_PROVIDER: z.enum(["openai", "ollama", "local"]).default("openai"),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.2"),
  
  // Database
  DATABASE_PATH: z.string().default("./data/quiz.db"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    try {
      envConfig = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Environment configuration error:");
        error.errors.forEach((err) => {
          console.error(`  - ${err.path.join(".")}: ${err.message}`);
        });
        throw new Error("Invalid environment configuration");
      }
      throw error;
    }
  }
  return envConfig;
}

export const config = getEnvConfig();
