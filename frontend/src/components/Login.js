import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [sifra, setSifra] = useState('');
    const [greska, setGreska] = useState('');
    const [ucitavanje, setUcitavanje] = useState(false);
    const navigate = useNavigate();

    const sessijaIstekla = new URLSearchParams(window.location.search).get('istekla');

    const handleLogin = async (e) => {
        e.preventDefault();
        setUcitavanje(true);
        setGreska('');
        try {
            const response = await login(email, sifra);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('rola', response.data.rola);
            localStorage.setItem('ime', response.data.ime);
            localStorage.setItem('id', response.data.id);
            navigate('/gant');
        } catch (error) {
            setGreska('Pogrešan email ili šifra!');
        } finally {
            setUcitavanje(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '16px'
        }}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .login-card { animation: slideUp 0.4s ease-out; }
                .input-field {
                    width: 100%; padding: 11px 16px; border-radius: 12px;
                    border: 1.5px solid #E2E8F0; background: #F8FAFC;
                    color: #1E293B; font-size: 14px; outline: none;
                    transition: all 0.2s; box-sizing: border-box;
                }
                .input-field:focus {
                    border-color: #4ECBA0;
                    box-shadow: 0 0 0 3px rgba(78, 203, 160, 0.12);
                    background: #fff;
                }
                .input-field::placeholder { color: #CBD5E1; }
                .btn-login {
                    width: 100%; padding: 12px; border-radius: 12px;
                    border: none; background: #1E293B; color: white;
                    font-size: 15px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s; display: flex; align-items: center;
                    justify-content: center; gap: 8px; margin-top: 8px;
                }
                .btn-login:hover:not(:disabled) {
                    background: #334155; transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(30, 41, 59, 0.2);
                }
                .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white; border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                .blob1 {
                    position: fixed; top: -100px; right: -100px;
                    width: 350px; height: 350px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(78,203,160,0.12), transparent 70%);
                    pointer-events: none;
                }
                .blob2 {
                    position: fixed; bottom: -100px; left: -100px;
                    width: 350px; height: 350px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(244,114,182,0.1), transparent 70%);
                    pointer-events: none;
                }
                .blob3 {
                    position: fixed; top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px; height: 500px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(167,139,250,0.05), transparent 70%);
                    pointer-events: none;
                }
            `}</style>

            <div className="blob1"/>
            <div className="blob2"/>
            <div className="blob3"/>

            <div className="login-card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>

                {/* Naslov */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px' }}>
                        NJT Events
                    </h1>
                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
                        Sistem za rezervaciju sala
                    </p>
                </div>

                {/* Kartica */}
                <div style={{
                    backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px',
                    boxShadow: '0 4px 32px rgba(30, 41, 59, 0.08), 0 1px 4px rgba(30,41,59,0.04)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Gradient linija */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, #4ECBA0, #A78BFA, #F472B6, #FBBF24)',
                        borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
                    }}/>

                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', margin: '8px 0 4px' }}>
                        Dobrodošli
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 24px' }}>
                        Prijavite se da nastavite
                    </p>

                    {/* Sesija istekla */}
                    {sessijaIstekla && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 14px', borderRadius: '10px',
                            backgroundColor: '#FFFBEB', border: '1px solid #FCD34D',
                            marginBottom: '20px', animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#92400E" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span style={{ fontSize: '13px', color: '#92400E' }}>
                                Sesija je istekla. Molimo prijavite se ponovo.
                            </span>
                        </div>
                    )}

                    {/* Greška */}
                    {greska && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 14px', borderRadius: '10px',
                            backgroundColor: '#FFF1F2', border: '1px solid #FFD1D8',
                            marginBottom: '20px', animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F43F5E" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span style={{ fontSize: '13px', color: '#E11D48' }}>{greska}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block', fontSize: '13px',
                                fontWeight: '500', color: '#475569', marginBottom: '6px'
                            }}>
                                Email adresa
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block', fontSize: '13px',
                                fontWeight: '500', color: '#475569', marginBottom: '6px'
                            }}>
                                Šifra
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                value={sifra}
                                onChange={(e) => setSifra(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-login" disabled={ucitavanje}>
                            {ucitavanje ? (
                                <>
                                    <div className="spinner"/>
                                    Prijavljivanje...
                                </>
                            ) : 'Prijavi se'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;