# Núcleo Design System · Especificación maestra

**Diseño: v1.0 histórica + enmienda v1.1 recuperada · 14/10/2026**
**Estado:** seis fases de diseño aprobadas; implantación integral todavía pendiente.
**Alcance:** tarjetas de Adrián Hub, ocho aplicaciones didácticas y módulos compatibles.

> Este archivo es un contrato de DISEÑO para próximas intervenciones, no prueba de implementación. La última versión del Hub comprobada al preparar la especificación era 30.5.13 (3ccbd92); contrastar de nuevo origin/main y GitHub Pages antes de editar.

## 0. Fuente de verdad y precedencia

La enmienda v1.1 de la sección 12 prevalece sobre reglas incompatibles de v1.0. Los cierres publicados y ejemplos anteriores se conservan como historia, no como estado del candidato actual.

- Este documento es la **única especificación maestra del rediseño**. No crear otra colección paralela de reglas visuales; mantener las fuentes CSS e historial.
- El registro operativo de identidad es adrian-hub/apps.json: IDs, nombres y campo brandColor. adrian-hub/versions.json registra versiones, evidencias y cambios; cada juego conserva su repositorio y lógica.
- La lectura tiene tokens en adrian-core/design/nucleo-visual-profile.css. Los ocho juegos usan adrian-core/design/nucleo-game-theme.css y copias locales para PWA offline. Revisar adaptadores OLED/globales y orden CSS antes de alterar estilos.
- ECOSYSTEM_CONTRACT.md, los documentos Luminous/OLED y auditorías anteriores son **historial de versiones**. Si expresan otro estilo, esta especificación orientará una futura reforma, pero NO significa que esa reforma ya esté aplicada.
- Estados: **[D] definido y acordado**, **[I] observado en código**, **[V] probado y publicado**. Nunca promover [D] directamente a [V].
- Los esquemas ilustrativos con cifras de muestra no son datos de aprendizaje reales.

## 1. Árbol maestro y regla fundamental

| Fase | Contrato | Estado |
| --- | --- | --- |
| 01 | Fundamentos: color, tipografía, espaciado, superficies, identidad | [D] |
| 02 | Componentes: tarjetas, botones, navegación, recompensas, progreso, estados | [D] |
| 03 | Pantallas: portada, quiz, resultados, estadísticas, Coach, biblioteca | [D] |
| 04 | Identidad: monogramas, paleta fija y personalidad de cada materia | [D] |
| 05 | Gamificación: medallas, estrellas, tiempo, niveles, JSON e histórico | [D] |
| 06 | Accesibilidad: legibilidad, ergonomía, contraste, adaptación e integridad | [D] |

**Contrato transversal:** PORTADAS OSCURAS + QUIZZES CLAROS + RESULTADOS Y LECTURA CLAROS. Se puede usar fondo oscuro en navegación o gestión, sin alternar arbitrariamente superficies oscuras y claras durante una sesión de preguntas. Unidad no exige identidad de contenido o disposición.

## 2. Fundamentos · Tokens de diseño

| Elemento | Portada oscura | Juego claro |
| --- | --- | --- |
| Fondo | #0E1318 | #EAF0F5 |
| Panel | #192229 | #FFFFFF |
| Elevación/detalle | #24313A | #DCE7EF |
| Texto principal | #EAF0F5 | #25282C |
| Texto secundario | #B9C5CE | #46596B |
| Borde | #414B54 | #B5C9D7 |
| Exterior OLED cuando proceda | #000000 | No aplica |

Son valores de **diseño**, aún por reconciliar con los tokens reales --ad-* y --ng-*. No añadir reemplazos masivos ni reglas que inviertan inadvertidamente la lectura.

- Fondo neutro; no grandes halos verdes, degradados verde-dorado ni niebla ambiental. El tinte de identidad, si existe, será muy sutil y no competirá con contenido.
- Roboto; texto habitual 19 px CSS con interlineado 1,35; secundarios 16 px; controles 18 px; respuestas objetivo >=20 px; títulos 28–32 px y secciones 22–24 px. Respetar zoom, reflujo y escalado Android.
- Espaciado 4/8/12/16/24/32 px. Radio de tarjeta 16 px; botón 12–14 px. Tamaño táctil habitual 52 px y navegación >=48 px; las insignias puramente informativas pueden ser más pequeñas que un control.
- Sombras mínimas y sin marcos anidados injustificados. Jerarquía de pesos; no usar negritas extremas en toda la página ni encoger letra esencial.
- **Colores semánticos protegidos:** opciones de respuesta, acierto/error, alerta temporal, medallas, estrellas y jardín no adoptan el color corporativo.

## 3. Paleta corporativa fija

Fuente operativa: apps.json. Tabla documental aprobada en Hub 30.5.13.

| ID | Nombre | Color |
| --- | --- | --- |
| english | Grammar Quest | #4A90E2 |
| phrasal-verbs | Phrasal Sprint | #9B59B6 |
| pizarras | Classroom B2 | #F29E4C |
| b2-cloze | Cloze Quiz | #37BFB5 |
| cambridge | Cambridge Lab | #E66F8D |
| keyword-speaking | B2 Transform | #A9CE5E |
| biblioteca | Català Podcasts | #F1C40F |
| hoti0108 | Turismo Lab | #D6A26B |
| entrenamiento | Gym Tracker | #2EC78F |
| cambio | Cambio | #67B7F7 |
| dcinbox | Buzón DC | #8EABC2 |
| adri-type | Control PC | #B58AEB |
| agents | Agentes | #EC80CF |
| limpieza | Limpieza | #7CCB7A |
| job-engine | Empleo Hub | #F1B75B |

Conjuga CAT comparte el amarillo por materia con Català Podcasts aunque no sea una tarjeta adicional del Hub.

**Tres expresiones del mismo color:** (1) hexadecimal exacto para monograma y marca; (2) variante accesible contrastada para botones blancos; (3) mezcla suave con superficie neutra para detalles. El ejemplo de botón azul de Grammar #285F9A NO se copia literalmente al resto; comprobar el contraste efectivo en cada aplicación.

## 4. Biblioteca de componentes [D]

| Componente | Presentación | Invariantes |
| --- | --- | --- |
| Tarjeta de app | Monograma y color de cabecera, fondo neutro | Acceso, información, actualización |
| Tarjeta de contenido | Panel/borde y tipografía compartidos | Acciones y datos vigentes |
| Cifra compacta | Cifra importante con etiqueta clara | Definición de la métrica |
| CTA primario | Acción dominante, 52 px, sin gradiente | Acción y estados activo/ocupado |
| Secundario/terciario | Borde o texto e icono, foco visible | Navegación/JSON reales |
| Navegación | Atrás, Hub, ajustes sin solape | Salida segura, acceso disponible |
| Medallas compactas | Tres círculos 32–34 px, orden 13/14/15 | Cantidad acumulada y categoría identificable |
| Estrellas | Estrella suelta 22–24 px, cifra exterior >=16 px | Cálculo previo intacto |
| Temporizador | Número, segmentos y donut según modalidad | Un solo reloj, misma duración/prerreloj |
| Estadísticas y Coach | Paneles comunes y etiquetas | Datos e inferencias diferenciados |
| JSON | Acceso reconocible | Exportación real sin inventar registros |
| Diálogos | Contraste, foco y cierre comunes | Cancelar/confirmar sin errores |

Los círculos de la tarjeta presentan **cantidades acumuladas** de medallas de 13, 14 y 15 aciertos, NO el umbral como si fuese el total. La categoría requiere identificación por orden fijo y descripción accesible. Los ceros de medallas pueden estar atenuados pero legibles. La estrella se oculta al valer cero **solo en tarjeta compacta**; en detalle permanece el estado numérico. No depender de hover móvil.

## 5. Arquitectura de pantallas [D]

- **Portada oscura:** navegación → identidad y nivel → Continuar → Statistics/My Coach → recompensas secundarias → biblioteca/Key Diary y utilidades. Mantener composiciones útiles; reducir ruido sin perder funciones. Si se agrupa el diario extenso, conservar todas sus fichas y estados.
- **Quiz claro:** pregunta, respuestas y tiempo dominan. Identidad secundaria, progreso y temporizador visibles; sin decoración de portada. Preservar respuestas cromáticas y transiciones reales.
- **Resultados claros:** evaluación inmediata → corrección y errores → siguiente acción. Gráficas y JSON siguen accesibles.
- **Statistics:** qué ocurrió, precisión, tiempo realmente medido, automatismos, dominio e histórico. Rapidez no equivale automáticamente a dominio.
- **My Coach:** qué estudiar, basado en errores reales, diferenciando datos e interpretación.
- **Bibliotecas y Key Diary:** contenido íntegro, ficha legible, anterior/siguiente, estados descubiertos y persistencia.
- **Identidad funcional:** Cambridge mantiene exámenes y Part 1–4; Classroom clases; Phrasal contextos; Cloze huecos; B2 Transform voz y teclado; Turismo documentos/exámenes; Català conjugaciones. Lenguaje común, pedagogías distintas.

## 6. Gamificación, progreso y JSON [D]

- No cambiar fórmulas de medallas 13/14/15, oros, estrellas, niveles, puntos o jardín. Conservar el acumulado y recompensas anteriores.
- Sustituir visualmente la cuarta medalla circular con estrella diminuta por **estrella independiente + cifra exterior legible**. Nunca introducir la cifra dentro de la estrella.
- Donut y segmentos, si coexisten, muestran **un único reloj real** sin segundos añadidos. El contrato histórico de Core habla de temporizador tipo pizza; mantener comportamiento implantado hasta acordar y probar su reconciliación en piloto.
- Nivel, puntos, dominio, velocidad, precisión y automatismos son conceptos distintos. No inventar métricas ni reconstruir sesiones archivadas ausentes.
- JSON de aprendizaje: sesiones, respuestas, errores, tiempo medido, progreso e histórico disponible, sin duplicados. JSON técnico: esquema separado. Exportaciones identificadas y voluntarias.
- Celebración breve, sonido configurable, reducción de movimiento; siempre se puede consultar el resultado sin efectos especiales.

## 7. Accesibilidad y aceptación [D]

- Objetivo WCAG 2.2 AA donde corresponda: texto habitual >=4,5:1, texto grande >=3:1, estados y componentes no textuales relevantes >=3:1 frente al fondo adyacente. Foco visible, navegación de teclado, sin información solo por color.
- Tacto diseñado para móvil, con objetivos de 48–52 px en controles, separación suficiente y acciones de retorno claras. Ninguna función exclusivamente hover.
- Matriz 360/390/412/768/1280 px, zoom 200 %, orientación y teclado virtual. Sin desplazamiento horizontal innecesario, texto invisible ni botones cubiertos.
- Regresión de recorrido: portada → quiz acierto/error y tiempo → resultados → Statistics/Coach/Diary → JSON → recarga. Respuestas y puntuación se registran una sola vez.
- Recompensas, progreso y jardín probados con perfiles aislados y datos de prueba. No escribir respuestas en el perfil real. El navegador no verifica por sí solo Pixel físico ni sincronización multidispositivo.
- Antes de publicar: HEAD correcto, inventario de CSS y cascada, capturas comparables, controles y contraste, tests didácticos, versiones/cachés/fingerprints, revisión de página pública y SW. Diferenciar local, remoto, publicado y cacheado.
- Evidencia de cierre: fecha, versiones y commits, navegador, resultados, fallos, límites y rollback. Sin evidencia no se declara finalizado.

## 8. Implantación por puertas

### Puerta 0 · Consolidación documental (etapa actual)

1. Las seis fases se expresan **en una fuente**; los repositorios consumidores enlazan el contrato, no copian otro manual.
2. Registrar la incompatibilidad entre temas históricos y la propuesta, sin tocar aún hojas funcionales.
3. No declarar como implantado ningún cambio únicamente diseñado.
4. Al tratarse de documentación, no subir versiones de assets ni limpiar caches sin motivo.

### Puerta 1 · Piloto Grammar Quest (siguiente intervención)

1. Consultar HEAD de adaptive-english, CSS en orden real, HTML, app.js, SW, pruebas; trabajar en rama/worktree limpio sin tocar cambios locales ajenos.
2. Capturar ANTES portada, quiz, resultados, Statistics, My Coach y Key Diary; localizar selectores responsables de halo verde, degradados y conflictos, sin presumir la causa.
3. Corregir portada a **oscura neutra**, identidad azul, paneles comunes, botón contrastado sin degradado y medallas/estrella discretas. Evitar cambios de disposición cuando no sean necesarios.
4. Conservar quiz **claro** y resultados/lectura claros, respuestas, prerreloj, tiempos, voz, teclado, puntuación, persistencia y JSON. Resolver precedencia OLED/Luminous en fuente maestra, no mediante cascadas indiscriminadas.
5. Verificar imágenes y recorridos a 360/390/412/768/1280, zoom, teclado, guardado y recompensas; añadir regresiones permanentes.
6. Solo al superar controles, versionar, actualizar SW/registro y publicar; comprobar GitHub Pages. En fallo, conservar piloto aislado y diagnóstico.

### Puerta 2 · Componentes compartidos

Tras validar Grammar, extraer únicamente componentes realmente repetibles a Core. Mantener copias locales byte a byte idénticas en ocho PWA cuando proceda. Verificar cada app individualmente; no imponer selectores ciegos sobre interfaces heterogéneas.

### Puerta 3 · Resto del Hub y cierre

Extender el lenguaje visual a módulos auxiliares sin tratar sus funciones como quizzes. Auditar gamificación, persistencia, accesibilidad, offline y publicación real. Cerrar con evidencia, nunca por sensación estética.

## 9. Invariantes de conservación

**No modificar por arrastre visual:** bancos de Grammar y fuentes/keys Cambridge, alternativas válidas, corrección, selección/revisión, Read First/Think Mode, temporizadores, niveles, medallas, estrellas, jardín, IndexedDB, archivos históricos, sincronización, sonido, voz, teclado, JSON, actualización ni datos privados.

**Regla final:** diseño definido ≠ código aplicado ≠ versión publicada. Una implantación que pierda datos, funciones o contraste no supera la puerta.

## 10. Cierre documental

**12/10/2026 · Puerta 0.** Se consolidan seis fases en este único contrato. Referencia inicial Hub 30.5.13, con colores corporativos en tarjetas y ocho juegos. El nuevo sistema completo está **pendiente de implantación y prueba**. **Siguiente paso: Puerta 1 · piloto controlado de Grammar Quest.**

## 11. Cierre verificado · Puerta 1 Grammar Quest · 2026-10-12

**Estado:** piloto IMPLANTADO y PUBLICADO; **el resto de aplicaciones aún no ha sido reformado con este patrón**.

- Grammar Quest **3.36.9**, repositorio adaptive-english, commits **48dc58d** (estilos y versión) y **7d5ab38** (huellas y precaché); Hub **30.5.14**, commit **8b520f6**.
- El piloto usa una hoja **local y reversible** grammar-visual-pilot.css enlazada después de los adaptadores históricos. Portada OLED neutra #0E1318, panel #192229, borde/marca #4A90E2, CTA #285F9A sin degradado, Statistics y Coach oscuros coherentes; quiz y resultados sobre lectura clara #EAF0F5/#FFFFFF.
- Medallas en tarjeta reducidas a tres círculos con cantidades; estrella suelta con contador en lugar de cuarto círculo. En la tarjeta compacta no se dibuja estrella bloqueada de valor cero. Resultados conservan explícitamente los ceros. No se modificaron cálculos de recompensas.
- Key Diary conserva carrusel horizontal, ficha completa y doble toque para revelar/avanzar; prueba móvil por viewport real (la captura de página completa puede mostrar artefactos al componer desplazamientos internos). Navegación Atrás/Panel/Hub con contraste corregido.
- Pruebas sobre Edge en perfiles **aislados** a **360/390/412/768/1280 px**: portada, acceso a Statistics/Coach, fichas completas, quiz claro, cuatro opciones y colores de categoría, tamaños, navegación, sin desbordamientos ni errores JavaScript. Una ronda completa de 15 preguntas llevó a resultados claros y pasó volver a portada y recargar. Pruebas adicionales de historial y persistencia bajo cuota aprobadas.
- Integridad de nueve cachés, rechazo de builds dañados, Version Center y **69 fingerprints** correctos. Navegador de GitHub Pages comprobó Grammar 3.36.9 a 390/1280 y Hub 30.5.14; CSS, JS y service-worker públicos coinciden byte a byte con archivos de la entrega.
- No se utilizó el perfil personal de progreso ni se alteró trabajo local sin confirmar. **No** se certifica en esta puerta la prueba física del Pixel, zoom 200 %, dictado/teclado real o sincronización entre dos dispositivos; esas comprobaciones pertenecen a su matriz específica de aceptación.
- **Siguiente paso · Puerta 2:** auditar los selectores del piloto frente a las reglas existentes y extraer únicamente los componentes compartibles a Adrián Core. Validarlos en cada app antes de propagarlos, sin copiar masivamente los overrides locales ni tocar motores o bancos.


## 12. Enmienda v1.1 recuperada y auditoría contractual · 14/10/2026
Las decisiones siguientes proceden de la ratificación del Contrato Maestro Integrado v1.1 del 12/10/2026 y del encargo operativo posterior. Sustituyen las reglas incompatibles de v1.0 de este mismo archivo. No se presenta este anexo como transcripción integral de la conversación original.
- Portadas, estadísticas y resultados: modo oscuro, base #0E1318; preguntas claras tintadas por aplicación, tarjetas blancas y texto #25282C.
- Roboto, lectura prolongada en móvil, espaciados coherentes y controles táctiles cómodos; navegación contextual sin duplicaciones.
- Cuatro respuestas en 2×2 donde el motor ofrece cuatro alternativas; conservar tareas escritas y motores heterogéneos.
- Progreso segmentado encima del enunciado, separado del reloj. Mostrar respuestas efectivamente registradas, sin dar por completada la pregunta actual.
- Temporizador de 20 segmentos bajo las respuestas, derivado del tiempo real del motor. No imponer 20 segundos; conservar Read First, estados sin límite, pausa y corrección.
- Identidades de actividad: Grammar #CBD8E3/#4A90E2; Phrasal #D9D0E2/#9B59B6; Classroom #E5D8C9/#F29E4C; Cloze #CEE0DB/#37BFB5; Cambridge #E4D3DA/#E66F8D; Transform #DAE0CC/#A9CE5E; Turismo #E2D7C9/#D6A26B; Català #E3DECA/#F1C40F.
- Conservar bancos, identificadores, algoritmos, sesiones, puntuación, estadísticas, medallas, estrellas, históricos, estudio, Coach, JSON, importación/exportación, preferencias y progresos compatibles. Datos e inferencias diferenciados; no inventar sesiones ni tiempos.
- Mantener los criterios de accesibilidad y gamificación compatibles de las secciones anteriores: tres medallas compactas con cantidades, estrella independiente y cifra exterior; no cuatro medallas circulares.
- Una aplicación no se declara terminada por superar un quiz: debe cumplir el diseño, conservar sus recorridos y contenidos, guardar/recuperar datos y superar sus pruebas pertinentes.
Estado actual: candidato aislado en auditoría y corrección. Sin publicación autorizada. Evidencia contractual en contract-audit-20261014/ del laboratorio; checkpoint en WORK-STATUS.md.


## Ergonomía de quiz · petición de Adrián del 17/10/2026
La propuesta aportada de Gemini se integra en Grammar, Cloze, Phrasal y Classroom. Cambridge queda excluido. Esta enmienda prevalece sobre las cuatro opciones cromáticas o centradas anteriores únicamente en estos quizzes; conservar portadas, identidad, premios y restantes módulos.

- Fuente optativa canónica: design/quiz-ergonomics.css y components/quiz-ergonomics.js 1.0.0. Las cuatro apps cargan copias locales idénticas para funcionar sin conexión. Ningún otro módulo importa esta pareja por defecto.
- Pila 1×4, letra A/B/C/D neutra a la izquierda, texto alineado a la izquierda; clase grid-2x2 disponible como variante de presentación. Colores de validación verde/rojo y respuesta correcta amarilla. Texto esencial desde 19px; letras de los distintivos oscuras en verde/rojo para conservar legibilidad.
- Fondo #EEF2F6 y tarjeta blanca en el ejercicio. Hueco azul, progreso semántico por respuesta y un único temporizador visible: barra continua y segundos enteros. El límite real sigue siendo 15 segundos después de Read First. No alterar controles de lectura/recuerdo, pausas, evaluación ni selección adaptativa.
- Medir y reservar altura usando los enunciados/opciones de la sesión y su corrección; repetir al cambiar anchura o escala. min-height:152px por sí solo no evita saltos de frases largas. Se eliminan los antiguos scrolls internos del escenario; una sola página desplazable conserva acceso a textos extensos y controles.
- El controlador es una adaptación para coordinar los motores existentes, no un motor sustitutivo. Referencias cancelables a espera, transición y reintento; callbacks del reloj capturan sesión, pregunta y generación. Pausa 850ms tras acierto, 1850ms tras error o tiempo agotado, más transición 150ms. Se cancela al cambiar de pregunta, salir o finalizar. Respetar movimiento reducido.
- Classroom conserva su duración y persistencia de contrato: si vence durante la corrección final, espera a terminarla antes de cerrar una sola vez.
- Integrado y verificado en perfiles aislados: rondas con acierto/error, doble entrada, callbacks antiguos, suspensión y error recuperable; vencimiento de 15s, salida/reinicio, recarga, clase y matriz de anchuras/escala. No equivale a verificación física en el Pixel. El cierre de publicación y sus límites se registra en adrian-hub/docs/ACCEPTANCE_TESTS.md.
