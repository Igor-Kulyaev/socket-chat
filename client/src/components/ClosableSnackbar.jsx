import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {forwardRef, useState} from "react";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ClosableSnackbar({message, setMessage, severity = "success", vertical = "top", horizontal = "right"}) {

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setMessage("");
  };

  return (
    <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical, horizontal}} >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}