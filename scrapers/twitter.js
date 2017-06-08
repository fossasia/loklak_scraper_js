"use strict";
const BaseLoklakScrapper = require('./base');

const cheerio = require('cheerio');
const request = require('request-promise-native');

class TwitterLoklakScrapper extends BaseLoklakScrapper {

	constructor() {
		super('Twitter', 'https://twitter.com/search?f=tweets&vertical=default&q=');
	}

	argumentSanityCheck(args) {
		super.argumentSanityCheck(args);
		return true;
	}

	onInit() {
		this.REQUEST_URL = this.BASE_URL + this.SLICED_PROC_ARGS + "&src=typd";
	}

	scrape($) {
		// Scraping logic goes here.
		// We have our HTML and $ set here so we can directly use these.
		// Set the result as this.JSON = {}
		const tweets = [];
		$("div.tweet").each( (i, element) => {
			let tweetDetail = {
				user: {},
			};

			// userid, profile_image_url, name, screen_name, apperance first & latest
			tweetDetail.user.appearance_first = new Date();
			tweetDetail.user.appearance_latest = new Date();
			tweetDetail.user.user_id = $(element).attr("data-user-id");
			tweetDetail.user.profile_image_url_https = $(element).find("img.avatar").attr("src");
			tweetDetail.user.name = $(element).attr("data-name");
			tweetDetail.user.screen_name = $(element).attr("data-screen-name");

			// status_url, time-name, time_in_millis
			tweetDetail.link = $(element).find("a.tweet-timestamp").attr("href");
			tweetDetail.link = "https://twitter.com" + tweetDetail.link;
			tweetDetail.created_at = $(element).find("a.tweet-timestamp").attr("title");
			tweetDetail.timestamp = $(element).find("span._timestamp").attr("data-time-ms");

			// tweet_text
			tweetDetail.text = $(element).find("p.tweet-text").text();
			tweetDetail.id_str = $(element).attr("data-tweet-id");

			$(element).find("span.ProfileTweet-actionCountForPresentation").each((i, ele) => {
				let number = $(ele).text();
				if (i === 1) {
					if (number.length > 0) {
						tweetDetail.retweet_count = parseInt(number);
					} else {
						tweetDetail.retweet_count = 0;
					}
				}
				if (i === 3) {
					if (number.length > 0) {
						tweetDetail.favourites_count = parseInt(number);
					} else {
						tweetDetail.favourites_count = 0;
					}
				}
			});

			// tweet images
			tweetDetail.images = []
			$(element).find("img").each((i, ele) => {
				let imageLink = $(ele).attr("src");
				tweetDetail.images.push(imageLink);
			});
			tweetDetail.images.splice(0, 1); // removes the profile image url

			// TODO: add location data
			// TODO: video, audio, gifs
			tweets.push(tweetDetail);
		});
		
		tweets.splice(-1, 1); // all data is not available for the last tweet
		
		this.JSON = {};
		this.JSON.statuses = tweets;
		return tweets;
	}

	/**
	 * Uses the scrape method to scrape Tweets from twitter and passes the data
	 * to callback function.
	 * @param {*string} query Tweet search query
	 * @param {*function} callback callback function to be invoked after completion
	 */
	getTweets(query, callback) {
		let url = this.BASE_URL + query + "&src=typd";
		let options = { uri: url};

		request(options)
			.then((body) => {
				let html = body;
				let $ = cheerio.load(html);

				let tweets = this.scrape($);
				callback(tweets);
			})
			.catch((error) => {
				callback(error.message);
			})
	}
}

module.exports = TwitterLoklakScrapper;

