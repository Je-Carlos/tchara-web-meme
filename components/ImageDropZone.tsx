"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

type ImageDropZoneProps = {
  previewUrl: string;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
  disabled: boolean;
};

export function ImageDropZone({
  previewUrl,
  onFileSelect,
  onFileDrop,
  disabled,
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFileDrop(file);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Selecionar ou arrastar imagem"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`focusable flex min-h-[140px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed p-4 transition ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : dragging
            ? "border-[var(--accent)] bg-orange-50"
            : "border-black/20 bg-white/70 hover:border-[var(--accent)]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        disabled={disabled}
        className="hidden"
        tabIndex={-1}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Imagem selecionada"
          className="max-h-32 rounded-xl object-contain"
        />
      ) : (
        <span className="text-center text-sm font-semibold text-black/50">
          Clique ou arraste uma imagem aqui
        </span>
      )}
    </div>
  );
}
