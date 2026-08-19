// Mock backend for /site/user/profile/:id (and related interactions).
// Mirrors the contract reverse-engineered from the SPA bundle:
//   GET    /v2/api/profile/viewer/:viewerId/getprofile/:profileId?viewedBy=...
//   GET    /v2/api/profile/viewer/:viewerId/hotties?resultsPerPage=8&page=1
//   GET    /v2/api/profile/viewer/:viewerId/newphotos?maxResults=8
//   GET    /v2/api/user/report/data
//   POST   /v2/api/user/:viewerId/report
//   GET    /v2/api/user/:viewerId/favorites
//   PUT|DELETE /v2/api/user/:viewerId/favorite/:profileId
//   POST   /v2/api/user/:viewerId/flirt/:profileId
//   POST   /v2/api/user/:viewerId/friend_request/:profileId
//   PUT|DELETE /v2/api/user/:viewerId/friend_request/:reqId
//   GET    /v2/api/chat/token
// Envelope: { success, data, status_code }. Every endpoint MUST return 200:
// the SPA request wrappers call location.reload() on "Unauthorized".

const AVATARS = [
  { user_id: 98, nickname: "Sweetie98", age: 25, distance: "3 miles away" },
  { user_id: 76, nickname: "Babe_76", age: 22, distance: "1 mile away" },
  { user_id: 65, nickname: "Hottie65", age: 28, distance: "5 miles away" },
  { user_id: 81, nickname: "Cutie81", age: 24, distance: "2 miles away" },
  { user_id: 75, nickname: "Dreamy75", age: 27, distance: "4 miles away" },
  { user_id: 67, nickname: "Kissable67", age: 26, distance: "6 miles away" },
  { user_id: 63, nickname: "Flirty63", age: 23, distance: "8 miles away" },
  { user_id: 105, nickname: "Bombshell105", age: 29, distance: "12 miles away" },
  { user_id: 57, nickname: "Angel57", age: 21, distance: "9 miles away" },
  { user_id: 88, nickname: "Lovely88", age: 30, distance: "7 miles away" },
  { user_id: 100, nickname: "Sparkle100", age: 25, distance: "3 miles away" },
  { user_id: 55, nickname: "Charming55", age: 27, distance: "2 miles away" },
  { user_id: 62, nickname: "OnlineNow62", age: 26, distance: "1 mile away" },
];

const SLIDE_VARIANTS = ["avatar288.jpg", "avatar.jpg", "avatar126.jpg"];
const REPORT_TOPIC_KEYS = [
  "fake_profile",
  "inappropriate_language",
  "misleading_scam",
  "other",
  "spam",
  "unauthorized_sales",
];

function avatarUrl(userId, variant) {
  return "https://static.wellhello.com/img/topusers/" + userId + "/" + variant;
}

function pick(profileId) {
  const id = Number(profileId) || 98;
  const exact = AVATARS.find((a) => a.user_id === id);
  if (exact) return exact;
  return AVATARS[((id % AVATARS.length) + AVATARS.length) % AVATARS.length];
}

function mediaFor(u) {
  return SLIDE_VARIANTS.map((variant) => {
    const url = avatarUrl(u.user_id, variant);
    return { src: url, title: u.nickname, type: "photo", public: true, href: url };
  });
}

function thumbnailFor(u) {
  return {
    src: avatarUrl(u.user_id, "avatar.jpg"),
    media: {
      sizes: {
        small: { url: avatarUrl(u.user_id, "avatar126.jpg") },
        medium: { url: avatarUrl(u.user_id, "avatar288.jpg") },
        large: { url: avatarUrl(u.user_id, "avatar.jpg") },
      },
    },
    user_id: u.user_id,
    nickname: u.nickname,
    sticker: false,
  };
}

function profileFor(u) {
  return {
    user: {
      user_id: u.user_id,
      unick: u.nickname,
      nickname: u.nickname,
      gender: "female",
      age: u.age,
    },
    media: mediaFor(u),
    title: u.nickname + ", " + u.age,
    description:
      "Hi, I'm " + u.nickname + "! I love going out, traveling and meeting new people. " +
      "Looking for someone fun to chat with and see where things go. Send me a message!",
    lookingFor: "Straight Male",
    interests: "Casual Sex, Role Play",
    details: {
      Height: "5'6\"",
      Race: "white",
      Status: "single",
      Orientation: "straightMale",
      Travel: "anytime",
    },
    interactions: {
      favorite: { action: "add" },
      flirt: true,
      addFriend: true,
      fullScreen: { link: "/site/user/profile/" + u.user_id },
      showVideo: { link: null },
      preferences: { link: "/site/user/profile/" + u.user_id, title: "Preferences" },
    },
    online: true,
    managed: false,
    phantom: false,
    limitedBoostedMessages: null,
    address: { distance: u.distance },
    gender: "female",
    viewerUser: { level: 0 },
    activation: null,
    ad: null,
  };
}

function hottiesFor(profileId) {
  const start = (Number(profileId) || 1) % AVATARS.length;
  const items = [];
  for (let i = 0; i < 8; i++) {
    items.push(thumbnailFor(AVATARS[(start + i) % AVATARS.length]));
  }
  return { items: items, upgradeButton: null };
}

function newPhotosFor(profileId) {
  const start = ((Number(profileId) || 1) + 5) % AVATARS.length;
  const items = [];
  for (let i = 0; i < 8; i++) {
    items.push(thumbnailFor(AVATARS[(start + i) % AVATARS.length]));
  }
  return { items: items };
}

function ok(res, data) {
  res.status(200).json({ success: true, data: data, status_code: 200 });
}

function reportTopicsPayload() {
  const reportTopics = {};
  REPORT_TOPIC_KEYS.forEach((key) => {
    reportTopics[key] = 1;
  });
  return { reportTopics: reportTopics };
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const q = req.query || {};
  const method = req.method || "GET";
  const p = Array.isArray(q.p) ? q.p[0] : q.p;

  // Dispatch on the rewrite marker param when Vercel rewrote the URL
  // (req.url then carries the destination path, e.g. /api/profile?p=...).
  if (p) {
    switch (p) {
      case "getprofile": {
        const profileId = Array.isArray(q.profileId) ? q.profileId[0] : q.profileId;
        const u = pick(profileId || 98);
        return ok(res, profileFor(u));
      }
      case "hotties":
        return ok(res, hottiesFor(1));
      case "newphotos":
        return ok(res, newPhotosFor(1));
      case "reporttopics":
        return ok(res, reportTopicsPayload());
      case "report":
        return ok(res, {});
      case "favorites":
        return ok(res, { favorites: [] });
      case "favorite":
      case "flirt":
      case "friendrequest":
        return ok(res, {});
      case "chattoken":
        return ok(res, { token: "mock-chatbot-token" });
      default:
        return ok(res, {});
    }
  }

  // Fallback: req.url still carries the original /v2 path.
  let m = path.match(/^\/v2\/api\/profile\/viewer\/[^/]+\/getprofile\/([^/]+)$/);
  if (m && method === "GET") {
    return ok(res, profileFor(pick(m[1])));
  }
  if (/^\/v2\/api\/profile\/viewer\/[^/]+\/hotties$/.test(path) && method === "GET") {
    return ok(res, hottiesFor(1));
  }
  if (/^\/v2\/api\/profile\/viewer\/[^/]+\/newphotos$/.test(path) && method === "GET") {
    return ok(res, newPhotosFor(1));
  }
  if (path === "/v2/api/user/report/data" && method === "GET") {
    return ok(res, reportTopicsPayload());
  }
  if (/^\/v2\/api\/user\/[^/]+\/report$/.test(path) && method === "POST") {
    return ok(res, {});
  }
  if (/^\/v2\/api\/user\/[^/]+\/favorites$/.test(path) && method === "GET") {
    return ok(res, { favorites: [] });
  }
  if (/^\/v2\/api\/user\/[^/]+\/favorite\/[^/]+$/.test(path) && (method === "PUT" || method === "DELETE")) {
    return ok(res, {});
  }
  if (/^\/v2\/api\/user\/[^/]+\/flirt\/[^/]+$/.test(path) && method === "POST") {
    return ok(res, {});
  }
  if (/^\/v2\/api\/user\/[^/]+\/friend_request\/[^/]+$/.test(path)) {
    return ok(res, {});
  }
  if (path === "/v2/api/chat/token" && method === "GET") {
    return ok(res, { token: "mock-chatbot-token" });
  }

  // Unknown: still answer 200 with an empty envelope so the SPA never hits
  // the "Unauthorized" -> location.reload() branch.
  return ok(res, {});
}
