FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5400

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/", "BuildingBlocks/"]
COPY ["src/Services/KLL.Logistics/", "Services/KLL.Logistics/"]
RUN dotnet restore "Services/KLL.Logistics/KLL.Logistics.Api/KLL.Logistics.Api.csproj"
RUN dotnet build "Services/KLL.Logistics/KLL.Logistics.Api/KLL.Logistics.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Services/KLL.Logistics/KLL.Logistics.Api/KLL.Logistics.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KLL.Logistics.Api.dll"]
