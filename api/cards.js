const AVATARS = [
  { user_id: 98, nickname: "Sweetie98", age: 25, distance: "3 miles away", img: "avatar.jpg" },
  { user_id: 76, nickname: "Babe_76", age: 22, distance: "1 mile away", img: "avatar126.jpg" },
  { user_id: 65, nickname: "Hottie65", age: 28, distance: "5 miles away", img: "avatar126.jpg" },
  { user_id: 81, nickname: "Cutie81", age: 24, distance: "2 miles away", img: "avatar.jpg" },
  { user_id: 75, nickname: "Dreamy75", age: 27, distance: "4 miles away", img: "avatar.jpg" },
  { user_id: 67, nickname: "Kissable67", age: 26, distance: "6 miles away", img: "avatar.jpg" },
  { user_id: 63, nickname: "Flirty63", age: 23, distance: "8 miles away", img: "avatar126.jpg" },
  { user_id: 105, nickname: "Bombshell105", age: 29, distance: "12 miles away", img: "avatar.jpg" },
  { user_id: 57, nickname: "Angel57", age: 21, distance: "9 miles away", img: "avatar126.jpg" },
  { user_id: 88, nickname: "Lovely88", age: 30, distance: "7 miles away", img: "avatar.jpg" },
  { user_id: 100, nickname: "Sparkle100", age: 25, distance: "3 miles away", img: "avatar.jpg" },
  { user_id: 55, nickname: "Charming55", age: 27, distance: "2 miles away", img: "avatar.jpg" },
];

function girlCard(u) {
  const url = "https://static.wellhello.com/img/topusers/" + u.user_id + "/" + u.img;
  return {
    thumbnail: {
      user_id: u.user_id,
      nickname: u.nickname,
      media: { sizes: { large: { url: url }, extra_large: { url: url } } },
    },
    favourite: false,
    age: u.age,
    distance: u.distance,
  };
}

function buildCards() {
  const cards = {};
  AVATARS.forEach((u, i) => {
    cards[String(i + 1)] = girlCard(u);
  });
  // one "online" card so the page is not considered void by the SPA
  cards[String(AVATARS.length + 1)] = {
    type: "online",
    thumbnail: {
      user_id: 62,
      nickname: "OnlineNow62",
      media: {
        sizes: {
          large: { url: "https://static.wellhello.com/img/topusers/62/avatar.jpg" },
          extra_large: { url: "https://static.wellhello.com/img/topusers/62/avatar.jpg" },
        },
      },
    },
    favourite: false,
    age: 26,
    distance: "1 mile away",
  };
  return cards;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const page = parseInt(req.query.page || "1", 10);
    const data = page > 1 ? { cards: {}, upgradeButton: null, reachPixels: [] } : { cards: buildCards(), upgradeButton: null, reachPixels: [] };
    res.status(200).json({ success: true, data: data, status_code: 200 });
    return;
  }
  res.status(405).json({ success: false, data: { error: "Method not allowed" }, status_code: 405 });
}