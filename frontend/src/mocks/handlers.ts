import { http, HttpResponse } from "msw";

const handlers = [
  http.get("api/auth/providers", () => {
    return HttpResponse.json({
      credentials: {
        id: "credentials",
        name: "Credentials",
        type: "credentials",
        signinUrl: "http://localhost:4000/api/auth/signin/credentials",
        callbackUrl: "http://localhost:4000/api/auth/callback/credentials",
      },
    });
  }),
  http.get("api/auth/csrf", () => {
    return HttpResponse.json({
      csrfToken: "123",
    });
  }),
  http.post("api/auth/callback/credentials", async () => {
    return HttpResponse.json({ url: "http://localhost:4000/profile" });
  }),
];

export default handlers;
