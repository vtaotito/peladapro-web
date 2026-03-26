# PeladaPro — Resumo Executivo

## Visão Geral

**PeladaPro** é uma plataforma completa para organização de peladas (futebol amador), focada na experiência mobile-first. O sistema resolve os problemas do dia a dia de quem organiza e participa de jogos informais: confirmação de presença, sorteio equilibrado de times, placar ao vivo, estatísticas, rankings e controle financeiro do grupo.

## Problema

Organizar uma pelada semanal envolve diversas tarefas manuais e dispersas:

- **Confirmação de presença** via WhatsApp, sem controle real
- **Sorteio de times** feito "no olho", gerando partidas desequilibradas
- **Placar e estatísticas** anotados em cadernos ou planilhas perdidas
- **Cobrança de mensalidades** sem visibilidade do caixa do grupo
- **Falta de engajamento** dos jogadores entre as partidas

## Solução

Uma plataforma web/mobile que centraliza toda a gestão da pelada:

| Módulo | Funcionalidade Principal |
|--------|--------------------------|
| **Confirmações** | Presença com fila de espera, check-in QR Code, notificações automáticas |
| **Sorteio Inteligente** | Algoritmo que equilibra times por habilidade (overall), posição e histórico |
| **Placar ao Vivo** | Cronômetro, registro de gols/assistências em tempo real, timeline da partida |
| **Rankings** | Estatísticas completas por jogador, evolução temporal, comparativos |
| **Financeiro** | Mensalidades, diárias, caixa do grupo, extrato e cobrança |
| **Gamificação** | Conquistas, troféus (craque, artilheiro), badges e streaks de presença |

## Público-Alvo

- **Organizadores de pelada**: gerenciam grupos de 10 a 30 jogadores
- **Jogadores**: querem confirmar presença rápido e ver suas estatísticas
- **Grupos de futebol amador**: semanais ou quinzenais, em quadras e campos

## Modelo de Negócio

- **Plano Gratuito**: 1 grupo, até 20 jogadores, funcionalidades básicas
- **Plano Pro** (futuro): grupos ilimitados, financeiro completo, gamificação avançada
- **Plano Clube** (futuro): múltiplos administradores, relatórios, API aberta

## Métricas de Sucesso (MVP)

| Métrica | Meta (3 meses) |
|---------|-----------------|
| Grupos ativos | 100+ |
| Jogadores cadastrados | 1.000+ |
| Partidas registradas | 500+ |
| Retenção semanal | > 60% |

## Diferencial Competitivo

1. **Sorteio por algoritmo**: não existe concorrente com balanceamento real de times
2. **Placar ao vivo**: experiência gamificada durante a partida
3. **Mobile-first / PWA**: funciona como app nativo sem precisar da App Store
4. **Financeiro integrado**: elimina planilhas paralelas de controle de caixa
5. **Gratuito para sempre** no plano básico

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS, PWA |
| Backend | Node.js, Express, Prisma ORM |
| Banco de Dados | PostgreSQL 16 |
| Cache | Redis 7 |
| Infraestrutura | Docker, Nginx, VPS Linux |
| Autenticação | JWT (access + refresh tokens) |

## Timeline (MVP)

| Fase | Período | Entregas |
|------|---------|----------|
| **Fase 1** | Semanas 1-2 | Infraestrutura, Auth, Perfil de Jogador |
| **Fase 2** | Semanas 3-4 | Grupos, Convites, Membros |
| **Fase 3** | Semanas 5-7 | Partidas, Confirmações, Sorteio |
| **Fase 4** | Semanas 8-9 | Placar ao Vivo, Eventos, Rankings |
| **Fase 5** | Semana 10 | Financeiro básico |
| **Fase 6** | Semanas 11-12 | PWA, Polish, Deploy |

## Status Atual

- Infraestrutura Docker configurada e pronta para deploy
- API REST funcional com autenticação JWT
- Schema do banco de dados completo (15 tabelas)
- Landing page implementada
- Proxy Nginx configurado para o domínio
