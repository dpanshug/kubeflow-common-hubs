import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generatePresignedUploadUrl,
  validateUpload,
  isR2Configured,
} from "@/lib/r2/client";

export async function POST(request: Request) {
  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "Avatar uploads are not available. Cloudflare R2 is not configured.",
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fileType?: string; fileSize?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { fileType, fileSize } = body;

  if (!fileType || !fileSize) {
    return NextResponse.json(
      { error: "fileType and fileSize are required" },
      { status: 400 }
    );
  }

  const validation = validateUpload(fileType, fileSize);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const { uploadUrl, publicUrl } = await generatePresignedUploadUrl(
      user.id,
      fileType,
      fileSize
    );

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
