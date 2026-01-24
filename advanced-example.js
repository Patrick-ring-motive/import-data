function test(){
  const text = importData('https://www.google.com');
  console.log(text);
}

const spreadSheetMemo = {};
const fileMemo = {};

const getSpreadSheetByName = (name)=>{
  if(name in spreadSheetMemo){
    return spreadSheetMemo[name];
  }
  try{
    fileMemo[name] = fileMemo[name] ?? DriveApp.getFilesByName(name).next();
    spreadSheetMemo[name] = SpreadsheetApp.open(fileMemo[name]);
  }catch{
    spreadSheetMemo[name] = SpreadsheetApp.create(name);
  }
  return spreadSheetMemo[name];
};

const getSheetBuffer = (spreadSheet,name) => {
  spreadSheet.memo = spreadSheet.memo ?? {};
  spreadSheet.memo[name] = spreadSheet.memo[name]
    ?? spreadSheet.getSheetByName(name)
    ?? spreadSheet.insertSheet(name);
  return spreadSheet.memo[name];
};

const delimeter = String.fromCharCode(57840);

function importData(url) {
  url = String(url).replaceAll('"','%22');
  const spreadSheet = getSpreadSheetByName('importDataSheet');
  const sheet = getSheetBuffer(spreadSheet,`buffer${~~(Math.random() * 10)}`);
  let col;
  let cell;
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  try {
    col = getColumnLock(spreadSheet, sheet);
    cell = spreadSheet.setCurrentCell(sheet.getRange(`${col}2`));
    cell.setValue(`=IMPORTDATA("${url}","${delimeter}")`);
    SpreadsheetApp.flush();
    let range = sheet.getRange(2, columns.indexOf(col) + 1, sheet.getLastRow(), 1);
    let cells = range.getValues();
    let result = cells.join('\n').trim();
    if(['#REF!','#N/A'].includes(result)){
      const currentRows = sheet.getMaxRows();
      sheet.insertRowsAfter(currentRows, 10000);
      while(sheet.getMaxRows()<10000)SpreadsheetApp.flush();
      cell.setValue('');
      SpreadsheetApp.flush();
      cell.setValue(`=IMPORTDATA("${url}","${delimeter}")`);
      SpreadsheetApp.flush();
      range = sheet.getRange(2, columns.indexOf(col) + 1, sheet.getLastRow(), 1);
      cells = range.getValues();
      result = cells.join('\n').trim();
    }
    return result;
  } catch (e) {
    return e.message;
  } finally {
    (async () => {
      await "defer";
      cell.setValue('');
      cell = spreadSheet.setCurrentCell(sheet.getRange(`${col}1`));
      cell.setValue('');
      SpreadsheetApp.flush();
    })();
  }
}

function getColumnLock(spreadSheet, sheet) {
  const myID = Utilities.getUuid();
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let col = 'A';
  let cell;

  for (let i = 0; i !== 1000; ++i) {
    col = columns[~~(Math.random() * 26)];
    cell = spreadSheet.setCurrentCell(sheet.getRange(`${col}1`));
    cell.setValue(myID);
    SpreadsheetApp.flush();
    if (cell.getValues()[0] == myID) {
      return col;
    }
  }
  return col;
}
