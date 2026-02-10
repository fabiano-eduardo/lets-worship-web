# Conexão com o Backend

Este documento explica como o frontend Let's Worship se conecta ao backend NestJS GraphQL, como autenticar requests e como validar que a integração está funcionando.

## 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto web com as seguintes variáveis:

```env
# Firebase Auth (obrigatório)
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend GraphQL (obrigatório para sync)
VITE_GRAPHQL_URL=https://sua-api.run.app/graphql
```

### Onde encontrar essas variáveis

- **Firebase**: Console do Firebase > Configurações do Projeto > Seus apps > Web
- **GraphQL URL**: URL da Cloud Function ou Cloud Run onde o backend NestJS está deployado

## 2. Como o Frontend Envia o Token

O frontend usa o Firebase Auth SDK para obter um ID Token JWT fresco antes de cada request GraphQL.

### Código do GraphQL Client

Localizado em `src/graphql/client.ts`:

```typescript
import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated/sdk";
import { auth } from "@/shared/firebase";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

// Obtém token fresco do Firebase (SDK cuida do refresh automaticamente)
async function getIdToken(): Promise<string | null> {
  const currentUser = auth?.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

// Retorna SDK tipado com auth injetado
export function getGraphqlSdk(options?: { requireAuth?: boolean }) {
  const requireAuth = options?.requireAuth ?? true;
  const client = new GraphQLClient(GRAPHQL_URL);

  return getSdk(client, async (action) => {
    const headers: Record<string, string> = {};
    if (requireAuth) {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication required");
      headers["Authorization"] = `Bearer ${token}`;
    }
    return action(headers);
  });
}
```

### Headers Enviados

Toda request autenticada inclui:

```http
POST /graphql HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

{"query": "...", "variables": {...}}
```

## 3. Como o Backend Valida o Token

O backend NestJS usa Firebase Admin SDK para validar o token JWT.

### Fluxo de Validação

1. Guard intercepta a request
2. Extrai o token do header `Authorization: Bearer <token>`
3. Chama `admin.auth().verifyIdToken(token)`
4. Firebase verifica assinatura e expiração
5. Se válido, retorna `{ uid: "user123", email: "user@email.com", ... }`
6. Guard injeta `uid` no contexto GraphQL
7. Resolvers/Services filtram dados por `ownerUid = uid`

### Exemplo de Guard no Backend

```typescript
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = GqlExecutionContext.create(context).getContext().req;
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header",
      );
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = { uid: decodedToken.uid, email: decodedToken.email };
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
```

## 4. Validando a Integração

### Checklist de Validação

#### 4.1. Sem Autenticação

```typescript
// No DevTools console, tente fazer uma query sem estar logado:
const response = await fetch("https://sua-api/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `query { songs { id title } }`,
  }),
});
const data = await response.json();
console.log(data);
// Esperado: { errors: [{ extensions: { code: "UNAUTHENTICATED" } }] }
```

#### 4.2. Com Autenticação

```typescript
// Após fazer login no app:
import { auth } from "@/shared/firebase";

const token = await auth.currentUser?.getIdToken();
console.log("Token:", token); // JWT longo

const response = await fetch("https://sua-api/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `query { songs { id title } }`,
  }),
});
const data = await response.json();
console.log(data);
// Esperado: { data: { songs: [...] } }
```

#### 4.3. Query de Health Check

Se o backend tiver uma query `health`:

```graphql
query {
  health {
    status
    timestamp
    version
  }
}
```

Resposta esperada:

```json
{
  "data": {
    "health": {
      "status": "ok",
      "timestamp": "2026-02-01T12:00:00Z",
      "version": "1.0.0"
    }
  }
}
```

#### 4.4. Verificar Token Refresh

```typescript
// Simule expiração fazendo logout e login novamente
await auth.signOut();
// ... faça login novamente ...
const newToken = await auth.currentUser?.getIdToken();
// O token deve ser diferente do anterior
```

## 5. Fluxo de Sincronização

O app é **local-first**: todas as operações CRUD acontecem primeiro no IndexedDB local, e o sync com o servidor é feito em background quando online.

### Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI (React)    │────>│   IndexedDB     │     │  Backend API    │
│                 │<────│   (Dexie)       │     │  (GraphQL)      │
└─────────────────┘     └────────┬────────┘     └────────▲────────┘
                                 │                       │
                                 │    ┌─────────────┐    │
                                 └───>│ SyncManager │───>┘
                                      │  (outbox)   │
                                      └─────────────┘
```

### Componentes do Sync

| Arquivo                                   | Responsabilidade                |
| ----------------------------------------- | ------------------------------- |
| `src/features/sync/SyncManager.ts`        | Orquestra push/pull e conflitos |
| `src/features/sync/outboxRepository.ts`   | Fila de mutações pendentes      |
| `src/features/sync/conflictRepository.ts` | Gerencia conflitos de sync      |
| `src/features/sync/graphql.ts`            | Queries e mutations de sync     |
| `src/shared/api/graphqlClient.ts`         | Cliente HTTP com autenticação   |

### Fluxo de Push (Local → Servidor)

1. Usuário edita uma música
2. `songRepository.update()` grava no IndexedDB com `dirty: true`
3. `outboxRepository.add()` adiciona item na fila
4. `SyncManager.sync()` é chamado (manual ou auto)
5. Para cada item no outbox:
   - Chama `syncPush` mutation
   - Se sucesso: remove do outbox, atualiza `remoteId` e `remoteRev`
   - Se conflito: cria registro em `conflictRepository`

### Fluxo de Pull (Servidor → Local)

1. `SyncManager.sync()` chama `syncPull` query
2. Passa `cursor` do último sync (armazenado em `syncState`)
3. Backend retorna mudanças desde o cursor
4. Para cada mudança:
   - Se entidade local não está `dirty`: aplica mudança
   - Se entidade local está `dirty`: cria conflito para resolução manual

### Mutations GraphQL de Sync

```graphql
# Push local changes
mutation SyncPush($input: SyncPushInput!) {
  syncPush(input: $input) {
    results {
      mutationId
      status # APPLIED | CONFLICT | REJECTED
      entityId
      newRev
      error
    }
  }
}

# Pull remote changes
query SyncPull($input: SyncPullInput!) {
  syncPull(input: $input) {
    changes {
      entityType # SONG | SONG_VERSION | SECTION_NOTE
      entityId
      op # UPSERT | DELETE
      rev
      entity # JSON da entidade (se UPSERT)
    }
    nextCursor
    hasMore
  }
}
```

## 6. Troubleshooting

### Erro: "UNAUTHENTICATED" mesmo logado

1. Verifique se `auth.currentUser` não é null
2. Confira se `VITE_GRAPHQL_URL` está correto no `.env`
3. Verifique se o backend está usando o mesmo projeto Firebase

### Erro: "Network unavailable"

O app detecta offline automaticamente. Aguarde conexão ou use o app no modo local.

### Token expirado

O Firebase SDK renova o token automaticamente. Se persistir:

1. Faça logout
2. Faça login novamente
3. Tente a operação

### Conflitos de sync

Vá em Configurações > "X conflitos" para resolver manualmente.

## 7. Testando Localmente

### Backend local

```bash
# No diretório do backend
npm run start:dev
# API disponível em http://localhost:4000/graphql
```

### Frontend com backend local

```env
# .env.local
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### Emulador Firebase (opcional)

```bash
# Iniciar emuladores
firebase emulators:start

# Configurar frontend para usar emuladores
# src/shared/firebase/firebase.ts
import { connectAuthEmulator } from "firebase/auth";
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

## 8. Resumo

| Etapa           | Ação                                                |
| --------------- | --------------------------------------------------- |
| **Configurar**  | Setar variáveis de ambiente Firebase + GraphQL URL  |
| **Autenticar**  | Login via Firebase Auth (email/senha ou Google)     |
| **Usar**        | App funciona 100% offline com IndexedDB             |
| **Sincronizar** | Quando online, SyncManager faz push/pull automático |
| **Validar**     | Testar queries com/sem token, verificar respostas   |

Para mais detalhes técnicos, consulte os arquivos fonte em `src/features/sync/` e `src/shared/api/`.
