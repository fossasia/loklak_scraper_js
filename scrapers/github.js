var request = require('sync-request');

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " + 
    "(KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36";
const REQUEST_HEADER = {
    headers: {"User-Agent": USER_AGENT}
};
const ENCODING = "UTF-8";
const GITHUB_USERS_URL = "https://api.github.com/search/users";

function searchGithubProfiles(query) {
    var requestUrl = GITHUB_USERS_URL + "?q=" + query;
    var res = request("GET", requestUrl, REQUEST_HEADER);
    return JSON.parse(res.body.toString(ENCODING));
}

function getExtraUserInfo(requestUrl) {
    var res = request("GET", requestUrl, REQUEST_HEADER);
    return JSON.parse(res.body.toString(ENCODING));
}

function createUserData(searchUserData) {
    var dataItem = {
        user_name: searchUserData.login,
        user_id: searchUserData.id,
        avatar_url: searchUserData.avatar_url,
        atom_feed_link: searchUserData.html_url + ".atom"
    };

    // user's followers
    var followersData = getExtraUserInfo(searchUserData.followers_url);
    dataItem.followers = followersData.length;
    dataItem.followers_data = followersData;

    // user following
    var userFollowingUrl = searchUserData.following_url.split("{")[0];
    var followingData = getExtraUserInfo(userFollowingUrl);
    dataItem.following = followingData.length;
    dataItem.following_data = followingData;

    // starred
    var starredUrl = searchUserData.starred_url.split("{")[0];
    var starredData = getExtraUserInfo(starredUrl);
    dataItem.starred = starredData.length;
    dataItem.starred_data = starredData;

    // gists
    var gistsUrl = searchUserData.gists_url.split("{")[0];
    dataItem.gists = getExtraUserInfo(gistsUrl);

    // subscriptions
    var subscriptionsData = getExtraUserInfo(searchUserData.subscriptions_url);
    dataItem.subscriptions = subscriptionsData;

    // events
    var eventsData = getExtraUserInfo(searchUserData.events_url.split("{")[0]);
    dataItem.events = eventsData;

    // received-events
    var receivedEventsData = getExtraUserInfo(
        searchUserData.received_events_url);
    dataItem.received_events = receivedEventsData;

    // organizations
    dataItem.organizations = getExtraUserInfo(
        searchUserData.organizations_url);

    // joining_date, bio, full_name, gravatar_id, home_location, works_for,
    // email, special_link (blog)
    var userData = getExtraUserInfo(searchUserData.url);
    dataItem.joining_date = userData.created_at.split("T")[0];
    dataItem.bio = userData.bio;
    dataItem.full_name = userData.name;
    dataItem.gravatar_id = userData.gravatar_id;
    dataItem.home_location = userData.location;
    dataItem.works_for = userData.company;
    if (userData.email) {
        dataItem.email = userData.email;
    } else {
        dataItem.email = "";
    }
    dataItem.special_link = userData.blog;
    return dataItem;
}

function getGithubProfiles(query) {
    var searchData = searchGithubProfiles(query).items;
    var searchResults = [];

    // API rate-limiting issue
    // for (var i=0; i < searchData.length; i++) {
    //     searchResults.push(createUserData(searchData[i]));
    // }
    searchResults.push(createUserData(searchData[0]));

    var finalData = {};
    finalData.metadata = {counter: searchResults.length};
    finalData.data = searchResults;
    return JSON.stringify(finalData);
}

// uncomment for testing
// const QUERY_PARAM = process.argv[2];
// var profiles = getGithubProfiles(QUERY_PARAM);
// console.log(profiles);
