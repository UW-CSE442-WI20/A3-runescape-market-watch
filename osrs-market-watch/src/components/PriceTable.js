import React, { Component } from "react";
import "../App.scss";
import { useTable, useSortBy } from "react-table";
import styled from "styled-components";

import CssBaseline from "@material-ui/core/CssBaseline";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { Input, Button } from '@material-ui/core';

const RED = "#8a3535";
const BG = "#303030";

class PriceTable extends Component {
  constructor(props) {
    super(props);
    this.metadata = props.metadata;
  }

  render() {
    const theme = createMuiTheme({
      palette: {
        type: "dark"
      }
    });

    return (
      <div className="Sidebar">
        <ThemeProvider theme={theme}>
        <div className="SearchBarContainer">
          <Input
            type="text"
            className="Searchbar"
            style={{ width: "100%" }}
            placeholder="Search..."
            onChange={this.props.filterSidebar}
          />
          <Button
            onClick={this.props.toggleExpand}
            className="ExpandButton">
              {this.props.expanded ? '<<' : '>>'}
          </Button>
        </div>
          <CssBaseline />

          <Table
            data={this.props.items}
            selected={this.props.activeItemId}
            metadata={this.metadata}
            onSelect={this.props.onSelect}
          />
        </ThemeProvider>
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
`;

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
                style={{ marginBottom: "-8px" }}
                src={metadata[row.row.original.id].icon}
              />
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
      }
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
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  // Render the UI for your table

  return (
    <MaUTable {...getTableProps()}>
      <TableHead>
        {headerGroups.map(headerGroup => (
          <TableRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <TableCell
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
                {column.render("Header")}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? " ↑" : " ↓") : ""}
                </span>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <TableRow
              className={row.original.id === selected ? "PriceTableRow Selected" : "PriceTableRow" }
              onClick={() => {
                onSelect(row.original.id);
              }}
              // style={{ background: row.original.id === selected ? RED : BG }}
              {...row.getRowProps()}
            >
              {row.cells.map(cell => {
                return (
                  <TableCell {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </MaUTable>
  );
}

export default PriceTable;
