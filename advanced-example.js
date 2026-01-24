function test(){
  const text = importData('https://www.example.com');
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
  spreadSheet.getSheetByName(name) || spreadSheet.insertSheet(name);
};
const delimeter = String.fromCharCode(57840);

function importData(url) {
  url = String(url).replaceAll('"','%22');
  const spreadSheet = getSpreadSheetByName('importDataSheet');
  const sheet = getSheetBuffer(`buffer${~~(Math.random() * 100)}`):
  let col;
  let cell;
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  try {
    col = getColumnLock(spreadSheet, sheet);
    cell = spreadSheet.setCurrentCell(sheet.getRange(`${col}2`));
    cell.setValue(`=IMPORTDATA("${url}","${delimeter}")`);
    SpreadsheetApp.flush();
    const cells = sheet.getRange(2, columns.indexOf(col) + 1, sheet.getLastRow(), 1).getValues();
    return cells.join('\n').trim();
  } catch (e) {
    return e.message;
  } finally {
    (async () => {
      await "defer";
      cell.setValue('');
      cell = spreadSheet.setCurrentCell(sheet.getRange(`${col}1`));
      cell.setValue('');
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
    if (cell.getValues()[0] === myID) {
      return col;
    }
  }
  return col;
}
