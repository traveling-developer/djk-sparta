import {
  createPartFromUri,
  GoogleGenAI,
  type ContentListUnion,
  type File,
} from "@google/genai";
import fs from "fs";
import { MatchReport } from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateReport(report: MatchReport) {
  const uploadedReport = await ai.files.upload({ file: report.filePath });

  const jsonReport = await withRetry(() =>
    generateJSONFromReport(uploadedReport)
  );

  const content = await withRetry(() => generateContent(jsonReport));

  await deleteUploadedFile(uploadedReport);

  const firstLineBreak = content.indexOf("\n");
  report.title = content.substring(0, firstLineBreak);
  report.content = content.substring(firstLineBreak + 1).trim();
}

async function generateContent(
  jsonReport: string | undefined
): Promise<string> {
  const generatedContent = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      "Du bist Pressewart der DJK Sparta Noris Nürnberg und schreibst einen Spielbericht für die Vereinshomepage basierend auf den folgenden JSON-Daten. Der Bericht sollte 150 bis 250 Wörter umfassen und aus der Perspektive unseres Vereins geschrieben sein, dabei aber sportlich fair bleiben. Der Ton sollte sachlich-positiv sein und auch bei Niederlagen konstruktive Aspekte hervorheben. Verwende keinen Markdown, sondern nur Fließtext mit natürlichen Absätzen. Beginne mit einem kurzen, aussagekräftigen Titel, der das Ergebnis widerspiegelt. Im Bericht solltest du das Endergebnis prominent nennen und den Spielverlauf kurz skizzieren - war es ein durchgehend ausgeglichenes Spiel oder gab es deutliche Phasen? Hebe zwei bis drei besondere Einzelleistungen hervor, wobei du auf die Nennung von Satzergebnissen verzichtest. Konzentriere dich stattdessen darauf, wer besonders überzeugte oder wichtige Punkte holte. Bei Siegen solltest du die Erfolgsfaktoren benennen, bei Niederlagen positive Aspekte und Lichtblicke finden. Schließe den Bericht mit einem kurzen Fazit oder einem Ausblick auf die kommenden Aufgaben ab. Die DJK Sparta Noris Nürnberg sollte im Text als 'wir' oder 'unser Team' bezeichnet werden, während der Gegner beim Vereinsnamen genannt wird. JSON-Daten:" +
      jsonReport,
  });

  return generatedContent.text!;
}

async function generateJSONFromReport(uploadedReport: File) {
  const jsonString = fs.readFileSync("src/matchResultTemplate.json", "utf8");

  const content: ContentListUnion = [
    "Befülle folgendes JSON mit den Daten aus der Datei und gebe mir das JSON als reinen Text zurück, mehr nicht: " +
      jsonString,
  ];
  const fileContent = createPartFromUri(
    uploadedReport.uri!.toString(),
    "application/pdf"
  );
  content.push(fileContent);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    config: { responseMimeType: "application/json" },
  });

  return response.text;
}

async function deleteUploadedFile(uploadedReport: File) {
  await ai.files.delete({ name: uploadedReport.name! });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error("Max retries reached");
}
