import React, { Component } from "react";
import * as d3 from "d3";

class PriceVolumeChart extends Component {

  constructor(props) {
    super(props);
    this.node = React.createRef();
    this.margin = { top: 20, right: 60, left: 20, bottom: 20, xbuffer: 20 };
    this.period = 3;

    this.chartWidth = this.props.width - this.margin.left - this.margin.right
    this.xScale = d3
      .scaleTime()
      .domain(d3.extent(this.props.data, d => d.ts))
      .range([0, this.chartWidth]);

    this.gpFormat = gp => `${d3.format(".3~s")(gp)} gp`;
    this.volFormat = d3.format(".3~s");

    this.candleData = this.generateCandlestickData(this.props.data, this.period);

    // Chart ratios 
    this.candleHeight = 0.4 * this.props.height;
    this.priceHeight = 0.4 * this.props.height;
    this.volumeHeight = 0.2 * this.props.height;
    
    // Chart colors
    this.green = "#60d68a";
    this.red = "#d66061";

    this.zoomed = this.zoomed.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      if (prevProps.data !== this.props.data) {
        this.candleData = this.generateCandlestickData(this.props.data, this.period);
      }
      this.chartWidth = this.props.width - this.margin.left - this.margin.right
      this.xScale = d3
        .scaleTime()
        .domain(d3.extent(this.props.data, d => d.ts))
        .range([0, this.chartWidth]);
      this.drawChart();
    }
  }

  componentDidMount() {
    this.drawChart();
  }

  render() {
    return <div ref={this.node} />;
  }

  buildCandlestickChart(chartArea, xScale) {
    const chartHeight = this.candleHeight - this.margin.top - this.margin.xbuffer;
    this.candlestickChart = chartArea
      .append("g")
      .attr("class", "candlestick-chart")
      .attr("width", this.chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)

    this.candlestickChart.append("defs").append("svg:clipPath")
      .attr("id", "candleclip")
      .append("svg:rect")
      .attr("width", this.chartWidth)
      .attr("height", chartHeight)
      .attr("x", 0)
      .attr("y", 0)

    this.candlestickChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${chartHeight})`)

    this.candlestickChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${this.chartWidth}, 0)`)

    this.updateCandlestickChart(xScale);
  }

  buildPriceChart(chartArea, xScale) {
    const chartHeight = this.priceHeight - this.margin.xbuffer;
    this.priceChart = chartArea
      .append("g")
      .attr("width", this.chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${this.margin.left}, 0)`)

    this.priceChart.append("defs").append("svg:clipPath")
      .attr("id", "priceclip")
      .append("svg:rect")
      .attr("width", this.chartWidth)
      .attr("height", chartHeight)
      .attr("x", 0)
      .attr("y", 0)

    this.priceChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${chartHeight})`)

    this.priceChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${this.chartWidth}, 0)`)

    this.updatePriceChart(xScale);
  }
  
  buildVolumeChart(chartArea, xScale) {
    const chartHeight = this.volumeHeight- this.margin.xbuffer - this.margin.bottom;
    this.volumeChart = chartArea
      .append("g")
      .attr("width", this.chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${this.margin.left}, 0)`)
    
    this.volumeChart.append("defs").append("svg:clipPath")
      .attr("id", "volumeclip")
      .append("svg:rect")
      .attr("width", this.chartWidth)
      .attr("height", chartHeight)
      .attr("x", 0)
      .attr("y", 0)

    this.volumeChart
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0, ${chartHeight})`)

    this.volumeChart
      .append("g")
      .attr("id", "yAxis")
      .attr("transform", `translate(${this.chartWidth}, 0)`);

    this.updateVolumeChart(xScale);
  }

  updateCandlestickChart(xScale) {
    const chartHeight = this.candleHeight - this.margin.top - this.margin.xbuffer;
    const xMin = xScale.invert(0);
    const xMax = xScale.invert(this.chartWidth);
    const candleData = this.candleData.filter(d => d.end > xMin && d.start < xMax);

    const yMin = d3.min(candleData, d => d.low) - 5;
    const yMax = d3.max(candleData, d => d.high) + 5;
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin), yMax])
      .range([chartHeight, 0]);

    this.candlestickChart.select("#xAxis")
      .call( d3.axisBottom(xScale) )

    this.candlestickChart.select("#yAxis")
      .call(d3.axisRight(yScale).tickFormat(this.gpFormat));

    this.candlestickChart
      .selectAll(".candlestick")
      .data(candleData, d => d.id)
      .join(
        enter => {
          const group = enter.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#candleclip)");
          group.append("rect")
            .attr("fill", d => d.close >= d.open ? this.green : this.red)
            .attr("x", d => xScale(d.start))
            .attr("y", d => yScale(Math.max(d.open, d.close)))
            .attr("width", d => xScale(d.end) - xScale(d.start))
            .attr("height", d => Math.max(2, Math.abs(yScale(d.open) - yScale(d.close))));
          group.append("line")
            .attr("x1", d => xScale(d.start) + (xScale(d.end) - xScale(d.start)) / 2)
            .attr("x2", d => xScale(d.start) + (xScale(d.end) - xScale(d.start)) / 2)
            .attr("y1", d => yScale(d.high))
            .attr("y2", d => yScale(d.low))
            .attr("stroke-width", d => (xScale(d.end) - xScale(d.start)) / 10)
            .attr("stroke", d => d.close >= d.open ? this.green : this.red);
        },
        update => {
          update.select("rect")
            .transition().duration(0)
            .attr("x", d => xScale(d.start))
            .attr("y", d => yScale(Math.max(d.open, d.close)))
            .attr("width", d => xScale(d.end) - xScale(d.start))
            .attr("height", d => Math.max(2, Math.abs(yScale(d.open) - yScale(d.close))));
          update.select("line")
            .transition().duration(0)
            .attr("x1", d => xScale(d.start) + (xScale(d.end) - xScale(d.start)) / 2)
            .attr("x2", d => xScale(d.start) + (xScale(d.end) - xScale(d.start)) / 2)
            .attr("y1", d => yScale(d.high))
            .attr("y2", d => yScale(d.low))
            .attr("stroke-width", d => (xScale(d.end) - xScale(d.start)) / 10);
        },
        exit => exit.remove()
      )
  }

  updatePriceChart(xScale) {
    const chartHeight = this.priceHeight - this.margin.xbuffer;
    const xMin = xScale.invert(0 - this.margin.left);
    const xMax = xScale.invert(this.chartWidth + this.margin.right);
    const data = this.props.data.filter(d => d.ts > xMin && d.ts < xMax);

    const yMin = Math.min(d3.min(data, d => d.daily), d3.min(data, d => d.average)) - 5
    const yMax = Math.max(d3.max(data, d => d.daily), d3.max(data, d => d.average)) + 5
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(yMin, 0), yMax])
      .range([chartHeight, 0]);
    
    this.priceChart.select("#xAxis")
      .call( d3.axisBottom(xScale) )

    this.priceChart.select("#yAxis")
      .call(d3.axisRight(yScale).tickFormat(this.gpFormat));

    const dailyLine = d3.line()
      .x(d => xScale(d.ts))
      .y(d => yScale(d.daily));

    const averageLine = d3.line()
      .x(d => xScale(d.ts))
      .y(d => yScale(d.average));

    this.priceChart
      .selectAll(".priceLines")
      .data([data])
      .join(
        enter => {
          const group = enter.append("g")
            .attr("class", "priceLines")
            .attr("clip-path", "url(#priceclip)");
          group.append("path")
            .attr("id", "dailyline")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3.0)
            .attr("d", dailyLine)
          group.append("path")
            .attr("id", "averageline")
            .attr("fill", "none")
            .attr("stroke", "goldenrod")
            .attr("stroke-width", 3.0)
            .attr("d", averageLine)
        },
        update => {
          update.select("#dailyline")
            // .transition().duration(0)    // Do we need these, was glitchy earlier but seems fine now
            .attr("d", dailyLine)
          update.select("#averageline")
            // .transition().duration(0)
            .attr("d", averageLine)
        },
        exit => exit.remove()
      )
  }

  updateVolumeChart(xScale) {
    const chartHeight = this.volumeHeight - this.margin.xbuffer - this.margin.bottom;
    const xMin = xScale.invert(0 - this.margin.left);
    const xMax = xScale.invert(this.chartWidth + this.margin.right);
    const data = this.props.data.filter(d => d.ts > xMin && d.ts < xMax);

    console.log(d3.max(this.props.data, d => d.ts));
    

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.volume))
      .range([chartHeight, 0]);

    this.volumeChart.select("#xAxis")
      .call( d3.axisBottom(xScale) )

    this.volumeChart.select("#yAxis")
      .call(d3.axisRight(yScale).tickFormat(this.volFormat).ticks(6));

    const bandwidth = this.chartWidth / (data.length + 2);
    this.volumeChart
      .selectAll(".volume_bar")
      .data(data, d => d.ts)
      .join(
        enter => enter.append("g")
          .attr("class", "volume_bar")
          .attr("clip-path", "url(#volumeclip)")
          .append("rect")
          .attr("fill", "gray")
          .attr("x", d => xScale(d.ts))
          .attr("y", d => yScale(d.volume))
          .attr("width", d => bandwidth)
          .attr("height", d => chartHeight - yScale(d.volume)),
        update => update.select("rect")
          .attr("x", d => xScale(d.ts))
          .attr("y", d => yScale(d.volume))
          .attr("width", d => bandwidth)
          .attr("height", d => chartHeight - yScale(d.volume)),
        exit => exit.remove()
      )
  }
  
  drawChart() {
    const div = d3.select(this.node.current);
    div.selectAll("*").remove();
    
    const svg = div
      .append("svg")
      .attr("width", this.props.width)
      .attr("height", this.props.height);

    const candlestickArea = svg
      .append("g")
      .attr("width", this.props.width)
      .attr("height", this.candleHeight);
      
    const priceArea = svg
      .append("g")
      .attr("width", this.props.width)
      .attr("height", this.priceHeight)
      .attr("transform", `translate(0, ${this.candleHeight})`);
      
    const volumeArea = svg
      .append("g")
      .attr("width", this.props.width)
      .attr("height", this.volumeHeight)
      .attr("transform", `translate(0, ${this.candleHeight + this.priceHeight})`);

    this.buildCandlestickChart(candlestickArea, this.xScale);
    this.buildPriceChart(priceArea, this.xScale);
    this.buildVolumeChart(volumeArea, this.xScale);

    // CROSSHAIR ////////////////////////////////////////////////////////////// 
    // svg
    //   .append("line")
    //   .classed("x", true)
    //   .style("fill", "none")
    //   .style("pointer-events", "all")
    //   .style("stroke", "#67809f")
    //   .style("stroke-width", "1.5px")
    //   .style("stroke-dasharray", "3 3");

      // svg
      // .on("mousemove", generateCrosshair)
      // .on("mouseover", () => priceFocus.style("display", null))
      // .on("mouseout", () => {
      //   priceFocus.style("display", "none");
      //   volumeChart.selectAll("rect").attr("fill", "steelblue");
      // });

    // const bisectDate = d3.bisector(d => d.ts).left;
    // function generateCrosshair() {
    //   const date = this.xScale.invert(d3.mouse(this)[0] - this.margin.left);
    //   const i = bisectDate(data, date, 1, data.length - 1);
    //   const d0 = data[i - 1];
    //   const d1 = data[i];
    //   const currData = (date - d0.ts) > (d1.ts - date) ? d1 : d0;
    //   const currX = this.xScale(currData.ts)
    //   svg
    //     .select("line.x")
    //     .attr("x1", 0)
    //     .attr("x2", 0)
    //     .attr("y1", 0)
    //     .attr("y2", height)
    //     .attr("transform", `translate(${this.margin.left + currX}, 0)`);
    // }

    const zoom = d3.zoom()
      .scaleExtent([1, 4])
      .extent([[this.margin.left, this.margin.top], [this.props.width - this.margin.right, this.candleHeight - this.margin.xbuffer]])
      .translateExtent([[this.margin.left, -Infinity], [this.props.width - this.margin.right, Infinity]])
      .on("zoom", this.zoomed);
      
    svg.call(zoom);
  }

  generateCandlestickData(data, period) {
    let condensed = [];
    for (var i = 0; i < data.length - 1; i += period) {
      const frame = data.slice(i, i + period);
      const candle = {
        "id"     : i,
        "high"   : d3.max(frame, d => d.daily),
        "low"    : d3.min(frame, d => d.daily),
        "open"   : frame[0].daily,
        "close"  : frame[frame.length - 1].daily,
        "volume" : frame.reduce((total, d) => total + d.volume),
        "start"  : frame[0].ts,
        "end"    : frame[frame.length - 1].ts
      }
      condensed.push(candle)
    }
    return condensed;
  }

  zoomed() {
    const transform = d3.event.transform;
    const newXScale = transform.rescaleX(this.xScale);
    this.updateCandlestickChart(newXScale);
    this.updatePriceChart(newXScale);
    this.updateVolumeChart(newXScale);
  }
}

export default PriceVolumeChart;
