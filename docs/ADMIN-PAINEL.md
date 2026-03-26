# Painel administrativo — PeladaPro

## URL

- **Produção:** `https://admin.peladapro.cloud`  
- O middleware do Next.js trata hosts `admin.peladapro.cloud` e `admin.*.peladapro.cloud` e redireciona `/` → `/admin`.

## DNS e SSL

### Registo DNS (Hostinger ou outro DNS do domínio)

Crie um registo que aponte **admin** para o **mesmo destino** que resolve `peladapro.cloud` (o IP público do VPS onde o Next corre atrás do proxy).

| Tipo | Nome / Host | Valor | Notas |
|------|-------------|-------|--------|
| **A** | `admin` | IP do VPS (ex.: o mesmo do registo `@` ou `www`) | Recomendado se o apex usa A |
| **CNAME** | `admin` | `peladapro.cloud.` | Só se o teu DNS permitir CNAME no subdomínio e não conflitar com outros registos |

Após propagar (minutos a horas), confirma com `nslookup admin.peladapro.cloud` ou `dig admin.peladapro.cloud`.

2. Inclua `admin.peladapro.cloud` no certificado Let’s Encrypt. No proxy (`infra/docker-compose.proxy.yml`) o Certbot já inclui `-d admin.peladapro.cloud` junto com o domínio principal; volta a correr o certbot no servidor se o certificado for mais antigo que este host.

3. O Nginx deve encaminhar `admin.peladapro.cloud` para o mesmo upstream do Next.js (porta 3000), com header `Host` preservado — já configurado em `infra/docker-compose.proxy.yml`.

## Conta administrador (ADM)

- **E-mail padrão (dev):** `admin@peladapro.cloud`  
- **Senha padrão (dev):** `PeladaPro!Admin2025`  

Em produção, **não commites** email/senha no Git. Define no painel da Hostinger (variáveis do projeto / Docker), num `.env` no servidor (fora do repositório) ou como **build-args** na imagem Docker.

```env
NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL=seu@email.com
NEXT_PUBLIC_PLATFORM_ADMIN_PASSWORD=senha_forte_e_unica
```

Exemplo de build da imagem `web` (a partir da raiz do repositório):

```bash
docker build -f web/Dockerfile web \
  --build-arg NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL="seu@email.com" \
  --build-arg NEXT_PUBLIC_PLATFORM_ADMIN_PASSWORD='sua_senha_segura'
```

> **Segurança:** variáveis `NEXT_PUBLIC_*` ficam no JavaScript enviado ao browser — qualquer pessoa pode inspecionar. Para produção séria, migra para login via API com JWT, senha só no servidor e cookie `httpOnly`. **Não partilhes a senha de admin em chats ou tickets**; se expuseres, altera-a de seguida.

## Funcionalidades atuais (front)

| Área        | Descrição |
|------------|-----------|
| Visão geral | KPIs de contas, novos em 7 dias, bloqueados, atalhos. |
| Usuários   | Lista, busca, criar jogador, bloquear/desbloquear, redefinir senha, exportar CSV. |
| Grupos     | Visão de negócio sobre dados demo (mock) + contagem de grupos ocultos no `localStorage`. |
| Ambiente   | Documentação de env, subdomínio e roadmap backend. |

Os dados de usuário vêm de `localStorage` (`peladapro_accounts`) nesta demonstração; não são globais entre dispositivos até existir API + banco.

## Login do app vs painel

- Contas com papel **PLATFORM_ADMIN** não entram pelo `/login` do jogador; usam `/admin/login` (ou o subdomínio admin).
- Jogadores comuns não acessam o painel sem credenciais de admin.
