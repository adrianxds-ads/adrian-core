# Contrato visual del ecosistema Adrián Hub

Adaptive English es la aplicación matriz. Antes de diseñar una app nueva se reutilizan primero Adrián Visual System, Adrián Core y los componentes comunes existentes.

La identidad compartida incluye, cuando sea aplicable: paleta AVS, fondos oscuros, jerarquía tipográfica, tarjetas, botones, bordes, sombras, navegación, pantallas de pregunta y resultado, indicadores, medallas, animaciones, transiciones, sonidos y filosofía de interacción. Compartir identidad no obliga a copiar literalmente la interfaz: cada app puede adaptar la composición a su contenido.

## Temporizador visual común
Todo temporizador visible del Hub utiliza Adrián Visual Timer como patrón único: esfera analógica tipo temporizador visual físico, porción/pizza AVS, tiempo numérico secundario y escala marrón → oro. La lógica de tiempo puede variar por app, pero no se crean estilos de temporizador independientes. Tamaños permitidos: large, compact y mini. Los cambios visuales del temporizador se hacen primero en Adrián Core y después se propagan a los consumidores.

## Jardín GitHub
El jardín es una identidad transversal, no una base de datos estadística común. Cada aplicación tiene una especie distinta y una posición estable. El jardín completo vive en el Hub como capa lúdica secundaria; dentro de cada aplicación se muestra únicamente su propia planta. Las plantas sin métrica de progreso válida permanecen como semillas; nunca se fabrican puntos.

El sistema se diseña para 10.000 niveles, 50 niveles por hito y 200 hitos. Las piezas vegetales son deterministas y persistentes: una rama existente no desaparece en la fase siguiente. La forma adulta no se muestra anticipadamente.

## Desarrollo
La lógica específica permanece en el repositorio de cada app. Los patrones corporativos seguros se promueven a Adrián Core. No se bifurcan copias independientes del registro del jardín. Nuevas especies se añaden al registro común y al renderizador compartido.

Adaptive English conserva su Practice Tree actual mientras sea estable. Su integración con el jardín común debe evitar regresiones y no exige reescribir el árbol existente.
