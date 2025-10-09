import { http, HttpResponse } from "msw";
import { PatientProfile } from "../app/api/profile/profile";

const anonymousPatient = {
  therapy_needs: [],
  personality_test_id: null,
  location: null,
  description: null,
  age: 25,
  gender: "other",
  id: "33cb29df-ca26-4f7c-a4b4-b83dd2489ccd",
};

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
  http.post("/anonymous-session", async () => {
    return HttpResponse.json(
      { message: "Anonymous patient session created successfully" },
      {
        headers: {
          "set-cookie": "anonymous_session=abc-123",
        },
      },
    );
  }),
  http.patch("/anonymous-session", async ({ request }) => {
    const body = (await request.json()) as Partial<PatientProfile>;

    const anonPatient = {
      ...anonymousPatient,
      ...body,
    };

    return HttpResponse.json({
      ...anonPatient,
      headers: {
        "set-cookie": "anonymous_session=abc-123",
      },
    });
  }),
  http.post("/users", async () => {
    return HttpResponse.json({
      first_name: "at",
      last_name: "bc",
      email_address: "d@b.com",
      id: "7a7e2ee8-cfa7-4caa-8e4e-97d2e4332d84",
    });
  }),
];

export default handlers;
