/**
 * Chalkline Foundation: Google Sheets backend (Google Apps Script)
 *
 * Paste this whole file into Extensions > Apps Script inside your Google Sheet.
 * The Sheet needs two tabs:
 *   "Volunteers"  where form sign ups are saved (this script writes to it)
 *   "Stats"       where the live numbers for the page are read from
 *
 * Stats tab layout (column A = key, column B = number):
 *   classrooms | 48
 *   pupils     | 2160
 *   schools    | 17
 *   states     | 4
 *   volunteers | =320 + MAX(0, COUNTA(Volunteers!B:B) - 1)
 */

var SHEET_VOLUNTEERS = 'Volunteers';
var SHEET_STATS = 'Stats';
var HEADERS = ['Received at', 'Name', 'Email', 'Phone', 'State', 'Can help with', 'Message'];
var STAT_KEYS = ['classrooms', 'pupils', 'schools', 'states', 'volunteers'];
var ALLOWED_STATES = ['Lagos', 'Ogun', 'Oyo', 'Abuja (FCT)', 'Another state'];

/** The page sends a form sign up here. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // one request at a time, so rows never overwrite each other
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var data = JSON.parse(raw);
    var clean = validate_(data);
    if (!clean) return json_({ ok: false, error: 'invalid' });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_VOLUNTEERS);
    if (!sheet) return json_({ ok: false, error: 'missing_sheet' });
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    sheet.appendRow([
      new Date(),
      safe_(clean.name),
      safe_(clean.email),
      safe_(clean.phone),
      safe_(clean.state),
      safe_(clean.help),
      safe_(clean.message)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/** The page asks for live numbers here: ...exec?action=stats */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action !== 'stats') return json_({ ok: true, message: 'Chalkline endpoint is running.' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_STATS);
  if (!sheet) return json_({ ok: false, error: 'missing_sheet' });

  var rows = sheet.getDataRange().getValues();
  var out = {};
  for (var i = 0; i < rows.length; i++) {
    var key = String(rows[i][0]).trim().toLowerCase();
    var val = Number(rows[i][1]);
    // Only share the keys we listed, and only real numbers. Nothing else leaves the Sheet.
    if (STAT_KEYS.indexOf(key) !== -1 && isFinite(val)) out[key] = val;
  }
  return json_(out);
}

/** Check every field again on the server. Never trust the browser. */
function validate_(d) {
  if (!d || typeof d !== 'object') return null;
  if (String(d.website || '').trim() !== '') return null; // spam trap was filled

  var name = String(d.name || '').trim();
  var email = String(d.email || '').trim();
  var phone = String(d.phone || '').trim();
  var state = String(d.state || '').trim();
  var help = String(d.help || '').trim();
  var message = String(d.message || '').trim();

  if (name.length < 2 || name.length > 80) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return null;
  if (phone && !/^[0-9+()\s-]{7,20}$/.test(phone)) return null;
  if (ALLOWED_STATES.indexOf(state) === -1) return null;

  return {
    name: name,
    email: email,
    phone: phone,
    state: state,
    help: help.slice(0, 200),
    message: message.slice(0, 1000)
  };
}

/**
 * Stops "formula injection". If someone types =HYPERLINK(...) as their name,
 * Sheets would run it. A leading apostrophe makes it plain text.
 */
function safe_(value) {
  var s = String(value).replace(/[\u0000-\u001F]/g, ' ');
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
