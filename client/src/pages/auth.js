import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useState} from "react";
import {Button, TextField} from "@mui/material";
import { useForm } from "react-hook-form";

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

export default function AuthorizationComponent() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onSubmit = data => console.log(data);

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
        </AuthTabPanel>
        <AuthTabPanel value={value} index={1}>
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
        </AuthTabPanel>
      </Box>
    </Box>
  )
}