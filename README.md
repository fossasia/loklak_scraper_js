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
