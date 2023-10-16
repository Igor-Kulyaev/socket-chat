import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useEffect, useState} from "react";
import {Button, FormHelperText, TextField} from "@mui/material";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import {useRouter} from "next/router";
import {decryptToken, encryptToken, USER_IP} from "@/utils/encryption";
import {AuthSkeleton} from "@/components/AuthSkeleton";
import {useAuthorization} from "@/hooks/useAuthorization";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ClosableAlert from "@/components/ClosableAlert";
import ClosableSnackbar from "@/components/ClosableSnackbar"; // Import yupResolver

const registrationSchema = Yup.object().shape({
  username: Yup.string()
    .max(20, 'Username must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Username can only contain Latin characters or numbers')
    .required('Username is required'),

  firstName: Yup.string()
    .max(20, 'First name must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'First name can only contain Latin characters or numbers')
    .required('First name is required'),

  lastName: Yup.string()
    .max(20, 'Last name must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Last name can only contain Latin characters or numbers')
    .required('Last name is required'),

  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  password: Yup.string()
    .min(5, 'Password must be at least 5 characters')
    .max(20, 'Password must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Password can only contain Latin characters or numbers')
    .required('Password is required'),
});

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .max(20, 'Username must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Username can only contain Latin characters or numbers')
    .required('Username is required'),

  password: Yup.string()
    .min(5, 'Password must be at least 5 characters')
    .max(20, 'Password must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Password can only contain Latin characters or numbers')
    .required('Password is required'),
});


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

function AuthRegistration({setError}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(registrationSchema), // Use the Yup schema resolver
  });
  const router = useRouter();
  const {authUser, setAuthUser} = useAuthorization();

  console.log('errors', errors);
  console.log('render');
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
      setError(error?.response?.data?.message || error?.message);
      console.log('error', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="Username" variant="outlined" {...register("username")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.username?.message && <FormHelperText error>{errors.username?.message}</FormHelperText>}
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="First name" variant="outlined" {...register("firstName")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.firstName?.message && <FormHelperText error>{errors.firstName?.message}</FormHelperText>}
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="Last name" variant="outlined" {...register("lastName")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.lastName?.message && <FormHelperText error>{errors.lastName?.message}</FormHelperText>}
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="Email" variant="outlined" {...register("email")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.email?.message && <FormHelperText error>{errors.email?.message}</FormHelperText>}
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="Password" variant="outlined" {...register("password")}/>
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.password?.message && <FormHelperText error>{errors.password?.message}</FormHelperText>}
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <Button variant="contained" type="submit" sx={{marginRight: "60px"}}>Submit</Button>
        <Button color="secondary" variant="contained" type="reset" sx={{}}>Reset</Button>
      </Box>
    </form>
  )
}

function AuthLogin({setError}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema), // Use the Yup schema resolver
  });
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
      setError(error?.response?.data?.message || error?.message);
      console.log('error', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="Username" variant="outlined" {...register("username")} />
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.username?.message && <FormHelperText error>{errors.username?.message}</FormHelperText>}
      </Box>
      <Box sx={{display: "flex", justifyContent: "center"}}>
        <TextField label="Password" variant="outlined" {...register("password")}/>
      </Box>
      <Box sx={{marginBottom: "20px", display: "flex", justifyContent: "center"}}>
        {errors.password?.message && <FormHelperText error>{errors.password?.message}</FormHelperText>}
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
  const [error, setError] = useState("");
  console.log('error at component', error);

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
        {error && (
          // <ClosableAlert message={error} setMessage={setError} severity="error"/>
          <ClosableSnackbar message={error} setMessage={setError} severity="error" />
        )}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", justifyContent: "center" }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Registration" />
            <Tab label="Login" />
          </Tabs>
        </Box>
        <AuthTabPanel value={value} index={0}>
          <AuthRegistration setError={setError}/>
        </AuthTabPanel>
        <AuthTabPanel value={value} index={1}>
          <AuthLogin setError={setError} />
        </AuthTabPanel>
      </Box>
    </Box>
  )
}