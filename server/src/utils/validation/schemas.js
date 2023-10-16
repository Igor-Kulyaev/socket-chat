const yup = require('yup');

const registrationSchema = yup.object().shape({
  username: yup.string()
    .max(20, 'Username must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Username can only contain Latin characters or numbers')
    .required('Username is required'),

  firstName: yup.string()
    .max(20, 'First name must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'First name can only contain Latin characters or numbers')
    .required('First name is required'),

  lastName: yup.string()
    .max(20, 'Last name must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Last name can only contain Latin characters or numbers')
    .required('Last name is required'),

  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  password: yup.string()
    .min(5, 'Password must be at least 5 characters')
    .max(20, 'Password must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Password can only contain Latin characters or numbers')
    .required('Password is required'),
});

const loginSchema = yup.object().shape({
  username: yup.string()
    .max(20, 'Username must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Username can only contain Latin characters or numbers')
    .required('Username is required'),

  password: yup.string()
    .min(5, 'Password must be at least 5 characters')
    .max(20, 'Password must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'Password can only contain Latin characters or numbers')
    .required('Password is required'),
});

const asciiRegularExp = /^[\x20-\x7E]+$/; // \x20: Represents the space character. \x7E: Represents the tilde character.

const messageSchema = yup.object().shape({
  message: yup.string()
    .min(1, 'Message must be at least 1 character')
    .max(200, 'Message must be at most 200 characters')
    .matches(asciiRegularExp, 'Message can only contain Latin characters or numbers')
    .required('Message is required'),
});

module.exports = {
  registrationSchema,
  loginSchema,
  messageSchema,
};