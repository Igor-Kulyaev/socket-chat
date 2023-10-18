import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {AuthorizationSkeleton} from "@/widgets/PageSkeletons/AuthorizationSkeleton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {TabPanel} from "@/shared/ui/TabPanel/TabPanel";
import {RegistrationForm} from "@/entities/RegistrationForm/RegistrationForm";
import {LoginForm} from "@/entities/LoginForm/LoginForm";
import ClosableSnackbar from "@/shared/ui/Snackbar/ClosableSnackbar";

export const Authorization = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [authError, setAuthError] = useState("");
  const router = useRouter();

  const handleChange = (event, newTabValue) => {
    setTabValue(newTabValue);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push("/chat");
    } else {
      setIsInitialRender(false);
    }
  }, []);

  if (isInitialRender) {
    return <AuthorizationSkeleton />
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh" }}>
        <Box sx={{backgroundColor: "#d8e2ff", padding: "50px", height: "85vh", borderRadius: "25px"}}>
          <Typography variant="h3" sx={{ textAlign: 'center', color: "#02569e" }}>Chat Authorization Form</Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", justifyContent: "center" }}>
            <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Registration" />
              <Tab label="Login" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <RegistrationForm setError={setAuthError}/>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <LoginForm setError={setAuthError} />
          </TabPanel>
        </Box>
      </Box>
      {authError && (
        <ClosableSnackbar message={authError} setMessage={setAuthError} severity="error" />
      )}
    </>
  )
}