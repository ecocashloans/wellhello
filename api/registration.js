const AGE_CHOICES = {};
for (let i = 18; i <= 75; i++) {
  AGE_CHOICES[`${2008 - (i - 18)}-01-01`] = i;
}

const FORM = {
  success: true,
  data: {
    fields: {
      gender: {
        value: null,
        required: false,
        name: "gender",
        label: null,
        attr: { force_type: "radio" },
        type: "radio",
        constraints: {},
        choiceList: { male: "Male", female: "Female", couple: "Couple" },
      },
      act: { value: "register", required: false, name: "act", label: null, attr: {}, type: "hidden", constraints: {} },
      email: {
        value: null,
        required: false,
        name: "email",
        label: "E-mail",
        attr: { placeholder: "E-mail" },
        type: "text",
        constraints: {},
      },
      password: {
        value: null,
        required: false,
        name: "password",
        label: "Password",
        attr: { placeholder: "Password" },
        type: "password",
        constraints: {},
      },
      age: {
        value: "2008-01-01",
        required: false,
        name: "age",
        label: "Age",
        attr: {},
        type: "choice",
        constraints: {},
        choiceList: AGE_CHOICES,
      },
      zip_code: {
        value: null,
        required: false,
        name: "zip_code",
        label: "Zip",
        attr: { placeholder: "Zip" },
        type: "text",
        constraints: {},
      },
      _token: { value: "mock-token-registration", required: false, name: "_token", label: "", attr: {}, type: "hidden", constraints: {} },
    },
    action: "/v2/api/registration",
    method: "POST",
    attr: {
      affiliateId: 104474,
      tourId: 20239,
      subId: "",
      tracking_pixel:
        "https://secure.authbill.com/join/tracking/track_in_overwatch.gif?track_type=prejoin&tour_id=20239&affiliate_id=104474&subid=",
    },
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