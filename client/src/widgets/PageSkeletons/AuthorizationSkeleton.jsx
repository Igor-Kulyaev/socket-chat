import Skeleton from '@mui/material/Skeleton';
import Box from "@mui/material/Box";
export const AuthorizationSkeleton = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh" }}>
      <Skeleton variant="rounded" width={"60%"} height={"75vh"} />
    </Box>
  )
}