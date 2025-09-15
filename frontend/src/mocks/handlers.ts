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
  http.post("/users", async ({ request }) => {
    console.log({ request });
    return HttpResponse.json({
      first_name: "at",
      last_name: "bc",
      email_address: "d@b.com",
      id: "7a7e2ee8-cfa7-4caa-8e4e-97d2e4332d84",
    });
  }),
];

export default handlers;
