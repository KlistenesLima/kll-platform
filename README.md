# 🚀 KLL Platform

Plataforma e-commerce enterprise com arquitetura de microserviços, construída com **.NET 8**, **React 18**, **Kafka**, **Redis**, **PostgreSQL** e mais 15+ tecnologias.

## 🏗️ Arquitetura

```
┌──────────────┐   ┌─────────────┐
│  Storefront  │   │  Admin Web  │
│  React + TS  │   │  React + TS │
│  Tailwind    │   │  MUI        │
│   (:5174)    │   │   (:5173)   │
└──────┬───────┘   └──────┬──────┘
       │                  │
       └────────┬─────────┘
                ▼
┌────────────────────────────────────────┐
│         YARP API Gateway (:5100)       │
└────────┬──────────┬──────────┬─────────┘
         │          │          │
   ┌─────▼──┐  ┌────▼───┐  ┌──▼────────┐
   │ Store  │  │  Pay   │  │ Logistics │
   │ :5200  │  │ :5300  │  │   :5400   │
   └───┬────┘  └───┬────┘  └────┬──────┘
       │           │            │
       │      ┌────▼─────┐     │
       │      │ KRT Bank │     │
       │      │  (PIX)   │     │
       │      └──────────┘     │
┌──────▼───────────────────────▼──────┐
│         Shared Infrastructure       │
│  PostgreSQL · Redis · Kafka · Rabbit│
│  Keycloak · SEQ · MongoDB          │
└─────────────────────────────────────┘
```

## 🧱 Padrões Enterprise

| Padrão | Implementação |
|--------|---------------|
| Clean Architecture | Domain → Application → Infra → API |
| CQRS | Commands + Queries via MediatR |
| Domain-Driven Design | Entities, Value Objects, Domain Events |
| Event-Driven | Kafka (Integration Events) + RabbitMQ (Notifications) |
| Saga Pattern | OrderSagaOrchestrator com compensação |
| Outbox Pattern | Garantia de entrega de eventos |
| API Gateway | YARP com rate limiting |
| Idempotency | Redis-based com filtros |
| Resilience | Polly (retry, circuit breaker, timeout) |
| Real-time | SignalR para tracking de pedidos |

## 🛠️ Tech Stack

**Backend:** .NET 8, C# 12, Entity Framework Core, MediatR, FluentValidation, Polly, Serilog
**Frontend:** React 18, TypeScript, Material UI (Admin), Tailwind CSS (Storefront), Zustand, Vite
**Infrastructure:** PostgreSQL 16, Redis 7, Apache Kafka, RabbitMQ, MongoDB 7
**Auth:** Keycloak 23
**Observability:** Serilog + SEQ, Health Checks
**DevOps:** Docker Compose, GitHub Actions CI/CD, YARP Gateway

## 🚀 Quick Start

### Infraestrutura
```bash
make infra       # Sobe PostgreSQL, Redis, Kafka, RabbitMQ, SEQ, Keycloak
```

### Microserviços (.NET)
```bash
make store       # Terminal 1
make pay         # Terminal 2
make logistics   # Terminal 3
make gateway     # Terminal 4
```

### Admin React
```bash
make admin       # Terminal 5
```

### Tudo com Docker
```bash
make up          # Sobe tudo (infra + serviços + admin)
make logs        # Acompanhar logs
```

## 📊 Microserviços

### KLL Store (:5200)
- Catálogo de produtos com busca e filtros
- Criação de pedidos com validação de estoque
- Saga de pedido (criação → pagamento → envio → entrega)
- SignalR para tracking em tempo real

### KLL Pay (:5300)
- Gateway de pagamentos (PIX via KRT Bank, Cartão simulado)
- Integração com KRT Bank (PIX charges, health check, webhooks)
- Gestão de merchants com API Keys
- Polly resilience (retry + circuit breaker) para chamadas externas

### KLL Logistics (:5400)
- Criação automática de shipments via eventos Kafka
- Tracking com histórico de eventos
- Atribuição de motoristas
- Previsão de entrega

### Gateway (:5100)
- YARP Reverse Proxy
- Rate limiting (100 req/min por IP)
- Health check agregado
- CORS configurado

## 🧪 Testes

```bash
dotnet test KLL.Platform.sln    # 157 testes (100% aprovados)
```

| Projeto | Testes | Tipo |
|---------|--------|------|
| KLL.Store.Tests | 76 | Unit (Domain, Services, Handlers, Validators) |
| KLL.Store.UnitTests | 15 | Unit (Favorite, Address, Shipping) |
| KLL.Store.IntegrationTests | 19 | Integration (WebApplicationFactory) |
| KLL.Pay.Tests | 10 | Unit (Transaction, Merchant) |
| KLL.Pay.UnitTests | 17 | Unit (Transaction, Merchant extended) |
| KLL.Logistics.Tests | 6 | Unit (Shipment, TrackingEvents) |
| KLL.Logistics.UnitTests | 12 | Unit (Shipment lifecycle) |
| KLL.Logistics.IntegrationTests | 2 | Integration (Lifecycle) |
| **Total** | **157** | **Todos aprovados** |

Stack: xUnit, FluentAssertions, Moq, Microsoft.AspNetCore.Mvc.Testing

## 📁 Estrutura do Projeto

```
kll-platform/
├── src/
│   ├── BuildingBlocks/          # Shared libs (Domain, CQRS, EventBus, Infra, Outbox)
│   ├── Services/
│   │   ├── KLL.Store/           # Domain → Application → Infra.Data → Api
│   │   ├── KLL.Pay/             # Domain → Application → Infra.Data → Api
│   │   ├── KLL.Logistics/       # Domain → Application → Infra.Data → Api
│   │   ├── KLL.Gateway/         # YARP API Gateway
│   │   └── KLL.Notifications/   # RabbitMQ Worker (Email, SMS, Push)
│   └── Web/
│       ├── kll-admin-web/       # React + TypeScript + Material UI
│       └── kll-storefront/      # React + TypeScript + Tailwind CSS
├── tests/                       # xUnit + FluentAssertions + Moq
├── infra/keycloak/              # Realm config
├── docker-compose.yml           # 12 containers
├── Makefile                     # Dev commands
└── .github/workflows/ci.yml    # CI/CD
```

## 🔗 Integração com KRT Bank

O KLL Pay integra com o [KRT Bank](https://github.com/klistenes/krt-bank) para processamento real de pagamentos:
- **Onboarding API**: Cadastro de merchants
- **Payments API**: Processamento PIX/Boleto/Cartão
- **Webhooks**: Confirmação assíncrona de pagamentos

## 📍 URLs & Portas

| Serviço | URL | Porta |
|---------|-----|-------|
| Gateway | http://localhost:5100 | 5100 |
| Store API | http://localhost:5200/swagger | 5200 |
| Pay API | http://localhost:5300/swagger | 5300 |
| Logistics API | http://localhost:5400/swagger | 5400 |
| Storefront | http://localhost:5174 | 5174 |
| Admin Web | http://localhost:5173 | 5173 |
| SEQ (logs) | http://localhost:8082 | 8082 |
| Keycloak | http://localhost:8081 | 8081 |
| RabbitMQ | http://localhost:15673 | 15673 |
| PostgreSQL | localhost:5434 | 5434 |
| Redis | localhost:6381 | 6381 |
| Kafka | localhost:39092 | 39092 |

## 👨‍💻 Autor

**Klístenes** — Senior .NET Software Engineer
- 7+ anos de experiência
- 8 pós-graduações em tecnologia
- Especialista em microserviços e sistemas distribuídos
