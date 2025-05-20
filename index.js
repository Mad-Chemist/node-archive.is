const UserAgent = require('user-agents');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const ARCHIVE_URL = "http://archive.vn"
const DEFAULT_TIMEOUT = 60 * 1000; // One Minute default timeout

async function save(req_url, options={}) {
	const {
		forceRefresh = false,
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
				if (/\/wip\/(.+)/.test(request.url())) { // If WIP, URL is archiving
					clearTimeout(timed_out);
					resolve(request.url().replace('/wip', ''));
				}
				else if (/\/\/.+\.[^\/]+\/(.{5})\/?$/.test(request.url())) { // Test if URL already archived
					clearTimeout(timed_out);
					resolve(request.url());
				}
			});

			await page.goto(archiveSite, { waitUntil: 'networkidle2' });

			if (forceRefresh) {
				await page.evaluate(() => {
					const input = document.createElement('input');
					input.type = "hidden";
					input.id = input.name = 'anyway';
					input.value = '1';
					document.querySelector('form#submiturl').prepend(input);
				});
			}

			await page.type('input#url', req_url);
			await page.click('form#submiturl input[type="submit"]');
			await page.waitForNavigation({ waitUntil: 'networkidle2' });
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