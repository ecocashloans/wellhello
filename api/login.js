const FORM = {
  success: true,
  data: {
    fields: {
      login_email: {
        value: null,
        required: false,
        name: "login_email",
        label: "E-mail",
        attr: { placeholder: "E-mail" },
        type: "text",
        constraints: {},
      },
      retUrl: { value: null, required: false, name: "retUrl", label: "Headline", attr: {}, type: "hidden", constraints: {} },
      act: { value: "login", required: false, name: "act", label: null, attr: {}, type: "hidden", constraints: {} },
      login_attempt: { value: "0", required: false, name: "login_attempt", label: null, attr: {}, type: "hidden", constraints: {} },
      login_password: {
        value: null,
        required: false,
        name: "login_password",
        label: "Password",
        attr: { placeholder: "Password" },
        type: "password",
        constraints: {},
      },
      rememberMe: { value: true, required: false, name: "rememberMe", label: "Remember me", attr: {}, type: "checkbox", constraints: {} },
      _token: { value: "mock-token-login", required: false, name: "_token", label: "", attr: {}, type: "hidden", constraints: {} },
    },
    action: "/v2/api/newLogin",
    method: "POST",
    attr: [],
  },
  status_code: 200,
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(FORM);
    return;
  }
  if (req.method === "POST") {
    res.status(200).json({ success: true, data: { redirectTo: "/site/user/home" }, status_code: 200 });
    return;
  }
  res.status(405).json({ success: false, data: { error: "Method not allowed" }, status_code: 405 });
}