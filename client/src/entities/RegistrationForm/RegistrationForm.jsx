import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {registrationSchema} from "@/shared/schemas/schemas";
import {useRouter} from "next/router";
import {useAuthorization} from "@/hooks/useAuthorization";
import api from "@/shared/api";
import Box from "@mui/material/Box";
import {Button, FormHelperText, TextField} from "@mui/material";

export const RegistrationForm = ({setError}) => {
  const {setAuthUser} = useAuthorization();
  const {register, handleSubmit, formState: { errors }} = useForm({
    resolver: yupResolver(registrationSchema),
  });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const result = await api.post('register', data, );
      localStorage.setItem(
        "token",
        result.data.token
      );
      setAuthUser(result.data.user);
      await router.push("/chat");

    } catch (error) {
      setError(error?.response?.data?.message || error?.message);
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
        <TextField label="Password" variant="outlined" type="password" {...register("password")}/>
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
