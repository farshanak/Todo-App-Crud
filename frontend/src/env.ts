interface AppEnv {
  API_BASE_URL: string;
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env at the repo root and fill it in.`,
    );
  }
  return value;
}

export const env: AppEnv = {
  API_BASE_URL: required("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL),
};
