const DEFAULT_API_BASE_URL = "http://130.192.238.11:8008";

export const API_BASE_URL =
  typeof process !== "undefined" && process.env?.API_BASE_URL
    ? process.env.API_BASE_URL
    : DEFAULT_API_BASE_URL;
