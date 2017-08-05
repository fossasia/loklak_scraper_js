const BaseLoklakScraper = require('./base');

const request = require('request-promise-native');
const Rx = require('rxjs/Rx');

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " + 
    "(KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36";
const REQUEST_HEADER = {
    headers: {"User-Agent": USER_AGENT}
};
const ENCODING = "UTF-8";
const GITHUB_USERS_URL = "https://api.github.com/search/users";

class GithubProfileScraper extends BaseLoklakScraper {

    constructor() {
        super('Github', 'https://github.com');
    }

    argumentSanityCheck(args) {
        super.argumentSanityCheck(args);
        return true;
    }

    onInit() {

    }

    /**
     * Creates promise object for sending GET requests
     * @param {*string} requestUrl API endpoint url
     */
    getRequestPromise(requestUrl) {
        let options = {
            uri: requestUrl,
            headers: {'User-Agent': USER_AGENT},
            json: true
        };
        return request(options);
    }

    /**
     * Creates promise object for querrying github profiles
     * @param {*stirng} query Github profile query
     */
    getGithubProfilesPromise(query) {
        let requestUrl = `${GITHUB_USERS_URL}?q=${query}`;
        return this.getRequestPromise(requestUrl);
    }

    scrape($) {
    
    }

    /**
     * Gets Github profile data of an user and passes the data to the callback function.
     * @param {*string} query Github profile query
     * @param {*function} callback function to be called after Profile data is fetched
     */
    getScrapedData(query, callback) {
        let profileData = {};
        let githubProfile = {};
        
        Rx.Observable.fromPromise(this.getGithubProfilesPromise(query))
            .flatMap((t,i) => {
                githubProfile = t["items"][0];
                profileData["user_name"] = githubProfile["login"];
                profileData["user_id"] = githubProfile["id"];
                profileData["avatar_url"] = githubProfile["avatar_url"];
                profileData["atom_feed_link"] = githubProfile["html_url"] + ".atom";
                return Rx.Observable.fromPromise(
                    this.getRequestPromise(githubProfile["followers_url"]));
            })
            .flatMap((t, i) => {
                profileData["followers"] = t["length"];
                profileData["followers_data"] = t;
                let followingUrl = githubProfile["following_url"].split("{")[0];
                return Rx.Observable.fromPromise(this.getRequestPromise(followingUrl));
            })
            .flatMap((t, i) => {
                profileData["following"] = t.length;
                profileData["following_data"] = t;
                let starredUrl = githubProfile["starred_url"].split("{")[0];
                return Rx.Observable.fromPromise(this.getRequestPromise(starredUrl));
            })
            .flatMap((t, i) => {
                profileData["starred"] = t.length;
                profileData["starred_data"] = t;
                let gistsUrl = githubProfile["gists_url"].split("{")[0];
                return Rx.Observable.fromPromise(this.getRequestPromise(gistsUrl));
            })
            .flatMap((t, i) => {
                profileData["gists"] = t;
                let subscriptionsUrl = githubProfile["subscriptions_url"];
                return Rx.Observable.fromPromise(this.getRequestPromise(subscriptionsUrl));
            })
            .flatMap((t, i) => {
                profileData["subscriptions"] = t;
                let eventsUrl = githubProfile["events_url"].split("{")[0];
                return Rx.Observable.fromPromise(this.getRequestPromise(eventsUrl));
            })
            .flatMap((t, i) => {
                profileData["events"] = t;
                let receivedEventsUrl = githubProfile["received_events_url"];
                return Rx.Observable.fromPromise(this.getRequestPromise(receivedEventsUrl));
            })
            .flatMap((t, i) => {
                profileData["received_events"] = t;
                let organizationsUrl = githubProfile["organizations_url"];
                return Rx.Observable.fromPromise(this.getRequestPromise(organizationsUrl));
            })
            .flatMap((t, i) => {
                profileData["organizations"] = t;
                let userDataUrl = githubProfile["url"];
                return Rx.Observable.fromPromise(this.getRequestPromise(userDataUrl));
            })
            .flatMap((t, i) => {
                profileData["joining_date"] = t["created_at"].split("T")[0];
                profileData["bio"] = t["bio"];
                profileData["full_name"] = t["name"];
                profileData["gravatar_id"] = t["gravatar_id"];
                profileData["home_location"] = t["location"];
                profileData["works_for"] = t["company"];
                let email = t["email"];
                profileData["email"] = "";
                if (email) profileData["email"] = email;
                profileData["special_link"] = t["blog"];
                return Rx.Observable.of(profileData);
            })
            .subscribe(
                profile => callback(profile),
                error => callback(error)
            );
    }
}

module.exports = GithubProfileScraper;

// Use of GithubProfileScraper
// let github = new GithubProfileScraper();
// github.getScrapedData("Siddhant", data => console.log(JSON.stringify(data)));
