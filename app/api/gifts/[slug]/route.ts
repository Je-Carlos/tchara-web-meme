import { NextResponse } from "next/server";
import { SIGNED_READ_URL_SECONDS, STORAGE_BUCKET } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type GiftRecord = {
  id: string;
  slug: string;
  image_path: string;
  top_text: string | null;
  bottom_text: string | null;
  expires_at: string;
  views: number;
};

type RouteContext = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { slug } = await Promise.resolve(context.params);

    if (slug === "exemplo") {
      return NextResponse.json(
        {
          slug: "exemplo",
          topText: "feliz",
          bottomText: "aniversário",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
          isExpired: false,
          imageUrl:
            "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop",
        },
        { status: 200 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("gifts")
      .select("id, slug, image_path, top_text, bottom_text, expires_at, views")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const gift = (data as GiftRecord | null) ?? null;

    if (!gift) {
      return NextResponse.json({ error: "Nao encontrado." }, { status: 404 });
    }

    const expiresAt = new Date(gift.expires_at);
    if (expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ isExpired: true }, { status: 410 });
    }

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(gift.image_path, SIGNED_READ_URL_SECONDS);

    if (signedError || !signedData?.signedUrl) {
      if (signedError?.message === "Object not found") {
        return NextResponse.json({ error: "Imagem ainda não enviada." }, { status: 404 });
      }
      throw new Error(signedError?.message || "Falha ao gerar URL da imagem.");
    }

    void supabaseAdmin
      .from("gifts")
      .update({ views: (gift.views ?? 0) + 1 } as never)
      .eq("id", gift.id);

    return NextResponse.json(
      {
        slug: gift.slug,
        topText: gift.top_text ?? "",
        bottomText: gift.bottom_text ?? "",
        expiresAt: expiresAt.toISOString(),
        isExpired: false,
        imageUrl: signedData.signedUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido.";
    console.error("[GET /api/gifts/[slug]]", message);
    return NextResponse.json(
      {
        error: "Erro interno.",
        ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
      },
      { status: 500 },
    );
  }
}
