import { NextResponse } from "next/server";
import {
  createAppUserAccount,
  isValidEmail,
  isValidIndianPhone,
  isValidPassword,
  normalizeEmail,
  normalizeIndianPhone,
} from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizeIndianPhone(body.phone);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();

    if (!isValidIndianPhone(phone)) {
      return NextResponse.json(
        { error: "कृपया 10 अंकों का सही भारतीय मोबाइल नंबर दर्ज करें।" },
        { status: 400 },
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "कृपया सही ईमेल पता दर्ज करें।" },
        { status: 400 },
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" },
        { status: 400 },
      );
    }

    const created = await createAppUserAccount({
      phone,
      email,
      password,
      fullName,
    });

    if ("error" in created) {
      return NextResponse.json(
        { error: created.error, code: created.code },
        { status: created.status },
      );
    }

    return NextResponse.json(
      {
        userId: created.userId,
        authEmail: created.authEmail,
        phone: created.phone,
        email: created.email,
        fullName: created.fullName,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("[app-sub/auth/register] Error:", err);
    return NextResponse.json(
      { error: "पंजीकरण में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।" },
      { status: 500 },
    );
  }
}
