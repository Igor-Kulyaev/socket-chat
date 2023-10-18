import {Modal, Link as MuiLink} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ExpiredSession() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh" }}>
      <Modal
        open
      >
        <Box sx={modalStyles}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Your session has expired
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Go to the <MuiLink href={"/"} color="primary" component={Link}>main page</MuiLink>
          </Typography>
        </Box>
      </Modal>
    </Box>
  )
}
