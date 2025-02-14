import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, IconButton, Toolbar, Tooltip, Typography, TablePagination, TableSortLabel, ButtonBase
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
import {useInvoiceContext} from '../services/context'
import {sortByDate} from '../services/sorter'
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DeleteConfirmationModal from '../modals/Confiramtion'

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

function EnhancedTableToolbar(props, handleOpenModal ) {
  const { numSelected } = props;

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
        <Tooltip title="Delete">
          <IconButton onClick={handleOpenModal}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
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
  

  const handleDelete = async () => {
    try {
      // Usuwamy zaznaczone elementy
      await invoiceAPI.deleteInvoices(selected);
      // Po usunięciu zamykamy modal i resetujemy zaznaczenie
      setOpenModal(false);
      setSelected([]);
      // Możesz również odświeżyć dane tabeli po usunięciu
    } catch (error) {
      console.error('Błąd usuwania:', error);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

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
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
  
    // Sortowanie wierszy na podstawie właściwości
    const sortedRows = [...rows].sort((a, b) => {
      if (property === 'number') { // Dostosuj 'number' do właściwej nazwy kolumny
        const dateA = parseInvoiceNumber(a[property]);
        const dateB = parseInvoiceNumber(b[property]);
  
        // Sortowanie według roku
        if (dateA.year !== dateB.year) {
          return newOrder === 'asc' ? dateA.year - dateB.year : dateB.year - dateA.year;
        }
  
        // Sortowanie według miesiąca
        if (dateA.month !== dateB.month) {
          return newOrder === 'asc' ? dateA.month - dateB.month : dateB.month - dateA.month;
        }
  
        // Sortowanie według numeru
        if (dateA.number !== dateB.number) {
          return newOrder === 'asc' ? dateA.number - dateB.number : dateB.number - dateA.number;
        }
  
        return 0;
      }
      if (property === 'date') {
        // Parsowanie daty w formacie DD-MM-YYYY
        const dateA = a[property].split('-').reverse().join('-');  // Przemiana na format YYYY-MM-DD
        const dateB = b[property].split('-').reverse().join('-');  // Przemiana na format YYYY-MM-DD
    
        // Sortowanie dat
        const parsedDateA = new Date(dateA);
        const parsedDateB = new Date(dateB);
    
        return newOrder === 'asc' ? parsedDateA - parsedDateB : parsedDateB - parsedDateA;
      }
      if (property === 'price') {
        // Parsowanie wartości na float
        const priceA = parseFloat(a[property]) || 0; // Domyślnie 0, jeśli wartość jest nieprawidłowa
        const priceB = parseFloat(b[property]) || 0; // Domyślnie 0, jeśli wartość jest nieprawidłowa
  
        return newOrder === 'asc' ? priceA - priceB : priceB - priceA;
      }
      if (a[property] < b[property]) {
        return newOrder === 'asc' ? -1 : 1;
      }
      if (a[property] > b[property]) {
        return newOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
    setRows(sortedRows);
  };
  

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event, id) => {
    // Jeśli kliknięcie nastąpiło na checkboxie, nie rób nic
    if (event.target.type === 'checkbox') return;
  
    // Przekierowanie do szczegółów, jeśli kliknięcie nie dotyczyło checkboxa
    navigate(`/invoice/${id}`);
  };
  
  const handleCheckboxClick = (event, id) => {
    event.stopPropagation(); // Zatrzymaj propagację, aby uniknąć wywołania handleRowClick
  
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
  
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const visibleRows = rows
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box 
        sx={{
            width: '100%',
            height: '100vh', // Sprawia, że Box zajmuje pełną wysokość ekranu
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Ustawia pozycję przycisku w poziomie na środku
            alignItems: 'center', // Ustawia pozycję przycisku w pionie na środku
        }}>
        <CreateInvoiceButton/>
        <Paper sx={{ width: '100%', mt: 10 }}>
        <EnhancedTableToolbar numSelected={selected.length} handleOpenModal={handleOpenModal}/>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleRowClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox" onClick={(event) => handleCheckboxClick(event, row.id)}>
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" padding="none">
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
