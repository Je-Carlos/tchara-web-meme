```
████████╗  ██████╗██╗  ██╗  █████╗  ██████╗   ·~~·
╚══██╔══╝ ██╔════╝██║  ██║ ██╔══██╗ ██╔══██╗  █████╗
   ██║    ██║     ███████║ ███████║ ██████╔╝  ██╔══██╗
   ██║    ██║     ██╔══██║ ██╔══██║ ██╔══██╗  ███████║
   ██║    ╚██████╗██║  ██║ ██║  ██║ ██║  ██║  ██╔══██║
   ╚═╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═╝  ╚═╝  🎁
```

> Monte um presente com foto e frases estilo meme, gere um link e entregue com animação de caixa e confete.

---

## ✨ Como funciona

```
  CRIADOR                              DESTINATÁRIO
  ───────                              ────────────

  1. Arrasta uma imagem          →     Recebe o link
  2. Digita os textos meme       →     Clica na caixa 🎁
  3. Clica em "Gerar link"       →     🎊 Confete + revelação
  4. Compartilha via WhatsApp    →     Vê a imagem com os textos
```

---

## 🔄 Máquina de estados

```
                   upload ok
  editing  ──────────────────►  gift_ready
     ▲      generating (spinner)      │
     │                                │ clique na caixa
     │                                ▼
  [ Criar outro ]              opening (420ms)
     │                                │
     └──────────  gift_open  ◄────────┘
                  (imagem + compartilhar)
```

---

## 🛠️ Stack

| Camada        | Tecnologia                        |
|---------------|-----------------------------------|
| Framework     | Next.js 16 (App Router)           |
| UI            | React 19 + Tailwind CSS v4        |
| Animações     | Framer Motion 12                  |
| Estado        | Zustand 5                         |
| Confete       | canvas-confetti                   |
| Backend       | Supabase (Postgres + Storage)     |
| Linguagem     | TypeScript 5 (strict)             |
| CI / Limpeza  | GitHub Actions (cron diário)      |

---

## 📁 Estrutura

```
web-meme/
├── app/
│   ├── page.tsx                  # Dashboard (tela única)
│   ├── criar/page.tsx            # Redirect → /
│   ├── p/[slug]/page.tsx         # Revelação para o destinatário
│   ├── api/gifts/
│   │   ├── route.ts              # POST – cria presente
│   │   └── [slug]/route.ts      # GET  – busca presente
│   └── globals.css
│
├── components/
│   ├── Dashboard.tsx             # Orquestrador + estado global
│   ├── EditorPanel.tsx           # Painel de edição (esquerda)
│   ├── PreviewPanel.tsx          # Preview / revelação (direita)
│   ├── ImageDropZone.tsx         # Drag-and-drop de imagem
│   ├── ShareActions.tsx          # WhatsApp + copiar link
│   ├── GiftBox.tsx               # Caixa animada (Framer Motion)
│   └── TextOverlay.tsx           # Textos meme sobre a imagem
│
├── lib/
│   ├── store.ts                  # Zustand – cache local do presente
│   ├── gift-api.ts               # Chamadas à API REST
│   ├── confetti.ts               # Helpers de confete
│   ├── validators.ts             # Sanitização e validação
│   ├── config.ts                 # Constantes (TTL, bucket…)
│   ├── ids.ts                    # Gerador de slugs únicos
│   └── supabaseAdmin.ts          # Cliente Supabase (server-only)
│
├── scripts/
│   └── cleanup.ts                # Remove presentes expirados
│
└── .github/workflows/
    └── cleanup.yml               # Cron diário às 06h UTC
```

---

## 🚀 Rodando localmente

### 1. Clone e instale as dependências

```bash
git clone https://github.com/Je-Carlos/web-meme.git
cd web-meme
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)**.

---

## ⚙️ GitHub Actions

O workflow `cleanup.yml` roda **diariamente às 06h00 UTC** e remove do banco e do storage todos os presentes com `expires_at` no passado.

```
Secrets necessários:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Variável opcional (padrão: "gifts"):
  BUCKET_NAME
```

---
