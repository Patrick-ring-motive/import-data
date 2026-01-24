# Google Apps Scripts Tricks: Beyond UrlFetchApp

Google Apps Script has one of the most generous free tiers of any edge compute platforms. 
Still it has its [limits](https://developers.google.com/apps-script/guides/services/quotas) that you have to be mindful of and manage. One of those limits is [`UrlFetchApp`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) which lets you make almost any kind of http request.
It is your primary connector to services and apis outside your google workspace. Needless to say this is tool is powerful and it can feel limiting once you reach your daily limit. 
This is why it is important to understand all the tools at your disposal and one often overlooked tool is the `IMPORTDATA` in google sheets. It is designed to pull data from across the web into a spreadsheet but when configured correctly, can situationally be used as a substitute for `UrlFetchApp` and importantly, does not share the same quota limits. This is where we dive into how to effectively leverage `IMPORTDATA` and handle the limits and edge cases that it has.

## IMPORTDATA

We'll start with this [basic example](https://github.com/Patrick-ring-motive/import-data/blob/main/basic-example.js). Calling `IMPORTDATA` is relatively straight forward. Let's step through each piece.

```js
const getSheet = ()=>{
  const files = DriveApp.getFilesByName('importDataSheet');
  try{
    return SpreadsheetApp.open(files.next());
  }catch{
    return SpreadsheetApp.create('importDataSheet');
  }
};
```

This is a simple helper function that lets us get a Google Sheet file by name or create one if it doesn't exist.

This next part looks a bit strange.

```js
const delimeter = String.fromCharCode(57840);
```

By default `IMPORTDATA` tries to parse the data received from the URL as a CSV and splits using commas as delimeters. 
We can override the character used as a delimeter using the second parameter of `IMPORTDATA`. `const delimeter = String.fromCharCode(57840);` is not a valid unicode character so we don't expect it to appear in text data. This effectively constrains our response to a single column.

⠀

```js
url = String(url).replaceAll('"','%22');
```

This is a basic sanitization to prevent escaping the sheet command.

⠀

```js
  const spreadSheet = getSheet();
  const sheet = spreadSheet.getSheetByName('buffer') || spreadSheet.insertSheet('buffer');
```

Here we get the spreadsheet file and either grab the buffer sheet or create it.

⠀

```js
  sheet.getRange(1, 1).setFormula(`=IMPORTDATA("${url}","${delimeter}")`);
  SpreadsheetApp.flush();  
```

This initiates the fetch request in the very first cell and waits for the response.

⠀

```js
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return ""; 
  const range = sheet.getRange(1, 1, lastRow, 1);
  response = range.getValues().flat().join('\n');
```

Here we get the entire row. The response will spill over into additional cells by spliting in '\n' so we grab all the values and `.trim()` since all the empty rows at the end will be collected as well.

⠀

```js
  range.clear();
  SpreadsheetApp.flush();
  return response;
```

Finally we cleanup the sheet and return the response.
⠀

Now we run the example and see the result `#REF!`. Lets open up Google Sheets and inspect the problem.

![](https://patrick-ring-motive.github.io/import-data/importData.jpeg)

This warning comes from a Google Sheets security feature which is waranted since we are importing data from anywhere. Simply `Allow access` and run the script again.
