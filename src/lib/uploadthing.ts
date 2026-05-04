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
    saveAs(file, "repertorio.pdf");

    // Retornar um array com um objeto contendo a URL fictícia
    return [{ url: "local/repertorio.pdf" }];
  } catch (error) {
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