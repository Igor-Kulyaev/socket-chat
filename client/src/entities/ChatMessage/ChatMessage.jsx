import Box from "@mui/material/Box";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Typography from "@mui/material/Typography";
import {formatFullDateTime} from "@/shared/utils";

export const ChatMessage = ({message, recipient}) => {
  const isMessageFromRecipient = message.userId === recipient._id;

  return (
    <Box sx={{
      backgroundColor: "#faf4cb",
      borderRadius: "10px",
      width: "50%",
      marginY: "10px",
      ...(!isMessageFromRecipient ? { marginLeft: 'auto' } : {}),
    }}
    >
      <Box sx={{display: 'flex', padding: "10px"}}>
        <PersonPinIcon color="warning"/>
        <Typography sx={{marginLeft: "20px"}}>{isMessageFromRecipient ? recipient.username : "Me"}</Typography>
      </Box>
      <Typography sx={{marginLeft: "20px"}}>{formatFullDateTime(message.createdAt)}</Typography>
      <Typography paragraph sx={{ padding: "10px" }}>
        {message.message}
      </Typography>
    </Box>
  )
}
