import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, IconButton, Toolbar, Tooltip, Typography, TablePagination, TableSortLabel, ButtonBase, Menu, MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';
import { invoiceAPI, userBusinessAPI } from '../services/api';
import { mapStatusEnumToString } from '../services/enumMapper'; // Import the new mapping service
import { parseInvoiceNumber, mapDateToDDMMYYYY } from '../services/parse'; // Import the new mapping service
import { useNavigate } from 'react-router-dom'; // Importuj useNavigate
import { useInvoiceContext } from '../services/context';
import { sortByDate, sortData } from '../services/sorter';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DeleteConfirmationModal from '../modals/Confiramtion';

function createData(id, number, client, price, date, status, business) {
  return { id, number, client, price, date, status, business };
}

const headCells = [
  { id: 'number', numeric: false, disablePadding: true, label: 'Numer faktury' },
  { id: 'client', numeric: true, disablePadding: false, label: 'Klient' },
  { id: 'business', numeric: true, disablePadding: false, label: 'Firma' },
  { id: 'price', numeric: true, disablePadding: false, label: 'Kwota' },
  { id: 'date', numeric: true, disablePadding: false, label: 'Data wystawienia' },
  { id: 'status', numeric: true, disablePadding: false, label: 'Status' },
];

function CreateInvoiceButton() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/createInvoice'); // Przekierowanie do ścieżki komponentu CreateInvoice
  };

  return (
    <ButtonBase onClick={handleNavigation}>
      <Paper elevation={3}
        sx={{
          minWidth: '100%',
          padding: '16px',
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark', // Zmiana koloru na hover
          },
          display: 'flex', justifyContent: 'center', mb: 2
        }}>
        <Typography variant="h6">STWÓRZ FAKTURĘ</Typography>
      </Paper>
    </ButtonBase>
  );
};

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'zaznacz wszystkie' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, handleOpenModal, handleStatusChange } = props;

  return (
    <Toolbar
      sx={[
        { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} wybranych
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Faktury
        </Typography>
      )}
      {numSelected > 0 ? (
        <div>
          <Tooltip title="Change Status">
            <IconButton onClick={handleStatusChange}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={handleOpenModal}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
};

export default function EnhancedTable() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate(); // Inicjalizuj useNavigate
  const { invoiceAdded, resetInvoiceAdded } = useInvoiceContext();
  const [openModal, setOpenModal] = useState(false); // Stan modalu
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null); // Status menu state

  const statusOptions = [
    { value: 0, label: 'Wystawiona' },
    { value: 1, label: 'Opłacona' },
    { value: 2, label: 'Nieopłacona' },
    { value: 3, label: 'Anulowana' },
    { value: 4, label: 'Szkic' }
  ];

  const handleStatusChange = (event) => {
    setStatusMenuAnchor(event.currentTarget); // Open the menu
  };

  const handleStatusSelect = (status) => {
    setStatusMenuAnchor(null); // Close the menu
    // Update the status of selected invoices
    const updatedRows = [...rows];
    selected.forEach(async (invoiceId) => {
      try {
        const invoice = await invoiceAPI.getById(invoiceId);
        invoice.status = status;
        await invoiceAPI.updateById(invoiceId, invoice); // Call the API to update the status

        const index = updatedRows.findIndex(row => row.id === invoiceId);
        if (index !== -1) {
          updatedRows[index].status = mapStatusEnumToString(status); // Mapa statusu do stringa
        }
        setSelected([]);
        setSnackbarMessage('Zmieniono status faktury.');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } catch (error) {
        setSnackbarMessage('Błąd zmiany statusu faktury.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    });
  };

  useEffect(() => {
    const getByNIP = async (isBusiness) => {
      try {
        const busineses = await userBusinessAPI.get(); 
        const NIPs = busineses.map((i) =>i.nipNumber);
        const response = (await Promise.all(NIPs.map(nip => invoiceAPI.getByNIP(nip, isBusiness)))).flat();
        const fetchedRows = response.map((invoice) =>
          createData(invoice.id, invoice.number, invoice.buyerName, invoice.amount, mapDateToDDMMYYYY(invoice.invoiceDate), mapStatusEnumToString(invoice.status), invoice.sellerName)
        );
        const sortedfetchedRows = sortByDate(fetchedRows);
        setRows(sortedfetchedRows);
      } catch (error) {
        console.error('Get invoice by NIP error:', error);
      }
    };
    getByNIP(true);
    if (invoiceAdded) {
      resetInvoiceAdded(); 
      setSnackbarMessage('Faktura została pomyślnie dodana!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true); // Resetujemy flagę
    }
  }, [invoiceAdded, resetInvoiceAdded]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    const sortedRows = sortData(rows, isAsc ? 'desc' : 'asc', property);  // Sorting rows based on selected column
    setRows(sortedRows);
  };
  

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selected) {
        await invoiceAPI.deleteById(id); // Call the API to delete
      }
      setRows(rows.filter(row => !selected.includes(row.id)));
      setSnackbarMessage('Faktury zostały usunięte');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setSelected([]); // Clear selected rows
      setOpenModal(false);
    } catch (error) {
      console.log(error)
      setSnackbarMessage('Błąd podczas usuwania faktur');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 15 }}>
      {/* Przywrócenie przycisku i wyśrodkowanie */}
      <CreateInvoiceButton sx={{ mb: 2, alignSelf: 'center' }} />
  
      <Paper sx={{ width: '60%', mb: 2, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          handleOpenModal={handleOpenModal}
          handleStatusChange={handleStatusChange}
        />
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
              rowCount={rows.length}
            />
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = selected.indexOf(row.id) !== -1;
                  return (
                    <TableRow
                      hover
                      onClick={(event) => {
                        if (!event.target.closest('input'))
                          navigate(`/invoice/${row.id}`)
                      }}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={(event) => handleClick(event, row.id)}
                          inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${index}` }}
                        />
                      </TableCell>
                      <TableCell component="th" id={`enhanced-table-checkbox-${index}`} scope="row" padding="none">
                        {row.number}
                      </TableCell>
                      <TableCell align="right">{row.client}</TableCell>
                      <TableCell align="right">{row.business}</TableCell>
                      <TableCell align="right">{row.price}</TableCell>
                      <TableCell align="right">{row.date}</TableCell>
                      <TableCell align="right">{row.status}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
  
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
  
      {/* Modal for status update */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        {statusOptions.map(({ value, label }) => (
          <MenuItem key={value} onClick={() => handleStatusSelect(value)}>
            {label}
          </MenuItem>
        ))}
      </Menu>
  
      {/* Modal for confirmation */}
      <DeleteConfirmationModal
        open={openModal}
        onClose={handleCloseModal}
        onDelete={handleDeleteSelected}
      />
  
      {/* Snackbar for success or error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );  
}
