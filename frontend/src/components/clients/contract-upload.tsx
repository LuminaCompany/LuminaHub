"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { UploadIcon, LinkIcon, FileIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";

type UploadMode = "file" | "url";

interface ContractUploadProps {
  clientId: string;
  trigger?: React.ReactNode;
}

interface UrlFormData {
  name: string;
  url: string;
}

export function ContractUpload({ clientId, trigger }: ContractUploadProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<UploadMode>("file");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [urlName, setUrlName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedFile(null);
      setDisplayName("");
      setUrlValue("");
      setUrlName("");
      setServerError(null);
      setDragOver(false);
    }
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file);
    if (!displayName) {
      setDisplayName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleFileSubmit() {
    if (!selectedFile) {
      setServerError("Selecione um arquivo");
      return;
    }
    if (!displayName.trim()) {
      setServerError("Nome é obrigatório");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Sessão expirada");

      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `contracts/${clientId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(filePath, selectedFile, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      await api.post("/contracts", {
        client_id: clientId,
        name: displayName.trim(),
        file_path: filePath,
        url: null,
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Erro ao fazer upload"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUrlSubmit() {
    if (!urlValue.trim()) {
      setServerError("URL é obrigatória");
      return;
    }
    if (!urlName.trim()) {
      setServerError("Nome é obrigatório");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await api.post("/contracts", {
        client_id: clientId,
        name: urlName.trim(),
        file_path: null,
        url: urlValue.trim(),
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Erro ao salvar contrato"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const defaultTrigger = (
    <Button
      style={{ backgroundColor: "var(--cyan)", color: "#080B0C" }}
      className="font-semibold"
    >
      <UploadIcon />
      Novo Contrato
    </Button>
  );

  const triggerElement = trigger ?? defaultTrigger;

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {triggerElement}
      </span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: "var(--fg)",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
            }}
          >
            Novo Contrato
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Mode selector */}
          <div
            className="flex rounded-lg p-1"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <button
              type="button"
              onClick={() => setMode("file")}
              className="flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  mode === "file" ? "var(--surface)" : "transparent",
                color:
                  mode === "file" ? "var(--fg-1)" : "var(--fg-2)",
                border:
                  mode === "file"
                    ? "1px solid var(--border-subtle)"
                    : "1px solid transparent",
              }}
            >
              <FileIcon className="size-4" />
              Arquivo
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className="flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  mode === "url" ? "var(--surface)" : "transparent",
                color:
                  mode === "url" ? "var(--fg-1)" : "var(--fg-2)",
                border:
                  mode === "url"
                    ? "1px solid var(--border-subtle)"
                    : "1px solid transparent",
              }}
            >
              <LinkIcon className="size-4" />
              URL Externa
            </button>
          </div>

          {mode === "file" ? (
            <>
              {/* Drag and drop area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-xl p-8 cursor-pointer transition-all"
                style={{
                  backgroundColor: dragOver
                    ? "rgba(0,234,255,0.05)"
                    : "var(--surface-2)",
                  border: dragOver
                    ? "2px dashed rgba(0,234,255,0.4)"
                    : "2px dashed var(--border-subtle)",
                }}
              >
                <UploadIcon
                  className="size-8"
                  style={{ color: dragOver ? "var(--cyan)" : "var(--fg-3)" }}
                />
                {selectedFile ? (
                  <div className="text-center">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--fg-1)" }}
                    >
                      {selectedFile.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--fg-2)" }}
                    >
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--fg-1)" }}
                    >
                      Arraste o arquivo ou clique para selecionar
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--fg-2)" }}
                    >
                      PDF, DOCX, PNG, JPG (máx. 10 MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>

              {/* Display name */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="contract-name-file"
                  style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
                >
                  Nome do Contrato{" "}
                  <span style={{ color: "var(--negative)" }}>*</span>
                </Label>
                <Input
                  id="contract-name-file"
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    backgroundColor: "var(--surface-2)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--fg)",
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {/* URL input */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="contract-url"
                  style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
                >
                  URL do Contrato{" "}
                  <span style={{ color: "var(--negative)" }}>*</span>
                </Label>
                <Input
                  id="contract-url"
                  type="url"
                  placeholder="https://..."
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  style={{
                    backgroundColor: "var(--surface-2)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--fg)",
                  }}
                />
              </div>

              {/* Name for URL */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="contract-name-url"
                  style={{ color: "var(--fg-1)", fontSize: "0.8125rem" }}
                >
                  Nome do Contrato{" "}
                  <span style={{ color: "var(--negative)" }}>*</span>
                </Label>
                <Input
                  id="contract-name-url"
                  placeholder="Ex: Proposta Comercial — Google Drive"
                  value={urlName}
                  onChange={(e) => setUrlName(e.target.value)}
                  style={{
                    backgroundColor: "var(--surface-2)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--fg)",
                  }}
                />
              </div>
            </>
          )}

          {serverError && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(229,80,80,0.1)",
                border: "1px solid rgba(229,80,80,0.3)",
                color: "var(--negative)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {serverError}
            </div>
          )}

          <DialogFooter className="mt-2" showCloseButton>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={mode === "file" ? handleFileSubmit : handleUrlSubmit}
              style={{ backgroundColor: "var(--cyan)", color: "#080B0C" }}
              className="font-semibold"
            >
              {isSubmitting ? "Salvando..." : "Salvar Contrato"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
