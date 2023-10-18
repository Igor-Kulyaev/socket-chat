import Box from "@mui/material/Box";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Typography from "@mui/material/Typography";
import {Divider} from "@mui/material";
import {formatFullDateTime} from "@/shared/utils";

export const NotificationMessage = ({notification, isLastNotification, users}) => {
  const sender = users.find((user) => user._id === notification.userId);
  return(
    <>
      <Box sx={{padding: "10px", maxWidth: "300px"}}>
        <Box sx={{display: 'flex'}}>
          <PersonPinIcon color="primary"/>
          <Typography>{sender.username}</Typography>
          <Typography sx={{marginLeft: "20px"}}>{formatFullDateTime(notification.createdAt)}</Typography>
          <Divider />
        </Box>
        <Typography>{notification.message}</Typography>
      </Box>
      {!isLastNotification && <Divider />}
    </>
  )
}
