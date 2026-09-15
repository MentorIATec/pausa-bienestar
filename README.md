# Pausa de bienestar

Portada común y Mi pausa, publicadas en GitHub Pages.

## Experiencias

- **Mi pausa**: tres pasos de reflexión (reconocer, comprender y elegir), resumen y cierre. Recupera la propuesta original de ChatGPT y amplía el acompañamiento pedagógico.
- **Mis siete dimensiones**: enlaza al check-in original en https://pausadebienestar.me. El sitio, su base de datos y su historial permanecen en Sites.

## Mi pausa

- Mapa de energía y agrado con orientación constante, incluso en móvil.
- Hasta dos emociones del mapa, definiciones orientativas, palabras propias e incertidumbre explícita.
- Posibles razones y relación opcional con una dimensión, sin volver a puntuarla.
- Necesidad elegida por la persona, sugerencias de acciones, redacción propia y momento opcional para actuar.
- Inicio, durante el día y cierre; el cierre permite reconocer qué ayudó o qué esfuerzo se quiere valorar.
- Guía para facilitar la pausa en clase, expresión voluntaria de una necesidad, atribución pedagógica y límites de la herramienta.

## Datos

Guardar exige una acción explícita en el resumen. No se envían respuestas a un servidor. Al terminar se limpia la reflexión en memoria y en la pantalla. No hay cuentas ni sincronización.

Las nuevas pausas se guardan en `mi-pausa.history.v2`. Se leen también `mi-pausa.history.v1` (prototipo ChatGPT) y `mi-pausa-history-v1` (primera publicación). Leer un formato anterior no lo modifica. Borrar una pausa afecta solo a su origen; borrar todo elimina únicamente las tres claves de Mi pausa.

El almacenamiento se limita al mismo origen web y navegador. No se traslada automáticamente el historial de un archivo descargado, otro dominio o el check-in de Sites. Una fuente dañada se conserva y se muestra un aviso; las fuentes legibles siguen disponibles. Si falla el guardado, no se presenta como exitoso.

## Publicación y mantenimiento

GitHub Pages sirve la rama `main`, carpeta raíz. No hay compilación ni dependencias de ejecución externas. Las rutas son relativas para funcionar bajo `/pausa-bienestar/`. `.nojekyll` evita el procesamiento de Jekyll.

- `mi-pausa/data.js`: vocabulario y propuestas pedagógicas.
- `mi-pausa/app.js`: navegación y presentación.
- `mi-pausa/storage.js`: compatibilidad y persistencia.
- `mi-pausa/app.css`: estilos y adaptaciones responsive.
- `tests/storage.test.mjs`: pruebas de preservación, compatibilidad y fallos de almacenamiento.

Pruebas: `npm test` (Node.js). Desarrollo: servir esta carpeta con un servidor HTTP estático.

La revisión heurística y las pruebas funcionales no sustituyen un pilotaje con estudiantes ni una auditoría completa de accesibilidad.
