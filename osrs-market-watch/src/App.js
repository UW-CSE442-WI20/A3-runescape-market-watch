import React, { Component } from "react";
import "./App.scss";

import Papa from "papaparse";
import * as d3 from "d3";
import ItemMetadata from './data/better_items.json';
import PriceVolumeChart from './PriceVolumeChart.js';
import PriceTable from './components/PriceTable.js';

const TITLE_HEIGHT = 0;
const SIDEBAR_WIDTH = 400;
const ITEM_HEADER_HEIGHT = 0;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      items: null,
      activeItemId: null,
      expanded: false
    };
    this.chart = React.createRef();
    this.csvToJson = this.csvToJson.bind(this);
    this.onResize = this.onResize.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.filterSidebar = this.filterSidebar.bind(this);
    this.onSidebarSelect = this.onSidebarSelect.bind(this);
  }

  // async load the csv file
  componentDidMount() {
    Papa.parse('./data.csv', {
      complete: this.csvToJson,
      download: true,
      header: true,
      skipEmptyLines: true,
      delimiter: ','
    });
    
    window.addEventListener('resize', this.onResize, false);
    this.onResize();
  }

  toggleExpand() {
    console.log('shit')
    this.setState((prev) => ({expanded: !prev.expanded}))
  }

  onResize() {
    this.setState(
      { chartWidth: window.innerWidth - SIDEBAR_WIDTH,
        chartHeight: window.innerHeight - ITEM_HEADER_HEIGHT - TITLE_HEIGHT});
  }

  csvToJson(csvData) {
    let itemMap = {};

    // sort by timestamp so all values are
    // inserted into itemMap in sorted order
    csvData.data.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    csvData.data.forEach(line => {
      if (!(line.id in itemMap)) {
        itemMap[line.id] = [];
      }
      itemMap[line.id].push(line);
    });

    // generate some stats here? like percent change?
    // and store them in this.state so we dont have to
    // recompute
    // or we could query that on item selection

    let sidebarItems = [];

    let percentChange = (start, end) => Math.round(1000 * (start - end) / start) / 10;


    for (var k in itemMap) {
      let mostRecent = itemMap[k].slice(-1)[0];
      let lastMonth = itemMap[k].slice(-30).map(d => d.daily);

      sidebarItems.push({
        name: mostRecent.name,
        average: mostRecent.average,
        daily: mostRecent.daily,
        volume: mostRecent.volume,
        id: mostRecent.id,
        oneDayChange: percentChange(lastMonth[28], lastMonth[29]),
        oneWeekChange: percentChange(lastMonth[22], lastMonth[29]),
        oneMonthChange: percentChange(lastMonth[0], lastMonth[29])
      });
    }

    console.log(sidebarItems[0].name);

    this.setState({
      loading: false,
      items: itemMap,
      sidebarItems: sidebarItems,
      filteredItems: sidebarItems,
      activeItemId: sidebarItems[0].id
    });
  }

  renderSidebar(sidebarItems) {
    return sidebarItems.map((item, i) => {
      let src = item.id in ItemMetadata ? ItemMetadata[item.id].icon : "";
      let isActive = item.id === this.state.activeItemId;
      let className = isActive ? "SidebarItem Active" : "SidebarItem"; 
      
      return (
        <div className={className} key={i} onClick={() => this.setState({activeItemId: item.id})}>
          <img className="SidebarItemImage" src={src} alt={"MEANINGFUL ALT TEXT"}/>
          <p>{item.name}</p>
        </div>
      );
    });
  }

  onSidebarSelect(id) {
    this.setState({activeItemId: id})
  }
  
  filterSidebar(e) {
    const text = e.target.value.toLowerCase();
    const newItems = this.state.sidebarItems.filter(
      item => item.name.toLowerCase().includes(text)
    );
    this.setState({
      filteredItems: newItems
    });
  }

  renderLoadingAnimation() {
    return (
        <div className="LoadingContainer">
            <div className="lds-roller" style={{"color": "black"}}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
}

  render() {
    if (this.state.loading) {
      return this.renderLoadingAnimation()
    }

    const { activeItemId, chartWidth, chartHeight } = this.state;
    const metadata = ItemMetadata[activeItemId]; // type, image urls
    const pricedata = this.state.sidebarItems.filter((e) => e.id === activeItemId)[0]; // daily values, and image
    const pricehistory = this.state.items[activeItemId]; // full price history


    const chartData = pricehistory.map((row) => ({
      'ts': new Date(row['ts']),
      'daily': +row['daily'],
      'average': +row['average'],
      'volume': +row['volume']
    }))

    const gpFormat = gp => `${d3.format('.3~s')(gp)} gp`;
    const volFormat = d3.format('.3~s');
    const { expanded } = this.state;

    return (
      <div>
      <div className={expanded ? "Container Expanded" : "Container"}>
        <PriceTable
          items={this.state.filteredItems}
          metadata={ItemMetadata}
          filterSidebar={this.filterSidebar}
          activeItemId={this.state.activeItemId}
          onSelect={this.onSidebarSelect}
          expanded={this.state.expanded}
          toggleExpand={this.toggleExpand}/>
        <div className={expanded ? "Content Expanded" : "Content"}>
          <div className="ChartContainer" ref={this.chart} style={{margin: 0}}>
            <PriceVolumeChart data={chartData}
                              width={chartWidth}
                              height={chartHeight} />
          </div>
          
        </div>
      </div>
      </div>
    );
  }
}

export default App;
