import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
export const ChatSkeleton = () => {
  return (
    <>
      <Skeleton variant="text" sx={{ fontSize: '10rem', marginTop: "-25px" }} />
      <Stack spacing={5} direction="row">
        <Skeleton variant="rectangular" width={"35%"} height={"80vh"} />
        <Skeleton variant="rectangular" width={"60%"} height={"80vh"} />
      </Stack>
    </>
  )
}
