import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

//import ForgotPassword from './ForgotPassword';
//import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { Snackbar } from '@mui/material';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

export default function AuthenticationPage() {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState(); // for error message
    const [messages, setMessages] = React.useState();

    const [formState, setFormState] = React.useState(0);
    const {handleRegister, handleLogin} = useContext(AuthContext);

    let handleAuth = async () => {
        try {
            // Clear previous errors
            setError('');
            
            if (formState === 0) { // login
                let result = await handleLogin(username, password)
                
            }

            if (formState === 1) { // register
                let result = await handleRegister(name, username, password);
                console.log(result);
                setMessages(result);
                setOpen(true);
                setError(''); // Clear error on success
                setFormState(0);
                setPassword('');
                setUsername('');
            }
        }
        catch(err) {
            let message = err.response?.data?.message || err.message || 'An error occurred';
            setError(message);
            setOpen(false); // Close success snackbar if error occurs
        }
    }


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const validateInputs = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    return (
        <Card variant="outlined">
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                {/* <SitemarkIcon /> */}
            </Box>
            
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Sign in
            </Typography>
            <Box
                component="form"
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >


                {formState === 1 ?
                    <FormControl>
                        <FormLabel htmlFor="username">Full Name</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMessage}
                            id="fullName"
                            type="string"
                            name="fullName"
                            placeholder="Full Name"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={emailError ? 'error' : 'primary'}
                            sx={{ ariaLabel: 'username' }}
                            onChange={(e) => setName(e.target.value)}
                        /> </FormControl> : <></>}



                <FormControl>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="username"
                        type="string"
                        name="username"
                        placeholder="username"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        sx={{ ariaLabel: 'username' }}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: 'baseline' }}
                        >
                            Forgot your password?
                        </Link>
                    </Box>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? 'error' : 'primary'}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p style={{color: "red"}}>{error}</p>
                </FormControl>
                {formState === 1 ? <Button type="button" fullWidth variant="contained" onClick={handleAuth}>
                    Sign up
                </Button> : <Button type="button" fullWidth variant="contained" onClick={handleAuth}>
                    Sign in
                </Button>}

                {formState === 0 ? <Typography sx={{ textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <span>
                        <Link
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                            component="button"
                            type="button"
                            onClick={() => setFormState(1)}
                        >
                            Sign up
                        </Link>
                    </span>
                </Typography> : <Typography sx={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <span>
                        <Link
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                            component="button"
                            type="button"
                            onClick={() => setFormState(0)}
                        >
                            Sign in
                        </Link>
                    </span>
                </Typography>}

            </Box>
            <Divider>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Google')}
                    startIcon={<GoogleIcon />}
                >
                    Sign in with Google
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Facebook')}
                    startIcon={<FacebookIcon />}
                >
                    Sign in with Facebook
                </Button>
            </Box>
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                message={messages}
            />
        </Card>
    );
}