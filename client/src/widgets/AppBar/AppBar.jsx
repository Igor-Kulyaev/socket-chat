import {AppBar as MuiAppBar, IconButton, Toolbar} from "@mui/material";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import {NotificationMessage} from "@/entities/NotificationMessage/NotificationMessage";
import Typography from "@mui/material/Typography";

export const AppBar = ({
  openNotifications,
  notificationsCount,
  logout,
  popoverAnchorEl,
  closeNotifications,
  notifications,
  usersList
}) => {
  return (
    <MuiAppBar position="static">
      <Toolbar style={{ justifyContent: 'flex-end' }}>
        <Box>
          <IconButton onClick={openNotifications}>
            <Badge badgeContent={notificationsCount} color="secondary">
              <NotificationsActiveIcon sx={{color: "white"}} />
            </Badge>
          </IconButton>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Box>
        <Popover
          open={Boolean(popoverAnchorEl)}
          anchorEl={popoverAnchorEl}
          onClose={closeNotifications}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {notifications.length
            ? notifications.map((notification) => <NotificationMessage key={notification._id} notification={notification} users={usersList} />)
            : (
              <Box sx={{padding: "10px", maxWidth: "300px"}}>
                <Typography>There are no notifications for you now.</Typography>
              </Box>
            )}
        </Popover>
      </Toolbar>
    </MuiAppBar>
  )
}
