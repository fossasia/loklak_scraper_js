# loklak_scraper_js
Scrapers for loklak in javascript

The idea is, that loklak and its scrapers (i.e. in loklak_server, loklak_wok, a possible loklak_wok_ios and a possible scraper in a web page integration) all use the same common code base.

That code shall be placed here in the `scraper` subdirectory. Each file in that subdirectory should be named by the scraper target (like `twitter.js`)

Exection of the scrapers must output a json very like to a loklak search result - without the enrichments that the scrapers also implement. I.e. there is no need to integrate a link de-shortener, that must be implemented in the loklak application itself.
