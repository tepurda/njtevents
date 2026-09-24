import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { zatraziResetSifre } from '../services/api';
import { AuthLayout, Poruka, Polje, DugmeZaSlanje } from './AuthLayout';

function ZaboravljenaSifra() {
    const [email, setEmail] = useState('');
    const [greska, setGreska] = useState('');
    const [poslato, setPoslato] = useState('');
    const [ucitavanje, setUcitavanje] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUcitavanje(true);
        setGreska('');
        try {
            const response = await zatraziResetSifre(email.trim());
            setPoslato(response.data.message);
        } catch (error) {
            setGreska(error.response?.data?.message || 'Greška pri slanju zahteva. Pokušajte ponovo.');
        } finally {
            setUcitavanje(false);
        }
    };

    return (
        <AuthLayout naslov="Zaboravljena šifra"
            podnaslov="Unesite email adresu naloga i poslaćemo Vam link za promenu šifre.">
            {greska && <Poruka tip="greska">{greska}</Poruka>}

            {poslato ? (
                <Poruka tip="uspeh">{poslato}</Poruka>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Polje label="Email adresa" type="email" autoComplete="email" autoFocus
                        value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <DugmeZaSlanje ucitavanje={ucitavanje} tekst="Pošalji link" tekstUcitavanja="Slanje..."/>
                </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" className="auth-link">← Nazad na prijavu</Link>
            </div>
        </AuthLayout>
    );
}

export default ZaboravljenaSifra;
