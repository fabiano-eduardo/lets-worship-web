// Settings page — Online-first

import { useState } from "react";
import { useAuth } from "@/app/auth";
import {
  PageHeader,
  Button,
  ConfirmModal,
  useToast,
  IconDatabase,
  IconLogOut,
  IconTrash,
  IconRefresh,
} from "@/shared/ui";
import {
  useOfflineLibrary,
  useUpdateOffline,
  useRemoveOffline,
} from "@/features/offline";
import type { OfflineMetaEntry } from "@/features/offline";

export function SettingsPage() {
  const { showToast } = useToast();
  const { isAuthenticated, user, signOut } = useAuth();

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: offlineItems = [], isLoading: offlineLoading } =
    useOfflineLibrary();
  const updateOffline = useUpdateOffline();
  const removeOffline = useRemoveOffline();
  const [checkingAll, setCheckingAll] = useState(false);

  // Sign out handler
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      showToast("success", "Até logo!", "Você foi desconectado.");
      setIsSignOutModalOpen(false);
    } catch (error) {
      showToast("error", "Erro ao sair", String(error));
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleUpdateAll = async () => {
    setCheckingAll(true);
    try {
      let updatedCount = 0;
      for (const item of offlineItems) {
        const result = await updateOffline.mutateAsync(item.versionId);
        if (result.updated) updatedCount++;
      }
      showToast(
        "success",
        updatedCount > 0
          ? `${updatedCount} itens atualizados`
          : "Tudo atualizado!",
      );
    } catch (error) {
      showToast("error", "Erro ao verificar atualizações", String(error));
    } finally {
      setCheckingAll(false);
    }
  };

  const handleRemoveOffline = async (versionId: string) => {
    try {
      await removeOffline.mutateAsync(versionId);
      showToast("success", "Removido do offline");
    } catch (error) {
      showToast("error", "Erro ao remover", String(error));
    }
  };

  return (
    <>
      <PageHeader title="Configurações" />

      <div className="page">
        {/* Account */}
        {isAuthenticated && user && (
          <div className="section">
            <h2 className="section__title">Conta</h2>
            <div className="card p-4">
              <div className="flex items-center gap-4 mb-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center">
                    <span className="text-xl font-semibold text-muted">
                      {user.displayName?.[0] || user.email?.[0] || "?"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {user.displayName && (
                    <p className="font-semibold truncate">{user.displayName}</p>
                  )}
                  <p className="text-sm text-muted truncate">{user.email}</p>
                </div>
              </div>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => setIsSignOutModalOpen(true)}
              >
                <IconLogOut size={20} />
                Sair da conta
              </Button>
            </div>
          </div>
        )}

        {/* Offline Library */}
        <div className="section">
          <h2 className="section__title">Biblioteca Offline</h2>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconDatabase size={24} className="text-muted" />
                <span className="font-semibold">Itens disponíveis offline</span>
              </div>
              {offlineItems.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUpdateAll}
                  disabled={checkingAll}
                  isLoading={checkingAll}
                >
                  <IconRefresh size={16} />
                  Verificar
                </Button>
              )}
            </div>

            {offlineLoading ? (
              <p className="text-muted">Carregando...</p>
            ) : offlineItems.length === 0 ? (
              <p className="text-muted text-sm">
                Nenhum item disponível offline. Use o botão de pin (📌) nas
                versões para baixá-las para acesso offline.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {offlineItems.map((item: OfflineMetaEntry) => (
                  <div
                    key={item.versionId}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-hover"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.songTitle}</p>
                      <p className="text-sm text-muted truncate">
                        {item.versionLabel}
                      </p>
                      <p className="text-xs text-muted">
                        Baixado em{" "}
                        {new Date(item.downloadedAt).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        ·{" "}
                        {item.sizeBytes < 1024
                          ? `${item.sizeBytes} B`
                          : `${Math.round(item.sizeBytes / 1024)} KB`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOffline(item.versionId)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              <p>Online-first PWA</p>
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

      {/* Sign out confirmation */}
      <ConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
        title="Sair da conta"
        message="Você será desconectado. Seus dados estão salvos no servidor e poderão ser acessados em outro dispositivo."
        confirmLabel="Sair"
        variant="primary"
        isLoading={isSigningOut}
      />
    </>
  );
}
