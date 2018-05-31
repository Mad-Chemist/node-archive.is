# node-archive.is
A wrapper to retrieve an archive.is archive for webpage given an URL

# Usage example

````
const archive = require("web-archive");
archive.save("https://www.npmjs.com/package/web-archive")
    .catch(error=>console.error(error))
    .then(url=> {
        console.log(`The generated archive can be reached at ${url}`);
    });
````
