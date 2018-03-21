require('mocha');
const {expect} = require('chai');
const TwitterLoklakScrapper = require('../scrapers/twitter');

describe('Testing twitter scrapper', function() {
    const query = 'fossasia';
    let twitterdata = null;
    const testTweet = require('./testTweet.json');

    before(function(done) {
        const twitter = new TwitterLoklakScrapper();
        twitter.getTweets(query, function(data) {
            twitterdata = data;
            done();
        });
    });

    it('should receive a truthy javascript object containing tweets and not an error message', function() {
        if(typeof twitterdata === 'string') {
            // Error message received
            throw new Error(this.twitterdata);
        }

        if(!twitterdata) {
            throw new Error("No data received from twitter scrapper");
        }

        twitterdata.forEach(tweet => {
            if(!tweet && !tweet.user) {
                throw new Error("Falsy tweet data received from twitter scrapper");
            }
        });
    });

    it('should receive tweets with all keys present', function() {
        twitterdata.every(tweet => {
            expect(tweet).to.deep.have.all.keys(testTweet)
            return true;
        });
    });

    it('should receive tweets with correct data', function() {
        twitterdata.every(tweet => {
            Object.values(tweet).every(value => {
                expect(value).to.exist
                return true;
            });
            return true;
        });

        twitterdata.every(tweet => {
            Object.values(tweet.user).every(value => expect(value).to.exist);
            return true;
        });
    });

    after(function() {
        console.log(`Number of tweets scraped for '${query}' = ${twitterdata.length}`);
        console.log('Twitter scrapper tests finished');
    });
});
