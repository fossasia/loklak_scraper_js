var BaseLoklakScrapper = require('./base');

class TwitterLoklakScrapper extends BaseLoklakScrapper {

	constructor() {
		super('Twitter', 'https://twitter.com/');
	}

	argumentSanityCheck(args) {
		super.argumentSanityCheck(args);

		if (args.length <= 2) {
			console.error('Atleast one argument required.');
			process.exit(-1);
		}

		return true;
	}

	onInit() {
		this.REQUEST_URL = this.BASE_URL + '';
		this.request();
	}

	scrape($) {
		// Scraping logic goes here.
		// We have our HTML and $ set here so we can directly use these.
		// Set the result as this.JSON = {}
	}
}

module.exports = TwitterLoklakScrapper;

new TwitterLoklakScrapper();
