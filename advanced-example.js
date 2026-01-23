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


const delimeter = String.fromCharCode(57840);

function importData(url) {
  url = String(url).replaceAll('"','%22');
  const spreadSheet = getSheet();
  const sheet = spreadSheet.getSheetByName('buffer') || spreadSheet.insertSheet('buffer');
  let col;
  let cell;
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  try {
    col = getColumnLock(spreadSheet, sheet);
    cell = spreadSheet.setCurrentCell(sheet.getRange(`${col}2`));
    cell.setValue(`=IMPORTDATA("${url}","${delimeter}")`);
    SpreadsheetApp.flush();
    const cells = sheet.getRange(2, columns.indexOf(col) + 1, sheet.getLastRow(), 1).getValues();
    const fetchedValue = cells.join('\n').trim();
    return fetchedValue;
  } catch (e) {
    return e.message;
  } finally {
    (async () => {
      await "immediate";
      cell.setValue('');
      cell = spreadSheet.setCurrentCell(importDataService.getRange(`${col}1`));
      cell.setValue('');
    })();
  }
}

function getColumnLock(importDataFile, importDataService) {
  const myID = new Date().getTime();
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let col = 'A';
  let cell;

  for (let i = 0; i < 1000; i++) {
    col = columns[getRandomInt(26)];
    cell = importDataFile.setCurrentCell(importDataService.getRange(`${col}1`));
    cell.setValue(myID);
    if (cell.getValues()[0] == myID) {
      return col;
    }
  }
  return col;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
