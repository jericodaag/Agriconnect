import React, { useState } from 'react';

const Register = () => {
    const [state, setState] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const register = (e) => {
        e.preventDefault();
        if (termsAccepted) {
            console.log('Registration data:', state);
            // Here you would handle the registration logic
        } else {
            console.log('Please accept the terms and conditions');
        }
    };

    return (
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6'}}>
            <div style={{flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem'}}>
                <div style={{maxWidth: '32rem', width: '100%', backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}>
                    <h2 style={{textAlign: 'center', fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem'}}>Create an Account</h2>
                    <form onSubmit={register} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <div>
                            <label htmlFor="name" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', fontSize: '0.875rem'}}
                                placeholder="Enter your full name"
                                value={state.name}
                                onChange={inputHandle}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', fontSize: '0.875rem'}}
                                placeholder="Enter your email"
                                value={state.email}
                                onChange={inputHandle}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', fontSize: '0.875rem'}}
                                placeholder="Enter your password"
                                value={state.password}
                                onChange={inputHandle}
                            />
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                style={{marginRight: '0.5rem'}}
                            />
                            <label htmlFor="terms" style={{fontSize: '0.875rem', color: '#374151'}}>
                                I accept the <button type="button" onClick={() => setShowTerms(true)} style={{color: '#059473', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>Terms and Conditions</button>
                            </label>
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem',
                                backgroundColor: termsAccepted ? '#059473' : '#9CA3AF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: termsAccepted ? 'pointer' : 'not-allowed'
                            }}
                            disabled={!termsAccepted}
                        >
                            Register
                        </button>
                    </form>
                    <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#4B5563'}}>
                        Already have an account? <a href="/login" style={{color: '#059473', textDecoration: 'none', fontWeight: '500'}}>Sign in</a>
                    </p>
                    <div style={{marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem'}}>
                        <hr style={{border: 'none', borderTop: '1px solid #E5E7EB'}} />
                        <span style={{color: '#6B7280', fontSize: '0.875rem'}}>Or</span>
                        <hr style={{border: 'none', borderTop: '1px solid #E5E7EB'}} />
                    </div>
                    <div style={{marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <a href="http://localhost:3001/login" target="_blank" rel="noopener noreferrer" style={{display: 'flex', justifyContent: 'center', padding: '0.5rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500'}}>
                            Login as a Seller
                        </a>
                        <a href="http://localhost:3001/register" target="_blank" rel="noopener noreferrer" style={{display: 'flex', justifyContent: 'center', padding: '0.5rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500'}}>
                            Register as a Seller
                        </a>
                    </div>
                </div>
            </div>
            {showTerms && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setShowTerms(false)}>
                    <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', maxWidth: '24rem', width: '100%'}} onClick={e => e.stopPropagation()}>
                        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Terms and Conditions</h3>
                        <p style={{fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem'}}>
                            By using our service, you agree to...
                            {/* Add your terms and conditions here */}
                        </p>
                        <button
                            onClick={() => setShowTerms(false)}
                            style={{width: '100%', padding: '0.5rem 1rem', backgroundColor: '#059473', color: 'white', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer'}}
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