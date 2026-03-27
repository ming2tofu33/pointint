import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { frontend: "ok", backend: "not configured" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(`${backendUrl}/health`);
    const data = await res.json();
    return NextResponse.json({ frontend: "ok", backend: data });
  } catch {
    return NextResponse.json(
      { frontend: "ok", backend: "unreachable" },
      { status: 502 }
    );
  }
}
