# Adrián Core

Fuente maestra compartida para la identidad visual y los componentes reutilizables de las apps de Adrián.

## Estado inicial
- AVS 2.0 es la fuente canónica en `design/adrian-visual-system.js`.
- Los tokens globales viven en `design/tokens.css`.
- Los componentes básicos compartidos empiezan en `components/base.css`.
- `consumers.json` registra las apps que consumen el Core.
- `scripts/sync-consumers.ps1` comprueba divergencias y sólo escribe con `-Apply`.

## Regla
La lógica específica de cada app permanece en su repositorio. El Core contiene identidad visual, tokens y componentes verdaderamente comunes.

## Sincronización local
Comprobar: `powershell -File .\scripts\sync-consumers.ps1`
Aplicar: `powershell -File .\scripts\sync-consumers.ps1 -Apply`

La migración de consumidores se hará de forma progresiva para no romper PWAs ya publicadas.