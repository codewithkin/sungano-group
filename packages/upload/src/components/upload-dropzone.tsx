"use client";

import * as React from "react";
import { UploadCloudIcon, XIcon, FileIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "@sungano-group/upload/constants";

export interface UploadedFile {
  key: string;
  publicUrl: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface UploadDropzoneProps {
  /** Server URL for the presign endpoint (e.g. /api/upload/presign) */
  presignEndpoint: string;
  /** Called when a file is successfully uploaded */
  onUpload?: (file: UploadedFile) => void;
  /** Called when an uploaded file is removed */
  onRemove?: () => void;
  /** Current value (controlled) */
  value?: UploadedFile | null;
  /** Optional label override */
  label?: string;
  /** Extra class on the root element */
  className?: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="size-5 shrink-0 text-muted-foreground" />;
  if (mimeType === "application/pdf") return <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />;
  return <FileIcon className="size-5 shrink-0 text-muted-foreground" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDropzone({
  presignEndpoint,
  onUpload,
  onRemove,
  value,
  label,
  className,
}: UploadDropzoneProps) {
  const [state, setState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const uploadFile = React.useCallback(
    async (file: File) => {
      setError(null);
      setProgress(0);

      // Validate type
      if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
        setError(`File type not allowed. Use: ${ALLOWED_EXTENSIONS.join(", ")}`);
        return;
      }
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large. Max size is 20 MB.`);
        return;
      }

      setState("uploading");

      try {
        // 1. Get presigned URL
        const res = await fetch(presignEndpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mimeType: file.type }),
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Presign failed: ${res.status}`);
        }
        const { uploadUrl, publicUrl, key } = (await res.json()) as {
          uploadUrl: string;
          publicUrl: string;
          key: string;
        };

        // 2. Upload directly to R2 with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          };
          xhr.onerror = () => reject(new Error("Network error during upload. Check CORS settings or try again."));
          xhr.onabort = () => reject(new Error("Upload was aborted"));
          xhr.send(file);
        });

        setProgress(100);
        setState("done");
        onUpload?.({ key, publicUrl, filename: file.name, size: file.size, mimeType: file.type });
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [presignEndpoint, onUpload],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFile(files[0]!);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("idle");
    setProgress(0);
    setError(null);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  const currentFile = value ?? null;

  return (
    <div className={className}>
      {label && (
        <p className="mb-1.5 text-xs font-medium text-foreground">
          {label}
        </p>
      )}

      {/* Dropzone area */}
      {!currentFile && state !== "done" ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload file"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={[
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
            state === "uploading" ? "pointer-events-none opacity-60" : "",
          ].join(" ")}
        >
          <UploadCloudIcon className="size-8 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">
              {state === "uploading" ? "Uploading…" : "Drag & drop or click to choose"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PDF, DOCX, or image · max 20 MB
            </p>
          </div>

          {/* Progress bar */}
          {state === "uploading" && (
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Error */}
          {state === "error" && error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      ) : (
        /* File chip */
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
          {currentFile ? fileIcon(currentFile.mimeType) : <FileIcon className="size-5 shrink-0 text-muted-foreground" />}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-foreground">
              {currentFile?.filename ?? "Uploaded"}
            </span>
            {currentFile && (
              <span className="text-xs text-muted-foreground">{formatBytes(currentFile.size)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Remove file"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_EXTENSIONS.join(",")}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
