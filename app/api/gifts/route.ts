import { NextResponse } from "next/server";
import { GIFT_TTL_HOURS, STORAGE_BUCKET } from "@/lib/config";
import { generateImagePath, generateSlug } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  assertAllowedExt,
  normalizeExt,
  sanitizeText,
  ValidationError,
} from "@/lib/validators";

export const runtime = "nodejs";

type CreateGiftPayload = {
  topText?: string;
  bottomText?: string;
  fileExt?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateGiftPayload;
    const fileExt = normalizeExt(body.fileExt);
    assertAllowedExt(fileExt);

    const topText = sanitizeText(body.topText ?? "", 60) || null;
    const bottomText = sanitizeText(body.bottomText ?? "", 120) || null;
    const expiresAt = new Date(Date.now() + GIFT_TTL_HOURS * 60 * 60 * 1000);
    const supabaseAdmin = getSupabaseAdmin();

    let slug = "";
    let imagePath = "";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const candidateSlug = generateSlug(10);
      const candidatePath = generateImagePath(candidateSlug, fileExt);

      const { error } = await supabaseAdmin.from("gifts").insert({
        slug: candidateSlug,
        image_path: candidatePath,
        top_text: topText,
        bottom_text: bottomText,
        expires_at: expiresAt.toISOString(),
      } as never);

      if (!error) {
        slug = candidateSlug;
        imagePath = candidatePath;
        break;
      }

      if (error.code !== "23505") {
        throw new Error(error.message);
      }
    }

    if (!slug || !imagePath) {
      throw new Error("Nao foi possivel gerar identificador unico.");
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(imagePath);

    if (uploadError || !uploadData?.signedUrl) {
      throw new Error(uploadError?.message || "Falha ao gerar upload URL.");
    }

    // Client side upload: use fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } }).
    return NextResponse.json(
      {
        slug,
        path: imagePath,
        uploadUrl: uploadData.signedUrl,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido.";
    console.error("[POST /api/gifts]", message);
    return NextResponse.json(
      {
        error: "Erro interno.",
        ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
      },
      { status: 500 },
    );
  }
}
