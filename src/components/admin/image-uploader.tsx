import { useRef, useState } from "react";
import { toast } from "sonner";
import { GripVertical, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "products";
// Bucket is private, so we persist long-lived signed URLs (10 years).
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

async function uploadOne(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  const { data, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  if (signErr || !data?.signedUrl) throw new Error(signErr?.message ?? "Could not create image link");
  return data.signedUrl;
}

/**
 * Drag & drop multi-image uploader for the admin product editor.
 * The first image in the list is the product's primary image.
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    try {
      const urls = await Promise.all(list.map(uploadOne));
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`grid place-items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center cursor-pointer transition-colors ${
          over ? "border-gold-brand bg-gold-brand/10" : "border-white/20 hover:border-gold-brand/60 bg-black/20"
        }`}
      >
        {busy ? (
          <Loader2 className="size-6 animate-spin text-gold-brand" />
        ) : (
          <UploadCloud className="size-6 text-gold-brand" />
        )}
        <p className="text-sm text-cream/80">{busy ? "Uploading…" : "Drag & drop images, or click to browse"}</p>
        <p className="text-[10px] uppercase tracking-widest text-cream/40">JPG · PNG · WEBP · multiple allowed</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) move(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/30"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded bg-gold-brand px-1.5 py-0.5 text-[9px] font-semibold text-forest-brand">
                  <Star className="size-2.5" /> Main
                </span>
              )}
              <span className="absolute right-1 top-1 text-cream/60 opacity-0 group-hover:opacity-100">
                <GripVertical className="size-4" />
              </span>
              <div className="absolute inset-x-0 bottom-0 flex opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  className="flex-1 bg-black/70 py-1 text-[10px] text-cream hover:text-gold-brand"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, k) => k !== i))}
                  className="flex-1 bg-black/70 py-1 text-cream hover:text-red-400"
                  aria-label="Remove image"
                >
                  <Trash2 className="mx-auto size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  className="flex-1 bg-black/70 py-1 text-[10px] text-cream hover:text-gold-brand"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-cream/40">Drag a tile to reorder — the first image is used as the product cover.</p>
    </div>
  );
}
