"use client";

import { motion } from "framer-motion";
import { GiftBox } from "./GiftBox";
import { TextOverlay } from "./TextOverlay";
import { ShareActions } from "./ShareActions";
import type { DashboardState } from "./EditorPanel";

type PreviewPanelProps = {
  dashboardState: DashboardState;
  previewUrl: string;
  topText: string;
  bottomText: string;
  giftUrl: string;
  onOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function PreviewPanel({
  dashboardState,
  previewUrl,
  topText,
  bottomText,
  giftUrl,
  onOpen,
}: PreviewPanelProps) {
  return (
    <section
      aria-label="Preview do presente"
      className="card-soft flex min-h-[400px] flex-col items-center justify-center gap-6 p-6 md:p-8"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-black/40">
        Preview
      </span>

      <div aria-live="polite" className="flex w-full flex-col items-center gap-6">
        {dashboardState === "editing" && !previewUrl && (
          <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-semibold text-black/40">
            Sua imagem aparece aqui
          </div>
        )}

        {dashboardState === "editing" && previewUrl && (
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-black/20 bg-white shadow-lg">
            <img
              src={previewUrl}
              alt="Preview do meme"
              className="h-auto w-full object-contain"
            />
            <TextOverlay topText={topText} bottomText={bottomText} />
          </div>
        )}

        {dashboardState === "generating" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-black/10 border-t-[var(--accent)]" />
            <p className="text-sm font-semibold text-black/60">
              Gerando presente...
            </p>
          </div>
        )}

        {(dashboardState === "gift_ready" || dashboardState === "opening") && (
          <div className="flex flex-col items-center gap-4">
            <GiftBox
              state={dashboardState === "gift_ready" ? "closed" : "opening"}
              onOpen={onOpen}
            />
            {dashboardState === "gift_ready" && (
              <p className="text-sm font-semibold text-black/50">
                Clique na caixa para abrir!
              </p>
            )}
          </div>
        )}

        {dashboardState === "gift_open" && (
          <div className="flex w-full flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-black/20 bg-white shadow-2xl"
            >
              <img
                src={previewUrl}
                alt="Presente meme revelado"
                className="h-auto w-full object-contain"
              />
              <TextOverlay topText={topText} bottomText={bottomText} />
            </motion.div>
            <ShareActions giftUrl={giftUrl} />
          </div>
        )}
      </div>
    </section>
  );
}
