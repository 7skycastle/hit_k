import axios from "axios";

export const API_ORIGIN = "http://127.0.0.1:4000";

export const api = axios.create({
  baseURL: API_ORIGIN
});

export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
