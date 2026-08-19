import fs from "fs";
import path from "path";

const USER_BLOCK = '"user":{"id":null,"type":null,"lastLogin":null}';
const MENU_NULL = '"menu":null';
const LOGO_ONLY_TRUE = '"logo_only":true';
const DEFAULT_ID = 100001;
const PRODUCT_ID = 28;

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const match = header.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildMenu() {
  const link = (opts) =>
    Object.assign(
      {
        type: "link",
        spaLink: true,
        special: false,
        extra: "",
        newWindow: false,
        notification: null,
        action: null,
        iconClasses: "svg--medium",
      },
      opts
    );

  const main = [
    link({
      title: "Search",
      titleKey: "search",
      link: "/site/search",
      icon: "search",
    }),
    link({
      title: "Chat",
      titleKey: "chat",
      link: "#",
      spaLink: false,
      icon: "conversation",
      action: "chat",
    }),
    link({
      title: "My Profile",
      titleKey: "myProfile",
      link: "/site/user/myprofile",
      icon: "profile-user-silhouette",
    }),
    link({
      title: "My Friends",
      titleKey: "myFriends",
      link: "/site/user/friends",
      icon: "add-friend",
    }),
    link({
      title: "Favorites",
      titleKey: "favorites",
      link: "/site/user/favorites",
      icon: "favorite",
    }),
    link({
      title: "Members Galleries",
      titleKey: "membersGalleries",
      link: "/site/photo/newest",
      icon: "image-folder",
    }),
    link({
      title: "WellHello Survey",
      titleKey: "survey",
      link: "https://www.surveymonkey.com/r/wellhello",
      spaLink: false,
      newWindow: true,
      special: true,
      icon: "dollar",
    }),
  ];

  const upgrade = [
    {
      type: "upgrade",
      title:
        "Unlimited messaging, private photos, chat and all our features",
      titleKey: "unlimitedMessaging",
      text: "UPGRADE NOW FOR $1",
      link: "/site/upgrade/upgrade",
      hitPixel: null,
    },
  ];

  const bottom = [
    link({
      title: "Email Preferences",
      titleKey: "emailPreferences",
      link: "/site/user/email-notifications",
      icon: "letter",
    }),
    link({
      title: "Logout",
      titleKey: "logout",
      link: "/?logout=1",
      spaLink: false,
      icon: "log-out",
    }),
  ];

  return {
    impression_link: null,
    items: [main, upgrade, bottom],
  };
}

function buildChatConfig() {
  return {
    phantoms: JSON.stringify({
      phantoms: [],
      timers: {},
      firstPhantomSpam: "inactive",
    }),
    properties: {},
    nickname: "You",
    avatar: "//static.wellhello.com/img/avatar/default_male.png",
    chatbot: false,
    girls_with_privileges: [],
    chat_storage: "",
  };
}

function injectChatKey(html, chatJson) {
  // Top-level appConfig.chat (NOT layout.header.chat). Insert before "user".
  if (/"chat"\s*:\s*\{"phantoms"/.test(html)) {
    return html;
  }
  return html.replace(
    /("user"\s*:\s*\{)/,
    '"chat":' + chatJson + ',$1'
  );
}

function bootstrapScript(userId) {
  const historyKey = "chatHistory-" + PRODUCT_ID + "-" + userId;
  const conv = {
    name: "chat-" + PRODUCT_ID + "-" + userId + "-900001",
    productId: String(PRODUCT_ID),
    members: [
      {
        id: userId,
        nickname: "You",
        avatar: "//static.wellhello.com/img/avatar/default_male.png",
      },
      {
        id: 900001,
        nickname: "ClassicVoid",
        avatar: "https://static.wellhello.com/img/topusers/98/avatar126.jpg",
      },
    ],
    unread: 87,
    messages: [
      {
        text: "Hey there!",
        timestamp: Date.now() - 60000,
        sender: { id: 900001, userId: 900001 },
        messageType: "message",
      },
    ],
    data: "",
  };
  const historyJson = JSON.stringify([conv]);
  return (
    "<script>(function(){try{localStorage.setItem(" +
    JSON.stringify(historyKey) +
    "," +
    JSON.stringify(historyJson) +
    ");}catch(e){}var n=0,t=setInterval(function(){n++;try{var el=document.querySelector(\"#app-container\");var app=el&&el.__vue__;if(app&&app.$store){var st=app.$store;if(st.state.chat&&st.state.chat.chatData&&st.state.chat.chatData.isOpened){st.commit(\"setChatDisplay\",false);}if(st.state.chat&&st.state.chat.chatData&&st.state.chat.chatData.unreadCounter===0){st.commit(\"setCounter\",87);}clearInterval(t);}}catch(e){}if(n>150)clearInterval(t);},80);})();</script>"
  );
}

export default async function handler(req, res) {
  const html = fs.readFileSync(path.join(process.cwd(), "_app.html"), "utf-8");
  const url = new URL(req.url || "/", "http://localhost");

  if (url.searchParams.get("logout") === "1") {
    res.setHeader(
      "Set-Cookie",
      "wh_user=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
    );
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }

  const rawId = readCookie(req, "wh_user");
  if (rawId === null) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(html);
    return;
  }

  const id = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : DEFAULT_ID;
  const userJson =
    '{"id":' +
    id +
    ',"type":"free","gender":"male","lastLogin":"2026-08-19 00:00:00","JWTToken":"mock-jwt-token"}';

  let injected = html.includes(USER_BLOCK)
    ? html.replace(USER_BLOCK, '"user":' + userJson)
    : html.replace(/"user":\{[^}]*\}/, '"user":' + userJson);

  const menuJson = JSON.stringify(buildMenu());
  if (injected.includes(MENU_NULL)) {
    injected = injected.replace(MENU_NULL, '"menu":' + menuJson);
  } else {
    injected = injected.replace(
      /"menu"\s*:\s*null/,
      '"menu":' + menuJson
    );
  }

  if (injected.includes(LOGO_ONLY_TRUE)) {
    injected = injected.replace(LOGO_ONLY_TRUE, '"logo_only":false');
  } else {
    injected = injected.replace(/"logo_only"\s*:\s*true/, '"logo_only":false');
  }

  const chatJson = JSON.stringify(buildChatConfig());
  injected = injectChatKey(injected, chatJson);

  // Bootstrap before SPA bundle so history exists when chat store loads.
  if (injected.includes("</head>")) {
    injected = injected.replace("</head>", bootstrapScript(id) + "</head>");
  } else if (injected.includes('<div id="app-container"')) {
    injected = injected.replace(
      '<div id="app-container"',
      bootstrapScript(id) + '<div id="app-container"'
    );
  } else {
    injected = injected + bootstrapScript(id);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(injected);
}
