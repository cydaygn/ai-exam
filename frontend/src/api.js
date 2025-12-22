export const API_BASE = "http://localhost:5000";
export const API_URL = `${API_BASE}/api`;

if (typeof window !== "undefined") {
  console.log("🔧 API_BASE:", API_BASE);
  console.log("🔧 API_URL:", API_URL);
}
