import React, { Component } from "react";
import "../App.scss";
import { useTable, useSortBy, usePagination } from "react-table";
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

const PRIMARY = "#212121";
const RED = "#d66061";
const GREEN = "#60d68a";
const BG = "#303030";

class PriceTable extends Component {
  constructor(props) {
    super(props);
    this.metadata = props.metadata;
    this.theme = createMuiTheme({
      palette: {
        primary: {500: RED},
        type: "dark"
      }
    });
  }

  render() {

    // subtract search bar, header, header, and footer heights...
    const TABLE_HEIGHT = this.props.height - 56 - 56 - 36 - 34;
    const TABLE_ROW_HEIGHT = 54;

    return (
      <div className="Sidebar">
        <ThemeProvider theme={this.theme}>
          <div className="Header">
            <img src={'./coins.png'} className="HeaderImage"/>
            <div className="Logo">OSRS Watch</div>
          </div>
        <div className="SearchBarContainer">
          <Input
            type="text"
            className="Searchbar"
            style={{ width: "100%" }}
            placeholder="Search..."
            onChange={this.props.filterSidebar}>
            </Input>
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
            formatGp={this.props.formatGp}
            pgSize={Math.round(TABLE_HEIGHT/TABLE_ROW_HEIGHT)}
          />
        </ThemeProvider>
      </div>
    );
  }
}

function Table({ data, metadata, onSelect, selected, formatGp, pgSize }) {
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
        accessor: "daily",
      Cell: row => {
      let color = row.row.original.oneDayChange > 0 ? GREEN : RED;
      return <span style={{"color" : color}}>{formatGp(row.row.original.daily)}</span>;
      }
      },
      {
        Header: "Volume",
        accessor: "volume",
        Cell: row => formatGp(row.row.original.volume)
      },
      // {
      //   Header: "Change (1d)",
      //   accessor: "oneDayChange",
      //   show: false
      // },
      // {
      //   Header: "Change (7d)",
      //   accessor: "oneWeekChange",
      //   show: false
      // },
      // {
      //   Header: "Change (1m)",
      //   accessor: "oneMonthChange",
      //   show: false
      // }
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    pageOptions,
    page,
    state: { pageIndex},
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: pgSize}
    },
    useSortBy,
    usePagination
  );

  // Render the UI for your table
  return (
    <>
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
        {page.map((row, i) => {
          prepareRow(row);
          return (
            <TableRow
              className={row.original.id === selected ? "PriceTableRow Selected" : "PriceTableRow" }
              onClick={() => {
                onSelect(row.original.id);
              }}
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
    <div className="Footer">
      <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
        Prev
      </Button>
      <div>
        Page{' '}
        <em>
          {pageIndex + 1} of {pageOptions.length}
        </em>
      </div>
      <Button onClick={() => nextPage()} disabled={!canNextPage}>
        Next
      </Button>


    </div>
    </>
  );
}

export default PriceTable;
