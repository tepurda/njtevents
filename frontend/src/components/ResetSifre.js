import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetujSifru } from '../services/api';
import { AuthLayout, Poruka, Polje, DugmeZaSlanje } from './AuthLayout';

function ResetSifre() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [novaSifra, setNovaSifra] = useState('');
    const [potvrda, setPotvrda] = useState('');
    const [greska, setGreska] = useState('');
    const [ucitavanje, setUcitavanje] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGreska('');

        if (novaSifra.length < 6) {
            setGreska('Šifra mora imati najmanje 6 karaktera!');
            return;
        }
        if (novaSifra !== potvrda) {
            setGreska('Nova šifra i potvrda se ne poklapaju!');
            return;
        }

        setUcitavanje(true);
        try {
            await resetujSifru(token, novaSifra);
            navigate('/login?reset=ok', { replace: true });
        } catch (error) {
            setGreska(error.response?.data?.message || 'Greška pri promeni šifre. Pokušajte ponovo.');
            setUcitavanje(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout naslov="Promena šifre" podnaslov="">
                <Poruka tip="greska">Link za promenu šifre nije ispravan.</Poruka>
                <div style={{ textAlign: 'center' }}>
                    <Link to="/zaboravljena-sifra" className="auth-link">Zatražite novi link</Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout naslov="Promena šifre" podnaslov="Unesite novu šifru za Vaš nalog.">
            {greska && <Poruka tip="greska">{greska}</Poruka>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Polje label="Nova šifra" type="password" autoComplete="new-password" autoFocus minLength={6}
                    value={novaSifra} onChange={(e) => setNovaSifra(e.target.value)}/>
                <Polje label="Potvrdite novu šifru" type="password" autoComplete="new-password"
                    value={potvrda} onChange={(e) => setPotvrda(e.target.value)}/>
                <DugmeZaSlanje ucitavanje={ucitavanje} tekst="Sačuvaj novu šifru" tekstUcitavanja="Čuvanje..."/>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/zaboravljena-sifra" className="auth-link">Zatražite novi link</Link>
            </div>
        </AuthLayout>
    );
}

export default ResetSifre;
