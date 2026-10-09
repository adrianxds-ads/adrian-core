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

## Jardín GitHub
`components/github-garden.js` renderiza el jardín común y `garden/registry.json` es su registro canónico. Desde Hub Nav v8, el jardín completo se reserva al Hub. Las portadas consumidoras muestran únicamente su propia planta; Adaptive English conserva su Practice Tree legacy estable. Las páginas auxiliares no se modifican.

## Teclado Adrián v4
Componente maestro: `components/adrian-keyboard.js`.

- QWERTY compacto con mayúsculas permanentes.
- Idiomas ES / CA / EN.
- `Ñ` directa en español y `Ç` directa en catalán.
- Acentos y variantes mediante pulsación larga.
- Fila inferior: `123/ABC · . · ESPACIO · ' · ? · ⌫` en inglés; mantiene `@` en ES/CA.
- En ejercicios de inglés (`data-ad-keyboard="en"`): QWERTY exclusivo inglés, sin selectores ES/CA y sin ventana flotante duplicada. La respuesta se ve solo en el campo de ejercicio.
- En campos ES/CA se conservan los idiomas, las variantes y la ventana flotante.
- Pantalla numérica independiente con coma, exclamación, apóstrofo y símbolos frecuentes.
- Sin autocorrección, sugerencias ni teclado nativo cuando un campo usa `data-ad-keyboard`.

Uso: cargar `https://adrianxds-ads.github.io/adrian-core/components/adrian-keyboard.js?v=410` y añadir `data-ad-keyboard="es"`, `ca` o `en` al campo.
## Shared performance contract

components/adrian-performance.js exposes window.AdrianPerformance. Each app supplies a small adapter that maps its own pedagogy to common presentation fields (AVS rank, coverage, mastery when valid, recent accuracy, /15 equivalent, timing, sessions, focus and JSON). Missing or invalid concepts must remain null/—; app-specific learning engines are never replaced by Core.


## Medallas y estrellas · 1.2.0 · 2026-10-08
Cada app conserva sus medallas y gana una estrella por cinco oros propios. El Hub y el jardín suman floor(orosApp/5) de cada app; los restos no se agrupan. El componente muestra estrellas locales y migra el alias de Key Word mediante máximo, sin duplicarlo. Cambridge cuenta medallas sobre rondas completas identificadas, deduplica registros, excluye rondas incompletas y conserva los intentos originales. Ledger anterior respaldado antes de la regla v3. Pruebas en adrian-hub/tests/test_star_rule.py.
