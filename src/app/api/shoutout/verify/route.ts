import { NextResponse } from "next/server";
import { environment } from "@/environment/environment";

const SHOUTOUT_VERIFY_URL = "https://api.getshoutout.com/otpservice/verify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(SHOUTOUT_VERIFY_URL, {
      method: "POST",
      headers: {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to proxy ShoutOut verify request" },
      { status: 500 },
    );
  }
}