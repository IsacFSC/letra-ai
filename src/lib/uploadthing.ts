import { useState } from "react";
import { saveAs } from "file-saver";

const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID;
const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;

// console.log("UPLOADTHING_SECRET:", UPLOADTHING_SECRET || "não definido");
// console.log("UPLOADTHING_APP_ID:", UPLOADTHING_APP_ID || "não definido");
// console.log("UPLOADTHING_TOKEN:", UPLOADTHING_TOKEN || "não definido");

if (typeof window === "undefined") {
  if (!UPLOADTHING_SECRET || !UPLOADTHING_APP_ID || !UPLOADTHING_TOKEN) {
    console.warn("As variáveis de ambiente do UploadThing não estão configuradas corretamente.");
  }
}

// Remover validações específicas
// if (!UPLOADTHING_APP_ID) {
//   throw new Error("UPLOADTHING_APP_ID não está definido. Verifique suas variáveis de ambiente.");
// }

// if (!UPLOADTHING_TOKEN) {
//   throw new Error("UPLOADTHING_TOKEN não está definido. Verifique suas variáveis de ambiente.");
// }

console.log("Cabeçalho Authorization:", `Bearer ${UPLOADTHING_TOKEN}`);

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