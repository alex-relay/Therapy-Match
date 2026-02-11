// src/app/api/proxy/[...path]/route.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.FASTAPI_URL;

if (!API_URL) {
  throw new Error("FASTAPI_URL environment variable is not configured");
}

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

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const token = await getToken({ req });

  if (!token || !token.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const queryString = req.nextUrl.search;

  // TODO: set up a list of allowed URL's. This is vulnerable to an SSRF attack
  const targetUrl = `${API_URL}/${path}${queryString}`;

  const options: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
    },
  };

  // If it's a POST/PUT, we need to forward the body
  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json") || contentType === "") {
        const body = await req.json();
        options.body = JSON.stringify(body);
        (options.headers as Record<string, string>)["Content-Type"] =
          "application/json";
      } else {
        // Forward raw body for non-JSON content types
        options.body = await req.arrayBuffer();
        (options.headers as Record<string, string>)["Content-Type"] =
          contentType;
      }
    } catch {
      // No body - proceed without body (expected for some DELETE requests)
    }
  }

  const response = getResponse(targetUrl, options);
  return response;
}

// 3. Export for All Methods
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
