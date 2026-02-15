FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5300

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BuildingBlocks/", "BuildingBlocks/"]
COPY ["src/Services/KLL.Pay/", "Services/KLL.Pay/"]
RUN dotnet restore "Services/KLL.Pay/KLL.Pay.Api/KLL.Pay.Api.csproj"
RUN dotnet build "Services/KLL.Pay/KLL.Pay.Api/KLL.Pay.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Services/KLL.Pay/KLL.Pay.Api/KLL.Pay.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KLL.Pay.Api.dll"]
