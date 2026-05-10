import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSveSale, kreirajRezervaciju, kreirajRezervacijuAdmin, getSveRezervacije } from '../services/api';

const SATI_LIST = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTI_LIST = ['00', '15', '30', '45'];

const formatVreme = (vreme) => {
    if (!vreme) return '';
    const [sati, minuti] = vreme.split(':');
    return `${sati}:${minuti}h`;
};

function RezervacijaForma() {
    const [naziv, setNaziv] = useState('');
    const [opis, setOpis] = useState('');
    const [datum, setDatum] = useState('');
    const [vremeOdSat, setVremeOdSat] = useState('');
    const [vremeOdMin, setVremeOdMin] = useState('');
    const [vremeDoSat, setVremeDoSat] = useState('');
    const [vremeDoMin, setVremeDoMin] = useState('');
    const [brojPrisutnih, setBrojPrisutnih] = useState('');
    const [sale, setSale] = useState([]);
    const [selektovaneSale, setSelektovaneSale] = useState([]);
    const [greska, setGreska] = useState('');
    const [uspeh, setUspeh] = useState('');
    const [ucitavanje, setUcitavanje] = useState(false);
    const [zahteviNaCekanju, setZahteviNaCekanju] = useState([]);

    const navigate = useNavigate();
    const rola = localStorage.getItem('rola');
    const id = localStorage.getItem('id');

    useEffect(() => { ucitajSale(); }, []);

    useEffect(() => {
        if (datum) { ucitajZahteveZaDatum(datum); }
        else { setZahteviNaCekanju([]); }
    }, [datum]);

    const ucitajSale = async () => {
        try {
            const response = await getSveSale();
            setSale(response.data);
        } catch (error) {
            console.error('Greška pri učitavanju sala:', error);
        }
    };

    const ucitajZahteveZaDatum = async (izabraniDatum) => {
        try {
            const response = await getSveRezervacije();
            const naCekanju = response.data.filter(r =>
                r.datum === izabraniDatum && r.statusZahteva === 'NA_CEKANJU'
            );
            setZahteviNaCekanju(naCekanju);
        } catch (error) {
            console.error('Greška pri učitavanju zahteva:', error);
        }
    };

    const handleSalaToggle = (salaID) => {
        if (selektovaneSale.includes(salaID)) {
            setSelektovaneSale(selektovaneSale.filter(id => id !== salaID));
        } else {
            setSelektovaneSale([...selektovaneSale, salaID]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGreska('');
        setUspeh('');

        if (selektovaneSale.length === 0) {
            setGreska('Morate izabrati barem jednu salu!');
            return;
        }

        setUcitavanje(true);
        try {
            const rezervacija = {
                naziv, opis, datum,
                vremeOd: `${vremeOdSat}:${vremeOdMin}:00`,
                vremeDo: `${vremeDoSat}:${vremeDoMin}:00`,
                brojPrisutnih: parseInt(brojPrisutnih),
                korisnik: rola === 'ROLE_ADMINISTRATOR' ? null : { korisnikID: parseInt(id) },
                administrator: rola === 'ROLE_ADMINISTRATOR' ? { administratorID: parseInt(id) } : null,
                sale: selektovaneSale.map(id => ({ salaID: id }))
            };

            if (rola === 'ROLE_ADMINISTRATOR') {
                await kreirajRezervacijuAdmin(rezervacija);
            } else {
                await kreirajRezervaciju(rezervacija);
            }

            setUspeh(rola === 'ROLE_ADMINISTRATOR'
                ? 'Rezervacija uspešno kreirana i automatski odobrena!'
                : 'Rezervacija uspešno kreirana! Čeka se odobrenje administratora.'
            );

            setNaziv(''); setOpis(''); setDatum('');
            setVremeOdSat(''); setVremeOdMin('');
            setVremeDoSat(''); setVremeDoMin('');
            setBrojPrisutnih(''); setSelektovaneSale([]);
            setZahteviNaCekanju([]);
        } catch (error) {
            setGreska(error.response?.data?.message || 'Greška pri kreiranju rezervacije!');
        } finally {
            setUcitavanje(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .forma-card { animation: slideUp 0.4s ease-out; }
                .input-field {
                    width: 100%; padding: 10px 14px; border-radius: 10px;
                    border: 1.5px solid #E2E8F0; background: #F8FAFC;
                    color: #1E293B; font-size: 14px; outline: none;
                    transition: all 0.2s; box-sizing: border-box; font-family: inherit;
                }
                .input-field:focus { border-color: #4ECBA0; box-shadow: 0 0 0 3px rgba(78,203,160,0.1); background: #fff; }
                .input-field:disabled { opacity: 0.5; cursor: not-allowed; }
                .textarea-field {
                    width: 100%; padding: 10px 14px; border-radius: 10px;
                    border: 1.5px solid #E2E8F0; background: #F8FAFC;
                    color: #1E293B; font-size: 14px; outline: none;
                    transition: all 0.2s; box-sizing: border-box;
                    resize: vertical; font-family: inherit; min-height: 80px;
                }
                .textarea-field:focus { border-color: #4ECBA0; box-shadow: 0 0 0 3px rgba(78,203,160,0.1); background: #fff; }
                .sala-kartica {
                    padding: 12px 14px; border-radius: 12px;
                    border: 1.5px solid #E2E8F0; cursor: pointer;
                    transition: all 0.2s; background: #F8FAFC; text-align: left;
                }
                .sala-kartica:hover {
                    border-color: #4ECBA0; background: rgba(78,203,160,0.04);
                    transform: translateY(-1px); box-shadow: 0 4px 12px rgba(78,203,160,0.1);
                }
                .sala-kartica.selected { border-color: #4ECBA0; background: rgba(78,203,160,0.08); }
                .btn-submit {
                    width: 100%; padding: 12px; border-radius: 12px; border: none;
                    background: #1E293B; color: white; font-size: 15px; font-weight: 500;
                    cursor: pointer; transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                    gap: 8px; font-family: inherit;
                }
                .btn-submit:hover:not(:disabled) {
                    background: #334155; transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(30,41,59,0.2);
                }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white; border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                .back-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 7px 14px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.1); color: #fff;
                    font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
                }
                .back-btn:hover { background: rgba(255,255,255,0.2); }
                .zahtev-red:hover { background: #FAFBFC; }
            `}</style>

            {/* Navbar */}
            <div style={{
                backgroundColor: '#1E293B', padding: '0 24px', height: '56px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 2px 12px rgba(30,41,59,0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #4ECBA0, #A78BFA)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/>
                            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
                            <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
                            <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/>
                        </svg>
                    </div>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>NJT Events</span>
                </div>
                <button className="back-btn" onClick={() => navigate('/gant')}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Nazad
                </button>
            </div>

            {/* Sadržaj */}
            <div style={{ padding: '32px 24px', maxWidth: '680px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px' }}>
                        Nova rezervacija
                    </h1>
                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
                        {rola === 'ROLE_ADMINISTRATOR'
                            ? 'Rezervacija će biti automatski odobrena'
                            : 'Zahtev će biti poslat na odobrenje administratoru'}
                    </p>
                </div>

                {/* Forma kartica */}
                <div className="forma-card" style={{
                    backgroundColor: '#fff', borderRadius: '20px', padding: '32px',
                    boxShadow: '0 4px 24px rgba(30,41,59,0.06)', border: '1px solid #F1F5F9'
                }}>
                    {/* Gradient linija */}
                    <div style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, #4ECBA0, #A78BFA, #F472B6)',
                        borderRadius: '2px', marginBottom: '28px'
                    }}/>

                    {/* Greška */}
                    {greska && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                            padding: '12px 14px', borderRadius: '10px',
                            backgroundColor: '#FFF1F2', border: '1px solid #FFD1D8',
                            marginBottom: '20px', animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F43F5E" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span style={{ fontSize: '13px', color: '#E11D48' }}>{greska}</span>
                        </div>
                    )}

                    {/* Uspeh */}
                    {uspeh && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                            padding: '12px 14px', borderRadius: '10px',
                            backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                            marginBottom: '20px', animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span style={{ fontSize: '13px', color: '#15803D' }}>{uspeh}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Naziv */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                Naziv <span style={{ color: '#F43F5E' }}>*</span>
                            </label>
                            <input type="text" className="input-field" value={naziv}
                                onChange={(e) => setNaziv(e.target.value)} required/>
                        </div>

                        {/* Opis */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                Opis <span style={{ color: '#94A3B8', fontWeight: '400' }}>(opciono)</span>
                            </label>
                            <textarea className="textarea-field" value={opis}
                                onChange={(e) => setOpis(e.target.value)} rows={3}/>
                        </div>

                        {/* Datum i broj prisutnih */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                    Datum <span style={{ color: '#F43F5E' }}>*</span>
                                </label>
                                <input type="date" className="input-field" value={datum}
                                    onChange={(e) => setDatum(e.target.value)} required/>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                    Broj prisutnih <span style={{ color: '#F43F5E' }}>*</span>
                                </label>
                                <input type="number" className="input-field" value={brojPrisutnih}
                                    onChange={(e) => setBrojPrisutnih(e.target.value)} min={1} required/>
                            </div>
                        </div>

                        {/* Zahtevi na čekanju za izabrani dan */}
                        {datum && zahteviNaCekanju.length > 0 && (
                            <div style={{
                                borderRadius: '12px', border: '1px solid #FCD34D',
                                backgroundColor: '#FFFBEB', overflow: 'hidden',
                                animation: 'fadeIn 0.3s ease-out'
                            }}>
                                {/* Header */}
                                <div style={{
                                    padding: '10px 14px',
                                    borderBottom: '1px solid #FCD34D',
                                    display: 'flex', alignItems: 'center', gap: '7px'
                                }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#92400E" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#92400E' }}>
                                        {zahteviNaCekanju.length} {zahteviNaCekanju.length === 1 ? 'zahtev čeka odobrenje' : 'zahteva čekaju odobrenje'} za ovaj dan
                                    </span>
                                </div>

                                {/* Lista zahteva */}
                                <div>
                                    {zahteviNaCekanju.map((r, index) => (
                                        <div
                                            key={r.rezervacijaID}
                                            className="zahtev-red"
                                            style={{
                                                padding: '10px 14px',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottom: index < zahteviNaCekanju.length - 1
                                                    ? '1px solid rgba(252,211,77,0.4)' : 'none',
                                                transition: 'background 0.15s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>
                                                    {r.naziv}
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                                    {r.sale?.map(s => s.nazivSale).join(', ')}
                                                </span>
                                            </div>
                                            <span style={{
                                                fontSize: '12px', fontWeight: '500',
                                                color: '#92400E', whiteSpace: 'nowrap', marginLeft: '12px'
                                            }}>
                                                {formatVreme(r.vremeOd)} — {formatVreme(r.vremeDo)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vreme */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* Vreme od */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                    Vreme od <span style={{ color: '#F43F5E' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select className="input-field" value={vremeOdSat}
                                        onChange={(e) => { setVremeOdSat(e.target.value); setVremeOdMin(''); setVremeDoSat(''); setVremeDoMin(''); }}
                                        required>
                                        <option value="">sat</option>
                                        {SATI_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <span style={{ color: '#94A3B8', fontWeight: '600', flexShrink: 0 }}>:</span>
                                    <select className="input-field" value={vremeOdMin}
                                        onChange={(e) => { setVremeOdMin(e.target.value); setVremeDoSat(''); setVremeDoMin(''); }}
                                        required disabled={!vremeOdSat}>
                                        <option value="">min</option>
                                        {MINUTI_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Vreme do */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                    Vreme do <span style={{ color: '#F43F5E' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select className="input-field" value={vremeDoSat}
                                        onChange={(e) => { setVremeDoSat(e.target.value); setVremeDoMin(''); }}
                                        required disabled={!vremeOdSat || !vremeOdMin}>
                                        <option value="">sat</option>
                                        {SATI_LIST.filter(s => s >= vremeOdSat).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <span style={{ color: '#94A3B8', fontWeight: '600', flexShrink: 0 }}>:</span>
                                    <select className="input-field" value={vremeDoMin}
                                        onChange={(e) => setVremeDoMin(e.target.value)}
                                        required disabled={!vremeDoSat}>
                                        <option value="">min</option>
                                        {MINUTI_LIST.filter(m =>
                                            vremeDoSat > vremeOdSat ? true : m > vremeOdMin
                                        ).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Sale */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '10px' }}>
                                Izaberite sale <span style={{ color: '#F43F5E' }}>*</span>
                                {selektovaneSale.length > 0 && (
                                    <span style={{
                                        marginLeft: '8px', padding: '2px 8px', borderRadius: '20px',
                                        backgroundColor: 'rgba(78,203,160,0.12)', color: '#0D7A5F',
                                        fontSize: '11px', fontWeight: '600'
                                    }}>
                                        {selektovaneSale.length} izabrano
                                    </span>
                                )}
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: '10px'
                            }}>
                                {sale.map(sala => {
                                    const izabrana = selektovaneSale.includes(sala.salaID);
                                    return (
                                        <button key={sala.salaID} type="button"
                                            className={`sala-kartica ${izabrana ? 'selected' : ''}`}
                                            onClick={() => handleSalaToggle(sala.salaID)}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                                                    {sala.nazivSale}
                                                </span>
                                                {izabrana && (
                                                    <div style={{
                                                        width: '18px', height: '18px', borderRadius: '50%',
                                                        backgroundColor: '#4ECBA0',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                    }}>
                                                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            {sala.tipSale && (
                                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                                    {sala.tipSale.nazivTipa} · {sala.tipSale.kapacitet} mesta
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-submit" disabled={ucitavanje} style={{ marginTop: '4px' }}>
                            {ucitavanje ? (
                                <><div className="spinner"/>Slanje...</>
                            ) : (
                                <>
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    {rola === 'ROLE_ADMINISTRATOR' ? 'Kreiraj rezervaciju' : 'Pošalji zahtev'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RezervacijaForma;