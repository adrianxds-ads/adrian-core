# Jardín GitHub

El Jardín GitHub es la capa vegetal común del ecosistema Adrián Hub.

## Arquitectura
- Fuente única de especies y posiciones: `garden/registry.json`.
- Renderizador compartido: `components/github-garden.js`.
- Escala conceptual: 0–10.000 LEVEL.
- Intervalo de crecimiento: 50 LEVEL.
- Máximo: 200 hitos visibles.
- El crecimiento es determinista: una etapa nueva añade piezas y nunca sustituye las anteriores.
- La posición de cada especie es estable.
- El jardín completo conserva posiciones canónicas en el Hub; las aplicaciones consumen una vista individual de su especie.

## Progreso
Nunca se inventa progreso para llenar el jardín.

Actualmente conectadas a un LEVEL acumulativo real:
- Adaptive English.
- B2 Multiple-Choice Cloze.
- Català · Verbs.
- Phrasal Verbs: el crecimiento usa niveles/sesiones completados acumulativos; la dificultad adaptativa 1–15 permanece separada.

Registradas como semilla hasta definir una métrica legítima:
- Cambridge B2.
- HOTI0108.
- Entrenamiento 2.0.
- DC Inbox.
- Limpieza 2.2.

## Adaptive English
Su Practice Tree existente es legacy estable y no se reemplaza. El Jardín reutiliza su semilla, algoritmo y fuente de LEVEL para representarlo dentro de la escena común.

## API
`AdrianGarden.mount(host, options)` renderiza una perspectiva.
`AdrianGarden.reportProgress(appId,{level})` permite que una app publique un snapshot real cuando en el futuro necesite un puente.
`AdrianGarden.growthStage(level)` aplica la regla común 50 → 1 hito.

## Regla
Un ecosistema → un jardín completo en el Hub → una planta propia dentro de cada aplicación.

El jardín completo es una capa lúdica secundaria y no debe competir con la función principal del Hub. Las aplicaciones individuales muestran únicamente su especie; Adaptive English conserva su Practice Tree existente.
