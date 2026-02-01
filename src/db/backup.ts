// Backup and restore utilities

import { db } from "./index";
import { songRepository } from "./songRepository";
import { versionRepository } from "./versionRepository";
import type { ExportData, Song, SongVersion } from "@/shared/types";

const EXPORT_VERSION = "1.0.0";

/**
 * Export all data as JSON
 */
export async function exportAllData(): Promise<ExportData> {
  const [songs, versions] = await Promise.all([
    songRepository.getAll(),
    versionRepository.getAll(),
  ]);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    songs,
    versions,
  };
}

/**
 * Export data as downloadable JSON file
 */
export function downloadExport(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ||
    `lets-worship-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 * Merge strategy: if ID exists and imported is newer, overwrite
 */
export async function importData(data: ExportData): Promise<{
  songsImported: number;
  versionsImported: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let songsImported = 0;
  let versionsImported = 0;

  // Validate basic structure
  if (!data.songs || !Array.isArray(data.songs)) {
    errors.push('Formato inválido: "songs" não encontrado ou não é um array');
    return { songsImported, versionsImported, errors };
  }

  if (!data.versions || !Array.isArray(data.versions)) {
    errors.push(
      'Formato inválido: "versions" não encontrado ou não é um array',
    );
    return { songsImported, versionsImported, errors };
  }

  // Import songs first
  for (const song of data.songs as Song[]) {
    try {
      if (!song.id || !song.title) {
        errors.push(`Música inválida: falta id ou título`);
        continue;
      }
      await songRepository.import(song);
      songsImported++;
    } catch (error) {
      errors.push(`Erro ao importar música "${song.title}": ${error}`);
    }
  }

  // Import versions
  for (const version of data.versions as SongVersion[]) {
    try {
      if (!version.id || !version.songId || !version.label) {
        errors.push(`Versão inválida: falta id, songId ou label`);
        continue;
      }

      // Check if parent song exists
      const songExists = await db.songs.get(version.songId);
      if (!songExists) {
        errors.push(
          `Versão "${version.label}" ignorada: música pai não encontrada`,
        );
        continue;
      }

      await versionRepository.import(version);
      versionsImported++;
    } catch (error) {
      errors.push(`Erro ao importar versão "${version.label}": ${error}`);
    }
  }

  return { songsImported, versionsImported, errors };
}

/**
 * Parse JSON file for import
 */
export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportData;
        resolve(data);
      } catch (error) {
        reject(new Error("Arquivo JSON inválido"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };

    reader.readAsText(file);
  });
}
