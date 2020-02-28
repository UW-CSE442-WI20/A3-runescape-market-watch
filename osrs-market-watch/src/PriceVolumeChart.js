import React, { Component } from "react";
import * as d3 from "d3";

class PriceVolumeChart extends Component {
  constructor(props) {
    super(props);
    this.node = React.createRef();
  }

  componentDidUpdate() {
    this.drawChart();
  }

  componentDidMount() {
    this.drawChart();
  }

  render() {
    return <div ref={this.node} />;
  }

  drawChart() {
    const { data } = this.props;
    const margin = { top: 0, right: 100, bottom: 40, left: 50, inner: 40 };
    const width = Math.max(0, this.props.width - margin.left - margin.right);
    const height = Math.max(
      0,
      this.props.height - margin.top - margin.bottom - 2 * margin.inner
    );
    const priceHeight = 0.4 * height;
    const volumeHeight = 0.2 * height;
    const candleHeight = 0.4 * height;

    const TEXT_COLOR = "#111";
    const GRID_COLOR = "#e7e7e7";

    const gpFormat = gp => `${d3.format(".3~s")(gp)} gp`;
    const volFormat = d3.format(".3~s");

    const div = d3.select(this.node.current);
    div.selectAll("*").remove();

    const xMin = d3.min(data, d => d.ts);
    const xMax = d3.max(data, d => d.ts);
    const xScale = d3
      .scaleTime()
      .domain([xMin, xMax])
      .range([0, width]);

    // Build Candlestick Chart ////////////////////////////////////////////////
    const candles = this.getCandles(data, "Rune scimitar");
    const bandwidth = candles.length > 0 ? (xScale(xMax) / (candles.length + 1)) : 0;

    const candlestickChart = div
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", candleHeight + margin.top + margin.inner)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yCandleScale = d3
      .scaleLinear()
      .rangeRound([height, 0])
      .domain([d3.min(candles, d => d.low), d3.max(candles, d => d.high)])
      .range([candleHeight, 0.1 * candleHeight]);

    // Gridlines
    const gridlines = d3
      .axisLeft()
      .tickFormat("")
      .tickSize(-width)
      .scale(yCandleScale);

    candlestickChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${candleHeight})`)
      .call(d3.axisBottom(xScale));

    candlestickChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yCandleScale).tickFormat(gpFormat));

    candlestickChart
      .attr("class", "grid")
      .style("color", GRID_COLOR)
      .call(gridlines);

    candlestickChart
      .selectAll(".wick")
      .data(candles)
      .enter()
      .append("line")
      .attr("class", "wick")
      .style("stroke", d => (d.open > d.close ? "#d66061" : "#60d68a"))
      .attr("x1", d => xScale(d.ts) + bandwidth / 2)
      .attr("y1", d => yCandleScale(d.high))
      .attr("x2", d => xScale(d.ts) + bandwidth / 2)
      .attr("y2", d => yCandleScale(d.low));

    candlestickChart
      .selectAll(".bar")
      .data(candles)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return xScale(d.ts);
      })
      .attr("y", function(d) {
        return yCandleScale(d.open > d.close ? d.open : d.close);
      })
      .attr("width", bandwidth)
      .attr("height", function(d) {
        let candleTop = Math.max(d.open, d.close);
        let candleBottom = Math.min(d.open, d.close);
        return yCandleScale(candleBottom) - yCandleScale(candleTop);
      })
      .style("fill", d => (d.open > d.close ? "#d66061" : "#60d68a"));

    // Build Price Chart //////////////////////////////////////////////////////
    const priceChart = div
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", priceHeight + margin.top + margin.inner)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    priceChart
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text("Price");

    const yPriceMin = Math.min(
      d3.min(data, d => d.average),
      d3.min(data, d => d.daily)
    );
    const yPriceMax = Math.max(
      d3.max(data, d => d.average),
      d3.max(data, d => d.daily)
    );

    const yPriceScale = d3
      .scaleLinear()
      .domain([Math.max(0, yPriceMin - 5), yPriceMax + 5])
      .range([priceHeight, 0.1 * priceHeight]);

    priceChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${priceHeight})`)
      .call(d3.axisBottom(xScale));

    priceChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yPriceScale).tickFormat(gpFormat));

    // generates lines when called
    const dailyLine = d3
      .line()
      .x(d => xScale(d.ts))
      .y(d => yPriceScale(d.daily));

    const averageLine = d3
      .line()
      .x(d => xScale(d.ts))
      .y(d => yPriceScale(d.average));

    priceChart
      .append("path")
      .data([data])
      .style("fill", "none")
      .attr("id", "dailyLine")
      .attr("stroke", "steelblue")
      .attr("stroke-width", "1.5")
      .attr("d", dailyLine);

    priceChart
      .append("path")
      .data([data])
      .style("fill", "none")
      .attr("id", "averageLine")
      .attr("stroke", "goldenrod")
      .attr("stroke-width", "1.5")
      .attr("d", averageLine);

    const priceFocus = priceChart
      .append("g")
      .attr("class", "focus")
      .style("display", "none");

    priceFocus
      .append("circle")
      .classed("daily", true)
      .attr("r", 4.5)
      .attr("fill", "steelblue");

    priceFocus
      .append("circle")
      .classed("average", true)
      .attr("r", 4.5)
      .attr("fill", "goldenrod");

    priceFocus
      .append("line")
      .classed("y", true)
      .style("fill", "none")
      .style("pointer-events", "all")
      .style("stroke", "#67809f")
      .style("stroke-width", "1.5px")
      .style("stroke-dasharray", "3 3");

    // Build Volume Chart /////////////////////////////////////////////////////
    const volumeChart = div
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", volumeHeight + margin.bottom + margin.inner)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    volumeChart
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text("Volume");

    const yVolumeMin = 0;
    // const yVolumeMin = d3.min(data, d => d.volume);
    const yVolumeMax = d3.max(data, d => d.volume);

    const yVolumeScale = d3
      .scaleLinear()
      .domain([yVolumeMin, yVolumeMax])
      .range([volumeHeight, 0.1 * volumeHeight]);

    // volumeChart
    //   .append('rect')
    //   .attr('class', 'overlay')
    //   .attr('width', width)
    //   .attr('height', volumeHeight)
    //   .style('fill', 'none')
    //   .style('pointer-events', 'all');

    volumeChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${volumeHeight})`)
      .call(d3.axisBottom(xScale));

    volumeChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yVolumeScale).tickFormat(volFormat));

    const volData = data.filter(d => d.volume != null);
    volumeChart
      .selectAll()
      .data(volData)
      .enter()
      .append("rect")
      .attr("id", (_, i) => `vol_${i}`)
      .attr("x", d => xScale(d.ts))
      .attr("y", d => yVolumeScale(d.volume))
      .attr("class", "vol")
      .attr("fill", "steelblue")
      .attr("width", 4)
      .attr("height", d => volumeHeight - yVolumeScale(d.volume));

    div
      .on("mousemove", generateCrosshair)
      .on("mouseover", () => priceFocus.style("display", null))
      .on("mouseout", () => {
        priceFocus.style("display", "none");
        volumeChart.selectAll("rect").attr("fill", "steelblue");
      });

    const bisectDate = d3.bisector(d => d.ts).left;

    function generateCrosshair() {
      const date = xScale.invert(d3.mouse(this)[0] - margin.left);
      const i = bisectDate(data, date, 1, data.length - 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const currData = date - d0.ts > d1.ts - date ? d1 : d0;

      priceFocus
        .select("circle.daily")
        .attr(
          "transform",
          `translate(${xScale(currData.ts)}, ${yPriceScale(currData.daily)})`
        );

      priceFocus
        .select("circle.average")
        .attr(
          "transform",
          `translate(${xScale(currData.ts)}, ${yPriceScale(currData.average)})`
        );

      priceFocus
        .select("line.y")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 10)
        .attr("y2", priceHeight)
        .attr("transform", `translate(${xScale(currData.ts)}, 0)`);

      priceFocus.selectAll("text").remove();

      // priceFocus
      //   .append('text')
      //   .attr('fill', 'black')
      //   .attr(
      //     'transform',
      //     `translate(${xScale(currData.ts)}, 0)`
      //   )
      //   .text(`${currData.ts.toLocaleString('en-US', options)}`);

      volumeChart.selectAll("rect").attr("fill", "steelblue");

      volumeChart.select(`rect#vol_${i}`).attr("fill", "darkblue");
      updateLegends(currData);
    }

    /* Legends */
    const updateLegends = currentData => {
      d3.selectAll(".lineLegend").remove();

      const legendKeys = Object.keys(data[0]);
      const lineLegend = priceChart
        .selectAll(".lineLegend")
        .data(legendKeys)
        .enter()
        .append("g")
        .attr("class", "lineLegend")
        .attr("transform", (_, i) => `translate(0, ${i * 20})`);

      lineLegend
        .append("text")
        .style("fill", "black")
        .attr("transform", "translate(15,15)")
        .text(d => {
          if (d === "ts") {
            const options = { year: "numeric", month: "long", day: "numeric" };
            return currentData[d].toLocaleDateString("en-US", options);
          } else if (d === "daily") {
            return `Price:   ${gpFormat(currentData[d])}`;
          } else if (d === "average") {
            return `Average: ${gpFormat(currentData[d])}`;
          } else if (d === "volume") {
            return `Volume traded: ${volFormat(currentData[d])}`;
          } else {
            return;
          }
        });
    };
  }

  getCandles(data) {
    let time_period_days = 7;
    let filtered = data;
    filtered.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    let condensed = [];
  
    for (var i = 0; i < filtered.length - 1; i += time_period_days) {
      let week = filtered.slice(i, i + time_period_days);
      if (week.length < time_period_days) {
        continue;
      }
      let open = +week[0].daily;
      let close = +week[time_period_days - 1].daily;
  
  
      let high = Math.max(...week.map(d => +d.daily));
      let low = Math.min(...week.map(d => +d.daily));
      let volume = week.reduce((prev, curr) => { return prev + +curr.volume}, 0);
      let ts = new Date(week[0].ts)
  
      condensed.push({
        "high": high,
        "low": low,
        "open": open,
        "close": close,
        "volume": volume,
        "ts": ts
      })
  
    }
  
    condensed.sort((a, b) => a.ts - b.ts);
    return condensed;
  }
}

export default PriceVolumeChart;
