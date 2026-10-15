import { NextResponse } from "next/server";

const SHOUTOUT_OTP_URL = "https://api.getshoutout.com/otpservice/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.content?.sms ?? "");
    const apiKey =
      process.env.SHOUTOUT_API_KEY || process.env.NEXT_PUBLIC_SHOUTOUT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "ShoutOut API key is not configured" },
        { status: 500 },
      );
    }

    const destination = String(body?.destination ?? "").replace(/\D/g, "");
    if (!/^94\d{9}$/.test(destination)) {
      return NextResponse.json(
        { message: "Only Sri Lankan numbers are supported" },
        { status: 400 },
      );
    }

    if (!message.includes("{{code}}")) {
      return NextResponse.json(
        { message: "OTP messages must include the {{code}} placeholder" },
        { status: 400 },
      );
    }

    const response = await fetch(SHOUTOUT_OTP_URL, {
      method: "POST",
      headers: {
        Authorization: `Apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: body?.source || "Polygon",
        transport: "sms",
        content: { sms: message },
        destination: `+${destination}`,
      }),
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to proxy ShoutOut send request" },
      { status: 500 },
    );
  }
}