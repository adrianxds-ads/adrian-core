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

## Teclado Adrián v4
Componente maestro: `components/adrian-keyboard.js`.

- QWERTY compacto con mayúsculas permanentes.
- Idiomas ES / CA / EN.
- `Ñ` directa en español y `Ç` directa en catalán.
- Acentos y variantes mediante pulsación larga.
- Fila inferior fija: `123/ABC · ¿ · ESPACIO · ? · ⌫`.
- Pantalla numérica independiente con la misma altura aproximada que la alfabética.
- Sin autocorrección, sugerencias ni teclado nativo cuando un campo usa `data-ad-keyboard`.

Uso: cargar `https://adrianxds-ads.github.io/adrian-core/components/adrian-keyboard.js?v=4` y añadir `data-ad-keyboard="es"`, `ca` o `en` al campo.