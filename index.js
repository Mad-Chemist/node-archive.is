const UserAgent = require('user-agents');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const ARCHIVE_URL = "http://archive.vn"
const DEFAULT_TIMEOUT = 60 * 1000; // One Minute default timeout

async function save(req_url, options={}) {
	const {
		userAgent = new UserAgent().toString(),
		archiveSite = ARCHIVE_URL,
		timeout = DEFAULT_TIMEOUT
	} = options;

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setUserAgent(userAgent); // Set a realistic User-Agent

	let error;
	let req = await new Promise(async (resolve, reject) => {
		let timed_out = setTimeout(() => reject('Request Timed Out'), timeout)
		try {
			await page.setRequestInterception(true);
			page.on('request', request => {
				request.continue();
				if (/\/wip\/(.+)/.test(request.url())) {
					clearTimeout(timed_out);
					resolve(request.url().replace('/wip', ''));
				}
			});

			await page.goto(archiveSite, { waitUntil: 'networkidle2' });
			await page.type('input#url', req_url);
			await page.click('form#submiturl input[type="submit"]');

			// Wait for page load then see if the archive needs to be re-archived
			await page.waitForNavigation({ waitUntil: 'networkidle2' });
			let needs_resave = await page.evaluate(() => !!document.querySelector('input[name="anyway"]'));
			if (needs_resave) {
				await page.click('form[action*="submit"] input[type="submit"]');
			}
		}
		catch (error) {
			clearTimeout(timed_out);
			reject(error);
		}
	}).catch(e => (error=e));

	await browser.close();

	// Throw if unable to archive
	if (error) {
		throw new Error(error)
	}

	return req;
}

module.exports = {save};