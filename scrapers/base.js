const request = require('request-promise-native');
const cheerio = require('cheerio');

/**
 * Base class for all the scrappers.
 */
class BaseLoklakScrapper {

	constructor(name, url = '') {
		this._scrapperName = name;
		this._baseUrl = url;
		this._requestUrl = url;
		this._html = null;
		this._$ = null;
		this._procArgs = process.argv;
		this._json = null;
		this.init();
	}


	/**
	 * Gets the name of the scrapper, Initially provided as a constructor parameter.
	 */
	get SCRAPPER_NAME() {
		return this._scrapperName;
	}

	/**
	 * Gets Base URL of the scrapper, Initially provided as a constructor parameter.
	 */
	get BASE_URL() {
		return this._baseUrl;
	}


	/**
	 * Gets URL of the scrapper where request is to be sent, Initially provided as a constructor parameter.
	 * This is initially same as BASE_URL.
	 */
	get REQUEST_URL() {
		return this._requestUrl;
	}

	/**
	 * Changes the REQUEST_URL.
	 */
	set REQUEST_URL(url) {
		this._requestUrl = url;
	}

	/**
	 * Gives all the process argument as an array.
	 * Includes the node path and file path.
	 */
	get PROC_ARGS() {
		return this._procArgs;
	}

	/**
	 * Gives all the arguments provided by the user.
	 * Excludes the node path and filepath
	 */
	get SLICED_PROC_ARGS() {
		return this.PROC_ARGS.slice(2);
	}

	/**
	 * Gives the scrapped html scraped by the scrapper.
	 */
	get HTML() {
		return this._html;
	}

	/**
	 * Sets the html this is to be used when you retrive the result.
	 */
	set HTML(html) {
		this._html = html;
	}

	/**
	 * Gets the cheerio Loaded html.
	 */
	get $() {
		return this._$;
	}

	/**
	 * Sets the cheerio loaded html.
	 */
	set $(cheerioLoad) {
		this._$ = cheerioLoad;
	}

	/**
	 * Gets the final JSON result.
	 */
	get JSON() {
		return this._json;
	}

	/**
	 * Sets the final JSON result.
	 */

	set JSON(json) {
		this._json = json;
	}

	/**
	 * Initializes the scrapper.
	 * Runs the argumentSanityCheck.
	 * Then calls `onInit()` method.
	 */
	init() {
		if (!this.argumentSanityCheck(this.PROC_ARGS)) {
			return;
		}

		try {
			this.onInit();
		} catch (TypeError) {
			console.error('You must define the scrapper\'s onInit() method.');
		}

		return;
	}

	/**
	 * Runs the sanity check for the process arguments.
	 * @param {array} args Array of actual command line arguments passed to the node process.
	 */
	argumentSanityCheck(args) {
		return true;
	}

	/**
	 * Actual Request method.
	 */
	request() {
		// All sequencing and load balancing can be generically done here.
		// We can even queue up the requests at this point and then do the request as and when required.
		// This can keep throttling in check.
		// You can define onBeforeRequest() method to be called just before the request is sent.
		try {
			this.onBeforeRequest();
		} catch (TypeError) { }

		let options = {
			uri: this.REQUEST_URL,
		}

		request(options)
			.then((body) => {
				this.HTML = body;
				this.$ = cheerio.load(body);

				try {
					this.scrape(this.$);

					try {
						this.onAfterScrape();
					} catch (TypeError) { }

				} catch (TypeError) {
					console.error('You must define the scrapper\'s scrape() method.')
				}
			})
			.catch((error) => {
				console.error(error);
			});

		return;
	}
}

module.exports = BaseLoklakScrapper;
