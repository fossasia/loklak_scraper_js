# loklak_scraper_js
Scrapers for loklak in javascript

The idea is, that loklak and its scrapers (i.e. in loklak_server, loklak_wok, a possible loklak_wok_ios and a possible scraper in a web page integration) all use the same common code base.

That code shall be placed here in the `scraper` subdirectory. Each file in that subdirectory should be named by the scraper target (like `twitter.js`)

Execution of the scrapers must output a json very like to a loklak search result - without the enrichments that the scrapers also implement. I.e. there is no need to integrate a link de-shortener, that must be implemented in the loklak application itself.

## Example
There is an example file scrapers/example.js which has just a static output of a json object. You would just have to implement the same behavior for the other scrapers.

I.e.:
```
node scrapers/example.js
```

outputs a json object. all other scrapers must do the same but just take a query attribute.

## Installing dependencies
This project uses request library to request for web pages and cheerio library to scrape. These libraries
can be installed as shown below.

```
cd loklak_scraper_js
npm install
```
The dependencies will now be installed in node_modules directory

## Quora profile scraper (quora.js)
The Quora profile scraper takes a single argument that is the name of the profile to scrape and outputs the
scrapped data as a json object.

```
node scrapers/quora.js <profile_name>
```
For example:
```
node scrapers/quora.js Saptak-Sengupta
{ bio: 'Loves developing anything and everything through coding. Supports himself against mess food by freelancing',
  profileImage: 'https://qph.ec.quoracdn.net/main-thumb-24728160-200-igibbfdmibqxdtrjlrdnejpvjqepxpnn.jpeg',
  user: 'Saptak Sengupta',
  rss_feed_link: 'https://www.quora.com/profile/Saptak-Sengupta/rss',
  answersUrl: 'https://www.quora.com/profile/Saptak-Sengupta',
  answersCount: '147',
  questionsUrl: 'https://www.quora.com/profile/Saptak-Sengupta/questions',
  questionsCount: '1',
  postsUrl: 'https://www.quora.com/profile/Saptak-Sengupta/all_posts',
  postsCount: '6',
  blogsUrl: 'https://www.quora.com/profile/Saptak-Sengupta/blogs',
  blogsCount: '2',
  followersUrl: 'https://www.quora.com/profile/Saptak-Sengupta/followers',
  followersCount: '675',
  followingUrl: 'https://www.quora.com/profile/Saptak-Sengupta/following',
  followingCount: '162',
  topicsUrl: 'https://www.quora.com/profile/Saptak-Sengupta/topics',
  topicsCount: '262',
  editsUrl: 'https://www.quora.com/profile/Saptak-Sengupta/log',
  editsCount: '238' }

```