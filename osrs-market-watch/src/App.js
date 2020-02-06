import React, { Component } from "react";
import "./App.scss";

import Papa from "papaparse";
import ItemMetadata from './data/better_items.json';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      items: null
    };

    console.log(ItemMetadata)

    this.readCSV = this.readCSV.bind(this);
    this.csvToJson = this.csvToJson.bind(this);
  }

  // async load the csv file
  componentDidMount() {
    this.readCSV("./data.csv").then(csvData => {
      Papa.parse(csvData, {
        complete: this.csvToJson,
        header: true,
        skipEmptyLines: true
      });
    });
  }

  csvToJson(csvData) {
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

    this.setState({
      loading: false,
      items: itemMap,
      sidebarItems: sidebarItems
    });
  }

  renderSidebar(sidebarItems) {
    return sidebarItems.map((item, i) => {
      let src = item.id in ItemMetadata ? ItemMetadata[item.id].icon : "";
      
      return (
        <div className="SidebarItem" key={i}>
          <img className="SidebarItemImage" src={src} alt={"MEANINGFUL ALT TEXT"}/>
          <p>{item.name}</p>
        </div>
      );
    });
  }

  readCSV(path) {
    return fetch(path).then(function(response) {
      let reader = response.body.getReader();
      let decoder = new TextDecoder("utf-8");

      return reader.read().then(function(result) {
        return decoder.decode(result.value);
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <div>im loading mothafugga</div>
    }

    return (
      <div className="Container">
        <div className="Sidebar">
          {
            this.renderSidebar(this.state.sidebarItems)
          }
          {/* <div className="SidebarListItem">test</div> */}
        </div>
        <div className="Content">
          <div className="ItemInfo">
            <img
              className="LargeItemImage"
              src={`./test.gif`}
              alt={"MEANINGFUL ALT TEXT"}
            />
            <h1 className="LargeItemName">Abyssal Whip</h1>
            <div className="Statistics">
              <div className="Statistic">{`Price: ${0}`}</div>
              <div className="Statistic">{`Volume: ${0}`}</div>
              <div className="Statistic">{`Daily % Change: ${0}`}</div>
              <div className="Statistic">{`1 Month % Change: ${0}`}</div>
              <div className="Statistic">{`3 Month % Change: ${0}`}</div>
              <div className="Statistic">{`6 Month % Change: ${0}`}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
