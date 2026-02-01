// Settings page

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStorageStats, clearAllData, getSyncState } from "@/db";
import {
  exportAllData,
  downloadExport,
  importData,
  parseImportFile,
} from "@/db/backup";
import { queryKeys } from "@/app/queryClient";
import {
  PageHeader,
  Button,
  ConfirmModal,
  useToast,
  IconDownload,
  IconUpload,
  IconTrash,
  IconDatabase,
  IconCloud,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconLoader,
} from "@/shared/ui";
import { useSyncStatus, useSync } from "@/features/sync";
import { conflictRepository } from "@/features/sync/conflictRepository";
import { useAuth } from "@/app/auth";
import type { SyncConflict } from "@/shared/types";
import { Link } from "@tanstack/react-router";

export function SettingsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  const { status: syncStatus, lastMessage: syncMessage } = useSyncStatus();
  const { sync, canSync } = useSync();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch storage stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.storage.stats,
    queryFn: getStorageStats,
  });

  // Fetch sync state
  const { data: syncState } = useQuery({
    queryKey: ["syncState"],
    queryFn: getSyncState,
  });

  // Fetch conflicts
  const { data: conflicts = [] } = useQuery({
    queryKey: ["conflicts"],
    queryFn: () => conflictRepository.getUnresolved(),
  });

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      downloadExport(data);
      showToast("success", "Backup exportado!", "O arquivo foi baixado.");
    } catch (error) {
      showToast("error", "Erro ao exportar", String(error));
    } finally {
      setIsExporting(false);
    }
  };

  // Import handler
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await parseImportFile(file);
      const result = await importData(data);

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.storage.stats });

      if (result.errors.length > 0) {
        showToast(
          "warning",
          "Importação concluída com avisos",
          `${result.songsImported} músicas e ${result.versionsImported} versões importadas. ${result.errors.length} erros.`,
        );
        console.warn("Import errors:", result.errors);
      } else {
        showToast(
          "success",
          "Backup importado!",
          `${result.songsImported} músicas e ${result.versionsImported} versões.`,
        );
      }
    } catch (error) {
      showToast("error", "Erro ao importar", String(error));
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Clear data handler
  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();

      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: queryKeys.songs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.versions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.storage.stats });

      showToast(
        "success",
        "Dados limpos",
        "Todos os dados locais foram removidos.",
      );
      setIsClearModalOpen(false);
    } catch (error) {
      showToast("error", "Erro ao limpar dados", String(error));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <PageHeader title="Configurações" />

      <div className="page">
        {/* Cloud Sync */}
        {isAuthenticated && (
          <div className="section">
            <h2 className="section__title">Sincronização na Nuvem</h2>
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-4">
                <IconCloud size={24} className="text-muted" />
                <span className="font-semibold">Status da sincronização</span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mb-4">
                {syncStatus === "syncing" ? (
                  <>
                    <IconLoader
                      size={18}
                      className="text-primary animate-spin"
                    />
                    <span className="text-secondary">Sincronizando...</span>
                  </>
                ) : syncStatus === "success" ? (
                  <>
                    <IconCheck size={18} className="text-success" />
                    <span className="text-secondary">Sincronizado</span>
                  </>
                ) : syncStatus === "error" ? (
                  <>
                    <IconAlertTriangle size={18} className="text-error" />
                    <span className="text-error">Erro na sincronização</span>
                  </>
                ) : (
                  <>
                    <IconCloud size={18} className="text-muted" />
                    <span className="text-secondary">Aguardando</span>
                  </>
                )}
              </div>

              {/* Last sync */}
              {syncState?.lastSyncAt && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-secondary">Última sincronização:</span>
                  <span className="text-muted">
                    {new Date(syncState.lastSyncAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              {/* Pending count */}
              {stats && stats.pendingSync > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-secondary">Pendente:</span>
                  <span className="font-medium text-warning">
                    {stats.pendingSync} alterações
                  </span>
                </div>
              )}

              {/* Error message */}
              {syncStatus === "error" && syncMessage && (
                <p className="text-sm text-error mb-4">{syncMessage}</p>
              )}

              {/* Sync button */}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => sync()}
                disabled={!canSync}
                isLoading={syncStatus === "syncing"}
              >
                <IconRefresh size={20} />
                Sincronizar agora
              </Button>
            </div>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div
                className="card p-4 mt-4"
                style={{ borderColor: "var(--color-warning)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <IconAlertTriangle size={20} className="text-warning" />
                  <span className="font-semibold text-warning">
                    {conflicts.length} conflito{conflicts.length > 1 ? "s" : ""}{" "}
                    pendente{conflicts.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-secondary mb-3">
                  Houve alterações conflitantes entre o servidor e este
                  dispositivo.
                </p>
                <ul className="flex flex-col gap-2">
                  {conflicts.slice(0, 5).map((conflict: SyncConflict) => (
                    <li key={conflict.id} className="text-sm">
                      <Link
                        to="/settings/conflicts/$conflictId"
                        params={{ conflictId: conflict.id }}
                        className="text-primary hover:underline"
                      >
                        {conflict.entityType === "song"
                          ? "Música"
                          : conflict.entityType === "songVersion"
                            ? "Versão"
                            : "Nota"}
                        :{" "}
                        {(
                          conflict.localVersion as {
                            title?: string;
                            label?: string;
                          }
                        ).title ||
                          (
                            conflict.localVersion as {
                              title?: string;
                              label?: string;
                            }
                          ).label ||
                          conflict.entityId}
                      </Link>
                    </li>
                  ))}
                </ul>
                {conflicts.length > 5 && (
                  <p className="text-sm text-muted mt-2">
                    E mais {conflicts.length - 5} conflitos...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Storage info */}
        <div className="section">
          <h2 className="section__title">Armazenamento</h2>
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-4">
              <IconDatabase size={24} className="text-muted" />
              <span className="font-semibold">Dados locais</span>
            </div>

            {statsLoading ? (
              <p className="text-muted">Carregando...</p>
            ) : stats ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-secondary">Músicas:</span>
                  <span className="font-medium">{stats.songsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Versões:</span>
                  <span className="font-medium">{stats.versionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Offline (fixadas):</span>
                  <span className="font-medium">{stats.pinnedCount}</span>
                </div>
                {stats.notesCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Notas:</span>
                    <span className="font-medium">{stats.notesCount}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">Erro ao carregar estatísticas</p>
            )}
          </div>
        </div>

        {/* Backup / Restore */}
        <div className="section">
          <h2 className="section__title">Backup e Restauração</h2>

          <div className="flex flex-col gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleExport}
              isLoading={isExporting}
            >
              <IconDownload size={20} />
              Exportar backup (JSON)
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={handleImportClick}
              isLoading={isImporting}
            >
              <IconUpload size={20} />
              Importar backup
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <p className="text-sm text-muted mt-2">
              O backup inclui todas as músicas e versões. Ao importar, dados
              existentes com o mesmo ID serão atualizados se a versão importada
              for mais recente.
            </p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="section">
          <h2
            className="section__title"
            style={{ color: "var(--color-error)" }}
          >
            Zona de perigo
          </h2>

          <div
            className="card p-4"
            style={{ borderColor: "var(--color-error)" }}
          >
            <p className="text-secondary mb-4">
              Atenção: estas ações são irreversíveis. Faça um backup antes.
            </p>

            <Button
              variant="danger"
              fullWidth
              onClick={() => setIsClearModalOpen(true)}
            >
              <IconTrash size={20} />
              Limpar todos os dados
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="section">
          <h2 className="section__title">Sobre</h2>

          <div className="card p-4">
            <h3 className="font-semibold text-lg mb-2">Let's worship</h3>
            <p className="text-secondary text-sm mb-4">
              Catálogo de canções para ministério de louvor com cifras,
              transposição e acesso offline.
            </p>

            <div className="text-sm text-muted">
              <p>Versão: 1.0.0</p>
              <p>Offline-first PWA</p>
            </div>
          </div>
        </div>

        {/* Future features placeholder */}
        <div className="section">
          <h2 className="section__title">Em breve</h2>

          <div className="card p-4">
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>• Compartilhamento de versões</li>
              <li>• Setlists e planejamento de culto</li>
              <li>• Busca por tonalidade/BPM</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Clear data confirmation */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearData}
        title="Limpar todos os dados"
        message="Tem certeza que deseja remover TODAS as músicas e versões? Esta ação não pode ser desfeita. Recomendamos fazer um backup antes."
        confirmLabel="Limpar tudo"
        variant="danger"
        isLoading={isClearing}
      />
    </>
  );
}
