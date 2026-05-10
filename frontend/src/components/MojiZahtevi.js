import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMojiZahtevi } from '../services/api';

const formatVreme = (vreme) => {
    if (!vreme) return '';
    const [sati, minuti] = vreme.split(':');
    return `${sati}:${minuti}h`;
};

function MojiZahtevi() {
    const [zahtevi, setZahtevi] = useState([]);
    const [aktivniTab, setAktivniTab] = useState('cekanje');
    const [selektovaniZahtev, setSelektovaniZahtev] = useState(null);
    const navigate = useNavigate();

    const korisnikID = parseInt(localStorage.getItem('id'));

    useEffect(() => { ucitajZahteve(); }, []);

    const ucitajZahteve = async () => {
        try {
            const response = await getMojiZahtevi(korisnikID);
            setZahtevi(response.data);
        } catch (error) {
            console.error('Greška pri učitavanju zahteva:', error);
        }
    };

    const zahteviNaCekanju = zahtevi.filter(z => z.status === 'NA_CEKANJU');
    const zahteviIstorija = zahtevi.filter(z => z.status !== 'NA_CEKANJU');
    const prikazaniZahtevi = aktivniTab === 'cekanje' ? zahteviNaCekanju : zahteviIstorija;

    const getStatusBoja = (status) => {
        switch(status) {
            case 'NA_CEKANJU': return { bg: 'rgba(251,191,36,0.12)', text: '#92400E', border: '#FCD34D' };
            case 'ODOBRENO': return { bg: 'rgba(78,203,160,0.12)', text: '#065F46', border: '#4ECBA0' };
            case 'ODBIJENO': return { bg: 'rgba(244,114,182,0.12)', text: '#9D174D', border: '#F472B6' };
            default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
        }
    };

    const getStatusNaziv = (status) => {
        switch(status) {
            case 'NA_CEKANJU': return 'Na čekanju';
            case 'ODOBRENO': return 'Odobreno';
            case 'ODBIJENO': return 'Odbijeno';
            default: return status;
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .sub-tab {
                    padding: 6px 14px; border-radius: 8px; border: none;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s; font-family: inherit;
                }
                .sub-tab.active { background: rgba(78,203,160,0.12); color: #065F46; }
                .sub-tab.inactive { background: transparent; color: #94A3B8; }
                .sub-tab.inactive:hover { background: #F1F5F9; color: #475569; }
                .tabela-red { border-bottom: 1px solid #F8FAFC; transition: background 0.15s; }
                .tabela-red:hover { background: #FAFBFC; }
                .action-btn {
                    padding: 6px 12px; border-radius: 8px; border: none;
                    font-size: 12px; font-weight: 500; cursor: pointer;
                    transition: all 0.15s; font-family: inherit;
                }
                .action-btn:hover { transform: translateY(-1px); }
                .btn-detalji { background: rgba(167,139,250,0.12); color: #5B21B6; }
                .btn-detalji:hover { background: rgba(167,139,250,0.2); }
                .back-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 7px 14px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.1); color: #fff;
                    font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
                }
                .back-btn:hover { background: rgba(255,255,255,0.2); }
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(15,23,42,0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 16px; animation: fadeIn 0.2s ease-out;
                    backdrop-filter: blur(4px);
                }
                .modal {
                    background: white; border-radius: 20px; width: 100%;
                    max-width: 480px; max-height: 85vh; overflow-y: auto;
                    box-shadow: 0 24px 64px rgba(15,23,42,0.2);
                }
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
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px' }}>Moji zahtevi</h1>
                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>Pregled vaših rezervacija i zahteva</p>
                </div>

                {/* Tabovi */}
                <div style={{
                    display: 'flex', gap: '4px', marginBottom: '20px',
                    backgroundColor: '#F1F5F9', padding: '4px',
                    borderRadius: '12px', width: 'fit-content'
                }}>
                    <button className={`sub-tab ${aktivniTab === 'cekanje' ? 'active' : 'inactive'}`}
                        style={{ padding: '7px 16px' }} onClick={() => setAktivniTab('cekanje')}>
                        Na čekanju {zahteviNaCekanju.length > 0 && `(${zahteviNaCekanju.length})`}
                    </button>
                    <button className={`sub-tab ${aktivniTab === 'istorija' ? 'active' : 'inactive'}`}
                        style={{ padding: '7px 16px' }} onClick={() => setAktivniTab('istorija')}>
                        Istorija {zahteviIstorija.length > 0 && `(${zahteviIstorija.length})`}
                    </button>
                </div>

                {/* Tabela */}
                <div style={{
                    backgroundColor: '#fff', borderRadius: '16px',
                    border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)',
                    overflow: 'hidden', animation: 'fadeIn 0.3s ease-out'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                {['Naziv', 'Datum', 'Vreme', 'Sale', 'Status',
                                  ...(aktivniTab === 'istorija' ? ['Napomena'] : []),
                                  'Akcije'
                                ].map(h => (
                                    <th key={h} style={{
                                        padding: '12px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: '600',
                                        color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {prikazaniZahtevi.map(zahtev => {
                                const boja = getStatusBoja(zahtev.status);
                                return (
                                    <tr key={zahtev.zahtevID} className="tabela-red">
                                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>
                                            {zahtev.rezervacija?.naziv}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                                            {zahtev.rezervacija?.datum}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                                            {formatVreme(zahtev.rezervacija?.vremeOd)} — {formatVreme(zahtev.rezervacija?.vremeDo)}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                                            {zahtev.rezervacija?.sale?.map(s => s.nazivSale).join(', ')}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '600',
                                                backgroundColor: boja.bg, color: boja.text,
                                                border: `1px solid ${boja.border}`
                                            }}>{getStatusNaziv(zahtev.status)}</span>
                                        </td>
                                        {aktivniTab === 'istorija' && (
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', maxWidth: '200px' }}>
                                                {zahtev.napomena || '—'}
                                            </td>
                                        )}
                                        <td style={{ padding: '12px 16px' }}>
                                            <button className="action-btn btn-detalji" onClick={() => setSelektovaniZahtev(zahtev)}>
                                                Detalji
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {prikazaniZahtevi.length === 0 && (
                        <div style={{ padding: '64px', textAlign: 'center' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                backgroundColor: '#F1F5F9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 12px'
                            }}>
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
                                {aktivniTab === 'cekanje' ? 'Nemate zahteva na čekanju' : 'Nemate istorije zahteva'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal — Detalji */}
            {selektovaniZahtev && (
                <div className="modal-overlay" onClick={() => setSelektovaniZahtev(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Detalji rezervacije</h3>
                            <button onClick={() => setSelektovaniZahtev(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Naziv', value: selektovaniZahtev.rezervacija?.naziv },
                                { label: 'Opis', value: selektovaniZahtev.rezervacija?.opis || '—' },
                                { label: 'Datum', value: selektovaniZahtev.rezervacija?.datum },
                                { label: 'Vreme', value: `${formatVreme(selektovaniZahtev.rezervacija?.vremeOd)} — ${formatVreme(selektovaniZahtev.rezervacija?.vremeDo)}` },
                                { label: 'Broj prisutnih', value: selektovaniZahtev.rezervacija?.brojPrisutnih },
                                { label: 'Sale', value: selektovaniZahtev.rezervacija?.sale?.map(s => s.nazivSale).join(', ') },
                                { label: 'Datum slanja', value: selektovaniZahtev.datumSlanja ? new Date(selektovaniZahtev.datumSlanja).toLocaleString('sr-RS') : '—' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8', minWidth: '120px' }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', color: '#1E293B' }}>{item.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8', minWidth: '120px' }}>Status</span>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                    backgroundColor: getStatusBoja(selektovaniZahtev.status).bg,
                                    color: getStatusBoja(selektovaniZahtev.status).text,
                                    border: `1px solid ${getStatusBoja(selektovaniZahtev.status).border}`
                                }}>{getStatusNaziv(selektovaniZahtev.status)}</span>
                            </div>
                            {selektovaniZahtev.status !== 'NA_CEKANJU' && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8', minWidth: '120px' }}>Napomena</span>
                                    <span style={{ fontSize: '13px', color: '#1E293B' }}>{selektovaniZahtev.napomena || '—'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MojiZahtevi;