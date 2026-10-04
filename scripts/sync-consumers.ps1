param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$config = Get-Content (Join-Path $root 'consumers.json') -Raw | ConvertFrom-Json

foreach($consumer in $config.consumers){
  foreach($file in $config.managedFiles){
    $allowedApps = @()
    if($null -ne $file.apps){ $allowedApps = @($file.apps) }
    if($allowedApps.Count -gt 0 -and $allowedApps -notcontains $consumer.id){ continue }

    $src = Join-Path $root $file.source
    $dst = Join-Path $consumer.path $file.target
    if(!(Test-Path $src)){ throw "Missing core source: $src" }

    if(!(Test-Path $dst)){
      if($Apply){
        Copy-Item $src $dst -Force
        Write-Host "$($consumer.id): CREATED $($file.target)"
      } else {
        Write-Host "$($consumer.id): MISSING $($file.target)"
      }
      continue
    }

    $srcHash=(Get-FileHash $src -Algorithm SHA256).Hash
    $dstHash=(Get-FileHash $dst -Algorithm SHA256).Hash
    if($srcHash -eq $dstHash){
      Write-Host "$($consumer.id): OK $($file.target)"
      continue
    }

    if($Apply){
      Copy-Item $src $dst -Force
      Write-Host "$($consumer.id): UPDATED $($file.target)"
    } else {
      Write-Host "$($consumer.id): UPDATE AVAILABLE $($file.target)"
    }
  }
}
