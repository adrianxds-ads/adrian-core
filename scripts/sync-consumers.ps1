param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$workspace = [IO.Path]::GetFullPath((Split-Path -Parent $root))
$config = Get-Content (Join-Path $root 'consumers.json') -Raw | ConvertFrom-Json
# Validate the entire destination set before the first write.
if($Apply -and !(Test-Path (Join-Path $root '.git') -PathType Leaf)){throw 'Apply requires an isolated Core Git worktree'}
$destinations = @{}
foreach($consumer in $config.consumers){
 $base = if([IO.Path]::IsPathRooted($consumer.path)){$consumer.path}else{Join-Path $root $consumer.path}
 $base = [IO.Path]::GetFullPath($base)
 if(!$base.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw "Consumer outside workspace: $base"}
 if(!(Test-Path (Join-Path $base '.git') -PathType Leaf)){throw "Consumer is not an isolated Git worktree: $base"}
 $branch = git -C $base branch --show-current
 if($LASTEXITCODE -ne 0 -or $branch -notlike 'agent-workbench-*'){throw "Unexpected consumer branch: $base $branch"}
 $destinations[$consumer.id]=$base
}
foreach($consumer in $config.consumers){
 foreach($file in $config.managedFiles){
  if($file.apps -and @($file.apps) -notcontains $consumer.id){continue}
  $src=[IO.Path]::GetFullPath((Join-Path $root $file.source))
  $base=$destinations[$consumer.id]
  $dst=[IO.Path]::GetFullPath((Join-Path $base $file.target))
  if(!$src.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -or !$dst.StartsWith($base+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Managed path escapes its repository'}
  if(!(Test-Path $src -PathType Leaf)){throw "Missing source: $src"}
  $same=(Test-Path $dst -PathType Leaf) -and ((Get-FileHash $src -Algorithm SHA256).Hash -eq (Get-FileHash $dst -Algorithm SHA256).Hash)
  if($same){Write-Output "$($consumer.id): OK $($file.target)";continue}
  if($Apply){Copy-Item $src $dst -Force;Write-Output "$($consumer.id): UPDATED $($file.target)"}
  else{Write-Output "$($consumer.id): UPDATE AVAILABLE $($file.target)"}
 }
}
