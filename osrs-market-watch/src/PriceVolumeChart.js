import React, { Component } from "react";
import * as d3 from "d3";

class PriceVolumeChart extends Component {

  constructor(props) {
    super(props);
    this.manyXAxes = true;
    this.node = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      this.drawChart();
    }
  }

  componentDidMount() {
    this.drawChart();
  }

  render() {
    return <div ref={this.node} />;
  }

  buildCandlestickChart(chartArea, data, height, chartWidth, margin, yFormatter, xScale) {
    const chartHeight = this.manyXAxes ? height - margin.top - margin.xbuffer: height - margin.top;
    const candles = this.getCandles(data);
    const bandwidth = candles.length > 0 ? (chartWidth / (candles.length + 2)) : 0;

    const candlestickChart = chartArea
      .append("g")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // X-axis
    if (this.manyXAxes) {
      candlestickChart
        .append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call( d3.axisBottom(xScale));
    }

    // Y-axis
    const yCandleScale = d3
      .scaleLinear()
      .domain([d3.min(candles, d => d.low), d3.max(candles, d => d.high)])
      .range([chartHeight, 0]);

    candlestickChart
      .append("g")
      .attr("id", "yAxis")
      .style("color", "#444")
      .attr("transform", `translate(${chartWidth}, 0)`)
      .call(d3.axisRight(yCandleScale).tickFormat(yFormatter));

    // Draw wicks
    candlestickChart
      .selectAll(".wick")
      .data(candles)
      .enter()
      .append("line")
      .attr("class", "wick")
      .style("stroke", d => (d.open > d.close ? "#d66061" : "#60d68a"))
      .attr("x1", d => xScale(d.ts) + bandwidth / 2)
      .attr("x2", d => xScale(d.ts) + bandwidth / 2)
      .attr("y1", d => yCandleScale(d.high))
      .attr("y2", d => yCandleScale(d.low))

    // Draw boxes
    candlestickChart
      .selectAll(".bar")
      .data(candles)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.ts))
      .attr("y", d => yCandleScale(Math.max(d.open, d.close)))
      .attr("width", bandwidth)
      .attr("height", d => Math.abs(yCandleScale(d.open) - yCandleScale(d.close)))
      .style("fill", d => (d.open > d.close ? "#d66061" : "#60d68a"))
  }

  // Construct the price chart in it's area
  buildPriceChart(chartArea, data, height, chartWidth, margin, yFormatter, xScale) {
    const chartHeight = this.manyXAxes ? height - margin.xbuffer: height;

    const priceChart = chartArea
      .append("g")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${margin.left}, 0)`)

    // X-axis
    if (this.manyXAxes) {
      priceChart
        .append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale));
    }

    // Y-axis 
    const yPriceMin = d3.min(data, d => Math.min(d.average, d.daily)) - 5;
    const yPriceMax = d3.max(data, d => Math.max(d.average, d.daily)) + 5;
    const yPriceScale = d3
      .scaleLinear()
      .domain([Math.max(0, yPriceMin), yPriceMax])
      .range([chartHeight, 0]);
      
    priceChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${chartWidth}, 0)`)
      .call(d3.axisRight(yPriceScale).tickFormat(yFormatter));

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
  }

  buildVolumeChart(chartArea, data, height, chartWidth, margin, yFormatter, xScale) {
    const chartHeight = height - margin.xbuffer - margin.bottom;
    
    const volumeChart = chartArea
      .append("g")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${margin.left}, 0)`)

    // X-axis
    volumeChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale));

    // Y-axis
    const yVolumeScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.volume)])
      .range([chartHeight, 0]);

    volumeChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${chartWidth}, 0)`)
      .call(d3.axisRight(yVolumeScale).tickFormat(yFormatter));

    // Draw bars
    const bandwidth = data.length > 0 ? (chartWidth / (data.length + 2)) : 0;
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
      .attr("width", bandwidth)
      .attr("height", d => chartHeight - yVolumeScale(d.volume));
  }

  drawChart() {
    const { data } = this.props;
    const margin = { top: 20, right: 60, left: 20, bottom: 20, xbuffer: 20 };
    const height = Math.max(0, this.props.height);
    const width = Math.max(0, this.props.width);
    const candleHeight = 0.4 * height;
    const priceHeight = 0.4 * height;
    const volumeHeight = 0.2 * height;

    const TEXT_COLOR = "#111";
    const GRID_COLOR = "#444";

    var gpFormat = gp => `${d3.format(".3~s")(gp)} gp`;
    var volFormat = d3.format(".3~s");

    const div = d3.select(this.node.current);
    div.selectAll("*").remove();
    
    const svg = div
      .append("svg")
      .attr("width", this.props.width)
      .attr("height", this.props.height)
      
    const candlestickArea = svg
      .append("g")
      .attr("class", "candlestick")
      .attr("width", this.props.width)
      .attr("height", candleHeight);
      
    const priceArea = svg
      .append("g")
      .attr("class", "price")
      .attr("width", this.props.width)
      .attr("height", priceHeight)
      .attr("transform", `translate(0, ${candleHeight})`);
      
    const volumeArea = svg
      .append("g")
      .attr("class", "volume")
      .attr("width", this.props.width)
      .attr("height", volumeHeight)
      .attr("transform", `translate(0, ${candleHeight + priceHeight})`);

    const chartWidth = width - margin.left - margin.right
    const xMin = d3.min(data, d => d.ts);
    const xMax = d3.max(data, d => d.ts);
    const xScale = d3
      .scaleTime()
      .domain([xMin, xMax])
      .range([0, chartWidth]);

    this.buildCandlestickChart(candlestickArea, data, candleHeight, chartWidth, margin, gpFormat, xScale);
    this.buildPriceChart(priceArea, data, priceHeight, chartWidth, margin, gpFormat, xScale);
    this.buildVolumeChart(volumeArea, data, volumeHeight, chartWidth, margin, volFormat, xScale);

    // CROSSHAIR ////////////////////////////////////////////////////////////// 
    svg
      .append("line")
      .classed("x", true)
      .style("fill", "none")
      .style("pointer-events", "all")
      .style("stroke", "#67809f")
      .style("stroke-width", "1.5px")
      .style("stroke-dasharray", "3 3");

    svg
      .on("mousemove", generateCrosshair)
      // .on("mouseover", () => priceFocus.style("display", null))
      // .on("mouseout", () => {
      //   priceFocus.style("display", "none");
      //   volumeChart.selectAll("rect").attr("fill", "steelblue");
      // });

    const bisectDate = d3.bisector(d => d.ts).left;
    function generateCrosshair() {
      const date = xScale.invert(d3.mouse(this)[0] - margin.left);
      const i = bisectDate(data, date, 1, data.length - 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const currData = (date - d0.ts) > (d1.ts - date) ? d1 : d0;
      const currX = xScale(currData.ts)
      svg
        .select("line.x")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("transform", `translate(${margin.left + currX}, 0)`);
    }

    // OLD CROSS HAIR
    // function generateCrosshair() {
    //   const date = xScale.invert(d3.mouse(this)[0] - margin.left);
    //   const i = bisectDate(data, date, 1, data.length - 1);
    //   const d0 = data[i - 1];
    //   const d1 = data[i];
    //   const currData = date - d0.ts > d1.ts - date ? d1 : d0;
    //   const currTs = xScale(currData.ts)

    //   priceFocus
    //     .select("circle.daily")
    //     .attr(
    //       "transform",
    //       `translate(${currTs}, ${yPriceScale(currData.daily)})`
    //     );

    //   priceFocus
    //     .select("circle.average")
    //     .attr(
    //       "transform",
    //       `translate(${currTs}, ${yPriceScale(currData.average)})`
    //     );

    //   priceFocus
    //     .select("line.y")
    //     .attr("x1", 0)
    //     .attr("x2", 0)
    //     .attr("y1", 10)
    //     .attr("y2", priceHeight)
    //     .attr("transform", `translate(${currTs}, 0)`);

    //   priceFocus.selectAll("text").remove();

    //   volumeChart.selectAll("rect").attr("fill", "steelblue");
    //   volumeChart.select(`rect#vol_${i}`).attr("fill", "darkblue");
    //   d3.selectAll(".lineLegend").remove();

    //   const legendKeys = Object.keys(data[0]);
    //   const lineLegend = priceChart
    //     .selectAll(".lineLegend")
    //     .data(legendKeys)
    //     .enter()
    //     .append("g")
    //     .attr("class", "lineLegend")
    //     .attr("transform", (_, i) => `translate(0, ${i * 20})`);

    //   lineLegend
    //     .append("text")
    //     .style("fill", "black")
    //     .attr("transform", "translate(15,15)")
    //     .text(d => {
    //       if (d === "ts") {
    //         const options = { year: "numeric", month: "long", day: "numeric" };
    //         return currData[d].toLocaleDateString("en-US", options);
    //       } else if (d === "daily") {
    //         return `Price:   ${gpFormat(currData[d])}`;
    //       } else if (d === "average") {
    //         return `Average: ${gpFormat(currData[d])}`;
    //       } else if (d === "volume") {
    //         return `Volume traded: ${volFormat(currData[d])}`;
    //       } else {
    //         return;
    //       }
    //     });
    // }
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
