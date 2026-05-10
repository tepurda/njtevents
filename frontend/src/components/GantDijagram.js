import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSveRezervacije, getSveSale, getSviZahtevi, getMojiZahtevi, obrisiRezervaciju } from '../services/api';
import { useNavigate } from 'react-router-dom';

function vremeUMinute(vreme) {
    const [sati, minuti] = vreme.split(':').map(Number);
    return sati * 60 + minuti;
}

const formatVreme = (vreme) => {
    if (!vreme) return '';
    const [sati, minuti] = vreme.split(':');
    return `${sati}:${minuti}h`;
};

const formatDatumPrikaz = (datum) => {
    if (!datum) return '—';
    const [godina, mesec, dan] = datum.split('-');
    const meseci = ['januar', 'februar', 'mart', 'april', 'maj', 'jun',
                    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
    return `${dan}. ${meseci[parseInt(mesec) - 1]} ${godina}.`;
};

const BOJE = [
    { bg: 'rgba(78,203,160,0.15)', border: '#4ECBA0', text: '#0D7A5F' },
    { bg: 'rgba(167,139,250,0.15)', border: '#A78BFA', text: '#5B21B6' },
    { bg: 'rgba(244,114,182,0.15)', border: '#F472B6', text: '#BE185D' },
    { bg: 'rgba(251,191,36,0.15)', border: '#FBBF24', text: '#92400E' },
    { bg: 'rgba(96,165,250,0.15)', border: '#60A5FA', text: '#1D4ED8' },
    { bg: 'rgba(52,211,153,0.15)', border: '#34D399', text: '#065F46' },
];

const SALA_SIRINA = 160;
const SATI = Array.from({ length: 24 }, (_, i) => i);
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.5;

function GantDijagram() {
    const [rezervacije, setRezervacije] = useState([]);
    const [sale, setSale] = useState([]);
    const [zahteviNaCekanju, setZahteviNaCekanju] = useState(0);
    const [mojiZahteviNaCekanju, setMojiZahteviNaCekanju] = useState(0);
    const [selektovanDatum, setSelektovanDatum] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [zoom, setZoom] = useState(1);
    const [baznaSiminaMinuta, setBaznaSiminaMinuta] = useState(1);
    const [selektovanaRezervacija, setSelektovanaRezervacija] = useState(null);

    const scrollRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const ime = localStorage.getItem('ime');
    const rola = localStorage.getItem('rola');
    const danas = new Date().toISOString().split('T')[0];

    const SIRINA_MINUTA = baznaSiminaMinuta * zoom;
    const UKUPNA_SIRINA = 24 * 60 * SIRINA_MINUTA;

    const izracunajBaznu = useCallback(() => {
        if (containerRef.current) {
            const dostupnasirina = containerRef.current.offsetWidth - SALA_SIRINA - 48;
            const bazna = dostupnasirina / (24 * 60);
            setBaznaSiminaMinuta(bazna);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { izracunajBaznu(); }, 50);
        window.addEventListener('resize', izracunajBaznu);
        return () => { clearTimeout(timer); window.removeEventListener('resize', izracunajBaznu); };
    }, [izracunajBaznu]);

    const handleWheel = useCallback((e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom(prev => Math.min(MAX_ZOOM, Math.max(1, parseFloat((prev + delta).toFixed(1)))));
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
            return () => el.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    useEffect(() => { ucitajPodatke(); }, [selektovanDatum]);

    const ucitajPodatke = async () => {
        try {
            const [rezervacijeRes, saleRes] = await Promise.all([
                getSveRezervacije(), getSveSale()
            ]);
            setSale(saleRes.data);
            const filtrirane = rezervacijeRes.data.filter(r =>
                r.statusZahteva === 'ODOBRENO' && r.datum === selektovanDatum
            );
            setRezervacije(filtrirane);

            if (rola === 'ROLE_ADMINISTRATOR') {
                const zahteviRes = await getSviZahtevi();
                setZahteviNaCekanju(zahteviRes.data.filter(z => z.status === 'NA_CEKANJU').length);
            }
            if (rola === 'ROLE_KORISNIK') {
                const id = parseInt(localStorage.getItem('id'));
                const zahteviRes = await getMojiZahtevi(id);
                setMojiZahteviNaCekanju(zahteviRes.data.filter(z => z.status === 'NA_CEKANJU').length);
            }
        } catch (error) {
            console.error('Greška pri učitavanju:', error);
        }
    };

    const handleOdjava = () => { localStorage.clear(); navigate('/login'); };

    const promeniDatum = (smer) => {
        const datum = new Date(selektovanDatum);
        datum.setDate(datum.getDate() + smer);
        setSelektovanDatum(datum.toISOString().split('T')[0]);
    };

    const getRezervacijeZaSalu = (salaID) =>
        rezervacije.filter(r => r.sale && r.sale.some(s => s.salaID === salaID));

    const formatDatum = (datum) => new Date(datum).toLocaleDateString('sr-RS', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const jeToday = selektovanDatum === danas;

    const trenutnoVremePx = () => {
        const sada = new Date();
        return (sada.getHours() * 60 + sada.getMinutes()) * SIRINA_MINUTA;
    };

    const izracunajBlok = (vremeOd, vremeDo) => {
        const odMin = vremeUMinute(vremeOd);
        const doMin = vremeUMinute(vremeDo);
        return { levo: odMin * SIRINA_MINUTA, sirina: (doMin - odMin) * SIRINA_MINUTA };
    };

    const handleObrisiRezervaciju = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovu rezervaciju?')) {
            try {
                await obrisiRezervaciju(id);
                setSelektovanaRezervacija(null);
                ucitajPodatke();
            } catch (error) {
                console.error('Greška pri brisanju:', error);
            }
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
                .nav-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 7px 14px; border-radius: 10px; border: none;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s; font-family: inherit;
                }
                .nav-btn:hover { transform: translateY(-1px); }
                .nav-btn-primary { background: #4ECBA0; color: #fff; }
                .nav-btn-primary:hover { background: #3AB88D; box-shadow: 0 4px 12px rgba(78,203,160,0.3); }
                .nav-btn-ghost { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2) !important; }
                .nav-btn-ghost:hover { background: rgba(255,255,255,0.2); }
                .nav-btn-admin { background: rgba(251,191,36,0.2); color: #FBBF24; border: 1px solid rgba(251,191,36,0.3) !important; }
                .nav-btn-admin:hover { background: rgba(251,191,36,0.3); }
                .ctrl-btn {
                    width: 32px; height: 32px; border-radius: 8px;
                    border: 1.5px solid #E2E8F0; background: #fff;
                    color: #475569; cursor: pointer; transition: all 0.15s;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px; font-weight: 600; font-family: inherit; line-height: 1;
                }
                .ctrl-btn:hover { border-color: #4ECBA0; color: #4ECBA0; background: rgba(78,203,160,0.05); }
                .ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .zoom-label {
                    padding: 4px 10px; border-radius: 6px;
                    background: #F1F5F9; font-size: 12px;
                    font-weight: 600; color: #475569;
                    min-width: 44px; text-align: center;
                }
                .today-btn {
                    padding: 5px 12px; border-radius: 8px;
                    border: 1.5px solid #E2E8F0; background: #fff;
                    color: #475569; font-size: 12px; font-weight: 500;
                    cursor: pointer; transition: all 0.15s; font-family: inherit;
                }
                .today-btn:hover { border-color: #4ECBA0; color: #4ECBA0; }
                .today-btn.active { border-color: #4ECBA0; background: rgba(78,203,160,0.08); color: #0D7A5F; }
                .date-input {
                    padding: 5px 10px; border-radius: 8px;
                    border: 1.5px solid #E2E8F0; background: #fff;
                    color: #475569; font-size: 12px; outline: none;
                    transition: border-color 0.2s; font-family: inherit;
                }
                .date-input:focus { border-color: #4ECBA0; }
                .badge {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 18px; height: 18px; border-radius: 50%;
                    font-size: 10px; font-weight: 700; margin-left: 4px;
                }
                .gantt-outer { overflow: auto; flex: 1; }
                .gantt-outer::-webkit-scrollbar { height: 6px; width: 6px; }
                .gantt-outer::-webkit-scrollbar-track { background: #F1F5F9; border-radius: 3px; }
                .gantt-outer::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
                .gantt-outer::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                .rez-blok {
                    position: absolute; top: 6px; bottom: 6px;
                    border-radius: 8px; font-size: 11px; font-weight: 500;
                    padding: 0 8px; overflow: hidden; white-space: nowrap;
                    text-overflow: ellipsis; cursor: pointer;
                    display: flex; align-items: center;
                    transition: box-shadow 0.15s, transform 0.15s;
                    border-width: 1px; border-style: solid; box-sizing: border-box;
                }
                .rez-blok:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; }
            `}</style>

            {/* Navbar */}
            <div style={{
                backgroundColor: '#1E293B', padding: '0 24px', height: '56px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, boxShadow: '0 2px 12px rgba(30,41,59,0.15)',
                animation: 'fadeIn 0.3s ease-out'
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '5px 10px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginRight: '4px'
                    }}>
                        <div style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4ECBA0, #A78BFA)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: '700', color: '#fff'
                        }}>
                            {ime ? ime.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {ime}
                    </div>

                    <button className="nav-btn nav-btn-primary" onClick={() => navigate('/rezervacija')}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                        </svg>
                        Rezerviši
                    </button>

                    {rola === 'ROLE_KORISNIK' && (
                        <button className="nav-btn nav-btn-ghost" onClick={() => navigate('/moji-zahtevi')}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            Moji zahtevi
                            {mojiZahteviNaCekanju > 0 && (
                                <span className="badge" style={{ background: '#FBBF24', color: '#1E293B' }}>
                                    {mojiZahteviNaCekanju}
                                </span>
                            )}
                        </button>
                    )}

                    {rola === 'ROLE_ADMINISTRATOR' && (
                        <button className="nav-btn nav-btn-admin" onClick={() => navigate('/admin')}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Admin panel
                            {zahteviNaCekanju > 0 && (
                                <span className="badge" style={{ background: '#F472B6', color: '#fff' }}>
                                    {zahteviNaCekanju}
                                </span>
                            )}
                        </button>
                    )}

                    <button className="nav-btn nav-btn-ghost" onClick={handleOdjava}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Odjava
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{
                backgroundColor: '#fff', borderBottom: '1px solid #F1F5F9',
                padding: '10px 24px', display: 'flex', alignItems: 'center',
                gap: '10px', flexShrink: 0, boxShadow: '0 1px 4px rgba(30,41,59,0.04)'
            }}>
                <button className="ctrl-btn" style={{ fontSize: '16px' }} onClick={() => promeniDatum(-1)}>‹</button>
                <button className="ctrl-btn" style={{ fontSize: '16px' }} onClick={() => promeniDatum(1)}>›</button>

                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', minWidth: '220px' }}>
                    {formatDatum(selektovanDatum)}
                </span>

                <button
                    className={`today-btn ${jeToday ? 'active' : ''}`}
                    onClick={() => setSelektovanDatum(danas)}
                >
                    Danas
                </button>

                <input
                    type="date"
                    className="date-input"
                    value={selektovanDatum}
                    onChange={(e) => setSelektovanDatum(e.target.value)}
                />

                <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0', margin: '0 2px' }}/>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Zum</span>
                    <button className="ctrl-btn"
                        onClick={() => setZoom(prev => Math.max(1, parseFloat((prev - ZOOM_STEP).toFixed(1))))}
                        disabled={zoom <= 1}>−</button>
                    <span className="zoom-label">{zoom.toFixed(1)}x</span>
                    <button className="ctrl-btn"
                        onClick={() => setZoom(prev => Math.min(MAX_ZOOM, parseFloat((prev + ZOOM_STEP).toFixed(1))))}
                        disabled={zoom >= MAX_ZOOM}>+</button>
                    <button className="today-btn" onClick={() => setZoom(1)}>Reset</button>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#CBD5E1' }}>scroll za zum</span>
                    <div style={{ width: '1px', height: '16px', backgroundColor: '#E2E8F0' }}/>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ECBA0' }}/>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{rezervacije.length} rezervacija</span>
                </div>
            </div>

            {/* Gantt */}
            <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', padding: '16px 24px' }}>
                <div style={{
                    backgroundColor: '#fff', borderRadius: '16px',
                    border: '1px solid #F1F5F9', overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(30,41,59,0.05)',
                    height: '100%', display: 'flex', flexDirection: 'column'
                }}>
                    <div ref={scrollRef} className="gantt-outer">
                        <div style={{ width: `${SALA_SIRINA + UKUPNA_SIRINA}px`, minWidth: '100%' }}>

                            {/* Zaglavlje */}
                            <div style={{
                                display: 'flex', position: 'sticky', top: 0,
                                zIndex: 20, backgroundColor: '#F8FAFC',
                                borderBottom: '1px solid #F1F5F9'
                            }}>
                                <div style={{
                                    width: `${SALA_SIRINA}px`, minWidth: `${SALA_SIRINA}px`,
                                    position: 'sticky', left: 0, zIndex: 30,
                                    backgroundColor: '#F8FAFC', padding: '12px 16px',
                                    fontSize: '11px', fontWeight: '600',
                                    color: '#64748B', letterSpacing: '0.05em',
                                    textTransform: 'uppercase', borderRight: '1px solid #F1F5F9'
                                }}>
                                    Sala
                                </div>
                                <div style={{ position: 'relative', height: '40px', flex: 1, overflow: 'hidden' }}>
                                    {SATI.map(sat => (
                                        <div key={sat} style={{
                                            position: 'absolute',
                                            left: `${sat * 60 * SIRINA_MINUTA}px`,
                                            width: `${60 * SIRINA_MINUTA}px`,
                                            height: '100%',
                                            borderLeft: '1px solid #F1F5F9',
                                            padding: '12px 4px',
                                            fontSize: '11px', fontWeight: '500',
                                            color: '#64748B',
                                            overflow: 'hidden', whiteSpace: 'nowrap'
                                        }}>
                                            {`${String(sat).padStart(2, '0')}:00h`}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Redovi */}
                            {sale.map((sala, index) => {
                                const salaRezervacije = getRezervacijeZaSalu(sala.salaID);
                                return (
                                    <div key={sala.salaID} style={{
                                        display: 'flex',
                                        borderBottom: index < sale.length - 1 ? '1px solid #F8FAFC' : 'none'
                                    }}>
                                        <div style={{
                                            width: `${SALA_SIRINA}px`, minWidth: `${SALA_SIRINA}px`,
                                            position: 'sticky', left: 0, zIndex: 10,
                                            backgroundColor: '#fff', padding: '8px 16px',
                                            borderRight: '1px solid #F1F5F9',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                        }}>
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>
                                                {sala.nazivSale}
                                            </div>
                                            {sala.tipSale && (
                                                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>
                                                    {sala.tipSale.kapacitet} mesta
                                                </div>
                                            )}
                                        </div>

                                        <div style={{
                                            flex: 1, height: '52px',
                                            position: 'relative', backgroundColor: '#fff',
                                            width: `${UKUPNA_SIRINA}px`
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: 0, bottom: 0,
                                                left: `${8 * 60 * SIRINA_MINUTA}px`,
                                                width: `${12 * 60 * SIRINA_MINUTA}px`,
                                                backgroundColor: 'rgba(78,203,160,0.03)',
                                                pointerEvents: 'none'
                                            }}/>

                                            {SATI.map(sat => (
                                                <div key={sat} style={{
                                                    position: 'absolute', top: 0, bottom: 0,
                                                    left: `${sat * 60 * SIRINA_MINUTA}px`,
                                                    width: '1px', backgroundColor: '#F1F5F9'
                                                }}/>
                                            ))}

                                            {jeToday && (
                                                <div style={{
                                                    position: 'absolute', top: 0, bottom: 0,
                                                    left: `${trenutnoVremePx()}px`,
                                                    width: '2px', backgroundColor: '#F472B6',
                                                    zIndex: 5, borderRadius: '1px'
                                                }}/>
                                            )}

                                            {salaRezervacije.map((rezervacija, rIndex) => {
                                                const { levo, sirina } = izracunajBlok(
                                                    rezervacija.vremeOd, rezervacija.vremeDo
                                                );
                                                const boja = BOJE[rIndex % BOJE.length];
                                                return (
                                                    <div
                                                        key={rezervacija.rezervacijaID}
                                                        className="rez-blok"
                                                        style={{
                                                            left: `${levo}px`,
                                                            width: `${sirina}px`,
                                                            backgroundColor: boja.bg,
                                                            borderColor: boja.border,
                                                            color: boja.text,
                                                        }}
                                                        onClick={() => setSelektovanaRezervacija(rezervacija)}
                                                        title={`${rezervacija.naziv}\n${formatVreme(rezervacija.vremeOd)} — ${formatVreme(rezervacija.vremeDo)}`}
                                                    >
                                                        {sirina > 30 ? rezervacija.naziv : ''}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {sale.length === 0 && (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                                    Nema sala za prikaz
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal — Detalji rezervacije */}
            {selektovanaRezervacija && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)',
                        animation: 'fadeInModal 0.2s ease-out'
                    }}
                    onClick={() => setSelektovanaRezervacija(null)}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '20px', width: '100%',
                            maxWidth: '440px', boxShadow: '0 24px 64px rgba(15,23,42,0.2)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                                Detalji rezervacije
                            </h3>
                            <button
                                onClick={() => setSelektovanaRezervacija(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px', lineHeight: 1 }}
                            >×</button>
                        </div>

                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Naziv', value: selektovanaRezervacija.naziv },
                                { label: 'Opis', value: selektovanaRezervacija.opis || '—' },
                                { label: 'Datum', value: formatDatumPrikaz(selektovanaRezervacija.datum) },
                                { label: 'Vreme', value: `${formatVreme(selektovanaRezervacija.vremeOd)} — ${formatVreme(selektovanaRezervacija.vremeDo)}` },
                                { label: 'Broj prisutnih', value: selektovanaRezervacija.brojPrisutnih },
                                { label: 'Sale', value: selektovanaRezervacija.sale?.map(s => s.nazivSale).join(', ') },
                                {
                                    label: 'Korisnik', value: selektovanaRezervacija.korisnik
                                        ? `${selektovanaRezervacija.korisnik.ime} ${selektovanaRezervacija.korisnik.prezime}`
                                        : selektovanaRezervacija.administrator
                                            ? `${selektovanaRezervacija.administrator.ime} ${selektovanaRezervacija.administrator.prezime} (admin)`
                                            : '—'
                                },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8', minWidth: '120px' }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', color: '#1E293B' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {rola === 'ROLE_ADMINISTRATOR' && selektovanaRezervacija.datum >= danas && (
                            <div style={{
                                padding: '16px 24px', borderTop: '1px solid #F1F5F9',
                                display: 'flex', justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => handleObrisiRezervaciju(selektovanaRezervacija.rezervacijaID)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                                        background: 'rgba(244,114,182,0.12)', color: '#9D174D',
                                        fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                                        transition: 'all 0.15s', fontFamily: 'inherit'
                                    }}
                                    onMouseEnter={e => e.target.style.background = 'rgba(244,114,182,0.2)'}
                                    onMouseLeave={e => e.target.style.background = 'rgba(244,114,182,0.12)'}
                                >
                                    Obriši rezervaciju
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GantDijagram;