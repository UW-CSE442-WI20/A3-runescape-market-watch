## OSRS Market Watch

### Scraper
The data scraping utility is written in python and produces data in the following format:

`name, id, timestamp, daily, average, volume`

It needs to be updated to be robust, resiliant against errors / rate limits, and should be run on a daily schedule.

### Market Watch UI
This is a React project that makes use of the data produced by the scraper. It consists of a suite of components, with each d3 data vis encapsulated in its own component.
