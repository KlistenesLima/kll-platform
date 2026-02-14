FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5200

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/", "BuildingBlocks/"]
COPY ["src/Services/KLL.Store/", "Services/KLL.Store/"]
RUN dotnet restore "Services/KLL.Store/KLL.Store.Api/KLL.Store.Api.csproj"
RUN dotnet build "Services/KLL.Store/KLL.Store.Api/KLL.Store.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Services/KLL.Store/KLL.Store.Api/KLL.Store.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KLL.Store.Api.dll"]