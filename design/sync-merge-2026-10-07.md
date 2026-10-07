# Conciliación conservadora de Cambridge — 7 de octubre de 2026

Estado: candidato local Sync 1.0.6, pendiente de autorización de publicación. Producción continúa en 1.0.5.

Cuando dos dispositivos completan ejercicios distintos sobre un historial común, el cliente y el servidor unen los intentos de cambridgeB2ExerciseStatsV3 por su id. Conservan cada intento completo y ordenan por completedAt e id. Un reintento de envío conserva el mismo conjunto de intentos.

La unión exige identificadores, resultados válidos, fechas válidas y metadatos superiores idénticos. Un mismo id con contenido distinto, registros antiguos sin id o metadatos incompatibles siguen como conflicto preservado. No se combinan por aproximación ni se suman contadores agregados de otras aplicaciones.

El cliente crea una copia de recuperación del historial local antes de reemplazarlo. La unión que todavía no existe en el servidor se mantiene en la cola persistente. El servidor conserva su mecanismo existente de copia previa al guardado. No se han tocado estados, secretos, logs ni backups reales durante estas pruebas.

El servidor acepta contribuciones identificadas aunque procedan de un reloj anterior. Una respuesta unida distinta del payload no confirma ese payload: acceptedKeys lo excluye y mergedKeys lo identifica. Tanto clientes anteriores como el nuevo cliente descargan la unión antes de declarar resuelto el envío.

Validación:
- node scripts/sync-merge.cjs: unión conmutativa, asociativa e idempotente; identidades en conflicto; registros antiguos; metadatos incompatibles; reloj anterior; reintentos; recuperación; cola tras recarga; respuesta del servidor y descarga de la unión.
- node scripts/sync-integrity.cjs: regresiones, borrados protegidos, esquemas, pendientes sin conexión y recuperación.
- Estado HTTP y almacenamiento simulados; ninguna escritura a progreso real.
- git diff --check en Core y servidor.

Publicación propuesta:
1. Publicar servidor compatible y Core 1.0.6 tras preservar el estado.
2. Actualizar pins, catálogos y huellas de consumidores con el procedimiento de release existente.
3. Verificar recursos publicados y transporte con clave desechable; probar conflictos con datos sintéticos.
4. Conservar las sesiones abiertas hasta su cierre natural.

Riesgo residual: este cambio añade escrituras de unión sobre historiales reales al desplegarse. La cobertura se limita a Cambridge identificado; las otras apps y los registros incompatibles siguen requiriendo conciliación específica.
