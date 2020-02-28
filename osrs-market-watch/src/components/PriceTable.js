import React, { Component } from "react";
import "../App.scss";
import { useTable, useSortBy } from "react-table";
import styled from 'styled-components';

class PriceTable extends Component {
  constructor(props) {
    super(props);
    this.metadata = props.metadata;
  }

  renderSidebar() {
    return this.props.items.map((item, i) => {
      let src = item.id in this.metadata ? this.metadata[item.id].icon : "";
      let isActive = item.id === this.props.activeItemId;
      let className = isActive ? "SidebarItem Active" : "SidebarItem";

      return (
        <div
          className={className}
          key={i}
          onClick={() => this.props.onSelect(item.id)}
        >
          <img
            className="SidebarItemImage"
            src={src}
            alt={"MEANINGFUL ALT TEXT"}
          />
          <p>{item.name}</p>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="Sidebar">
        <input
          type="text"
          className="Searchbar"
          style={{ width: "100%" }}
          placeholder="Search..."
          onChange={this.props.filterSidebar}
        />
        {/* <div className="ItemsContainer">
          {this.renderSidebar(this.props.items)}
        </div> */}
        <Styles>
            <Table data={this.props.items}
                   selected={this.props.activeItemId}
                   metadata={this.metadata}
                   onSelect={this.props.onSelect} />
        </Styles>
        
      </div>
    );
  }
}

const Styles = styled.div`
  padding: 1rem;

  table {
    width: 100%;

    tbody > tr {
        cursor: pointer;
            
    }
    tbody > tr:hover {
        background: #d2438d !important;
    }   

    th,
    td {
      text-align: left;
    }
  }
`

function Table({ data, metadata, onSelect, selected }) {
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        Cell: row => {
          return (
            <div>
              <img height={24} style={{"marginBottom": "-8px"}}src={metadata[row.row.original.id].icon}/>
              {row.row.original.name}
            </div>
          );
        },
        id: "status"
      },
    //   {
    //     Header: "Name",
    //     accessor: "name"
    //   },

      {
        Header: "Price",
        accessor: "daily"
      },

      {
        Header: "Volume",
        accessor: "volume"
      }
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr onClick={() => {
                onSelect(row.original.id)
                }}
                style={{
                    background: row.original.id === selected ? '#00afec' : 'white',
                    color: row.original.id === selected ? 'white' : 'black'}}
                {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default PriceTable;
