import { useState } from "react";
import { saveAs } from "file-saver";

const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;

if (typeof window === "undefined") {
  if (!UPLOADTHING_TOKEN) {
    console.warn("Token do serviço de upload não configurado.");
  }
}

export const saveRepertoryLocally = async (file: File): Promise<{ url: string }[]> => {
  try {
    console.log("Salvando repertório localmente...");
    saveAs(file, "repertorio.pdf");
    console.log("Repertório salvo com sucesso.");

    // Retornar um array com um objeto contendo a URL fictícia
    return [{ url: "local/repertorio.pdf" }];
  } catch (error) {
    console.error("Falha ao salvar o repertório localmente:", error);
    throw error;
  }
};

export const useSaveRepertory = () => {
  const [isSaving, setIsSaving] = useState(false);

  const save = async (file: File): Promise<void> => {
    setIsSaving(true);
    try {
      await saveRepertoryLocally(file);
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, save };
};