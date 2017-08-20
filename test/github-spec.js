const GithubProfileScraper = require('../scrapers/github')

let githubProfileScraper = new GithubProfileScraper();

var expect    = require("chai").expect;

const userId = 16368427;
const userName = "djmgit";
const avatarUrl = "https://avatars0.githubusercontent.com/u/16368427?v=4";
const atomFeedLink = "https://github.com/djmgit.atom";
const fullName = "Deepjyoti Mondal";
const specialLink = "http://djmgit.github.io";
const joiningDate = "2015-12-20";

describe("Test GithubProfileScraper", function() {
    describe("Testing profile data", function() {
  	    this.timeout(60000);

        it("contains basic user profile data", function(done) {
    	      githubProfileScraper.getScrapedData("djmgit", data => {
    		        expect(data["user_id"]).to.equal(userId);
    		        expect(data["user_name"]).to.equal(userName);
    		        expect(data["avatar_url"]).to.equal(avatarUrl);
    		        expect(data["atom_feed_link"]).to.equal(atomFeedLink);
    		        expect(data["full_name"]).to.equal(fullName);
    		        expect(data["special_link"]).to.equal(specialLink);
    		        expect(data["joining_date"]).to.equal(joiningDate);
    		        done();
    	      });
        });
    });  
});
