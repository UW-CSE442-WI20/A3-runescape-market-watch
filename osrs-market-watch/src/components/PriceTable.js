import React, { Component } from "react";
import "../App.scss";
import { useTable, useSortBy } from "react-table";
import styled from 'styled-components';

class PriceTable extends Component {
  constructor(props) {
    super(props);
    this.metadata = props.metadata;
  }

  render() {
    return (
      <div className="Sidebar">
        <div className="SearchBarContainer">
          <input
            type="text"
            className="Searchbar"
            style={{ width: "100%" }}
            placeholder="Search..."
            onChange={this.props.filterSidebar}
          />
          <button onClick={this.props.toggleExpand} className="ExpandButton">{`expand`}</button>
        </div>
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
        accessor: "name",
        Cell: row => {
          return (
            <div>
              <img 
                height={24}
                style={{"marginBottom": "-8px"}}
                src={metadata[row.row.original.id].icon}/>
              {row.row.original.name}
            </div>
          );
        }      
    },
      {
        Header: "Price",
        accessor: "daily"
      },
      {
        Header: "Volume",
        accessor: "volume"
      },
      // {
      //   Header: "Change (1d)",
      //   accessor: "oneDayChange"
      // },
      // {
      //   Header: "Change (7d)",
      //   accessor: "oneWeekChange"
      // },
      // {
      //   Header: "Change (1m)",
      //   accessor: "oneMonthChange"
      // }
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
  },
    useSortBy);

  console.log(data)

  // Render the UI for your table

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' ↑'
                        : ' ↓'
                      : ''}
                  </span>
            </th>
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
