# Sync 1.0.4 · repair block 1/6

Protected remote deletes are rejected on both ends. Schema counters cover Pizarras answers, Cambridge attempts and nested HOTI studyGame. Regressing/divergent snapshots stay local; any protected snapshot replaced by a remote value is first retained under a local recovery key. Pending writes persist in sync metadata and survive reload/offline. No write freeze. Server acknowledgements identify accepted keys.

Validation: node scripts/sync-integrity.cjs, client/server syntax and diff checks. Tests use synthetic storage and mocked server filesystem, never production state.

Limit: divergent aggregate snapshots are preserved rather than automatically added, because sessions lack universal event IDs. Cross-device live acceptance and deployment are pending. A local reset does not authorize resetting another device. Consumer pins will be updated in block 5/6.
