import React, {Component} from 'react';
import * as d3 from "d3";

class PriceVolumeChart extends Component {

    constructor(props) {
        super(props);
        this.node = React.createRef();
        this.responsivefy = this.responsivefy.bind(this);
    }

    componentDidMount() {
        this.drawChart();
    }

    render() {
        return (<svg ref={this.node}></svg>)
    }
    
    // credits: https://brendansudol.com/writing/responsive-d3
    responsivefy() {
        const { node } = this;
        const svg = d3.select(node.current);
        // get container + svg aspect ratio
        const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width')),
        height = parseInt(svg.style('height')),
        aspect = width / height;
    
        // get width of container and resize svg to fit it
        const resize = () => {
        var targetWidth = parseInt(container.style('width'));
        svg.attr('width', targetWidth);
        svg.attr('height', Math.round(targetWidth / aspect));
        };
    
        // add viewBox and preserveAspectRatio properties,
        // and call resize so that svg resizes on inital page load
        svg
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('perserveAspectRatio', 'xMinYMid')
        .call(resize);
    
        // to register multiple listeners for same event type,
        // you need to add namespace, i.e., 'click.foo'
        // necessary if you call invoke this function for multiple svgs
        // api docs: https://github.com/mbostock/d3/wiki/Selections#on
        d3.select(window).on('resize.' + container.attr('id'), resize);
    };

    drawChart() {
        const { data } = this.props;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = window.innerWidth - margin.left - margin.right; // Use the window's width
        const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
        
        const { node } = this;

        const svg = d3.select(node.current);
        // find data range
        const xMin = d3.min(data, d => {
            return d['ts'];
        });

        const xMax = d3.max(data, d => {
            return d['ts'];
        });

        const yMin = d3.min(data, d => {
            return d['daily'];
        });

        const yMax = d3.max(data, d => {
            return d['daily'];
        });

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
            .call(this.responsivefy)
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
    }
}

export default PriceVolumeChart;