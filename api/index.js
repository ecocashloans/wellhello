import fs from "fs";
import path from "path";

const USER_BLOCK = '"user":{"id":null,"type":null,"lastLogin":null}';
const DEFAULT_ID = 100001;

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const match = header.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req, res) {
  const html = fs.readFileSync(path.join(process.cwd(), "_app.html"), "utf-8");

  const rawId = readCookie(req, "wh_user");
  if (rawId === null) {
    // no session cookie -> keep logged-out landing (LOG IN / JOIN FREE)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(html);
    return;
  }
  const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : DEFAULT_ID;
  const userJson =
    '{"id":' + id + ',"type":"free","gender":"male","lastLogin":"2026-08-19 00:00:00","JWTToken":"mock-jwt-token"}';

  const injected = html.includes(USER_BLOCK)
    ? html.replace(USER_BLOCK, '"user":' + userJson)
    : html.replace(/"user":\{[^}]*\}/, '"user":' + userJson);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(injected);
}