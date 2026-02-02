# Let's worship 🎵

Catálogo de canções para ministério de louvor com cifras, transposição automática e suporte offline.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Projeto Firebase com Authentication habilitado (opcional)

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd web

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase

# Rode em modo desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 🔐 Configuração Firebase

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **Project Settings** > **General**
4. Na seção "Your apps", adicione um **Web app**
5. Copie as credenciais de configuração

### 2. Habilitar Authentication

1. No Firebase Console, vá em **Authentication** > **Sign-in method**
2. Habilite os provedores desejados:
   - **Email/Password**: Ative
   - **Google**: Ative e configure o OAuth consent screen

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# GraphQL Backend (opcional)
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### 4. Configurar Domínios Autorizados

No Firebase Console:

1. Vá em **Authentication** > **Settings** > **Authorized domains**
2. Adicione os domínios onde o app será hospedado:
   - `localhost` (já incluso)
   - `seu-app.vercel.app`
   - Seu domínio personalizado

### Rodando sem Firebase (modo offline)

O app funciona sem Firebase configurado, mas:

- Não haverá autenticação
- O acesso será livre a todas as rotas
- Dados são salvos apenas localmente (IndexedDB)

## 📦 Scripts

| Comando                    | Descrição                        |
| -------------------------- | -------------------------------- |
| `npm run dev`              | Servidor de desenvolvimento      |
| `npm run build`            | Build de produção                |
| `npm run preview`          | Preview do build                 |
| `npm run lint`             | Executa ESLint                   |
| `npm run check`            | Build + verificação de tipos     |
| `npm run graphql:codegen`  | Gera tipos TypeScript do GraphQL |
| `npm run graphql:schema`   | Baixa o schema do backend        |
| `npm run diagnose:backend` | Executa diagnóstico de conexão   |

## 🔌 GraphQL

O app usa GraphQL para comunicação com o backend de sincronização.

### Configuração

Configure a URL do backend no `.env`:

```env
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

### Gerando Tipos

Os tipos TypeScript são gerados automaticamente a partir do schema do backend:

```bash
npm run graphql:codegen
```

Isso gera `src/graphql/generated/graphql.ts` com:

- Tipos para todas as queries e mutations
- TypedDocumentNode para type-safety total
- Fragmentos reutilizáveis

### Obtendo Token de Autenticação para Codegen

Se o backend exige autenticação para introspecção:

1. Abra o app no browser e faça login
2. Abra o console (F12)
3. Execute:
   ```javascript
   await (await import("firebase/auth")).getAuth().currentUser.getIdToken();
   ```
4. Copie o token e configure:
   ```bash
   export CODEGEN_AUTH_TOKEN="seu-token-aqui"
   npm run graphql:codegen
   ```

### Diagnóstico de Conexão

Para verificar se o backend está funcionando:

```bash
npm run diagnose:backend
```

Isso verifica:

- ✅ Conectividade de rede
- ✅ CORS configurado corretamente
- ✅ Health check (se disponível)
- ✅ Introspecção do schema
- ✅ Autenticação (se token fornecido)
- ✅ Queries autenticadas (songs, syncPull)

**Exemplo de saída:**

```
╔═══════════════════════════════════════════════════════════════╗
║       Let's Worship - Backend Diagnostic Report               ║
╚═══════════════════════════════════════════════════════════════╝

📍 GraphQL URL: http://localhost:3000/graphql
🔐 Auth Token:  Provided
⏰ Timestamp:   2026-02-01T05:00:00.000Z

✅ Network Connectivity [50ms]
✅ CORS Headers Check [5ms]
✅ Schema Introspection (without auth) [10ms]
✅ Songs Query (authenticated) [25ms]

═════════════════════════════════════════════════════════════════
SUMMARY: 4 passed, 0 failed
═════════════════════════════════════════════════════════════════
```

### Mapa de Problemas Comuns

| Erro                   | Causa Provável                         | Correção                                                    |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------- |
| `ECONNREFUSED`         | Backend não está rodando               | Inicie o backend                                            |
| HTTP 404               | URL do GraphQL incorreta               | Verifique `VITE_GRAPHQL_URL`                                |
| CORS error             | Backend não permite origem do frontend | Adicione `http://localhost:5173` ao CORS_ORIGINS no backend |
| `UNAUTHENTICATED`      | Token ausente ou expirado              | Faça login e obtenha token novo                             |
| `Cannot query field X` | Schema divergente                      | Rode `npm run graphql:codegen` para regenerar tipos         |
| Introspection disabled | Introspecção desabilitada em prod      | Habilite em dev ou baixe schema manualmente                 |

## 🏗️ Build de Produção

```bash
npm run build
```

Os arquivos são gerados em `dist/`. O build inclui:

- Bundle otimizado com code splitting
- Service worker para PWA
- Manifest para instalação
- Assets com hash para cache busting

## 🚀 Deploy (Vercel)

### Via Vercel CLI

```bash
# Instale a CLI
npm i -g vercel

# Deploy
vercel
```

### Via GitHub

1. Conecte o repositório no [Vercel Dashboard](https://vercel.com)
2. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Deploy automático a cada push

### Configuração SPA

O arquivo `vercel.json` já está configurado para SPA:

```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

## 📱 PWA (Progressive Web App)

### Instalação no Dispositivo

1. Acesse o app no navegador mobile
2. Toque em "Adicionar à Tela Inicial" (ou "Instalar")
3. O app funciona como um aplicativo nativo

### Funcionalidades Offline

- ✅ App funciona 100% sem internet (após primeira visita)
- ✅ Todos os dados salvos localmente (IndexedDB)
- ✅ Service worker cacheia assets
- ✅ Atualização automática quando há nova versão

### Testando PWA Localmente

```bash
npm run build
npm run preview
```

O preview serve o build com service worker ativo.

## 📁 Estrutura do Projeto

```
src/
├── app/              # Bootstrap (App, Router, QueryClient)
├── routes/           # Rotas (TanStack Router)
├── features/         # Módulos de funcionalidade
│   ├── songs/       # CRUD de músicas
│   ├── versions/    # Versões com cifras
│   └── settings/    # Configurações e backup
├── shared/           # Código compartilhado
│   ├── ui/          # Componentes e estilos
│   ├── hooks/       # Hooks genéricos
│   └── types/       # TypeScript types
├── db/               # IndexedDB (Dexie)
└── main.tsx          # Entry point
```

## ✨ Funcionalidades

### Músicas

- Criar, editar e excluir músicas
- Organizar por título e artista
- Múltiplas versões por música

### Versões com Cifras

- Formato ChordPro-like: `[C]letra [G]com acordes`
- Divisão em seções (Verso, Refrão, Ponte)
- Sequência de execução personalizável
- Notas e dinâmica por seção

### Transposição

- Transpor acordes automaticamente
- Suporta todos os acordes (7, maj7, sus, dim, aug, slash)
- Tonalidades maiores, menores e modais

### Visualização

- Modo edição: editar ChordPro diretamente
- Modo visualização: acordes alinhados sobre a letra
- Modo apresentação: tela limpa para performance

### Backup

- Exportar todos os dados em JSON
- Importar backup (merge ou substituição)
- Estatísticas de armazenamento

## 🎵 Formato ChordPro

Digite letra com acordes entre colchetes:

```
[C]Amazing [G]grace how [Am]sweet the [F]sound
[C]That saved a [G]wretch like [C]me
```

Renderiza como:

```
C        G           Am        F
Amazing grace how sweet the sound
C           G             C
That saved a wretch like me
```

## 🔧 Configuração de Desenvolvimento

### TypeScript

Strict mode habilitado. Configuração em `tsconfig.json`.

### ESLint

```bash
npm run lint
```

### Verificação de Tipos

```bash
npm run type-check
```

## 📖 Documentação Adicional

- [System Design](docs/SystemDesign.md) - Arquitetura e decisões técnicas

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT © 2024
