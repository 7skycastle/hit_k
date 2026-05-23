import axios from "axios";

const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:4000";
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || runtimeOrigin;

export const api = axios.create({
  baseURL: API_ORIGIN
});

export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
