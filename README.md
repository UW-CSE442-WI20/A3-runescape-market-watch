## OSRS Market Watch
[Live Demo](https://uw-cse442-wi20.github.io/A3-runescape-market-watch/)

We approached this project from a utility perspective - we wanted to build a tool that we would actually use. Our Runescape Market Watch displays price data for every F2P item in the game for a 180 day period, and the obvious choice for this type of data was a finanical chart, displaying daily closing price, avererage, and volume. We considered some other respresentations, including a grid of items sorted by price, volatility, etc., but decided to keep our representation simple as we figure out what we want to achieve with A4. Ideally, this tool will allow us to gain insights about the state of the market and will faciliate market manipulation and potentially automated trading.

We started by sketching our designs and then Preston built the project skeleton in React, handling state management and CSS on the main page. Jake built the d3 visualization, taking inspiration from [this article](https://www.freecodecamp.org/news/how-to-build-historical-price-charts-with-d3-js-72214aaf6ba3/). While Jake developed the visualization, Preston translated the d3 to be React compatible, which included updating the state of the d3 visualiztion as users interact with other elements in the DOM. Preston wrote the original code for pulling the dataset, as well as all the data transformations required to render our charts in the browser. Jake handled building and deploying our final deliverable to github pages, and Preston did the write up! We spent about 10 - 12 hours each on this project. The most time consuming portion of this project was getting the d3 visualization to behave exactly as we wanted - things like adjusting the margins, centering, and responsiveness of the chart took many minute adjustments and involved making changes to both the React and d3 codebases.


#### TODO
- python scraper, daily pulls and maybe a db, osbuddy data too? (jake/preston)
- volume / price dual chart with shared X axis (jake)
- business logic for sidebar / image view, state management (preston)
- compute % change (day, week, month, etc.) and display with item name (preston)
  in sidebar
- sortable sidebar? (maybe a stretch goal) (preston)
- styles (preston)
- change units (gp, 100k, 500M, 1.5B, etc...)
- proper resize... maybe cheat with breakpoints?


### Scraper
The data scraping utility is written in python and produces data in the following format:

`name, id, timestamp, daily, average, volume`

It needs to be updated to be robust, resiliant against errors / rate limits, and should be run on a daily schedule.

### Market Watch UI
This is a React project that makes use of the data produced by the scraper. It consists of a suite of components, with each d3 data vis encapsulated in its own component.
