# web-archive
A NodeJS wrapper to generate an archive.is webpage archive, and return the archived URL to the requester.

### Usage example

```javascript
    const archive = require("web-archive");
    try {
        let url = await save('https://www.npmjs.com/package/web-archive');
        console.log(`Archived URL: ${url}`);
    }
    catch(error) {
        log(`Result page archive failed ${error}`);
    }
```

### Available Options

```javascript
    // All options are optional
    {
        "forceRefresh": Boolean,
        // Default: False
        // If set to true, will always create new archive of URL
        "userAgent":String,
        // Default: new UserAgent().toString()
        // Use to override default request user agent
        "archiveSite":String,
        // Default: http://archive.vn
        // Choose default archive.is domain variant to attempt
        "timeout": Number
        // Default: 60000
        // How long to wait in milliseconds for archived URL to return before timing out
    }
```

### Passing Options Into Save Function
```javascript
    const options = {forceRefresh:true}; // Use any of the above options as it fits your use case
    await save('https://www.npmjs.com/package/web-archive', options);
```