"use client";

import { ChangeEvent } from "react";
import { ImageDropZone } from "./ImageDropZone";

export type DashboardState =
  | "editing"
  | "generating"
  | "gift_ready"
  | "opening"
  | "gift_open";

type EditorPanelProps = {
  dashboardState: DashboardState;
  previewUrl: string;
  topText: string;
  bottomText: string;
  showContentWarning: boolean;
  error: string;
  canSubmit: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
  onTopTextChange: (value: string) => void;
  onBottomTextChange: (value: string) => void;
  onContentWarningChange: (checked: boolean) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function EditorPanel({
  dashboardState,
  previewUrl,
  topText,
  bottomText,
  showContentWarning,
  error,
  canSubmit,
  onFileSelect,
  onFileDrop,
  onTopTextChange,
  onBottomTextChange,
  onContentWarningChange,
  onSubmit,
  onReset,
}: EditorPanelProps) {
  const isEditing = dashboardState === "editing";
  const isOpen = dashboardState === "gift_open";
  const inputDisabled = !isEditing;

  const inputClass =
    "focusable mt-2 block w-full rounded-xl border-2 border-black/20 bg-white p-3 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <aside className="card-soft sticky top-5 space-y-4 p-6 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
      <h1 className="text-4xl leading-none md:text-5xl">Presente Meme</h1>
      <p className="text-sm text-black/60">
        Escolha a imagem, ajuste os textos e gere o link.
      </p>

      <ImageDropZone
        previewUrl={previewUrl}
        onFileSelect={onFileSelect}
        onFileDrop={onFileDrop}
        disabled={inputDisabled}
      />

      <label className="block text-sm font-bold">
        Texto grande (max 60)
        <input
          aria-label="Texto grande"
          maxLength={60}
          value={topText}
          onChange={(e) => onTopTextChange(e.target.value)}
          disabled={inputDisabled}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-bold">
        Texto pequeno (max 120)
        <input
          aria-label="Texto pequeno"
          maxLength={120}
          value={bottomText}
          onChange={(e) => onBottomTextChange(e.target.value)}
          disabled={inputDisabled}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-3 rounded-xl border-2 border-black/15 bg-white/80 p-3 font-semibold">
        <input
          aria-label="Mostrar aviso de conteudo"
          type="checkbox"
          checked={showContentWarning}
          onChange={(e) => onContentWarningChange(e.target.checked)}
          disabled={inputDisabled}
          className="h-4 w-4 accent-orange-600"
        />
        Mostrar aviso de conteudo
      </label>

      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {isOpen ? (
        <button
          type="button"
          onClick={onReset}
          className="focusable w-full rounded-full border-2 border-black/20 bg-white px-6 py-3 text-base font-extrabold transition hover:-translate-y-0.5"
        >
          Criar outro
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="Gerar link do presente"
          className="focusable w-full rounded-full bg-[var(--accent)] px-6 py-3 text-base font-extrabold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {dashboardState === "generating" ? "Gerando..." : "Gerar link"}
        </button>
      )}
    </aside>
  );
}
