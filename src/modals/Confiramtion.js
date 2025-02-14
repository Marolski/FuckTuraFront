import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

function DeleteConfirmationModal({ open, onClose, onDelete }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
      <DialogContent>
        <p>Czy na pewno chcesz usunąć zaznaczone elementy?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Anuluj
        </Button>
        <Button onClick={onDelete} color="primary">
          Usuń
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationModal;
