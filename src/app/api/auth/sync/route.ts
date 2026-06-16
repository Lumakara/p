import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const uid = decodedToken.uid;
    const email = decodedToken.email ?? null;
    const name = decodedToken.name ?? null;
    const picture = decodedToken.picture ?? null;
    
    const providerId = decodedToken.firebase?.sign_in_provider ?? "custom";
    const providerMap: Record<string, string> = {
      "google.com": "google",
      "github.com": "github",
      "password": "email"
    };
    const provider = providerMap[providerId] || providerId;

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email: email ?? undefined,
        name: name ?? undefined,
        avatar: picture ?? undefined,
      },
      create: {
        id: uid,
        email,
        name,
        avatar: picture,
        provider,
        role: "USER",
      },
    });

    return NextResponse.json({ user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error syncing user";
    console.error("[auth/sync]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
