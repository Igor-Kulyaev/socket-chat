import * as Yup from "yup";

const asciiRegularExp = /^[\x20-\x7E]+$/; // from \x20 the space character to \x7E the tilde character.

export const registrationSchema = Yup.object().shape({
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

export const loginSchema = Yup.object().shape({
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

export const messageSchema = Yup.object().shape({
  message: Yup.string()
    .min(1, 'Message must be at least 1 character')
    .max(200, 'Message must be at most 200 characters')
    .matches(asciiRegularExp, 'Message can only contain Latin characters or numbers')
    .required('Message is required'),
});
