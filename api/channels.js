const PRODUCT_ID = 28;
const DEFAULT_ID = 100001;
const PEER_ID = 900001;

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const match = header.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildConversation(userId) {
  return {
    name: "chat-" + PRODUCT_ID + "-" + userId + "-" + PEER_ID,
    productId: String(PRODUCT_ID),
    members: [
      {
        id: userId,
        nickname: "You",
        avatar: "//static.wellhello.com/img/avatar/default_male.png",
      },
      {
        id: PEER_ID,
        nickname: "ClassicVoid",
        avatar: "https://static.wellhello.com/img/topusers/98/avatar126.jpg",
      },
    ],
    unread: 87,
    messages: [
      {
        text: "Hey there!",
        timestamp: Date.now() - 60000,
        sender: { id: PEER_ID, userId: PEER_ID },
        messageType: "message",
      },
    ],
    data: "",
  };
}

export default async function handler(req, res) {
  const rawId = readCookie(req, "wh_user");
  const id = /^\d+$/.test(rawId || "") ? parseInt(rawId, 10) : DEFAULT_ID;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(JSON.stringify([buildConversation(id)]));
}
