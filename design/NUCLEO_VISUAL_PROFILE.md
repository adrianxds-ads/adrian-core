# Núcleo Visual · Perfil compartido de lectura (v1, 2026-10-09)

## Estado y evidencia
Perfil inicial basado en una única autovaloración nocturna de Adrián (ambiente tenue, gafas relax/presbicia). No es una medida clínica:
- Fondo preferido de las dos muestras: gris azulado `#EAF0F5` con texto `#25282C` (nitidez 5/5 y comodidad 4/5).
- Tipografía preferida: Roboto (4/5 de nitidez y comodidad); alternativa Atkinson Hyperlegible Next 3/5.
- Tamaño web CSS preferido entre 19/21/23: **19 px**; interlineado 1,35.
- No extrapolar automáticamente los px CSS a sp nativos, ni la prueba nocturna a condiciones diurnas.
- Segunda prueba con interior iluminado en curso. Cambiar valores en un único origen, no duplicarlos app por app.

## Contrato de interfaz
Fuente común: `Roboto`, con fuentes locales de sustitución, sin depender de descarga web.
Tokens centrales en `design/nucleo-visual-profile.css`:
`--nucleo-reading-size:19px`, `--nucleo-reading-line:1.35`,
`--nucleo-ui-size:18px`, `--nucleo-small-size:16px`,
`--nucleo-heading-size:24px`, `--nucleo-touch-min:52px`,
`--nucleo-light-bg:#EAF0F5`, `--nucleo-light-text:#25282C`.

La escala es punto de partida. Las preguntas, opciones, explicaciones, botones y textos largos nunca deben quedar microscópicos. Las etiquetas/estadísticas pueden usar tamaño secundario pero deben poder leerse y aumentarse.

## Integración progresiva
1. En cada HTML de app, importar el CSS compartido versionado desde `https://adrianxds-ads.github.io/adrian-core/design/nucleo-visual-profile.css`.
2. Añadir `class="nucleo-readable"` al contenedor de la app.
3. Aplicar las clases semánticas `.nucleo-reading`, `.nucleo-ui`, `.nucleo-secondary`, `.nucleo-heading` o atributos `data-nucleo-*` a los elementos correspondientes. `.nucleo-light-surface` se aplica solo a paneles de lectura que admitan tema claro.
4. Los componentes antiguos con CSS de mayor especificidad deberán migrarse o referenciar los tokens; importar el archivo **no** basta para corregir automáticamente todos los tamaños fijados en px.
5. Evitar `!important` masivo y cambios en relojes, gráficas, teclado, feedback, reglas de juego, datos o almacenamientos.
6. Comprobar vista 360/390/412 px, teclado Android abierto, modo vertical, 200% de zoom, sin desbordamiento horizontal; contrastes de texto y controles.
7. Verificar una partida y la persistencia de puntuación/progreso antes y después de cambios visuales. Registrar versión y notas de cada app tras la integración.

## Alcance de esta entrega
La hoja CSS está preparada como recurso opcional; por sí sola **no cambia las interfaces existentes**. Su integración y publicación en cada app requieren prueba y versiones propias. El color claro es una propuesta y no se impondrá sobre pantallas oscuras sin autorización y contraste visual.
