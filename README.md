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
- Expresión voluntaria de una necesidad, atribución pedagógica y límites de la herramienta. La interfaz está dirigida al estudiante.

## Datos

El resumen tiene un único botón principal: «Terminar pausa». Ese botón guarda automáticamente y termina la pausa, sin una elección adicional. Si el guardado falla, el formulario permanece abierto con las respuestas intactas. No se envían respuestas a un servidor. Al terminar se limpia la reflexión en memoria y en la pantalla. No hay cuentas ni sincronización.

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

## Historial visual

Mi historial ofrece Calendario y Lista. El calendario mensual agrupa registros por fecha local; cada casilla conserva las zonas presentes sin promediar las emociones. Seleccionar un día muestra las pausas desde la primera hasta la última. Las palabras propias o no reconocidas usan una categoría neutral. Los registros nuevos conservan las palabras elegidas separadas del texto libre; para los anteriores se reconocen solo coincidencias exactas con el vocabulario. No se calculan rachas, puntuaciones ni mejoras emocionales.

Pruebas adicionales en `tests/history.test.mjs`: calendario, años bisiestos, cambio de año, fechas locales, mezcla de colores y tratamiento de palabras propias.


## Versionado pedagógico

### 2026-10-01 · Bienestar estable como resultado válido

**Motivo del cambio.** Se incorpora explícitamente la posibilidad de que una persona complete un check-in y concluya que se siente bien o estable, sin asumir que siempre existe un problema, una necesidad de mejora o algo que resolver. El ajuste responde al principio de que el instrumento debe permitir reconocer necesidades, fortalezas y estabilidad con el mismo peso.

**Criterio de diseño.**
- El bienestar no se presenta desde un enfoque de déficit.
- Reconocer que algo marcha bien es un resultado válido del check-in.
- La persona puede identificar algo que quiere cuidar, algo que quiere mantener o no detectar una necesidad particular en ese momento.
- No se fuerza una reflexión adicional cuando la persona reporta estabilidad.

**Salida propuesta para el check-in de siete dimensiones (Sites), después de “Tu mapa de hoy”.**

Pregunta: **Al mirar tu mapa de hoy, ¿qué notas?**

1. 🌱 Hay algo a lo que me gustaría prestar más atención.
2. 🙌 Hay algo que está marchando bien y quiero reconocerlo.
3. 🙂 En general, me siento estable con cómo están las cosas ahora.
4. 🤔 No tengo una conclusión particular en este momento.

**Ramificación.**
- Opción 1 → continuar a reflexión/prioridad.
- Opción 2 → reflexión breve orientada a reconocer qué está funcionando y qué se desea mantener; puede cerrar después.
- Opción 3 → **permitir cerrar el check-in inmediatamente**, sin solicitar una necesidad, acción o compromiso adicional.
- Opción 4 → permitir cerrar o continuar de manera voluntaria.

**Mensaje para la salida “me siento estable”.**

> Está bien cerrar aquí. Reconocer que en este momento te sientes estable también es parte de revisar tu bienestar. Puedes volver cuando tenga sentido para ti.

**Texto general asociado al radar.**

> Tu mapa puede ayudarte a reconocer algo que quieras cuidar, valorar lo que ya está funcionando o simplemente confirmar cómo estás hoy.

Este versionado debe mantenerse también como criterio para futuras mediciones de utilidad: un resultado útil no se limita a detectar una necesidad; también puede consistir en confirmar estabilidad, reconocer una fortaleza o hacer una pausa sin identificar un cambio necesario.
