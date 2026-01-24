# Google Apps Scripts Tricks: Beyond UrlFetchApp

Google Apps Script has one of the most generous free tiers of any edge compute platforms. 
Still it has its [limits](https://developers.google.com/apps-script/guides/services/quotas) that you have to be mindful of and manage. One of those limits is [`UrlFetchApp`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) which lets you make almost any kind of http request.
It is your primary connector to services and apis outside your google workspace. Needless to say this is tool is powerful and it can feel limiting once you reach your daily limit. 
This is why it is important to understand all the tools at your disposal and one often overlooked tool is the `IMPORTDATA` in google sheets. It is designed to pull data from across the web into a spreadsheet but when configured correctly, can situationally be used as a substitute for `UrlFetchApp` and importantly, does not share the same quota limits. This is where I dive into how to effectively leverage `IMPORTDATA` and handle the limits and edge cases that it has.
