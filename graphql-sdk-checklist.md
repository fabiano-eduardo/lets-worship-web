# GraphQL SDK Migration Checklist

## Migração: fetch manual → graphql-request + getSdk

### Arquivos migrados

| Arquivo                                      | Status      | Notas                                  |
| -------------------------------------------- | ----------- | -------------------------------------- |
| `src/graphql/fetcher.ts`                     | ✅ Removido | Substituído por `client.ts`            |
| `src/graphql/hooks.ts`                       | ✅ Removido | Hooks genéricos não mais necessários   |
| `src/shared/api/graphqlClient.ts`            | ✅ Removido | Substituído por `client.ts`            |
| `src/features/songs/hooks/useSongs.ts`       | ✅ Migrado  | Usa `songsApi` via fachada             |
| `src/features/versions/hooks/useVersions.ts` | ✅ Migrado  | Usa `versionsApi` via fachada          |
| `src/features/offline/offlineManager.ts`     | ✅ Migrado  | Usa fachada `getSong`/`getSongVersion` |
| `src/features/offline/offlineStore.ts`       | ✅ Migrado  | Tipos agora de `sdk.ts`                |

### Operações cobertas

| Operação            | Fachada             | Status |
| ------------------- | ------------------- | ------ |
| Songs               | `songsApi.ts`       | ✅     |
| Song                | `songsApi.ts`       | ✅     |
| CreateSong          | `songsApi.ts`       | ✅     |
| UpdateSong          | `songsApi.ts`       | ✅     |
| DeleteSong          | `songsApi.ts`       | ✅     |
| SongVersions        | `versionsApi.ts`    | ✅     |
| SongVersion         | `versionsApi.ts`    | ✅     |
| CreateSongVersion   | `versionsApi.ts`    | ✅     |
| UpdateSongVersion   | `versionsApi.ts`    | ✅     |
| DeleteSongVersion   | `versionsApi.ts`    | ✅     |
| MePreferences       | `preferencesApi.ts` | ✅     |
| UpdateMePreferences | `preferencesApi.ts` | ✅     |
| Health              | `healthApi.ts`      | ✅     |

### Regra de bloqueio

- ❌ Não pode restar `fetch` GraphQL em `src/` (exceto `scripts/`).
- Verificado via `npm run check:graphql`.

### Novos arquivos

- `src/graphql/client.ts` — Cliente central com auth e erro normalizado
- `src/graphql/api/songsApi.ts` — Fachada de songs
- `src/graphql/api/versionsApi.ts` — Fachada de versions
- `src/graphql/api/preferencesApi.ts` — Fachada de preferences
- `src/graphql/api/healthApi.ts` — Fachada de health
- `src/graphql/api/index.ts` — Barrel export
- `src/graphql/generated/sdk.ts` — SDK gerado pelo codegen
