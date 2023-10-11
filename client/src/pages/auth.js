import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useEffect, useState} from "react";
import {Button, TextField} from "@mui/material";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import {useRouter} from "next/router";
import {decryptToken, encryptToken, USER_IP} from "@/utils/encryption";
import {AuthSkeleton} from "@/components/AuthSkeleton";
import {useAuthorization} from "@/hooks/useAuthorization";

function AuthTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AuthRegistration() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const router = useRouter();
  const {authUser, setAuthUser} = useAuthorization();
  const onSubmit = async (data) => {
    try {
      const result = await api.post('register', data, );
      // const encryptedToken = encryptToken(result.data.token, USER_IP.IP_ADDRESS);
      localStorage.setItem(
        "token",
        result.data.token
      );
      setAuthUser(result.data.user);
      await router.push("/chat");

    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="Username" variant="outlined" {...register("username")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="First name" variant="outlined" {...register("firstName")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="Last name" variant="outlined" {...register("lastName")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="Email" variant="outlined" {...register("email")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="Password" variant="outlined" {...register("password")}/>
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <Button variant="contained" type="submit" sx={{marginRight: "60px"}}>Submit</Button>
        <Button color="secondary" variant="contained" type="reset" sx={{}}>Reset</Button>
      </Box>
    </form>
  )
}

function AuthLogin() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const router = useRouter();
  const {authUser, setAuthUser} = useAuthorization();
  const onSubmit = async (data) => {
    try {
      const result = await api.post('login', data, );
      // const encryptedToken = encryptToken(result.data.token, USER_IP.IP_ADDRESS);
      localStorage.setItem(
        "token",
        result.data.token
      );
      setAuthUser(result.data.user);
      await router.push("/chat");

    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="Username" variant="outlined" {...register("username")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        <TextField id="outlined-basic" label="Password" variant="outlined" {...register("password")}/>
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <Button variant="contained" type="submit" sx={{marginRight: "60px"}}>Submit</Button>
        <Button color="secondary" variant="contained" type="reset" sx={{}}>Reset</Button>
      </Box>
    </form>
  )
}

export default function AuthorizationComponent() {
  const [value, setValue] = useState(0);
  const router = useRouter();
  const [isInitialRender, setIsInitialRender] = useState(true);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    // const encryptedToken = localStorage.getItem('token');
    // const decryptedToken = encryptedToken ? decryptToken(encryptedToken, USER_IP.IP_ADDRESS) : null;
    const token = localStorage.getItem('token');
    if (token) {
      router.push("/chat");
    } else {
      setIsInitialRender(false);
    }
  }, []);

  if (isInitialRender) {
    return <AuthSkeleton />
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh" }}>
      <Box sx={{backgroundColor: "#d8e2ff", padding: "50px", height: "85vh", borderRadius: "25px"}}>
        <Typography variant="h3" sx={{ textAlign: 'center', color: "#02569e" }}>Chat Authorization Form</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", justifyContent: "center" }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Registration" />
            <Tab label="Login" />
          </Tabs>
        </Box>
        <AuthTabPanel value={value} index={0}>
          <AuthRegistration/>
        </AuthTabPanel>
        <AuthTabPanel value={value} index={1}>
          <AuthLogin/>
        </AuthTabPanel>
      </Box>
    </Box>
  )
}