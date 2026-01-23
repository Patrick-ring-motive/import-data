

//importCoreJs();

function myFunctionExample() {
  let myURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Male_and_female_chicken_sitting_together.jpg/220px-Male_and_female_chicken_sitting_together.jpg';
  console.log(Utilities.base64Encode(Utilities.newBlob([...sheetFetch(myURL)].map(x => x.codePointAt())).getBytes()));
  //console.log([...myURL].map(x=>x.codePointAt()));
}

function sheetFetch(url) {
  const sheetFetchFile = SpreadsheetApp.openById('118Ty5Y5humiZz3G9xOHbW9zgZCh3NkdSRI3oLIZ3lQQ');
  const sheetFetchService = sheetFetchFile.getSheetByName("fetch");
  let col;
  let cell;
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  try {
    col = getColumnLock(sheetFetchFile, sheetFetchService);
    cell = sheetFetchFile.setCurrentCell(sheetFetchService.getRange(`${col}2`));
    cell.setValue(`=IMPORTDATA("${url}","${String.fromCharCode(57840)}")`);
    SpreadsheetApp.flush();
    const cells = sheetFetchService.getRange(2, columns.indexOf(col) + 1, sheetFetchService.getLastRow(), 1).getValues();
    const fetchedValue = cells.join('\n').trim();
    return fetchedValue;
  } catch (e) {
    return e.message;
  } finally {
    (async () => {
      await "immediate";
      cell.setValue('');
      cell = sheetFetchFile.setCurrentCell(sheetFetchService.getRange(`${col}1`));
      cell.setValue('');
    })();
  }
}

function getColumnLock(sheetFetchFile, sheetFetchService) {
  const myID = new Date().getTime();
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let col = 'A';
  let cell;

  for (let i = 0; i < 1000; i++) {
    col = columns[getRandomInt(26)];
    cell = sheetFetchFile.setCurrentCell(sheetFetchService.getRange(`${col}1`));
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
