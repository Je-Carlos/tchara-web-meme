"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { createGift, uploadToSignedUrl } from "@/lib/gift-api";
import { useGiftStore } from "@/lib/store";
import { fireConfetti, fireFallingConfetti } from "@/lib/confetti";
import { EditorPanel, type DashboardState } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";

const MAX_BYTES = 5 * 1024 * 1024;
const VALID_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

function validateImage(file: File): string | null {
  if (!VALID_TYPES.includes(file.type)) {
    return "Use apenas JPG, PNG, WEBP ou GIF.";
  }
  if (file.size > MAX_BYTES) {
    return "Arquivo maior que 5MB.";
  }
  return null;
}

export function Dashboard() {
  const setGift = useGiftStore((s) => s.setGift);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [showContentWarning, setShowContentWarning] = useState(true);
  const [dashboardState, setDashboardState] = useState<DashboardState>("editing");
  const [error, setError] = useState("");
  const [generatedSlug, setGeneratedSlug] = useState("");

  const giftUrl = generatedSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${generatedSlug}`
    : "";

  const canSubmit = useMemo(
    () => Boolean(file && dashboardState === "editing" && !error),
    [file, dashboardState, error],
  );

  const processFile = (f: File) => {
    const validation = validateImage(f);
    if (validation) {
      setError(validation);
      setFile(null);
      setPreviewUrl("");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError("");
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreviewUrl("");
      return;
    }
    processFile(selected);
  };

  const onFileDrop = (f: File) => processFile(f);

  const onSubmit = async () => {
    if (!file || !previewUrl || dashboardState !== "editing") return;

    setDashboardState("generating");
    setError("");

    try {
      const fileExt = file.name.split(".").pop() ?? "";
      const { slug, uploadUrl } = await createGift({
        topText,
        bottomText,
        fileExt,
      });

      const uploadResult = await uploadToSignedUrl(file, uploadUrl);
      if (!uploadResult.ok) throw new Error("Falha no upload.");

      setGift(slug, {
        imageObjectUrl: previewUrl,
        topText: topText.trim(),
        bottomText: bottomText.trim(),
        showContentWarning,
      });

      setGeneratedSlug(slug);
      setDashboardState("gift_ready");
    } catch {
      setError("Nao foi possivel gerar o link agora. Tente novamente.");
      setDashboardState("editing");
    }
  };

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDashboardState("opening");

    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    setTimeout(() => fireConfetti(origin), 420);
    setTimeout(() => fireFallingConfetti(), 780);
    setTimeout(() => setDashboardState("gift_open"), 800);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setTopText("");
    setBottomText("");
    setShowContentWarning(true);
    setError("");
    setGeneratedSlug("");
    setDashboardState("editing");
  };

  return (
    <main className="app-shell mx-auto w-full max-w-6xl py-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <EditorPanel
          dashboardState={dashboardState}
          previewUrl={previewUrl}
          topText={topText}
          bottomText={bottomText}
          showContentWarning={showContentWarning}
          error={error}
          canSubmit={canSubmit}
          onFileSelect={onFileSelect}
          onFileDrop={onFileDrop}
          onTopTextChange={setTopText}
          onBottomTextChange={setBottomText}
          onContentWarningChange={setShowContentWarning}
          onSubmit={onSubmit}
          onReset={handleReset}
        />
        <PreviewPanel
          dashboardState={dashboardState}
          previewUrl={previewUrl}
          topText={topText}
          bottomText={bottomText}
          giftUrl={giftUrl}
          onOpen={handleOpen}
        />
      </div>
    </main>
  );
}
