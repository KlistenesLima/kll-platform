FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5100

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Services/KLL.Gateway/", "Services/KLL.Gateway/"]
RUN dotnet restore "Services/KLL.Gateway/KLL.Gateway.csproj"
RUN dotnet build "Services/KLL.Gateway/KLL.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Services/KLL.Gateway/KLL.Gateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KLL.Gateway.dll"]
