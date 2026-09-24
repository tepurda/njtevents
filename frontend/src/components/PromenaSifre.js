import React, { useState } from 'react';
import { promeniSifru } from '../services/api';

const praznaForma = { staraSifra: '', novaSifra: '', potvrdaSifre: '' };

function PromenaSifre({ onZatvori }) {
    const [forma, setForma] = useState(praznaForma);
    const [greska, setGreska] = useState('');
    const [uspeh, setUspeh] = useState(false);
    const [salje, setSalje] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGreska('');

        if (forma.novaSifra.length < 6) {
            setGreska('Šifra mora imati najmanje 6 karaktera!');
            return;
        }
        if (forma.novaSifra !== forma.potvrdaSifre) {
            setGreska('Nova šifra i potvrda se ne poklapaju!');
            return;
        }

        setSalje(true);
        try {
            await promeniSifru(forma.staraSifra, forma.novaSifra);
            setUspeh(true);
            setForma(praznaForma);
            setTimeout(onZatvori, 1500);
        } catch (error) {
            setGreska(error.response?.data?.message || 'Greška pri promeni šifre!');
        } finally {
            setSalje(false);
        }
    };

    const polja = [
        { key: 'staraSifra', label: 'Trenutna šifra', autoComplete: 'current-password' },
        { key: 'novaSifra', label: 'Nova šifra', autoComplete: 'new-password' },
        { key: 'potvrdaSifre', label: 'Potvrdite novu šifru', autoComplete: 'new-password' },
    ];

    return (
        <div className="ps-overlay" onClick={onZatvori}>
            <style>{`
                .ps-overlay {
                    position: fixed; inset: 0; background: rgba(15,23,42,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 16px; backdrop-filter: blur(4px);
                }
                .ps-modal {
                    background: #fff; border-radius: 20px; width: 100%; max-width: 420px;
                    box-shadow: 0 24px 64px rgba(15,23,42,0.2);
                }
                .ps-input {
                    width: 100%; box-sizing: border-box; padding: 10px 12px;
                    border: 1.5px solid #E2E8F0; border-radius: 10px;
                    font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s;
                }
                .ps-input:focus { border-color: #4ECBA0; }
                .ps-btn {
                    padding: 9px 16px; border-radius: 10px; border: none;
                    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
                }
                .ps-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ps-btn-primary { background: #4ECBA0; color: #fff; }
                .ps-btn-ghost { background: #F1F5F9; color: #475569; }
            `}</style>
            <div className="ps-modal" role="dialog" aria-modal="true" aria-labelledby="ps-naslov"
                onClick={(e) => e.stopPropagation()}>
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <h3 id="ps-naslov" style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                        Promena šifre
                    </h3>
                    <button onClick={onZatvori} aria-label="Zatvori"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px', lineHeight: 1 }}>×</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {polja.map(p => (
                        <label key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
                            {p.label}
                            <input type="password" className="ps-input" required
                                autoComplete={p.autoComplete}
                                value={forma[p.key]}
                                onChange={(e) => setForma({ ...forma, [p.key]: e.target.value })}/>
                        </label>
                    ))}

                    {greska && (
                        <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#B91C1C' }}>{greska}</p>
                    )}
                    {uspeh && (
                        <p role="status" style={{ margin: 0, fontSize: '13px', color: '#065F46' }}>Šifra je uspešno promenjena!</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                        <button type="button" className="ps-btn ps-btn-ghost" onClick={onZatvori}>Otkaži</button>
                        <button type="submit" className="ps-btn ps-btn-primary" disabled={salje || uspeh}>
                            {salje ? 'Čuvanje...' : 'Sačuvaj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PromenaSifre;
