# Genera un certificado TLS autofirmado para el entorno local (Secure Channel).
# Busca OpenSSL en el PATH y, si no está, en la instalación de Git para Windows.
#
# Uso:
#   ./infrastructure/edge/generate-cert.ps1

$ErrorActionPreference = 'Stop'

# Localizar openssl
$openssl = (Get-Command openssl -ErrorAction SilentlyContinue).Source
if (-not $openssl) {
    $candidates = @(
        'C:\Program Files\Git\usr\bin\openssl.exe',
        'C:\Program Files\Git\mingw64\bin\openssl.exe',
        'C:\Program Files (x86)\Git\usr\bin\openssl.exe'
    )
    $openssl = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $openssl) {
    throw "No se encontro openssl. Instala OpenSSL o Git para Windows."
}
Write-Host "Usando openssl: $openssl" -ForegroundColor Cyan

$certDir = Join-Path $PSScriptRoot 'certs'
if (-not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

$crt = Join-Path $certDir 'deliunal.crt'
$key = Join-Path $certDir 'deliunal.key'

& $openssl req -x509 -nodes -newkey rsa:2048 `
    -keyout $key `
    -out $crt `
    -days 365 `
    -subj "/C=CO/ST=Bogota/L=Bogota/O=DELIUNAL/CN=localhost"

Write-Host "Certificado generado en $certDir" -ForegroundColor Green
