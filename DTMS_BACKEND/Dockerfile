FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["DTMS.Api/DTMS.Api/DTMS.Api.csproj", "DTMS.Api/DTMS.Api/"]
RUN dotnet restore "DTMS.Api/DTMS.Api/DTMS.Api.csproj"

COPY . .
WORKDIR /src/DTMS.Api/DTMS.Api
RUN dotnet publish "DTMS.Api.csproj" --configuration Release --output /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "DTMS.Api.dll"]
