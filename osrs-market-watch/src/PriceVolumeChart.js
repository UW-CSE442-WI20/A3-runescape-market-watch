import React, {Component} from 'react';
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
        //this.resize();
    }

    render() {
        return (<svg ref={this.node}></svg>)
    }
    
    drawChart() {
        // TODO get the height of this container from ref or whatever, rather than using the window dimensions
        const { data } = this.props;
        const margin = { top: 0, right: 0, bottom: 100, left: 100 };
        const width = Math.max(0, this.props.width - margin.left - margin.right);
        const height = Math.max(0, 800 - margin.top - margin.bottom); // Use the window's height
        
        const { node } = this;

        const svg = d3.select(node.current);
        
        // find data range
        const xMin = d3.min(data, d => d.ts);
        const xMax = d3.max(data, d => d.ts);
        const yMin = d3.min(data, d => d.daily);
        const yMax = d3.max(data, d => d.daily);

        // scale using range
        const xScale = d3
            .scaleTime()
            .domain([xMin, xMax])
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([yMin - 5, yMax])
            .range([height, 0]);

        svg.selectAll("*").remove();

        // add chart SVG to the page
        svg
            .attr('width', width + margin['left'] + margin['right'])
            .attr('height', height + margin['top'] + margin['bottom'])
            .append('g')
            .attr('transform', `translate(${margin['left']}, ${margin['top']})`);

        // create the axes component
        svg
            .append('g')
            .attr('id', 'xAxis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        svg
            .append('g')
            .attr('id', 'yAxis')
            .attr('transform', `translate(${width}, 0)`)
            .call(d3.axisRight(yScale));

          // generates lines when called
        const line = d3
            .line()
            .x(d => xScale(d.ts))
            .y(d => yScale(d.daily));
        
        console.log(data)

        svg
            .append('path')
            .data([data]) // binds data to the line
            .style('fill', 'none')
            .attr('id', 'priceChart')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '1.5')
            .attr('d', line);
        
    
        const focus = svg
            .append('g')
            .attr('class', 'focus')
            .style('display', 'none');
        
          focus.append('circle').attr('r', 4.5);
          focus.append('line').classed('x', true);
          focus.append('line').classed('y', true);
        
          svg
            .append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', generateCrosshair);
        
          d3.select('.overlay').style('fill', 'none');
          d3.select('.overlay').style('pointer-events', 'all');
        
          d3.selectAll('.focus line').style('fill', 'none');
          d3.selectAll('.focus line').style('stroke', '#67809f');
          d3.selectAll('.focus line').style('stroke-width', '1.5px');
          d3.selectAll('.focus line').style('stroke-dasharray', '3 3');
        
          //returs insertion point
          const bisectDate = d3.bisector(d => d.ts).left;
        
          /* mouseover function to generate crosshair */
          function generateCrosshair() {
            //returns corresponding value from the domain
            const correspondingDate = xScale.invert(d3.mouse(this)[0]);
            //gets insertion point
            const i = bisectDate(data, correspondingDate, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const currentPoint =
              correspondingDate - d0['ts'] > d1['ts'] - correspondingDate ? d1 : d0;
            focus.attr(
              'transform',
              `translate(${xScale(currentPoint['ts'])}, ${yScale(
                currentPoint['daily']
              )})`
            );
        
            focus
              .select('line.x')
              .attr('x1', 0)
              .attr('x2', width - xScale(currentPoint['ts']))
              .attr('y1', 0)
              .attr('y2', 0);
        
            focus
              .select('line.y')
              .attr('x1', 0)
              .attr('x2', 0)
              .attr('y1', 0)
              .attr('y2', height - yScale(currentPoint['daily']));
        
            // updates the legend to display the data at the selected mouseover area
            updateLegends(currentPoint);
          }
        
          /* Legends */
          const updateLegends = currentData => {
            d3.selectAll('.lineLegend').remove();
        
            const legendKeys = Object.keys(data[0]);
            const lineLegend = svg
              .selectAll('.lineLegend')
              .data(legendKeys)
              .enter()
              .append('g')
              .attr('class', 'lineLegend')
              .attr('transform', (d, i) => {
                return `translate(0, ${i * 20})`;
              });
            lineLegend
              .append('text')
              .text(d => {
                if (d === 'ts') {
                  return `${d}: ${currentData[d].toLocaleDateString()}`;
                } else if (
                  d === 'high' ||
                  d === 'low' ||
                  d === 'open' ||
                  d === 'close'
                ) {
                  return `${d}: ${currentData[d].toFixed(2)}`;
                } else {
                  return `${d}: ${currentData[d]}`;
                }
              })
              .style('fill', 'black')
              .attr('transform', 'translate(15,15)'); //align texts with boxes
          };
        
          /* Volume series bars */
          const volData = data.filter(d => d['volume'] !== null );
          console.log(volData)
        
          const yMinVolume = d3.min(volData, d => {
            return Math.min(d['volume']);
          });
        
          const yMaxVolume = d3.max(volData, d => {
            return Math.max(d['volume']);
          });
        
          const yVolumeScale = d3
            .scaleLinear()
            .domain([yMinVolume, yMaxVolume])
            .range([height, height * (3 / 4)]);
        
          svg
            .selectAll()
            .data(volData)
            .enter()
            .append('rect')
            .attr('x', d => {
              return xScale(d['ts']);
            })
            .attr('y', d => {
              return yVolumeScale(d['volume']);
            })
            .attr('class', 'vol')
            .attr('fill', (d, i) => {
              if (i === 0) {
                return '#03a678';
              } else {
                // TODO change this, we dont have open and close values
                // green bar if price is rising during that period, and red when price  is falling
                return volData[i - 1].close > d.close ? '#c0392b' : '#03a678'; 
              }
            })
            .attr('width', 1)
            .attr('height', d => {
              return height - yVolumeScale(d['volume']);
            });
    }
}

export default PriceVolumeChart;