export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ success: true, data: null, status_code: 200 });
    return;
  }
  res.status(405).json({ success: false, data: { error: "Method not allowed" }, status_code: 405 });
}