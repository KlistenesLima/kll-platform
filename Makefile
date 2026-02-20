# KLL Platform - Development Commands
.PHONY: help build test infra up down logs clean admin

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build all .NET projects
	dotnet build KLL.Platform.sln

test: ## Run all tests
	dotnet test KLL.Platform.sln --verbosity normal

infra: ## Start only infrastructure (postgres, redis, kafka, rabbitmq, seq)
	docker compose up -d postgres redis zookeeper kafka rabbitmq seq keycloak

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

logs: ## Tail logs from all services
	docker compose logs -f --tail=50

clean: ## Remove all containers and volumes
	docker compose down -v --remove-orphans

admin: ## Start React Admin in dev mode
	cd src/Web/kll-admin-web && npm run dev

store: ## Run Store API locally
	dotnet run --project src/Services/KLL.Store/KLL.Store.Api

pay: ## Run Pay API locally
	dotnet run --project src/Services/KLL.Pay/KLL.Pay.Api

logistics: ## Run Logistics API locally
	dotnet run --project src/Services/KLL.Logistics/KLL.Logistics.Api

gateway: ## Run Gateway locally
	dotnet run --project src/Services/KLL.Gateway

migrate: ## Apply all pending migrations
	dotnet ef database update --project src/Services/KLL.Store/KLL.Store.Infra.Data --startup-project src/Services/KLL.Store/KLL.Store.Api
	dotnet ef database update --project src/Services/KLL.Pay/KLL.Pay.Infra.Data --startup-project src/Services/KLL.Pay/KLL.Pay.Api
	dotnet ef database update --project src/Services/KLL.Logistics/KLL.Logistics.Infra.Data --startup-project src/Services/KLL.Logistics/KLL.Logistics.Api

seed: ## Seed test data
	@echo "Run: curl -X POST http://localhost:5200/api/v1/products -H 'Content-Type: application/json' -d '{\"name\":\"Smartphone\",\"description\":\"Latest model\",\"price\":2999.90,\"stockQuantity\":50,\"category\":\"Electronics\"}'"
