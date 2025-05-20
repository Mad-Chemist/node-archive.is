# node-archive.is
A wrapper to retrieve an archive.is archive for webpage given an URL

# Usage example

````
const archive = require("web-archive");
try {
    let url = await save('https://www.npmjs.com/package/web-archive')
    console.log(`Archived URL: ${url}`);
}
catch(error) {
    log(`Result page archive failed ${error}`);
}
````
