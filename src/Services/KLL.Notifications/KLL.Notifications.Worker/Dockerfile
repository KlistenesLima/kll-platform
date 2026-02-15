FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/", "BuildingBlocks/"]
COPY ["src/Services/KLL.Notifications/", "Services/KLL.Notifications/"]
RUN dotnet restore "Services/KLL.Notifications/KLL.Notifications.Worker/KLL.Notifications.Worker.csproj"
RUN dotnet build "Services/KLL.Notifications/KLL.Notifications.Worker/KLL.Notifications.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Services/KLL.Notifications/KLL.Notifications.Worker/KLL.Notifications.Worker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KLL.Notifications.Worker.dll"]
