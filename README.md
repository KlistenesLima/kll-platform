# KLL Platform â€” Distributed E-Commerce Ecosystem

> Plataforma de e-commerce distribuÃ­da com microserviÃ§os .NET 8, integrada ao KRT Bank para pagamentos PIX em tempo real.

## Arquitetura

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    KLL Platform (5100)                          â”‚
â”‚                    API Gateway (YARP)                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  React     â”‚  KLL.Store â”‚  KLL.Pay   â”‚  KLL.      â”‚  KLL.      â”‚
â”‚  Frontend  â”‚  :5200     â”‚  :5300     â”‚  Logistics â”‚  Admin     â”‚
â”‚  :5173     â”‚            â”‚            â”‚  :5400     â”‚  :5500     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚            â”‚            â”‚
              â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”
              â”‚         Apache Kafka :39092        â”‚
              â”‚    (Domain Events + Integration)   â”‚
              â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚                      â”‚
              â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”
              â”‚ RabbitMQ â”‚           â”‚ KRT Bank  â”‚
              â”‚  :5673   â”‚           â”‚  :5000    â”‚
              â”‚ (Notif.) â”‚           â”‚ (Payments)â”‚
              â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
              â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚ Notifications â”‚
              â”‚    Worker     â”‚
              â”‚ (Email/SMS)   â”‚
              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Stack TecnolÃ³gica

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

| ServiÃ§o | KLL Platform | KRT Bank |
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
| API 3 | 5400 (Logistics) | â€” |
| Admin | 5500 | â€” |
| Frontend | 5173 (React) | 4200 (Angular) |
| MongoDB | 27018 | â€” |
| Keycloak | â€” | 8080 |

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
.	est-e2e-flow.ps1
```

## Fluxo de IntegraÃ§Ã£o KLL â†” KRT Bank

```
1. Cliente cria pedido no KLL.Store
   â””â†’ Kafka: "ordercreated"

2. KLL.Pay consome evento
   â””â†’ HTTP POST para KRT Bank /api/v1/pix/charge
   â””â†’ Retorna QR Code PIX

3. Cliente paga via app do banco
   â””â†’ KRT Bank confirma pagamento
   â””â†’ Webhook POST para KLL.Pay /api/v1/webhooks/krt-bank/payment-confirmed

4. KLL.Pay atualiza transaÃ§Ã£o
   â””â†’ Kafka: "paymentconfirmed"

5. KLL.Store confirma pagamento no pedido
   â””â†’ Kafka: "shipmentrequested"
   â””â†’ RabbitMQ: notification.email (confirmaÃ§Ã£o para cliente)

6. KLL.Logistics cria envio com tracking code
   â””â†’ Kafka: "shipmentcreated"
   â””â†’ SignalR: real-time update para frontend

7. Motorista entrega
   â””â†’ Kafka: "shipmentdelivered"
   â””â†’ RabbitMQ: notification.push (entrega confirmada)
```

## Design Patterns

- **CQRS**: Commands e Queries separados via MediatR
- **DDD**: Aggregates, Entities, Value Objects, Domain Events
- **Saga Pattern**: Order â†’ Payment â†’ Shipment com compensaÃ§Ã£o
- **Outbox Pattern**: Garantia at-least-once delivery via polling
- **Repository Pattern**: AbstraÃ§Ã£o de persistÃªncia com EF Core
- **Cache-Aside**: Redis para queries frequentes de produtos
- **Circuit Breaker**: Polly protegendo chamadas ao KRT Bank
- **Idempotency**: Header X-Idempotency-Key para POST/PUT
- **Event-Driven**: Kafka para eventos, RabbitMQ para notificaÃ§Ãµes

## Projetos (20 projects)

```
KLL.Platform.sln
â”œâ”€â”€ BuildingBlocks/
â”‚   â”œâ”€â”€ KLL.BuildingBlocks.Domain          (Result, Outbox, ValueObjects, Events)
â”‚   â”œâ”€â”€ KLL.BuildingBlocks.EventBus        (Kafka, RabbitMQ, Outbox Processor)
â”‚   â””â”€â”€ KLL.BuildingBlocks.Infrastructure  (MediatR, Polly, Serilog, HealthChecks)
â”œâ”€â”€ Services/
â”‚   â”œâ”€â”€ KLL.Store.{Domain,Application,Infra.Data,Api}
â”‚   â”œâ”€â”€ KLL.Pay.{Domain,Application,Infra.Data,Api}
â”‚   â”œâ”€â”€ KLL.Logistics.{Domain,Application,Infra.Data,Api}
â”‚   â”œâ”€â”€ KLL.Gateway (YARP)
â”‚   â””â”€â”€ KLL.Notifications.Worker (RabbitMQ)
â”œâ”€â”€ Web/
â”‚   â”œâ”€â”€ kll-frontend (React + TypeScript + Tailwind)
â”‚   â””â”€â”€ KLL.Admin (Blazor Server + MudBlazor)
â””â”€â”€ Tests/
    â”œâ”€â”€ KLL.Store.Tests (xUnit + FluentAssertions)
    â”œâ”€â”€ KLL.Pay.Tests
    â””â”€â”€ KLL.Logistics.Tests
```

## Testes

- **Unit Tests**: Domain entities, business rules
- **Integration Tests**: API endpoints via E2E script
- **Test Runner**: `dotnet test` + `test-e2e-flow.ps1`

---

*KLL Platform â€” Built for integration with KRT Bank ecosystem*