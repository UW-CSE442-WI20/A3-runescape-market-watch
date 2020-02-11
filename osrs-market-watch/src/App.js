import React, { Component } from "react";
import "./App.scss";

import Papa from "papaparse";
import ItemMetadata from './data/better_items.json';
import PriceVolumeChart from './PriceVolumeChart.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      items: null,
      activeItemId: null
    };

    this.csvToJson = this.csvToJson.bind(this);
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
  }

  csvToJson(csvData) {
    console.log(csvData)
    let itemMap = {};

    // sort by timestamp so all values are
    // inserted into itemMap in sorted order
    csvData.data.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    console.log(csvData);
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
    for (var k in itemMap) {
      let mostRecent = itemMap[k].slice(-1)[0];

      sidebarItems.push({
        name: mostRecent.name,
        average: mostRecent.average,
        daily: mostRecent.daily,
        volume: mostRecent.volume,
        id: mostRecent.id
      });
    }

    console.log(sidebarItems[0].name);

    this.setState({
      loading: false,
      items: itemMap,
      sidebarItems: sidebarItems,
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

  render() {
    if (this.state.loading) {
      return <div>im loading mothafugga</div>
    }

    const { activeItemId } = this.state;
    const metadata = ItemMetadata[activeItemId]; // type, image urls
    const pricedata = this.state.sidebarItems.filter((e) => e.id === activeItemId)[0]; // daily values, and image
    const pricehistory = this.state.items[activeItemId]; // full price history

    const chartData = pricehistory.map((row) => ({
      'ts': new Date(row['ts']),
      'daily': +row['daily'],
      'average': +row['average'],
      'volume': +row['volume']
    }))

    return (
      <div className="Container">
        <div className="Sidebar">
          {
            this.renderSidebar(this.state.sidebarItems)
          }
        </div>
        <div className="Content">
          <div className="ItemInfo">
            <img
              className="LargeItemImage"
              src={metadata.icon}
              alt={`${metadata.name} thumbnail`}
            />
            <h1 className="LargeItemName">{pricedata.name}</h1>
            <div className="Statistics">
              <div className="Statistic">{`Avg. Price: ${pricedata.average}`}</div>
              <div className="Statistic">{`Daily Volume: ${pricedata.volume}`}</div>
              <div className="Statistic">{`Daily Price: ${pricedata.daily}`}</div>
              <div className="Statistic">{`Daily % Change: ${-1}`}</div>
              <div className="Statistic">{`1 Month % Change: ${-1}`}</div>
              <div className="Statistic">{`3 Month % Change: ${-1}`}</div>
            </div>
          </div>
          <PriceVolumeChart data={chartData}/>
        </div>
      </div>
    );
  }
}

export default App;
