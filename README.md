# Diagnóstico de equipo IENN

Encuesta de diagnóstico de equipo (Inteligencia Colaborativa) con un panel privado de resultados: promedio por dimensión, dispersión, NPS, áreas de oportunidad y comparación por antigüedad.

## Cómo funciona

- La encuesta es una página estática (`index.html`) publicada con GitHub Pages. No requiere cuenta de nadie.
- Cada respuesta se envía a un script de Google (`apps-script/Code.gs`) que la guarda en una hoja de Google Sheets del propietario. Los datos no viven en este repositorio.
- El panel de resultados se abre tocando 5 veces el texto pequeño del final de la página (o añadiendo `#panel` a la dirección) y pide una clave. Se actualiza solo cada 20 segundos.
- El enlace que se comparte con el equipo lleva un código: `https://<usuario>.github.io/<repositorio>/?c=CODIGO`. Sin ese código, el script rechaza los envíos.

## Configuración (una sola vez)

1. Crea una hoja de Google Sheets vacía.
2. Dentro de la hoja: Extensiones > Apps Script. Pega el contenido de `apps-script/Code.gs`.
3. Cambia `CLAVE_PANEL` y `CODIGO_EQUIPO` por valores propios (mínimo 8 caracteres).
4. Ejecuta la función `configurar` y acepta los permisos. Crea las pestañas `Respuestas`, `Preguntas` y `Control`.
5. Implementar > Nueva implementación > Aplicación web. Ejecutar como: yo. Acceso: cualquier persona. Copia la dirección que termina en `/exec`.
6. Pega esa dirección en la variable `API_URL` de `index.html` y sube el cambio.

Si cambias el código del script, hay que crear una nueva versión desde Implementar > Administrar implementaciones para que el cambio se aplique.

## Privacidad

- La hoja guarda fecha, si la persona lleva más de 3 meses en el equipo, las 25 respuestas, la recomendación (1 a 10) y el comentario. No guarda nombres, correos ni cuentas.
- Para evitar envíos repetidos, el navegador genera una marca aleatoria que se anota en la pestaña oculta `Control`. No identifica a nadie, y borrar los datos del navegador permite responder otra vez.
- Este repositorio es público, pero no contiene respuestas ni claves.
