// Paste this entire file into your Google Apps Script editor
// Extensions > Apps Script > replace everything > Save > Deploy as Web App

var SPREADSHEET_ID = "1DbzgT0NQGg_Dfo1dsijc1d6X99AzUI0IJRUCp_fKvKo";
var SHEET_NAME = "Foglio1";

function getLabel(labelObj) {
  if (!labelObj) return "";
  if (typeof labelObj === "string") return labelObj;
  return labelObj.en || labelObj.it || labelObj.el || labelObj.es || "";
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot check - silently reject bots
    if (data.honeypot) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    // Write header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Session ID",
        "City",
        "Language",
        "Station ID",
        "Station Name",
        "Issue Category",
        "Issue Subcategory",
        "Additional Details",
        "Distance from Stop",
        "Wants Contact",
        "Email",
        "Phone",
        "Demographics Consent",
        "Gender",
        "Age Range",
        "Income"
      ]);
    }

    var demo = data.demographics || {};
    var station = data.station || {};
    var issue = data.issue || {};
    var category = issue.category || {};
    var subcategory = issue.subcategory || {};
    var contact = data.contact || {};

    sheet.appendRow([
      new Date().toISOString(),
      data.sessionId || "",
      data.city || "",
      data.lang || "",
      station.id || "",
      station.name || "",
      getLabel(category.label),
      getLabel(subcategory.label),
      data.details || "",
      data.distanceBucket || "unavailable",
      contact.wantsContact ? "Yes" : "No",
      contact.email || "",
      contact.phone || "",
      demo.wantsDemographics ? "Yes" : "No",
      demo.gender || "",
      demo.age || "",
      demo.income || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
