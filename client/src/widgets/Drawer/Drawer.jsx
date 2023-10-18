import {Divider, List, Toolbar, Drawer as MuiDrawer} from "@mui/material";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ListItemText from "@mui/material/ListItemText";
import {drawerWidth} from "@/shared/constants/constants";

export const Drawer = ({usersList, selectRecipient, authUser}) => {
  return (
    <MuiDrawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Socket Chat App
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {usersList.map((user, index) => (
          <ListItem key={index} disablePadding onClick={() => selectRecipient(user)}>
            <ListItemButton>
              <ListItemIcon>
                <AccountCircleIcon color={user.online ? "success" : "error"}/>
              </ListItemIcon>
              <ListItemText primary={`${user.firstName} ${user.lastName} ${user._id === authUser._id ? "(You)" : ""}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </MuiDrawer>
  )
}
