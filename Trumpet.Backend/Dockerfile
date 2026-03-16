FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Trumpet.Backend.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Data and media are expected to be mounted as volumes:
#   /data       → contains trumpet.db and raw/ JSON files
#   /media      → contains resources (media files)
VOLUME ["/data", "/media"]

ENTRYPOINT ["dotnet", "Trumpet.Backend.dll"]
