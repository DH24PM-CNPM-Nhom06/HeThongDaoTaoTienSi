FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Backend/DTMS.Api/DTMS.Api/DTMS.Api.csproj", "Backend/DTMS.Api/DTMS.Api/"]
RUN dotnet restore "Backend/DTMS.Api/DTMS.Api/DTMS.Api.csproj"

COPY ["Backend/DTMS.Api/DTMS.Api/", "Backend/DTMS.Api/DTMS.Api/"]
WORKDIR /src/Backend/DTMS.Api/DTMS.Api
RUN dotnet publish "DTMS.Api.csproj" --configuration Release --no-restore --output /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DTMS.Api.dll"]
