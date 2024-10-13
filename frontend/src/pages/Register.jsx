import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customer_register } from '../store/reducers/authReducer';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loader, errorMessage, successMessage, userInfo } = useSelector(state => state.auth);

    const [state, setState] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setState({ name: '', email: '', password: '' });
        }
        if (errorMessage) {
            toast.error(errorMessage);
        }
        if (userInfo) {
            navigate('/');
        }
    }, [successMessage, errorMessage, userInfo, navigate]);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const register = (e) => {
        e.preventDefault();
        if (termsAccepted) {
            dispatch(customer_register(state));
        } else {
            toast.error('Please accept the terms and conditions');
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f3f4f6',
        },
        content: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
        },
        card: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            maxWidth: isMobile ? '100%' : '64rem',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
        },
        imageSection: {
            flex: 1,
            backgroundImage: 'url("/images/grocery.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: isMobile ? 'none' : 'block',
        },
        formSection: {
            flex: 1,
            padding: '2.5rem',
        },
        title: {
            textAlign: 'center',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#059473',
            marginBottom: '2rem',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
        },
        input: {
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #D1D5DB',
            fontSize: '0.875rem',
        },
        passwordContainer: {
            position: 'relative',
        },
        passwordToggle: {
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#6B7280',
        },
        button: {
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: '#059473',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
        },
        termsContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        termsText: {
            fontSize: '0.875rem',
            color: '#374151',
        },
        termsLink: {
            color: '#059473',
            cursor: 'pointer',
            textDecoration: 'underline',
        },
        loginLink: {
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: '#4B5563',
        },
        loginLinkText: {
            color: '#059473',
            textDecoration: 'none',
            fontWeight: '500',
        },
        message: {
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.875rem',
        },
    };

    return (
        <div style={styles.container}>
            <Toaster position="top-center" reverseOrder={false} />
            <div style={styles.content}>
                <div style={styles.card}>
                    {!isMobile && <div style={styles.imageSection} />}
                    <div style={styles.formSection}>
                        <h2 style={styles.title}>Create an Account</h2>
                        <form style={styles.form} onSubmit={register}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="name" style={styles.label}>Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    value={state.name}
                                    onChange={inputHandle}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="email" style={styles.label}>Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    value={state.email}
                                    onChange={inputHandle}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="password" style={styles.label}>Password</label>
                                <div style={styles.passwordContainer}>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        style={styles.input}
                                        placeholder="Enter your password"
                                        value={state.password}
                                        onChange={inputHandle}
                                    />
                                    <button
                                        type="button"
                                        style={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <div style={styles.termsContainer}>
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <label htmlFor="terms" style={styles.termsText}>
                                    I accept the <span style={styles.termsLink} onClick={() => setShowTerms(true)}>Terms and Conditions</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                style={{...styles.button, opacity: termsAccepted && !loader ? 1 : 0.5}}
                                disabled={!termsAccepted || loader}
                            >
                                {loader ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                        {errorMessage && <p style={{...styles.message, color: 'red'}}>{errorMessage}</p>}
                        {successMessage && <p style={{...styles.message, color: 'green'}}>{successMessage}</p>}
                        <p style={styles.loginLink}>
                            Already have an account? <a href="/login" style={styles.loginLinkText}>Sign in</a>
                        </p>
                    </div>
                </div>
            </div>
            {showTerms && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={() => setShowTerms(false)}
                >
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '0.5rem',
                        maxWidth: '24rem',
                        width: '100%',
                    }}
                    onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Terms and Conditions</h3>
                        <p style={{fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem'}}>
                            By using our service, you agree to...
                            {/* Add your terms and conditions here */}
                        </p>
                        <button
                            onClick={() => setShowTerms(false)}
                            style={styles.button}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;