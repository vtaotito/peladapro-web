# DNS: `admin.peladapro.cloud`

Este ficheiro descreve o registo a criar no painel DNS do domínio (ex.: Hostinger → **Domínios** → **DNS / Zona DNS**).

## Registo

| Campo | Valor |
|--------|--------|
| **Tipo** | `A` |
| **Nome** | `admin` (ou `admin.peladapro.cloud`, conforme o painel — o importante é o hostname final ser `admin.peladapro.cloud`) |
| **Aponta para / Conteúdo** | O **mesmo IPv4** que já usas para `peladapro.cloud` ou `www` (o IP público do VPS onde corre o Next.js atrás do Nginx proxy) |
| **TTL** | Padrão |

**Não** coloques segredos (senha do painel ADM) em ficheiros Git — define-os só no servidor ou nas variáveis do teu fluxo de build.

## Depois do DNS

1. Espera a propagação e testa: `https://admin.peladapro.cloud` (deve abrir o painel).
2. Se o SSL falhar, no servidor garante que o Certbot inclui `admin.peladapro.cloud` (já referido em `infra/docker-compose.proxy.yml`) e renova/emite certificado conforme necessário.

Documentação completa do painel: [ADMIN-PAINEL.md](./ADMIN-PAINEL.md).
