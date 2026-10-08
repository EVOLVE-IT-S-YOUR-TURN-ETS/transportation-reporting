// Paste this entire file into your Google Apps Script editor
// Extensions → Apps Script → replace everything → Deploy as Web App

const SPREADSHEET_ID = "1DbzgT0NQGg_Dfo1dsijc1d6X99AzUI0IJRUCp_fKvKo";
const SHEET_NAME = "Foglio1";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Honeypot check — silently reject bots
    if (data.honeypot) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

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
        "Income",
      ]);
    }

    const demo = data.demographics || {};

    sheet.appendRow([
      new Date().toISOString(),
      data.sessionId || "",
      data.city || "",
      data.lang || "",
      data.station?.id || "",
      data.station?.name || "",
      data.issue?.category?.label || "",
      data.issue?.subcategory?.label || "",
      data.details || "",
      data.distanceBucket || "unavailable",
      data.contact?.wantsContact ? "Yes" : "No",
      data.contact?.email || "",
      data.contact?.phone || "",
      demo.wantsDemographics ? "Yes" : "No",
      demo.gender || "",
      demo.age || "",
      demo.income || "",
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

// Handles CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
