// src/app/api/proxy/[...path]/route.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.FASTAPI_URL;

if (!API_URL) {
  throw new Error("FASTAPI_URL environment variable is not configured");
}

const PUBLIC_ROUTE_PATHS = ["therapists"];

const getResponse = async (targetUrl: string, options: RequestInit) => {
  try {
    const response = await fetch(targetUrl, options);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
};

// TODO: refactor to account for a user registering and not having a token issued.

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[]; method: string } },
) {
  const token = await getToken({ req });

  const resolvedParams = await params;

  const isPublicRoute = resolvedParams.path.some((p) =>
    PUBLIC_ROUTE_PATHS.includes(p),
  );

  if (
    isPublicRoute &&
    resolvedParams.method === "POST" &&
    (!token || !token.accessToken)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = resolvedParams.path.join("/");
  const queryString = req.nextUrl.search;

  // TODO: set up a list of allowed URL's. This is vulnerable to an SSRF attack
  const targetUrl = `${API_URL}/${path}${queryString}`;

  const headers: Record<string, string> = {};

  if (token?.accessToken) {
    headers["Authorization"] = `Bearer ${token.accessToken}`;
  }

  const options: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json") || contentType === "") {
        const body = await req.json();

        options.body = JSON.stringify(body);
        (options.headers as Record<string, string>)["Content-Type"] =
          "application/json";
      } else {
        options.body = await req.arrayBuffer();
        (options.headers as Record<string, string>)["Content-Type"] =
          contentType;
      }
    } catch {
      // No body - proceed without body (expected for some DELETE requests)
    }
  }

  const response = await getResponse(targetUrl, options);
  return response;
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
