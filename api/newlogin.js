export default async function handler(req, res) {
  if (req.method === "POST") {
    res.setHeader("Set-Cookie", "wh_user=100001; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000");
    res.status(200).json({ success: true, data: { redirectTo: "/site/user/home" }, status_code: 200 });
    return;
  }
  res.status(405).json({ success: false, data: { error: "Method not allowed" }, status_code: 405 });
}