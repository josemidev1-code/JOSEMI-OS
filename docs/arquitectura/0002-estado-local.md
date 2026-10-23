# ADR 002 · Preferencias y progreso locales

Estado: implementado; documentado el 23 de octubre de 2026.

**Situación.** El escritorio necesita recordar fondos, temas, notas y progreso de juego sin obligar al visitante a crear una cuenta.

**Decisión implementada.** Guardar ese estado en `localStorage`, con lectura y escritura protegidas frente a errores. Los cambios de identificadores se migran: por ejemplo, el fondo `marioWorld` pasa a `platformWorld`, incluidos los favoritos de galería.

**Consecuencias.** Las preferencias sobreviven a una recarga en el mismo navegador. No hay sincronización entre dispositivos, recuperación de cuenta ni protección para información sensible. El navegador puede borrar o bloquear este almacenamiento, por lo que la web conserva valores por defecto. Secret Vault es un juego, no un sistema de permisos.

**Alternativa.** Una base de datos con usuarios permitiría sincronizar, pero añadiría autenticación, tratamiento de datos personales y mantenimiento que el portfolio no necesita ahora. No se usa una cookie porque estos ajustes no necesitan enviarse al servidor.
