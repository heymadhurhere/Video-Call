let IS_PROD = false;

const server = IS_PROD
  ? "https://video-call-backend-p932.onrender.com"
  : "http://localhost:8080";

export { IS_PROD, server };
