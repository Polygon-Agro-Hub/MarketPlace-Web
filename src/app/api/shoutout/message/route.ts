// app/api/shoutout/message/route.ts
import { NextResponse } from "next/server";

// Plain (non-OTP) messages API. The OTP route (/otpservice/send) only accepts text with {{code}}.
const SHOUTOUT_MESSAGE_URL = "https://api.getshoutout.com/coreservice/messages";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message: string = body?.content?.sms ?? "";
    const rawDestination: string = String(body?.destination ?? "");
    const source: string = body?.source || "Polygon";

    // ShoutOut expects the number without "+", e.g. 94771234567
    const destination = rawDestination.replace(/\D/g, "");

    // Basic guards so this route can't be used as an open SMS relay
    if (!message || typeof message !== "string" || message.length > 480) {
      return NextResponse.json({ message: "Invalid message" }, { status: 400 });
    }
    if (!/^94\d{9}$/.test(destination)) {
      return NextResponse.json(
        { message: "Only Sri Lankan numbers are supported" },
        { status: 400 },
      );
    }

    const apiKey =
      process.env.SHOUTOUT_API_KEY || process.env.NEXT_PUBLIC_SHOUTOUT_API_KEY;

    const response = await fetch(SHOUTOUT_MESSAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source,
        destinations: [destination],
        content: { sms: message },
        transports: ["sms"],
      }),
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to proxy ShoutOut message request" },
      { status: 500 },
    );
  }
}