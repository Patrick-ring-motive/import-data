function test(){
  const text = importData('https://www.example.com');
  console.log(text);
}


const getSheet = ()=>{
  const files = DriveApp.getFilesByName('importDataSheet');
  try{
    return SpreadsheetApp.open(files.next());
  }catch{
    return SpreadsheetApp.create('importDataSheet');
  }
};


const delimeter = decodeURIComponent('%EE%87%AF');

function importData(url) {
  url = String(url).replaceAll('"','%22');
  const spreadSheet = getSheet();
  const sheet = spreadSheet.getSheetByName('buffer') || spreadSheet.insertSheet('buffer');
  sheet.getRange(1, 1).setFormula(`=IMPORTDATA("${url}","${delimeter}")`);
  SpreadsheetApp.flush();  
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return ""; 
  const range = sheet.getRange(1, 1, lastRow, 1);
  response = range.getValues().flat().join('\n');
  range.clear();
  SpreadsheetApp.flush();
  return response;
}
