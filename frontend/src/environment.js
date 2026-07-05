// Vite sets import.meta.env.PROD automatically: true for `vite build`, false for `vite dev`
const IS_PROD = import.meta.env.PROD;

const server = IS_PROD
  ? "https://video-call-backend-p932.onrender.com"
  : "http://localhost:8080";

export { IS_PROD, server };
