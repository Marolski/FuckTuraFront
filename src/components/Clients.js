import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, IconButton, Toolbar, Tooltip, Typography, TablePagination, TableSortLabel, ButtonBase, Menu, MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon   from '@mui/icons-material/SwapHoriz';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';
import { customerAPI, customerBusinessAPI, invoiceAPI, userBusinessAPI } from '../services/api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import NewClientModal from '../modals/NewClientModal';
import DeleteConfirmationModal from '../modals/Confiramtion';
import SellerSelectionModal from '../modals/SelectBusiness';

function createData(id, name, address, nip) {
  return { id, name, address, nip };
}

const headCells = [
  { id: 'name', numeric: true, disablePadding: false, label: 'Nazwa' },
  { id: 'address', numeric: true, disablePadding: false, label: 'Adres' },
  { id: 'nip', numeric: true, disablePadding: false, label: 'NIP' },
];

function CreateClient({ handleOpenNewClientModal }) {
  return (
    <ButtonBase onClick={handleOpenNewClientModal}>
      <Paper elevation={3}
        sx={{
          minWidth: '100%',
          padding: '16px',
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          display: 'flex', justifyContent: 'center', mb: 2
        }}>
        <Typography variant="h6">DODAJ KLIENTA</Typography>
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
            align={'left'}
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
  const { numSelected, handleOpenModal, handleOpenSelectClientModal, selectedBusinessName } = props;

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
          Klienci firmy {selectedBusinessName ? selectedBusinessName : '...'}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Usuń">
          <IconButton onClick={handleOpenModal}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Wybierz firmę">
          <IconButton onClick={handleOpenSelectClientModal}>
            <SwapHorizIcon    />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  handleOpenSelectClientModal: PropTypes.func.isRequired,
  selectedBusinessName: PropTypes.string,
};


export default function EnhancedTable() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [clientAdded, setClientAdded] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openNewClientModal, setOpenNewClientModal] = useState(false); // Stan otwarcia modala
  const [openSelectClientModal, setOpenSelectClientModal] = useState(false);

const getBusinessUser = async () =>{
    const sellerResponse = await userBusinessAPI.get();
    if (sellerResponse && sellerResponse.length > 0) {
      setSellers(sellerResponse);
  }
}
  const getClients = async (businessId) => {
    try {
      const response = await customerBusinessAPI.getByBusinessId(businessId);
      const fetchedRows = response.map((client) =>
        createData(client.id, client.name, client.address, client.nip)
      );
      setRows(fetchedRows);
    } catch (error) {
      console.error('Pobranie klientów zakończone błędem.', error);
    }
  };
  useEffect(() => {
    getBusinessUser();
    if(!selectedBusinessId)
      handleOpenSelectClientModal()
    if (clientAdded) {
      setSnackbarMessage('Klient został pomyślnie dodany!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setClientAdded(false); // Reset flagi
      getClients(selectedBusinessId); // Odśwież listę klientów
    }
  }, [clientAdded]);

  useEffect(() => {
    if (selectedBusinessId) {
      getClients(selectedBusinessId); // Pobierz klientów po ustawieniu selectedBusinessId
    }
  }, [selectedBusinessId]);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
  
    // Sprawdzenie typu kolumny
    const comparator = (a, b) => {
      if (typeof a[property] === 'string') {
        return a[property].localeCompare(b[property]); // dla tekstu
      }
      return a[property] - b[property]; // dla liczb
    };
  
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  
    // Sortowanie danych
    setRows(rows.slice().sort((a, b) => (isAsc ? comparator(a, b) : comparator(b, a))));
  };
  

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows
        .sort((a, b) => (order === 'desc' ? b[orderBy] - a[orderBy] : a[orderBy] - b[orderBy])) // sortowanie
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // aktualna strona
        .map((n) => n.id);
  
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

  const handleSelectSeller = (id) => {
    setSelectedBusinessId(id);
    handleCloseModal();
  };

  const handleOpenSelectClientModal = () => {
    setOpenSelectClientModal(true);
  };

  const handleCloseSelectClientModal = () => {
    setOpenSelectClientModal(false);
  };

  const handleOpenNewClientModal = (client) => {
    setSelectedClient(client);
    setOpenNewClientModal(true);
  }
  const handleCloseNewClientModal = () => {
    setOpenNewClientModal(false); 
    setSelectedClient(null);

  }
  const handleDeleteSelected = async () => {
    try {
      for (const id of selected) {
        await customerAPI.delete(id);
      }
      setSelected([]);
      await getClients(selectedBusinessId);
      setSnackbarMessage('Klienci zostali usunięci.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Błąd przy usuwaniu klientów.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
    handleCloseModal();
  };

  const handleClickRow = (client) => {
    handleOpenNewClientModal(client); // Otwarcie modala po kliknięciu w wiersz
  };

  const handleClientAdded = () => {
    setClientAdded(true);
  };
  const sellername = (sellers) => {
    const selectedSeller = sellers.find(seller => seller.id === selectedBusinessId);
    return selectedSeller ? selectedSeller.companyName : '...';
  };
  return (
    <>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 15 }}>
      {/* Przywrócenie przycisku i wyśrodkowanie */}
      <CreateClient handleOpenNewClientModal={handleOpenNewClientModal}  sx={{ mb: 2, alignSelf: 'center' }}/>
      <TableContainer component={Paper} sx={{ width: '60%', mb: 2, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
      <EnhancedTableToolbar
        numSelected={selected.length}
        handleOpenModal={handleOpenModal}
        handleOpenSelectClientModal={handleOpenSelectClientModal}
        selectedBusinessName={sellername(sellers)}
      />

        <Table sx={{ minWidth: 500 }} aria-labelledby="tableTitle">
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            numSelected={selected.length}
            rowCount={rows.length}
          />
          <TableBody>
            {rows.sort((a, b) => (order === 'desc' ? b[orderBy] - a[orderBy] : a[orderBy] - b[orderBy]))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = selected.indexOf(row.id) !== -1;
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClickRow(row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                     <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleClick(event, row.id)}
                        inputProps={{ 'aria-labelledby': row.id }}
                      />
                    </TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">{row.address}</TableCell>
                    <TableCell align="left">{row.nip}</TableCell>
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
      <DeleteConfirmationModal
        open={openModal}
        onClose={handleCloseModal}
        onDelete={handleDeleteSelected}
      />
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <NewClientModal 
        open={openNewClientModal} 
        onClose={handleCloseNewClientModal} 
        onSave={handleClientAdded} 
        businessId={selectedBusinessId} 
        clientToEdit={selectedClient}
      />
      <SellerSelectionModal
        open={openSelectClientModal}
        sellers={sellers}
        onClose={handleCloseSelectClientModal}
        onSelectSeller={handleSelectSeller}
      />
      </Box>
    </>
  );
}
