# KLL Platform — Distributed E-Commerce Ecosystem

> Plataforma de e-commerce distribuída com microserviços .NET 8, integrada ao KRT Bank para pagamentos PIX em tempo real.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    KLL Platform (5100)                          │
│                    API Gateway (YARP)                           │
├────────────┬────────────┬────────────┬────────────┬────────────┤
│  React     │  KLL.Store │  KLL.Pay   │  KLL.      │  KLL.      │
│  Frontend  │  :5200     │  :5300     │  Logistics │  Admin     │
│  :5173     │            │            │  :5400     │  :5500     │
└────────────┴─────┬──────┴─────┬──────┴─────┬──────┴────────────┘
                   │            │            │
              ┌────┴────────────┴────────────┴────┐
              │         Apache Kafka :39092        │
              │    (Domain Events + Integration)   │
              └────┬──────────────────────┬───────┘
                   │                      │
              ┌────┴────┐           ┌─────┴─────┐
              │ RabbitMQ │           │ KRT Bank  │
              │  :5673   │           │  :5000    │
              │ (Notif.) │           │ (Payments)│
              └────┬─────┘           └───────────┘
                   │
              ┌────┴──────────┐
              │ Notifications │
              │    Worker     │
              │ (Email/SMS)   │
              └───────────────┘
```

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | .NET 8, C# 12, ASP.NET Core |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Admin** | Blazor Server, MudBlazor |
| **Gateway** | YARP Reverse Proxy |
| **Database** | PostgreSQL 16 (1 per service) |
| **Cache** | Redis 7 (Cache-Aside pattern) |
| **Events** | Apache Kafka (domain events, Outbox Pattern) |
| **Notifications** | RabbitMQ (Email, SMS, Push with DLX) |
| **Observability** | Serilog + SEQ |
| **Resilience** | Polly (Retry, Circuit Breaker, Timeout) |
| **Real-time** | SignalR (order tracking) |
| **Validation** | FluentValidation + MediatR Pipeline |
| **Patterns** | CQRS, DDD, Saga, Outbox, Idempotency |

## Portas (sem conflito com KRT Bank)

| Serviço | KLL Platform | KRT Bank |
|---------|:----:|:----:|
| PostgreSQL | 5434 | 5433 |
| Redis | 6381 | 6380 |
| Kafka | 39092 | 29092 |
| Zookeeper | 42181 | 32181 |
| RabbitMQ | 5673/15673 | 5672/15680 |
| SEQ | 5342/8082 | 5341/8081 |
| Gateway | 5100 | 5000 |
| API 1 | 5200 (Store) | 5001 (Onboarding) |
| API 2 | 5300 (Pay) | 5002 (Payments) |
| API 3 | 5400 (Logistics) | — |
| Admin | 5500 | — |
| Frontend | 5173 (React) | 4200 (Angular) |
| MongoDB | 27018 | — |
| Keycloak | — | 8080 |

## Quick Start

```powershell
# 1. Infraestrutura
docker compose up -d

# 2. Backend
dotnet restore KLL.Platform.sln
dotnet build KLL.Platform.sln

# Rodar cada servico (terminais separados):
dotnet run --project src/Services/KLL.Store/KLL.Store.Api
dotnet run --project src/Services/KLL.Pay/KLL.Pay.Api
dotnet run --project src/Services/KLL.Logistics/KLL.Logistics.Api
dotnet run --project src/Services/KLL.Gateway
dotnet run --project src/Services/KLL.Notifications/KLL.Notifications.Worker

# 3. Frontend
cd src/Web/kll-frontend
npm install && npm run dev

# 4. Testes
dotnet test KLL.Platform.sln
.est-e2e-flow.ps1
```

## Fluxo de Integração KLL ↔ KRT Bank

```
1. Cliente cria pedido no KLL.Store
   └→ Kafka: "ordercreated"

2. KLL.Pay consome evento
   └→ HTTP POST para KRT Bank /api/v1/pix/charge
   └→ Retorna QR Code PIX

3. Cliente paga via app do banco
   └→ KRT Bank confirma pagamento
   └→ Webhook POST para KLL.Pay /api/v1/webhooks/krt-bank/payment-confirmed

4. KLL.Pay atualiza transação
   └→ Kafka: "paymentconfirmed"

5. KLL.Store confirma pagamento no pedido
   └→ Kafka: "shipmentrequested"
   └→ RabbitMQ: notification.email (confirmação para cliente)

6. KLL.Logistics cria envio com tracking code
   └→ Kafka: "shipmentcreated"
   └→ SignalR: real-time update para frontend

7. Motorista entrega
   └→ Kafka: "shipmentdelivered"
   └→ RabbitMQ: notification.push (entrega confirmada)
```

## Design Patterns

- **CQRS**: Commands e Queries separados via MediatR
- **DDD**: Aggregates, Entities, Value Objects, Domain Events
- **Saga Pattern**: Order → Payment → Shipment com compensação
- **Outbox Pattern**: Garantia at-least-once delivery via polling
- **Repository Pattern**: Abstração de persistência com EF Core
- **Cache-Aside**: Redis para queries frequentes de produtos
- **Circuit Breaker**: Polly protegendo chamadas ao KRT Bank
- **Idempotency**: Header X-Idempotency-Key para POST/PUT
- **Event-Driven**: Kafka para eventos, RabbitMQ para notificações

## Projetos (20 projects)

```
KLL.Platform.sln
├── BuildingBlocks/
│   ├── KLL.BuildingBlocks.Domain          (Result, Outbox, ValueObjects, Events)
│   ├── KLL.BuildingBlocks.EventBus        (Kafka, RabbitMQ, Outbox Processor)
│   └── KLL.BuildingBlocks.Infrastructure  (MediatR, Polly, Serilog, HealthChecks)
├── Services/
│   ├── KLL.Store.{Domain,Application,Infra.Data,Api}
│   ├── KLL.Pay.{Domain,Application,Infra.Data,Api}
│   ├── KLL.Logistics.{Domain,Application,Infra.Data,Api}
│   ├── KLL.Gateway (YARP)
│   └── KLL.Notifications.Worker (RabbitMQ)
├── Web/
│   ├── kll-frontend (React + TypeScript + Tailwind)
│   └── KLL.Admin (Blazor Server + MudBlazor)
└── Tests/
    ├── KLL.Store.Tests (xUnit + FluentAssertions)
    ├── KLL.Pay.Tests
    └── KLL.Logistics.Tests
```

## Testes

- **Unit Tests**: Domain entities, business rules
- **Integration Tests**: API endpoints via E2E script
- **Test Runner**: `dotnet test` + `test-e2e-flow.ps1`

---

*KLL Platform — Built for integration with KRT Bank ecosystem*