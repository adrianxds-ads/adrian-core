param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$config = Get-Content (Join-Path $root 'consumers.json') -Raw | ConvertFrom-Json
foreach($consumer in $config.consumers){
  foreach($file in $config.managedFiles){
    $src = Join-Path $root $file.source
    $dst = Join-Path $consumer.path $file.target
    if(!(Test-Path $dst)){ Write-Host "$($consumer.id): missing $($file.target)"; continue }
    $srcHash=(Get-FileHash $src -Algorithm SHA256).Hash
    $dstHash=(Get-FileHash $dst -Algorithm SHA256).Hash
    if($srcHash -eq $dstHash){ Write-Host "$($consumer.id): OK"; continue }
    if($Apply){
      Copy-Item $src $dst -Force
      Write-Host "$($consumer.id): UPDATED"
    } else {
      Write-Host "$($consumer.id): UPDATE AVAILABLE (run with -Apply)"
    }
  }
}