"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GiftBox } from "@/components/GiftBox";
import { TextOverlay } from "@/components/TextOverlay";
import { fireConfetti, fireFallingConfetti } from "@/lib/confetti";
import { getGift } from "@/lib/gift-api";
import { useGiftStore } from "@/lib/store";

type BoxState = "closed" | "opening" | "open";

export default function GiftSlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const getFromStore = useGiftStore((state) => state.getGift);
  const [boxState, setBoxState] = useState<BoxState>("closed");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [gift, setGift] = useState(() => getFromStore(slug));

  useEffect(() => {
    let active = true;
    async function loadGift() {
      setLoading(true);
      const fromApi = await getGift(slug);
      if (!active) return;
      if (!fromApi) {
        setFallback(true);
      } else {
        setGift(fromApi);
      }
      setLoading(false);
    }
    void loadGift();
    return () => {
      active = false;
    };
  }, [getFromStore, slug]);

  const canOpen = useMemo(
    () => !loading && !fallback && boxState === "closed",
    [boxState, fallback, loading],
  );

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    setBoxState("opening");
    window.setTimeout(() => {
      fireConfetti({ x, y });
      fireFallingConfetti(4000);
    }, 420);
    window.setTimeout(() => setBoxState("open"), 780);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <main className="app-shell mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <p className="rounded-full bg-white px-5 py-3 text-sm font-bold">
          Carregando presente...
        </p>
      </main>
    );
  }

  if (fallback || !gift) {
    return (
      <main className="app-shell mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <section className="card-soft w-full max-w-xl p-8 text-center">
          <h1 className="text-5xl leading-none">Oops</h1>
          <p className="mt-3 text-black/70">
            Esse presente nao esta disponivel neste dispositivo (imagem era
            local).
          </p>
          <Link
            href="/"
            className="focusable mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 font-extrabold text-white"
          >
            Criar um novo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/60">
        {boxState === "open" ? "Presente aberto" : "Clique para abrir"}
      </p>

      {gift.showContentWarning && boxState !== "open" ? (
        <p className="rounded-full border border-orange-300 bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-orange-700">
          Aviso de conteudo habilitado
        </p>
      ) : null}

      <div className="relative flex min-h-[360px] w-full items-center justify-center">
        {boxState !== "open" ? (
          <GiftBox state={boxState} onOpen={handleOpen} />
        ) : null}

        {boxState === "open" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-black/20 bg-white shadow-2xl"
          >
            <div className="relative h-[62vh] max-h-[540px] min-h-[280px] w-full">
              <Image
                src={gift.imageObjectUrl}
                alt="Presente meme revelado"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </div>
            <TextOverlay topText={gift.topText} bottomText={gift.bottomText} />
          </motion.div>
        ) : null}
      </div>

      {boxState === "open" ? (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Link
            href="/"
            className="focusable rounded-full border-2 border-black/20 bg-white px-5 py-2.5 font-bold"
          >
            Menu inicial
          </Link>
          <button
            aria-label="Abrir presente de novo"
            type="button"
            onClick={() => setBoxState("closed")}
            className="focusable rounded-full border-2 border-black/20 bg-white px-5 py-2.5 font-bold"
          >
            Abrir de novo
          </button>
          <Link
            href="/"
            className="focusable rounded-full bg-[var(--accent)] px-5 py-2.5 font-extrabold text-white"
          >
            Criar outro
          </Link>
          <button
            aria-label="Copiar link do presente"
            type="button"
            onClick={handleCopy}
            className="focusable rounded-full border-2 border-black/20 bg-white px-5 py-2.5 font-bold"
          >
            {copied ? "Link copiado" : "Copiar link"}
          </button>
        </div>
      ) : null}
    </main>
  );
}
