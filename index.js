const _ = require('lodash');
const phantom = require('phantom');
const ARCHIVE_URL = "http://www.archive.is"

function testUrl(url) {
	// Verifies that the URL is likely the archive link and not submit link
	let domainCheck = new RegExp(/archive\.is\/.{5}/, "g");
	let archiveUrl = new RegExp(/archive\.is\/submit|archive\.is\/\?run/, "g");

	return !archiveUrl.test(url) && domainCheck.test(url);
}

function loadPage(url) {
	return new Promise((resolve, reject) => {
		try {
			phantom.create()
				.catch(reject)
				.then(function(ph) {

				    ph.createPage()
					    .catch(reject)
					    .then(function(page) {

					    	let timeout = false;
					    	page.on("onNavigationRequested", (url, type, willNavigate, main) => {
					    		clearTimeout(timeout);
					    		if (testUrl(url) === true) {
									resolve(url);
									page.close().then(()=> ph.exit());
					    		}
					    		else {
					    			timeout = setTimeout(()=> {
					    				reject(`Attempting to get the archive link has timed out.`);
					    				page.close().then(()=> ph.exit());
					    			}, 5000);
					    		}
					    	})

					        page.open(url);
					    });
				});
		}
		catch(error) {
			reject(error);
		}
	});
}

let api = {
	save: function(url) {
		return new Promise((resolve, reject) => {
			if (typeof url !== "string") {
				return reject(`The URL provided is not a string as required, but rather ${typeof url}`);
			}

			loadPage(`${ARCHIVE_URL}/?run=1&url=${encodeURIComponent(url)}`)
				.catch(reject)
				.then(responseUrl=> {
					resolve(responseUrl);
				})
		})
	}
};

module.exports = api;