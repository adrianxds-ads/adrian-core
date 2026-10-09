# Núcleo · Editorial Luminous v1 para juegos de estudio

**Fecha de integración:** 9–10 de octubre de 2026.

La fuente canónica es `design/nucleo-game-theme.css` de `adrian-core`. Cada repositorio incorpora una copia local idéntica (`nucleo-game-theme.css`) para funcionar sin depender del dominio de Core al estar sin conexión. La copia se carga al FINAL de `<head>` de la página y el `<body>` identifica su materia con `data-nucleo-game`.

## Contrato fijo

- Fondo de lectura `#EAF0F5` y texto base `#25282C`, fuente Roboto, 19 px CSS y 1,35 de interlineado.
- Tarjetas y paneles de lectura blancos, tintas reconocibles por materia, halos discretos en acciones. Materias: Grammar Quest (azul), Phrasal Sprint (verde), Classroom B2 (ámbar), Cloze (violeta), Cambridge (añil), B2 Transform (coral), Conjuga CAT (ocre), Turismo Lab (turquesa).
- Los elementos de respuesta `.answer`, `.option`, `.kq-option`, temporizadores, resultados, medallas, recompensas, barras cromáticas de niveles y jardín **no se rediseñan**. Se conservan deliberadamente las superposiciones de celebración y prerreloj aunque sus colores sean más oscuros.
- Las apps incluyen estilos dinámicos por nivel/ranking que antes repintaban la portada oscura. La capa de accesibilidad utiliza selectores de pantalla para conservar los contenidos claros sin modificar esos cálculos ni los datos.
- No hacer reemplazos masivos de `color`, `background` o `font-size` en bancos, resultados, SVG y controles de respuesta.
- Cualquier modificación posterior debe ir a Core, replicarse con hash idéntico a los ocho repos y verificarse en móvil y escritorio.

## Alcance y verificación

Se aplica a los ocho repositorios de estudio, incluyendo el lanzador de Cambridge, el quiz Cambridge y el quiz Keyword; no se extiende a PWA privadas, biblioteca ni herramientas auxiliares.

Checklist de publicación: CSS idéntico en los ocho repos, link cargado, aspecto calculado del panel inicial blanco y texto oscuro, colores de respuesta diferenciados cuando estén disponibles, ausencia de errores JS y scroll horizontal, versionado propio por app, assets de service worker íntegros, registry Hub coherente, y comprobación de publicación de GitHub Pages. La persistencia entre dispositivos y la prueba física del Pixel son verificaciones adicionales; el test visual en Chrome aislado no las sustituye.

**Notas:** las dos pruebas visuales que originaron el perfil fueron autovaloraciones subjetivas en noche tenue e interior artificial iluminado. Que el modo claro mejore la precisión de aprendizaje es una hipótesis por comprobar mediante sesiones comparables, no un resultado demostrado.
