// Conflict Resolution Page

import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conflictRepository } from "../conflictRepository";
import { db } from "@/db";
import {
  PageHeader,
  Button,
  useToast,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from "@/shared/ui";
import type { SyncConflict } from "@/shared/types";

export function ConflictResolutionPage() {
  const { conflictId } = useParams({ from: "/settings/conflicts/$conflictId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch conflict
  const { data: conflict, isLoading } = useQuery({
    queryKey: ["conflict", conflictId],
    queryFn: async () => {
      const conflicts = await conflictRepository.getUnresolved();
      return conflicts.find((c) => c.id === conflictId);
    },
  });

  // Keep local version
  const keepLocalMutation = useMutation({
    mutationFn: async (conflict: SyncConflict) => {
      // Mark the local entity as dirty to force push
      const table = getTableForEntity(conflict.entityType);
      if (table) {
        const local = conflict.localVersion as { id: string };
        await table.update(local.id, {
          dirty: true,
          updatedAt: new Date().toISOString(),
        });
      }
      await conflictRepository.resolve(conflict.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["versions"] });
      queryClient.invalidateQueries({ queryKey: ["sectionNotes"] });
      showToast("success", "Conflito resolvido", "Versão local mantida.");
      navigate({ to: "/settings" });
    },
    onError: (error) => {
      showToast("error", "Erro", String(error));
    },
  });

  // Accept server version
  const acceptServerMutation = useMutation({
    mutationFn: async (conflict: SyncConflict) => {
      const table = getTableForEntity(conflict.entityType);
      if (table) {
        const remote = conflict.remoteVersion as {
          id: string;
          remoteRev?: number;
        };
        const local = conflict.localVersion as { id: string };
        // Replace local with remote data
        await table.update(local.id, {
          ...remote,
          dirty: false,
        });
      }
      await conflictRepository.resolve(conflict.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["versions"] });
      queryClient.invalidateQueries({ queryKey: ["sectionNotes"] });
      showToast("success", "Conflito resolvido", "Versão do servidor aceita.");
      navigate({ to: "/settings" });
    },
    onError: (error) => {
      showToast("error", "Erro", String(error));
    },
  });

  // Get table for entity type
  function getTableForEntity(entityType: string) {
    switch (entityType) {
      case "song":
        return db.songs;
      case "songVersion":
        return db.versions;
      case "sectionNote":
        return db.sectionNotes;
      default:
        return null;
    }
  }

  // Format entity type
  function formatEntityType(type: string): string {
    switch (type) {
      case "song":
        return "Música";
      case "songVersion":
        return "Versão";
      case "sectionNote":
        return "Nota";
      default:
        return type;
    }
  }

  // Render value comparison
  function renderValueComparison(
    local: Record<string, unknown>,
    remote: Record<string, unknown>,
    key: string,
  ) {
    const localVal = local[key];
    const remoteVal = remote[key];
    const isDifferent = JSON.stringify(localVal) !== JSON.stringify(remoteVal);

    if (!isDifferent) return null;

    // Skip internal fields
    if (["id", "remoteId", "remoteRev", "dirty", "deleted"].includes(key)) {
      return null;
    }

    return (
      <div key={key} className="mb-4">
        <h4 className="text-sm font-medium text-secondary mb-2 capitalize">
          {formatFieldName(key)}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg bg-surface text-sm"
            style={{ borderLeft: "3px solid var(--color-primary)" }}
          >
            <span className="text-xs text-muted block mb-1">Local</span>
            <pre className="whitespace-pre-wrap wrap-break-word">
              {formatValue(localVal)}
            </pre>
          </div>
          <div
            className="p-3 rounded-lg bg-surface text-sm"
            style={{ borderLeft: "3px solid var(--color-warning)" }}
          >
            <span className="text-xs text-muted block mb-1">Servidor</span>
            <pre className="whitespace-pre-wrap wrap-break-word">
              {formatValue(remoteVal)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  function formatFieldName(key: string): string {
    const names: Record<string, string> = {
      title: "Título",
      artist: "Artista",
      label: "Rótulo",
      content: "Conteúdo",
      key: "Tonalidade",
      tempo: "BPM",
      note: "Nota",
      updatedAt: "Atualizado em",
    };
    return names[key] || key;
  }

  function formatValue(val: unknown): string {
    if (val === null || val === undefined) return "(vazio)";
    if (typeof val === "string") {
      if (val.length > 500) return val.substring(0, 500) + "...";
      return val;
    }
    if (typeof val === "object") {
      return JSON.stringify(val, null, 2);
    }
    return String(val);
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Conflito" showBack backTo="/settings" />
        <div className="page">
          <div className="card p-4">
            <p className="text-muted">Carregando...</p>
          </div>
        </div>
      </>
    );
  }

  if (!conflict) {
    return (
      <>
        <PageHeader title="Conflito" showBack backTo="/settings" />
        <div className="page">
          <div className="card p-4">
            <p className="text-error">
              Conflito não encontrado ou já resolvido.
            </p>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate({ to: "/settings" })}
              className="mt-4"
            >
              Voltar para configurações
            </Button>
          </div>
        </div>
      </>
    );
  }

  const local = conflict.localVersion as Record<string, unknown>;
  const remote = conflict.remoteVersion as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  return (
    <>
      <PageHeader title="Resolver Conflito" showBack backTo="/settings" />

      <div className="page">
        {/* Conflict Info */}
        <div className="section">
          <div
            className="card p-4 mb-4"
            style={{ borderColor: "var(--color-warning)" }}
          >
            <div className="flex items-start gap-3">
              <IconAlertTriangle size={24} className="text-warning shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">
                  Conflito em {formatEntityType(conflict.entityType)}
                </h3>
                <p className="text-sm text-secondary">
                  Este item foi modificado tanto localmente quanto no servidor.
                  Compare as versões abaixo e escolha qual manter.
                </p>
              </div>
            </div>
          </div>

          {/* Entity title/label */}
          <div className="card p-4 mb-4">
            <h3 className="font-semibold">
              {(local.title as string) ||
                (local.label as string) ||
                conflict.entityId}
            </h3>
            <p className="text-sm text-muted">ID: {conflict.entityId}</p>
          </div>
        </div>

        {/* Differences */}
        <div className="section">
          <h2 className="section__title">Diferenças</h2>
          <div className="card p-4">
            {Array.from(allKeys).map((key) =>
              renderValueComparison(local, remote, key),
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="section">
          <h2 className="section__title">Resolução</h2>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => keepLocalMutation.mutate(conflict)}
              isLoading={keepLocalMutation.isPending}
              disabled={acceptServerMutation.isPending}
            >
              <IconCheck size={20} />
              Manter minha versão
            </Button>
            <p className="text-xs text-muted px-2">
              A versão local será enviada para o servidor na próxima
              sincronização.
            </p>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => acceptServerMutation.mutate(conflict)}
              isLoading={acceptServerMutation.isPending}
              disabled={keepLocalMutation.isPending}
            >
              <IconX size={20} />
              Aceitar versão do servidor
            </Button>
            <p className="text-xs text-muted px-2">
              Suas alterações locais serão descartadas.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
