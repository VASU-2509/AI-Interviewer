import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromPdf } from "@/lib/parse-resume";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 400 }
    );
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 5MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractTextFromPdf(buffer);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Try a different file." },
        { status: 422 }
      );
    }

    const resume = await prisma.resume.upsert({
      where: { userId: session.user.id },
      update: { fileName: file.name, extractedText },
      create: { userId: session.user.id, fileName: file.name, extractedText },
    });

    return NextResponse.json({
      id: resume.id,
      fileName: resume.fileName,
      preview: extractedText.slice(0, 300),
    });
  } catch (err) {
    console.error("Resume parsing failed:", err);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 }
    );
  }
}