import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { AuthLayout, Poruka, Polje, DugmeZaSlanje } from './AuthLayout';

function Login() {
    const [email, setEmail] = useState('');
    const [sifra, setSifra] = useState('');
    const [greska, setGreska] = useState('');
    const [ucitavanje, setUcitavanje] = useState(false);
    const navigate = useNavigate();

    const parametri = new URLSearchParams(window.location.search);
    const sessijaIstekla = parametri.get('istekla');
    const sifraResetovana = parametri.get('reset');

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
        <AuthLayout naslov="Dobrodošli" podnaslov="Prijavite se da nastavite">
            {sessijaIstekla && <Poruka tip="upozorenje">Sesija je istekla. Molimo prijavite se ponovo.</Poruka>}
            {sifraResetovana && <Poruka tip="uspeh">Šifra je promenjena. Prijavite se novom šifrom.</Poruka>}
            {greska && <Poruka tip="greska">{greska}</Poruka>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Polje label="Email adresa" type="email" autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}/>
                <div>
                    <Polje label="Šifra" type="password" autoComplete="current-password"
                        value={sifra} onChange={(e) => setSifra(e.target.value)}/>
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                        <Link to="/zaboravljena-sifra" className="auth-link">Zaboravili ste šifru?</Link>
                    </div>
                </div>
                <DugmeZaSlanje ucitavanje={ucitavanje} tekst="Prijavi se" tekstUcitavanja="Prijavljivanje..."/>
            </form>
        </AuthLayout>
    );
}

export default Login;
