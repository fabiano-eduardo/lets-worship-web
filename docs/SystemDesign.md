# Let's worship - System Design Document

## 1. Visão Geral

**Let's worship** é uma aplicação web mobile-first para catálogo de canções de louvor. O sistema permite gerenciar músicas, versões com cifras, transposição automática de acordes e funciona completamente offline.

### 1.1 Objetivos

- **Mobile-first**: Interface otimizada para uso em smartphones durante ensaios e cultos
- **Offline-first**: Funciona sem internet, com sincronização futura
- **Simplicidade**: Fácil de usar para músicos e líderes de louvor
- **Flexibilidade**: Suporta múltiplas versões de uma música com arranjos diferentes

### 1.2 Stack Tecnológico

| Camada         | Tecnologia            | Justificativa                                  |
| -------------- | --------------------- | ---------------------------------------------- |
| Framework      | React 18 + TypeScript | Maturidade, tipagem forte, ecossistema         |
| Build          | Vite                  | Velocidade de dev, suporte a PWA               |
| Roteamento     | TanStack Router       | Type-safe, file-based routes                   |
| Estado/Queries | TanStack Query        | Cache, invalidação, mesmo para dados locais    |
| Persistência   | Dexie (IndexedDB)     | API simples, queries poderosas, offline nativo |
| PWA            | vite-plugin-pwa       | Service worker, cache, manifest                |
| Deploy         | Vercel                | SSG/SPA suporte, edge functions futuras        |

---

## 2. Modelo de Dados

### 2.1 Entidades Principais

```
Song (Música)
├── id: string (uuid)
├── title: string
├── artist: string | null
├── defaultVersionId: string | null
├── createdAt: ISO string
├── updatedAt: ISO string
└── [sync fields]

SongVersion (Versão)
├── id: string (uuid)
├── songId: string (FK)
├── label: string
├── reference: VersionReference
├── musicalMeta: MusicalMeta
├── arrangement: VersionArrangement
├── pinnedOffline: boolean
├── createdAt: ISO string
├── updatedAt: ISO string
└── [sync fields]
```

### 2.2 Estrutura do Arranjo (VersionArrangement)

```typescript
interface VersionArrangement {
  sections: SectionBlock[]; // Seções com letra e acordes
  sequence: SequenceItem[]; // Ordem de execução
}

interface SectionBlock {
  id: string;
  name: string; // "V1", "Refrão", "Ponte"
  chordProText: string; // Letra com acordes inline
  notes: SectionNote[]; // Observações/dinâmica
}

interface SequenceItem {
  sectionId: string;
  repeat?: number; // Quantidade de repetições
  sequenceNotes?: string[];
}
```

### 2.3 Por que ChordPro-like?

O formato ChordPro-like (`[C]palavra [G]outra`) foi escolhido por:

1. **Simplicidade de edição**: Usuário digita texto normal com acordes em colchetes
2. **Portabilidade**: Formato texto puro, fácil de exportar/importar
3. **Transposição**: Parser identifica acordes e aplica transposição
4. **Renderização**: Fácil converter para visualização "acorde em cima"

Exemplo:

```
[C]Eu amo Je[G]sus
[Am]Meu Rei e Se[F]nhor
```

Renderiza como:

```
C        G
Eu amo Jesus
Am          F
Meu Rei e Senhor
```

### 2.4 Sistema de Tonalidade (KeySignature)

Suporta dois tipos:

```typescript
type KeySignature =
  | { type: "tonal"; root: NoteName; tonalQuality: "major" | "minor" }
  | { type: "modal"; root: NoteName; mode: ModalMode };
```

Modos suportados: ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian

### 2.5 Campos de Sincronização (Sync Fields)

Cada entidade possui campos para sincronização futura:

```typescript
interface SyncFields {
  remoteId?: string; // ID no servidor
  dirty?: boolean; // Modificado localmente
  deleted?: boolean; // Soft delete para sync
  lastSyncedAt?: string; // Timestamp da última sync
}
```

---

## 3. Estratégia Offline

### 3.1 PWA (Progressive Web App)

Configurado via `vite-plugin-pwa`:

- **Service Worker**: Cache do app shell (HTML, CSS, JS, assets)
- **Manifest**: Nome, ícones, tema, orientação
- **Instalável**: Pode ser adicionado à home screen

### 3.2 IndexedDB via Dexie

```typescript
// Schema do banco
songs: "id, title, artist, defaultVersionId, createdAt, updatedAt, remoteId, dirty, deleted";
versions: "id, songId, label, pinnedOffline, createdAt, updatedAt, remoteId, dirty, deleted";
```

### 3.3 TanStack Query com Dados Locais

```typescript
// Exemplo de query local
export function useSongs() {
  return useQuery({
    queryKey: ["songs", "list"],
    queryFn: () => songRepository.getAll(),
  });
}

// Mutations invalidam queries
export function useCreateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => songRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}
```

Benefícios:

- Cache automático
- Loading/error states
- Invalidação declarativa
- Preparação para backend futuro (trocar queryFn)

### 3.4 Pin/Unpin (Offline)

O campo `pinnedOffline` indica se uma versão deve ser destacada como "disponível offline". Como todos os dados já são locais, esta flag serve para:

1. Destacar versões importantes na UI
2. Futuro: Priorizar sync dessas versões
3. Futuro: Manter em cache mesmo com limpeza de espaço

---

## 4. Transposição de Acordes

### 4.1 Parser de Acordes

```typescript
// Regex para parsing
/^([A-G])([#b]?)([^/]*)?(?:\/([A-G])([#b]?))?$/;

// Estrutura parseada
interface ParsedChord {
  root: string; // "C", "D#", "Bb"
  quality: string; // "m", "7", "maj7", "add9"
  bass?: string; // Para slash chords: "B" em "G/B"
  original: string; // String original
}
```

### 4.2 Acordes Suportados

- Maiores: C, D, E, F, G, A, B
- Menores: Cm, Dm, Em, etc.
- Sétimas: C7, Cmaj7, Cm7, Cdim7
- Extensões: Cadd9, C9, C11, C13
- Suspensos: Csus2, Csus4
- Diminutos/Aumentados: Cdim, C°, Caug, C+
- Power chords: C5
- Slash chords: G/B, D/F#
- Acidentais: C#, Db, F#m, Bbmaj7

### 4.3 Algoritmo de Transposição

```typescript
function transposeChordProText(
  text: string,
  fromKey: NoteName,
  toKey: NoteName,
): string {
  const semitones = getSemitonesBetween(fromKey, toKey);
  const preferFlats = shouldUseFlats(toKey);

  return text.replace(/\[([^\]]+)\]/g, (_, chord) => {
    const parsed = parseChord(chord);
    if (!parsed) return `[${chord}]`; // Mantém desconhecidos
    return `[${transposeParsedChord(parsed, semitones, preferFlats)}]`;
  });
}
```

### 4.4 Preferência Sharps vs Flats

Regra simples implementada:

- Se tom alvo contém "b" → usa flats (Bb, Eb, Ab)
- Se tom alvo contém "#" → usa sharps (C#, F#, G#)
- Tons naturais → sharps por padrão

---

## 5. Arquitetura de Código

### 5.1 Estrutura de Pastas

```
src/
├── app/                    # Bootstrap da aplicação
│   ├── App.tsx            # Providers wrapper
│   ├── router.ts          # TanStack Router config
│   └── queryClient.ts     # TanStack Query config
├── routes/                 # File-based routes
│   ├── __root.tsx         # Layout root
│   ├── index.tsx          # Redirect para /songs
│   ├── songs/
│   │   ├── index.tsx
│   │   ├── new.tsx
│   │   └── $songId/
│   └── settings.tsx
├── features/               # Feature modules
│   ├── songs/
│   │   ├── hooks/
│   │   └── pages/
│   ├── versions/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── components/
│   │   └── utils/
│   └── settings/
├── shared/                 # Código compartilhado
│   ├── ui/                # Componentes UI + estilos
│   ├── hooks/             # Hooks genéricos
│   └── types/             # TypeScript types
├── db/                    # IndexedDB
│   ├── index.ts           # Dexie setup
│   ├── songRepository.ts
│   ├── versionRepository.ts
│   └── backup.ts
└── main.tsx               # Entry point
```

### 5.2 Convenções

- **Naming**: camelCase para funções/variáveis, PascalCase para componentes/tipos
- **Hooks**: Prefixo `use` (ex: `useSongs`, `useCreateVersion`)
- **Repositories**: Acesso a dados via repository pattern
- **Queries**: Keys centralizadas em `queryClient.ts`

---

## 6. Estratégia Futura de Sync (GraphQL)

### 6.1 Modelo de Conflito

Proposta para resolução de conflitos:

1. **Last Write Wins** (padrão simples):
   - Compara `updatedAt` local vs remoto
   - Versão mais recente ganha

2. **Merge por Campo** (complexo, futuro):
   - Compara cada campo individualmente
   - Conflitos reais apresentados ao usuário

### 6.2 Fluxo de Sync Proposto

```
1. Pull: Buscar mudanças do servidor desde lastSyncedAt
2. Merge: Aplicar mudanças remotas (respeitar conflitos)
3. Push: Enviar itens dirty=true para servidor
4. Confirm: Limpar flags dirty e atualizar lastSyncedAt
```

### 6.3 Preparação Atual

- Campos `dirty`, `deleted`, `remoteId`, `lastSyncedAt` já existem
- Soft delete implementado (não remove do IndexedDB)
- Queries via TanStack Query (fácil trocar queryFn)

---

## 7. Decisões e Trade-offs

### 7.1 O que foi implementado

✅ CRUD completo de músicas e versões
✅ Editor ChordPro-like com preview
✅ Transposição automática de acordes
✅ Suporte a tonalidades tonais e modais
✅ PWA com service worker
✅ IndexedDB para persistência offline
✅ Export/Import JSON para backup
✅ Modo apresentação (tela limpa)
✅ UI mobile-first com tema escuro

### 7.2 O que ficou de fora (futuro)

❌ Autenticação/multi-usuário
❌ Sincronização com backend
❌ Setlists e planejamento de culto
❌ Compartilhamento de versões
❌ Busca avançada (por tonalidade, BPM)
❌ Impressão/PDF
❌ Auto-scroll sincronizado com áudio
❌ Detecção automática de acordes

### 7.3 Trade-offs

| Decisão              | Alternativa             | Justificativa             |
| -------------------- | ----------------------- | ------------------------- |
| ChordPro inline      | MusicXML                | Simplicidade > precisão   |
| Dexie                | LocalForage             | Queries melhores, tipagem |
| CSS vanilla          | Tailwind                | Controle, sem build extra |
| Dark theme único     | Light/Dark              | Foco, menos código        |
| Sharps/flats simples | Teoria musical completa | Pragmatismo               |

---

## 8. Autenticação e Autorização

### 8.1 Firebase Authentication

O sistema utiliza Firebase Authentication para gerenciar usuários:

```
┌─────────────────────────────────────────────────────────┐
│                    Firebase Auth                        │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐                    │
│  │   Email/    │    │   Google    │                    │
│  │  Password   │    │    OAuth    │                    │
│  └─────────────┘    └─────────────┘                    │
│           │                │                            │
│           └───────┬────────┘                            │
│                   ▼                                     │
│          ┌──────────────┐                              │
│          │   ID Token   │                              │
│          │    (JWT)     │                              │
│          └──────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

**Métodos de login suportados:**

- Email e senha
- Google OAuth (popup no desktop, redirect no mobile)

### 8.2 Fluxo de Autenticação

```
1. Usuário acessa rota protegida
   │
   ▼
2. beforeLoad verifica contexto auth
   │
   ├── Não autenticado → Redirect para /login?redirect=<path>
   │
   └── Autenticado → Permite acesso

3. Login bem-sucedido
   │
   ▼
4. Firebase SDK gerencia token (auto-refresh)
   │
   ▼
5. Redirect para página original (ou /songs)
```

### 8.3 Proteção de Rotas (TanStack Router)

```typescript
// Rotas públicas: /login
// Rotas protegidas: todas as outras

// Cada rota protegida usa beforeLoad:
export const Route = createRoute({
  // ...
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.pathname);
  },
});
```

### 8.4 Injeção de Token no GraphQL

```typescript
// Toda request GraphQL inclui Authorization header
async function graphqlFetch<T>(query: string, variables?: any): Promise<T> {
  // 1. Obtém token SEMPRE fresco do SDK (auto-refresh)
  const token = await auth.currentUser?.getIdToken();

  // 2. Injeta no header
  headers["Authorization"] = `Bearer ${token}`;

  // 3. Faz request
  return fetch(GRAPHQL_URL, { ... });
}
```

**Importante**: Nunca armazenamos tokens manualmente. O Firebase SDK gerencia:

- Persistência local (usando IndexedDB interno)
- Refresh automático antes de expirar
- Recuperação de sessão após reload

### 8.5 Comportamento Offline com Auth

```
┌─────────────────────────────────────────────────────────┐
│                    Estado da Aplicação                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Online + Autenticado                                   │
│  ├── Sync habilitado                                    │
│  ├── Indicador verde no header                          │
│  └── Todas as features disponíveis                      │
│                                                         │
│  Online + Não Autenticado                               │
│  ├── Redirect para /login                               │
│  ├── Não pode acessar rotas protegidas                  │
│  └── Banner "Faça login para sincronizar"               │
│                                                         │
│  Offline + Autenticado                                  │
│  ├── Acesso total aos dados locais (IndexedDB)          │
│  ├── Indicador vermelho "Offline"                       │
│  ├── Sync pausado até voltar online                     │
│  └── Mudanças marcadas como "dirty" para sync futuro    │
│                                                         │
│  Offline + Não Autenticado                              │
│  ├── Acesso aos dados locais (se existirem)             │
│  ├── Indicador "Offline - Login necessário"             │
│  └── Funcionalidade limitada                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.6 Tratamento de Erros de Auth

| Erro                       | Ação                               |
| -------------------------- | ---------------------------------- |
| Token expirado             | SDK faz refresh automático         |
| UNAUTHENTICATED do GraphQL | Força logout, redirect para /login |
| Sessão expirada            | Mostra toast, redirect para /login |
| Erro de rede               | Opera offline com dados locais     |

---

## 9. Performance

### 9.1 Otimizações Implementadas

- **Code splitting**: TanStack Router lazy loading por rota
- **Query caching**: TanStack Query com staleTime de 5 min
- **Rendering**: Memoização onde necessário
- **PWA caching**: Assets em cache pelo service worker

### 9.2 Métricas Alvo

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse PWA: 100
- Funciona 100% offline após primeira visita

---

## 10. Segurança

### 10.1 Autenticação

- **Firebase Auth**: Provedor de identidade confiável
- **ID Tokens JWT**: Verificados no backend
- **Session persistence**: Gerenciado pelo Firebase SDK (não manual)
- **Sem tokens em localStorage/IndexedDB**: Usamos apenas o SDK

### 10.2 Autorização

- Rotas protegidas via TanStack Router beforeLoad
- Backend valida token em cada request GraphQL
- Dados isolados por usuário no backend

### 10.3 Boas Práticas

- HTTPS obrigatório em produção
- Sanitização de inputs (validação Zod)
- Headers de segurança (CSP, X-Frame-Options)
- Rate limiting no backend GraphQL

### 10.4 PWA/Service Worker

- Service worker não intercepta requests GraphQL autenticados
- Evita cache de respostas com dados sensíveis
- Apenas assets estáticos são cacheados
