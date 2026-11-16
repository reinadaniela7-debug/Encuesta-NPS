/**
 * Diagnóstico de equipo IENN
 * Recibe las respuestas de la encuesta y las guarda en esta hoja de Google Sheets.
 *
 * Antes de implementarlo:
 *  1. Cambia CLAVE_PANEL (la que te pedirá tu panel de resultados) y CODIGO_EQUIPO
 *     (el código que va en el enlace de la encuesta, después de "?c=").
 *  2. Ejecuta una vez la función "configurar" y acepta los permisos.
 *  3. Implementar > Nueva implementación > Aplicación web.
 *     Ejecutar como: Yo. Quién tiene acceso: Cualquier persona.
 */

var CLAVE_PANEL = "CAMBIA-ESTA-CLAVE";
var CODIGO_EQUIPO = "CAMBIA-ESTE-CODIGO";

var HOJA = "Respuestas";
var HOJA_CONTROL = "Control";
var HOJA_PREGUNTAS = "Preguntas";
var COL_COMENTARIO = 29;
var DIMENSIONES = ["Confianza", "Resolución de problemas", "Compromiso", "Responsabilidades", "Resultados"];
var ANTIGUEDAD = { si: "Más de 3 meses", no: "3 meses o menos", na: "Prefiero no decirlo" };
var ANTIGUEDAD_INV = { "Más de 3 meses": "si", "3 meses o menos": "no", "Prefiero no decirlo": "na" };

var PREGUNTAS = [
  "Los miembros del equipo admiten sus errores y debilidades de forma abierta.",
  "Los miembros del equipo se piden ayuda unos a otros sin dudarlo.",
  "Los miembros del equipo se disculpan entre sí cuando actúan de forma inapropiada.",
  "Los miembros del equipo sienten la confianza de decir “no” o “ahora no” a una nueva solicitud si ya están al máximo de su capacidad.",
  "Los miembros del equipo están dispuestos a admitir que otros tienen mejores habilidades.",
  "Las reuniones son apasionantes y nada aburridas.",
  "Durante las reuniones, se sacan a relucir los temas más difíciles para resolverlos.",
  "Los miembros del equipo expresan sus opiniones aunque sean contrarias a las de los demás.",
  "Los miembros del equipo mantienen un trato respetuoso incluso durante discusiones acaloradas.",
  "Se incentiva a los miembros a cuestionar el “status quo” de los procesos actuales.",
  "Los miembros del equipo salen de las reuniones confiando en que todos aceptaron las decisiones.",
  "El equipo termina las reuniones con directrices y metas claras.",
  "Se apoya la decisión final del grupo, incluso si hubo desacuerdos iniciales.",
  "Incluso con incertidumbre, el equipo toma acciones concretas en lugar de paralizarse.",
  "Las prioridades del equipo están claras para todos en todo momento.",
  "Los miembros del equipo se llaman la atención sobre conductas improductivas.",
  "El equipo presiona a los miembros que rinden poco para que mejoren.",
  "Todos se sienten responsables de los resultados, inclusive cuando son mediocres.",
  "Los miembros prefieren confrontar a un compañero antes que acudir al líder.",
  "El equipo revisa periódicamente su progreso respecto a los estándares establecidos.",
  "Los miembros sacrifican voluntariamente su reconocimiento por el bien del equipo.",
  "El equipo se enfoca en el éxito colectivo más que en objetivos individuales.",
  "Se sienten profundamente afectados cuando el equipo no logra sus metas.",
  "Manejamos correctamente la flexibilidad y respetamos los límites sanos.",
  "Se celebran los hitos del equipo con entusiasmo por parte de todos."
];

function encabezados_() {
  var h = ["Fecha", "Más de 3 meses en el equipo"];
  DIMENSIONES.forEach(function (d) {
    for (var i = 1; i <= 5; i++) h.push(d + " " + i);
  });
  h.push("Recomendación (1 a 10)");
  h.push("Comentario");
  return h;
}

function configurado_(valor) {
  return typeof valor === "string" && valor.length >= 8 && valor.indexOf("CAMBIA") !== 0;
}

/** Ejecútala una vez a mano: crea las pestañas y los encabezados. */
function configurar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var hoja = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  var enc = encabezados_();
  hoja.getRange(1, 1, 1, enc.length).setValues([enc]).setFontWeight("bold");
  hoja.setFrozenRows(1);
  var filas = Math.max(hoja.getMaxRows() - 1, 1);
  hoja.getRange(2, 1, filas, 1).setNumberFormat("dd/mm/yyyy hh:mm");
  hoja.getRange(2, COL_COMENTARIO, filas, 1).setNumberFormat("@");

  var control = ss.getSheetByName(HOJA_CONTROL) || ss.insertSheet(HOJA_CONTROL);
  control.getRange(1, 1, 1, 1).setValues([["Marcas de envío (evitan respuestas repetidas desde el mismo navegador)"]]);

  var pr = ss.getSheetByName(HOJA_PREGUNTAS) || ss.insertSheet(HOJA_PREGUNTAS);
  var filasPr = [["Columna", "Pregunta"]];
  for (var i = 0; i < 25; i++) {
    filasPr.push([DIMENSIONES[Math.floor(i / 5)] + " " + ((i % 5) + 1), PREGUNTAS[i]]);
  }
  filasPr.push(["Recomendación (1 a 10)", "¿Qué tan probable es que recomiendes tu puesto de trabajo a un amigo o colega?"]);
  filasPr.push(["Comentario", "¿Hay algo que le quieras regalar al equipo para mejorar? ¿Cómo crees que afecta esto al equipo?"]);
  filasPr.push(["Escala", "Preguntas de la 1 a la 25: 1 = Nunca, 5 = Siempre. Recomendación: 1 a 10."]);
  pr.getRange(1, 1, filasPr.length, 2).setValues(filasPr);
  pr.getRange(1, 1, 1, 2).setFontWeight("bold");

  var primera = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (primera && primera.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(primera);
  var ctl = ss.getSheetByName(HOJA_CONTROL);
  if (ctl) ctl.hideSheet();
  return "Listo";
}

function salida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return salida_({ ok: true, mensaje: "La encuesta está conectada. Esta dirección solo recibe respuestas." });
}

function doPost(e) {
  var res;
  try {
    var p = JSON.parse(e.postData.contents);
    if (p.action === "submit") res = guardar_(p);
    else if (p.action === "results") res = resultados_(p);
    else res = { ok: false, error: "accion" };
  } catch (err) {
    res = { ok: false, error: "error" };
  }
  return salida_(res);
}

function guardar_(p) {
  if (!configurado_(CODIGO_EQUIPO)) return { ok: false, error: "config" };
  if (String(p.code || "") !== CODIGO_EQUIPO) return { ok: false, error: "code" };

  var token = String(p.token || "");
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return { ok: false, error: "datos" };

  var a = p.a;
  if (!Array.isArray(a) || a.length !== 26) return { ok: false, error: "datos" };
  for (var i = 0; i < 26; i++) {
    var max = i === 25 ? 10 : 5;
    if (typeof a[i] !== "number" || Math.floor(a[i]) !== a[i] || a[i] < 1 || a[i] > max) return { ok: false, error: "datos" };
  }
  var tn = ANTIGUEDAD[p.tn];
  if (!tn) return { ok: false, error: "datos" };
  var t = typeof p.t === "string" ? p.t.trim().slice(0, 1000) : "";

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: "busy" };
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName(HOJA);
    var control = ss.getSheetByName(HOJA_CONTROL);
    if (!hoja || !control) return { ok: false, error: "config" };

    var n = control.getLastRow();
    if (n >= 2) {
      var vistos = control.getRange(2, 1, n - 1, 1).getValues();
      for (var j = 0; j < vistos.length; j++) {
        if (String(vistos[j][0]) === token) return { ok: false, error: "duplicate" };
      }
    }
    control.getRange(n + 1, 1).setValues([[token]]);

    var fila = [new Date(), tn].concat(a.slice(0, 25)).concat([a[25], t]);
    var r = hoja.getLastRow() + 1;
    hoja.getRange(r, 1).setNumberFormat("dd/mm/yyyy hh:mm");
    hoja.getRange(r, COL_COMENTARIO).setNumberFormat("@");
    hoja.getRange(r, 1, 1, fila.length).setValues([fila]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function resultados_(p) {
  if (!configurado_(CLAVE_PANEL)) return { ok: false, error: "config" };
  if (String(p.key || "") !== CLAVE_PANEL) return { ok: false, error: "key" };

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!hoja) return { ok: false, error: "config" };
  var n = hoja.getLastRow();
  var rows = [];
  if (n >= 2) {
    var vals = hoja.getRange(2, 1, n - 1, COL_COMENTARIO).getValues();
    for (var i = 0; i < vals.length; i++) {
      var v = vals[i];
      rows.push({
        at: v[0] instanceof Date ? v[0].toISOString() : "",
        tn: ANTIGUEDAD_INV[v[1]] || "na",
        a: v.slice(2, 28).map(Number),
        t: String(v[28] || "")
      });
    }
  }
  return { ok: true, rows: rows };
}
