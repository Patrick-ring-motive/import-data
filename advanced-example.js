

function importData(url) {
  const importDataFile = SpreadsheetApp.openById('118Ty5Y5humiZz3G9xOHbW9zgZCh3NkdSRI3oLIZ3lQQ');
  const importDataService = importDataFile.getSheetByName("importDataSheet");
  let col;
  let cell;
  const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  try {
    col = getColumnLock(importDataFile, importDataService);
    cell = importDataFile.setCurrentCell(importDataService.getRange(`${col}2`));
    cell.setValue(`=IMPORTDATA("${url}","${String.fromCharCode(57840)}")`);
    SpreadsheetApp.flush();
    const cells = importDataService.getRange(2, columns.indexOf(col) + 1, importDataService.getLastRow(), 1).getValues();
    const fetchedValue = cells.join('\n').trim();
    return fetchedValue;
  } catch (e) {
    return e.message;
  } finally {
    (async () => {
      await "immediate";
      cell.setValue('');
      cell = importDataFile.setCurrentCell(importDataService.getRange(`${col}1`));
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
