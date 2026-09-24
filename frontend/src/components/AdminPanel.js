import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSviZahtevi, obradiZahtev, getSviKorisnici, kreirajKorisnika, obrisiKorisnika, azurirajKorisnika, getSveSale, kreirajSalu, azurirajSalu, obrisiSalu, getSviTipoviSale, kreirajTipSale, azurirajTipSale, obrisiTipSale, getSveRezervacije, obrisiRezervaciju } from '../services/api';

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

const SortIkonica = ({ kolona, sortKolona, sortSmer }) => {
    if (sortKolona !== kolona) return <span style={{ color: '#CBD5E1', marginLeft: '4px' }}>↕</span>;
    return <span style={{ color: '#4ECBA0', marginLeft: '4px' }}>{sortSmer === 'asc' ? '↑' : '↓'}</span>;
};

const ThSort = ({ label, kolona, sort, onSort }) => (
    <th
        onClick={() => onSort(kolona)}
        style={{
            padding: '12px 16px', textAlign: 'left',
            fontSize: '11px', fontWeight: '600',
            color: '#64748B', letterSpacing: '0.05em',
            textTransform: 'uppercase', cursor: 'pointer',
            userSelect: 'none', whiteSpace: 'nowrap'
        }}
    >
        {label}
        <SortIkonica kolona={kolona} sortKolona={sort.kolona} sortSmer={sort.smer}/>
    </th>
);

const SearchInput = ({ value, onChange, placeholder }) => (
    <div style={{ position: 'relative', marginBottom: '12px' }}>
        <svg
            width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="#94A3B8" strokeWidth="2"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: '100%', padding: '8px 12px 8px 34px',
                borderRadius: '10px', border: '1.5px solid #E2E8F0',
                background: '#F8FAFC', color: '#1E293B', fontSize: '13px',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = '#4ECBA0'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
        />
        {value && (
            <button
                onClick={() => onChange('')}
                style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94A3B8', fontSize: '16px', lineHeight: 1, padding: '2px'
                }}
            >×</button>
        )}
    </div>
);

const defaultSort = { kolona: '', smer: 'asc' };

function AdminPanel() {
    const [zahtevi, setZahtevi] = useState([]);
    const [korisnici, setKorisnici] = useState([]);
    const [sale, setSale] = useState([]);
    const [tipoviSale, setTipoviSale] = useState([]);
    const [rezervacije, setRezervacije] = useState([]);
    const [aktivniTab, setAktivniTab] = useState('zahtevi');
    const [aktivniZahtevTab, setAktivniZahtevTab] = useState('cekanje');
    const [aktivniSaleTab, setAktivniSaleTab] = useState('sale');
    const [selektovaniZahtev, setSelektovaniZahtev] = useState(null);
    const [potvrda, setPotvrda] = useState(null);
    const [napomena, setNapomena] = useState('');
    const [greska, setGreska] = useState('');
    const [uspeh, setUspeh] = useState('');

    const [salaForma, setSalaForma] = useState({ nazivSale: '', napomena: '', tipSale: { idTipSale: '' } });
    const [izmeniSalu, setIzmeniSalu] = useState(null);
    const [tipSaleForma, setTipSaleForma] = useState({ nazivTipa: '', kapacitet: '' });
    const [izmeniTipSale, setIzmeniTipSale] = useState(null);
    const [noviKorisnik, setNoviKorisnik] = useState({ ime: '', prezime: '', email: '' });
    const [izmeniKorisnika, setIzmeniKorisnika] = useState(null);
    const [izmenaKorisnikForma, setIzmenaKorisnikForma] = useState({ ime: '', prezime: '', email: '', sifra: '' });

    const [searchZahtevi, setSearchZahtevi] = useState('');
    const [searchKorisnici, setSearchKorisnici] = useState('');
    const [searchSale, setSearchSale] = useState('');
    const [searchTipoviSale, setSearchTipoviSale] = useState('');
    const [searchRezervacije, setSearchRezervacije] = useState('');

    const [sortZahtevi, setSortZahtevi] = useState(defaultSort);
    const [sortKorisnici, setSortKorisnici] = useState(defaultSort);
    const [sortSale, setSortSale] = useState(defaultSort);
    const [sortTipoviSale, setSortTipoviSale] = useState(defaultSort);
    const [sortRezervacije, setSortRezervacije] = useState(defaultSort);

    const navigate = useNavigate();
    const adminID = localStorage.getItem('id');

    useEffect(() => { ucitajPodatke(); }, []);

    const ucitajPodatke = async () => {
        try {
            const [zahteviRes, korisnicireRes, saleRes, tipoviRes, rezervacijeRes] = await Promise.all([
                getSviZahtevi(), getSviKorisnici(), getSveSale(), getSviTipoviSale(), getSveRezervacije()
            ]);
            setZahtevi(zahteviRes.data);
            setKorisnici(korisnicireRes.data);
            setSale(saleRes.data);
            setTipoviSale(tipoviRes.data);
            const danas = new Date().toISOString().split('T')[0];
            const aktivneBuduce = rezervacijeRes.data.filter(r =>
                r.statusZahteva === 'ODOBRENO' && r.datum >= danas
            );
            setRezervacije(aktivneBuduce);
        } catch (error) {
            console.error('Greška pri učitavanju:', error);
        }
    };

    const prikaziUspeh = (poruka) => { setUspeh(poruka); setTimeout(() => setUspeh(''), 3000); };
    const prikaziGresku = (poruka) => { setGreska(poruka); setTimeout(() => setGreska(''), 3000); };

    const resetujSve = () => {
        setSortZahtevi(defaultSort); setSortKorisnici(defaultSort);
        setSortSale(defaultSort); setSortTipoviSale(defaultSort);
        setSortRezervacije(defaultSort);
        setSearchZahtevi(''); setSearchKorisnici('');
        setSearchSale(''); setSearchTipoviSale('');
        setSearchRezervacije('');
    };

    const handleSort = (setSort, kolona) => {
        setSort(prev => ({
            kolona,
            smer: prev.kolona === kolona && prev.smer === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortiraj = (lista, sort, getVrednost) => {
        if (!sort.kolona) return lista;
        return [...lista].sort((a, b) => {
            const va = getVrednost(a, sort.kolona) || '';
            const vb = getVrednost(b, sort.kolona) || '';
            const cmp = String(va).localeCompare(String(vb), 'sr');
            return sort.smer === 'asc' ? cmp : -cmp;
        });
    };

    function getStatusNaziv(status) {
        switch(status) {
            case 'NA_CEKANJU': return 'Na čekanju';
            case 'ODOBRENO': return 'Odobreno';
            case 'ODBIJENO': return 'Odbijeno';
            default: return status;
        }
    }

    const zahteviNaCekanju = zahtevi.filter(z => z.status === 'NA_CEKANJU');
    const zahteviIstorija = zahtevi.filter(z => z.status !== 'NA_CEKANJU');
    const prikazaniZahteviBase = aktivniZahtevTab === 'cekanje' ? zahteviNaCekanju : zahteviIstorija;

    const prikazaniZahtevi = useMemo(() => {
        const filtrirani = prikazaniZahteviBase.filter(z => {
            const s = searchZahtevi.toLowerCase();
            return !s ||
                z.rezervacija?.naziv?.toLowerCase().includes(s) ||
                z.rezervacija?.datum?.includes(s) ||
                getStatusNaziv(z.status).toLowerCase().includes(s) ||
                z.napomena?.toLowerCase().includes(s);
        });
        return sortiraj(filtrirani, sortZahtevi, (z, k) => {
            if (k === 'naziv') return z.rezervacija?.naziv;
            if (k === 'datum') return z.rezervacija?.datum;
            if (k === 'status') return z.status;
            if (k === 'napomena') return z.napomena;
            return '';
        });
    }, [prikazaniZahteviBase, searchZahtevi, sortZahtevi]);

    const prikazaniKorisnici = useMemo(() => {
        const filtrirani = korisnici.filter(k => {
            const s = searchKorisnici.toLowerCase();
            return !s ||
                k.ime?.toLowerCase().includes(s) ||
                k.prezime?.toLowerCase().includes(s) ||
                k.email?.toLowerCase().includes(s);
        });
        return sortiraj(filtrirani, sortKorisnici, (k, kolona) => {
            if (kolona === 'ime') return k.ime;
            if (kolona === 'prezime') return k.prezime;
            if (kolona === 'email') return k.email;
            return '';
        });
    }, [korisnici, searchKorisnici, sortKorisnici]);

    const prikazaneSale = useMemo(() => {
        const filtrirane = sale.filter(s => {
            const q = searchSale.toLowerCase();
            return !q ||
                s.nazivSale?.toLowerCase().includes(q) ||
                s.napomena?.toLowerCase().includes(q) ||
                s.tipSale?.nazivTipa?.toLowerCase().includes(q);
        });
        return sortiraj(filtrirane, sortSale, (s, k) => {
            if (k === 'naziv') return s.nazivSale;
            if (k === 'napomena') return s.napomena;
            if (k === 'tip') return s.tipSale?.nazivTipa;
            if (k === 'kapacitet') return s.tipSale?.kapacitet;
            return '';
        });
    }, [sale, searchSale, sortSale]);

    const prikazaniTipoviSale = useMemo(() => {
        const filtrirani = tipoviSale.filter(t => {
            const s = searchTipoviSale.toLowerCase();
            return !s ||
                t.nazivTipa?.toLowerCase().includes(s) ||
                String(t.kapacitet).includes(s);
        });
        return sortiraj(filtrirani, sortTipoviSale, (t, k) => {
            if (k === 'naziv') return t.nazivTipa;
            if (k === 'kapacitet') return t.kapacitet;
            return '';
        });
    }, [tipoviSale, searchTipoviSale, sortTipoviSale]);

    const prikazaneRezervacije = useMemo(() => {
        const filtrirane = rezervacije.filter(r => {
            const s = searchRezervacije.toLowerCase();
            return !s ||
                r.naziv?.toLowerCase().includes(s) ||
                r.datum?.includes(s) ||
                r.sale?.some(s2 => s2.nazivSale?.toLowerCase().includes(s)) ||
                r.korisnik?.ime?.toLowerCase().includes(s) ||
                r.korisnik?.prezime?.toLowerCase().includes(s);
        });
        return sortiraj(filtrirane, sortRezervacije, (r, k) => {
            if (k === 'naziv') return r.naziv;
            if (k === 'datum') return r.datum;
            if (k === 'vreme') return r.vremeOd;
            if (k === 'korisnik') return r.korisnik?.ime || r.administrator?.ime;
            return '';
        });
    }, [rezervacije, searchRezervacije, sortRezervacije]);

    const handleObradiZahtev = async () => {
        try {
            await obradiZahtev(potvrda.zahtevID, adminID, potvrda.status, napomena);
            prikaziUspeh(`Zahtev uspešno ${potvrda.status === 'ODOBRENO' ? 'odobren' : 'odbijen'}!`);
            setPotvrda(null); setNapomena(''); setSelektovaniZahtev(null);
            ucitajPodatke();
        } catch (error) { prikaziGresku('Greška pri obradi zahteva!'); }
    };

    const handleKreirajKorisnika = async (e) => {
        e.preventDefault();
        try {
            await kreirajKorisnika(noviKorisnik);
            prikaziUspeh(`Korisnik kreiran! Privremena šifra je poslata na ${noviKorisnik.email}.`);
            setNoviKorisnik({ ime: '', prezime: '', email: '' });
            ucitajPodatke();
        } catch (error) { prikaziGresku(error.response?.data?.message || 'Greška pri kreiranju korisnika!'); }
    };

    const handleAzurirajKorisnika = async (e) => {
        e.preventDefault();
        try {
            const podaci = {};
            if (izmenaKorisnikForma.ime.trim()) podaci.ime = izmenaKorisnikForma.ime.trim();
            if (izmenaKorisnikForma.prezime.trim()) podaci.prezime = izmenaKorisnikForma.prezime.trim();
            if (izmenaKorisnikForma.email.trim()) podaci.email = izmenaKorisnikForma.email.trim();
            if (izmenaKorisnikForma.sifra.trim()) podaci.sifra = izmenaKorisnikForma.sifra.trim();

            await azurirajKorisnika(izmeniKorisnika.korisnikID, podaci);
            prikaziUspeh('Korisnik uspešno izmenjen!');
            setIzmeniKorisnika(null);
            setIzmenaKorisnikForma({ ime: '', prezime: '', email: '', sifra: '' });
            ucitajPodatke();
        } catch (error) { prikaziGresku(error.response?.data?.message || 'Greška pri izmeni korisnika!'); }
    };

    const handlePocniIzmenuKorisnika = (korisnik) => {
        setIzmeniKorisnika(korisnik);
        setIzmenaKorisnikForma({ ime: '', prezime: '', email: '', sifra: '' });
    };

    const handleObrisiKorisnika = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete korisnika?')) {
            try {
                await obrisiKorisnika(id);
                prikaziUspeh('Korisnik uspešno obrisan!');
                ucitajPodatke();
            } catch (error) { prikaziGresku(error.response?.data?.message || 'Korisnik se ne može obrisati!'); }
        }
    };

    const handleKreirajSalu = async (e) => {
        e.preventDefault();
        try {
            if (izmeniSalu) {
                await azurirajSalu(izmeniSalu.salaID, salaForma);
                prikaziUspeh('Sala uspešno izmenjena!');
                setIzmeniSalu(null);
            } else {
                await kreirajSalu(salaForma);
                prikaziUspeh('Sala uspešno kreirana!');
            }
            setSalaForma({ nazivSale: '', napomena: '', tipSale: { idTipSale: '' } });
            ucitajPodatke();
        } catch (error) { prikaziGresku(error.response?.data?.message || 'Greška pri čuvanju sale!'); }
    };

    const handleObrisiSalu = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete salu?')) {
            try {
                await obrisiSalu(id);
                prikaziUspeh('Sala uspešno obrisana!');
                ucitajPodatke();
            } catch (error) { prikaziGresku(error.response?.data?.message || 'Sala se ne može obrisati!'); }
        }
    };

    const handleIzmeniSalu = (sala) => {
        setIzmeniSalu(sala);
        setSalaForma({ nazivSale: sala.nazivSale, napomena: sala.napomena || '', tipSale: { idTipSale: sala.tipSale?.idTipSale || '' } });
    };

    const handleKreirajTipSale = async (e) => {
        e.preventDefault();
        try {
            if (izmeniTipSale) {
                await azurirajTipSale(izmeniTipSale.idTipSale, tipSaleForma);
                prikaziUspeh('Tip sale uspešno izmenjen!');
                setIzmeniTipSale(null);
            } else {
                await kreirajTipSale(tipSaleForma);
                prikaziUspeh('Tip sale uspešno kreiran!');
            }
            setTipSaleForma({ nazivTipa: '', kapacitet: '' });
            ucitajPodatke();
        } catch (error) { prikaziGresku(error.response?.data?.message || 'Greška pri čuvanju tipa sale!'); }
    };

    const handleObrisiTipSale = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete tip sale?')) {
            try {
                await obrisiTipSale(id);
                prikaziUspeh('Tip sale uspešno obrisan!');
                ucitajPodatke();
            } catch (error) { prikaziGresku(error.response?.data?.message || 'Tip sale se ne može obrisati!'); }
        }
    };

    const handleIzmeniTipSale = (tipSale) => {
        setIzmeniTipSale(tipSale);
        setTipSaleForma({ nazivTipa: tipSale.nazivTipa, kapacitet: tipSale.kapacitet });
    };

    const handleObrisiRezervaciju = async (id) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovu rezervaciju?')) {
            try {
                await obrisiRezervaciju(id);
                prikaziUspeh('Rezervacija uspešno obrisana!');
                ucitajPodatke();
            } catch (error) { prikaziGresku(error.response?.data?.message || 'Greška pri brisanju rezervacije!'); }
        }
    };

    const getStatusBoja = (status) => {
        switch(status) {
            case 'NA_CEKANJU': return { bg: 'rgba(251,191,36,0.12)', text: '#92400E', border: '#FCD34D' };
            case 'ODOBRENO': return { bg: 'rgba(78,203,160,0.12)', text: '#065F46', border: '#4ECBA0' };
            case 'ODBIJENO': return { bg: 'rgba(244,114,182,0.12)', text: '#9D174D', border: '#F472B6' };
            default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
        }
    };

    const tabovi = [
        { id: 'zahtevi', label: 'Zahtevi', badge: zahteviNaCekanju.length },
        { id: 'korisnici', label: 'Korisnici', badge: 0 },
        { id: 'sale', label: 'Sale', badge: 0 },
        { id: 'rezervacije', label: 'Rezervacije', badge: rezervacije.length },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .input-field {
                    width: 100%; padding: 9px 13px; border-radius: 10px;
                    border: 1.5px solid #E2E8F0; background: #F8FAFC;
                    color: #1E293B; font-size: 13px; outline: none;
                    transition: all 0.2s; box-sizing: border-box; font-family: inherit;
                }
                .input-field:focus { border-color: #4ECBA0; box-shadow: 0 0 0 3px rgba(78,203,160,0.1); background: #fff; }
                .tab-btn {
                    padding: 8px 18px; border-radius: 10px; border: none;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s; display: flex; align-items: center;
                    gap: 6px; font-family: inherit;
                }
                .tab-btn.active { background: #1E293B; color: #fff; }
                .tab-btn.inactive { background: transparent; color: #64748B; }
                .tab-btn.inactive:hover { background: #F1F5F9; color: #1E293B; }
                .sub-tab {
                    padding: 6px 14px; border-radius: 8px; border: none;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s; font-family: inherit;
                }
                .sub-tab.active { background: rgba(78,203,160,0.12); color: #065F46; }
                .sub-tab.inactive { background: transparent; color: #94A3B8; }
                .sub-tab.inactive:hover { background: #F1F5F9; color: #475569; }
                .action-btn {
                    padding: 6px 12px; border-radius: 8px; border: none;
                    font-size: 12px; font-weight: 500; cursor: pointer;
                    transition: all 0.15s; font-family: inherit;
                    display: inline-flex; align-items: center; gap: 4px;
                }
                .action-btn:hover { transform: translateY(-1px); }
                .btn-detalji { background: rgba(167,139,250,0.12); color: #5B21B6; }
                .btn-detalji:hover { background: rgba(167,139,250,0.2); }
                .btn-odobri { background: rgba(78,203,160,0.12); color: #065F46; }
                .btn-odobri:hover { background: rgba(78,203,160,0.2); }
                .btn-odbij { background: rgba(244,114,182,0.12); color: #9D174D; }
                .btn-odbij:hover { background: rgba(244,114,182,0.2); }
                .btn-izmeni { background: rgba(251,191,36,0.12); color: #92400E; }
                .btn-izmeni:hover { background: rgba(251,191,36,0.2); }
                .btn-obrisi { background: rgba(244,114,182,0.12); color: #9D174D; }
                .btn-obrisi:hover { background: rgba(244,114,182,0.2); }
                .btn-dodaj {
                    padding: 9px 18px; border-radius: 10px; border: none;
                    background: #1E293B; color: white; font-size: 13px;
                    font-weight: 500; cursor: pointer; transition: all 0.2s;
                    font-family: inherit; white-space: nowrap;
                }
                .btn-dodaj:hover { background: #334155; transform: translateY(-1px); }
                .btn-odustani-mali {
                    padding: 9px 14px; border-radius: 10px;
                    border: 1.5px solid #E2E8F0; background: transparent;
                    color: #64748B; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
                }
                .btn-odustani-mali:hover { background: #F1F5F9; }
                .tabela-red { border-bottom: 1px solid #F8FAFC; transition: background 0.15s; }
                .tabela-red:hover { background: #FAFBFC; }
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
                .textarea-napomena {
                    width: 100%; padding: 10px 13px; border-radius: 10px;
                    border: 1.5px solid #E2E8F0; background: #F8FAFC;
                    color: #1E293B; font-size: 13px; outline: none;
                    transition: all 0.2s; box-sizing: border-box;
                    resize: vertical; font-family: inherit; min-height: 80px;
                }
                .textarea-napomena:focus { border-color: #4ECBA0; box-shadow: 0 0 0 3px rgba(78,203,160,0.1); background: #fff; }
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
                    <span style={{
                        padding: '3px 8px', borderRadius: '6px',
                        background: 'rgba(78,203,160,0.15)', color: '#4ECBA0',
                        fontSize: '11px', fontWeight: '600'
                    }}>Admin</span>
                </div>
                <button className="back-btn" onClick={() => navigate('/gant')}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Nazad
                </button>
            </div>

            {/* Sadržaj */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px' }}>Admin panel</h1>
                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>Upravljanje zahtevima, korisnicima i salama</p>
                </div>

                {/* Tabovi */}
                <div style={{
                    display: 'flex', gap: '4px', marginBottom: '24px',
                    backgroundColor: '#F1F5F9', padding: '4px',
                    borderRadius: '12px', width: 'fit-content'
                }}>
                    {tabovi.map(tab => (
                        <button key={tab.id}
                            className={`tab-btn ${aktivniTab === tab.id ? 'active' : 'inactive'}`}
                            onClick={() => { setAktivniTab(tab.id); resetujSve(); }}
                        >
                            {tab.label}
                            {tab.badge > 0 && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    backgroundColor: aktivniTab === tab.id ? '#F472B6' : '#EF4444',
                                    color: '#fff', fontSize: '10px', fontWeight: '700'
                                }}>{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Poruke */}
                {greska && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 16px', borderRadius: '12px',
                        backgroundColor: '#FFF1F2', border: '1px solid #FFD1D8',
                        marginBottom: '16px', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F43F5E" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#E11D48' }}>{greska}</span>
                    </div>
                )}
                {uspeh && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 16px', borderRadius: '12px',
                        backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                        marginBottom: '16px', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#15803D' }}>{uspeh}</span>
                    </div>
                )}

                {/* Tab — Zahtevi */}
                {aktivniTab === 'zahtevi' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                            <button className={`sub-tab ${aktivniZahtevTab === 'cekanje' ? 'active' : 'inactive'}`}
                                onClick={() => { setAktivniZahtevTab('cekanje'); setSortZahtevi(defaultSort); setSearchZahtevi(''); }}>
                                Na čekanju {zahteviNaCekanju.length > 0 && `(${zahteviNaCekanju.length})`}
                            </button>
                            <button className={`sub-tab ${aktivniZahtevTab === 'istorija' ? 'active' : 'inactive'}`}
                                onClick={() => { setAktivniZahtevTab('istorija'); setSortZahtevi(defaultSort); setSearchZahtevi(''); }}>
                                Istorija {zahteviIstorija.length > 0 && `(${zahteviIstorija.length})`}
                            </button>
                        </div>

                        <SearchInput value={searchZahtevi} onChange={setSearchZahtevi} placeholder="Pretraži po nazivu, datumu, statusu..."/>

                        <div style={{
                            backgroundColor: '#fff', borderRadius: '16px',
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                        <ThSort label="Naziv" kolona="naziv" sort={sortZahtevi} onSort={(k) => handleSort(setSortZahtevi, k)}/>
                                        <ThSort label="Datum" kolona="datum" sort={sortZahtevi} onSort={(k) => handleSort(setSortZahtevi, k)}/>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vreme</th>
                                        <ThSort label="Status" kolona="status" sort={sortZahtevi} onSort={(k) => handleSort(setSortZahtevi, k)}/>
                                        {aktivniZahtevTab === 'istorija' && (
                                            <ThSort label="Napomena" kolona="napomena" sort={sortZahtevi} onSort={(k) => handleSort(setSortZahtevi, k)}/>
                                        )}
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prikazaniZahtevi.map(zahtev => {
                                        const boja = getStatusBoja(zahtev.status);
                                        return (
                                            <tr key={zahtev.zahtevID} className="tabela-red">
                                                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>{zahtev.rezervacija?.naziv}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{formatDatumPrikaz(zahtev.rezervacija?.datum)}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{formatVreme(zahtev.rezervacija?.vremeOd)} — {formatVreme(zahtev.rezervacija?.vremeDo)}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '20px',
                                                        fontSize: '11px', fontWeight: '600',
                                                        backgroundColor: boja.bg, color: boja.text, border: `1px solid ${boja.border}`
                                                    }}>{getStatusNaziv(zahtev.status)}</span>
                                                </td>
                                                {aktivniZahtevTab === 'istorija' && (
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', maxWidth: '200px' }}>{zahtev.napomena || '—'}</td>
                                                )}
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button className="action-btn btn-detalji" onClick={() => setSelektovaniZahtev(zahtev)}>Detalji</button>
                                                        {zahtev.status === 'NA_CEKANJU' && (
                                                            <>
                                                                <button className="action-btn btn-odobri" onClick={() => setPotvrda({ zahtevID: zahtev.zahtevID, status: 'ODOBRENO' })}>Odobri</button>
                                                                <button className="action-btn btn-odbij" onClick={() => setPotvrda({ zahtevID: zahtev.zahtevID, status: 'ODBIJENO' })}>Odbij</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {prikazaniZahtevi.length === 0 && (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                                    {searchZahtevi ? 'Nema rezultata pretrage' : aktivniZahtevTab === 'cekanje' ? 'Nema zahteva na čekanju' : 'Nema istorije zahteva'}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab — Korisnici */}
                {aktivniTab === 'korisnici' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{
                            backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', marginBottom: '16px'
                        }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: '0 0 14px' }}>
                                {izmeniKorisnika
                                    ? `Izmeni korisnika — ${izmeniKorisnika.ime} ${izmeniKorisnika.prezime}`
                                    : 'Dodaj novog korisnika'}
                            </h3>
                            <form
                                onSubmit={izmeniKorisnika ? handleAzurirajKorisnika : handleKreirajKorisnika}
                                style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                            >
                                {izmeniKorisnika ? (
                                    <>
                                        <input type="text" className="input-field"
                                            placeholder={`Ime (trenutno: ${izmeniKorisnika.ime})`}
                                            value={izmenaKorisnikForma.ime}
                                            onChange={(e) => setIzmenaKorisnikForma({...izmenaKorisnikForma, ime: e.target.value})}
                                            style={{ flex: '1', minWidth: '150px' }}/>
                                        <input type="text" className="input-field"
                                            placeholder={`Prezime (trenutno: ${izmeniKorisnika.prezime})`}
                                            value={izmenaKorisnikForma.prezime}
                                            onChange={(e) => setIzmenaKorisnikForma({...izmenaKorisnikForma, prezime: e.target.value})}
                                            style={{ flex: '1', minWidth: '150px' }}/>
                                        <input type="email" className="input-field"
                                            placeholder={`Email (trenutno: ${izmeniKorisnika.email})`}
                                            value={izmenaKorisnikForma.email}
                                            onChange={(e) => setIzmenaKorisnikForma({...izmenaKorisnikForma, email: e.target.value})}
                                            style={{ flex: '1', minWidth: '150px' }}/>
                                        <input type="password" className="input-field"
                                            placeholder="Nova šifra (ostavite prazno da ne menjate)"
                                            value={izmenaKorisnikForma.sifra}
                                            onChange={(e) => setIzmenaKorisnikForma({...izmenaKorisnikForma, sifra: e.target.value})}
                                            style={{ flex: '1', minWidth: '150px' }}/>
                                        <button type="submit" className="btn-dodaj">Sačuvaj</button>
                                        <button type="button" className="btn-odustani-mali"
                                            onClick={() => {
                                                setIzmeniKorisnika(null);
                                                setIzmenaKorisnikForma({ ime: '', prezime: '', email: '', sifra: '' });
                                            }}>
                                            Odustani
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { placeholder: 'Ime', value: noviKorisnik.ime, key: 'ime' },
                                            { placeholder: 'Prezime', value: noviKorisnik.prezime, key: 'prezime' },
                                            { placeholder: 'Email', value: noviKorisnik.email, key: 'email', type: 'email' },
                                        ].map(field => (
                                            <input key={field.key} type={field.type || 'text'}
                                                className="input-field" placeholder={field.placeholder}
                                                value={field.value}
                                                onChange={(e) => setNoviKorisnik({...noviKorisnik, [field.key]: e.target.value})}
                                                required style={{ flex: '1', minWidth: '150px' }}/>
                                        ))}
                                        <button type="submit" className="btn-dodaj">Dodaj</button>
                                    </>
                                )}
                            </form>
                            {izmeniKorisnika && (
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '10px 0 0' }}>
                                    Ostavite polja praznim ako ne želite da ih menjate.
                                </p>
                            )}
                        </div>

                        <SearchInput value={searchKorisnici} onChange={setSearchKorisnici} placeholder="Pretraži po imenu, prezimenu, emailu..."/>

                        <div style={{
                            backgroundColor: '#fff', borderRadius: '16px',
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                        <ThSort label="Ime" kolona="ime" sort={sortKorisnici} onSort={(k) => handleSort(setSortKorisnici, k)}/>
                                        <ThSort label="Prezime" kolona="prezime" sort={sortKorisnici} onSort={(k) => handleSort(setSortKorisnici, k)}/>
                                        <ThSort label="Email" kolona="email" sort={sortKorisnici} onSort={(k) => handleSort(setSortKorisnici, k)}/>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prikazaniKorisnici.map(korisnik => (
                                        <tr key={korisnik.korisnikID} className="tabela-red">
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1E293B', fontWeight: '500' }}>{korisnik.ime}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{korisnik.prezime}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{korisnik.email}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button className="action-btn btn-izmeni" onClick={() => handlePocniIzmenuKorisnika(korisnik)}>Izmeni</button>
                                                    <button className="action-btn btn-obrisi" onClick={() => handleObrisiKorisnika(korisnik.korisnikID)}>Obriši</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {prikazaniKorisnici.length === 0 && (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                                    {searchKorisnici ? 'Nema rezultata pretrage' : 'Nema korisnika'}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab — Sale */}
                {aktivniTab === 'sale' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                            <button className={`sub-tab ${aktivniSaleTab === 'sale' ? 'active' : 'inactive'}`}
                                onClick={() => { setAktivniSaleTab('sale'); setSortSale(defaultSort); setSearchSale(''); }}>Sale</button>
                            <button className={`sub-tab ${aktivniSaleTab === 'tipoviSale' ? 'active' : 'inactive'}`}
                                onClick={() => { setAktivniSaleTab('tipoviSale'); setSortTipoviSale(defaultSort); setSearchTipoviSale(''); }}>Tipovi sale</button>
                        </div>

                        {aktivniSaleTab === 'sale' && (
                            <div>
                                <div style={{
                                    backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
                                    border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', marginBottom: '16px'
                                }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: '0 0 14px' }}>
                                        {izmeniSalu ? 'Izmeni salu' : 'Dodaj novu salu'}
                                    </h3>
                                    <form onSubmit={handleKreirajSalu} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <input type="text" className="input-field" placeholder="Naziv sale"
                                            value={salaForma.nazivSale}
                                            onChange={(e) => setSalaForma({...salaForma, nazivSale: e.target.value})}
                                            required style={{ flex: '1', minWidth: '150px' }}/>
                                        <input type="text" className="input-field" placeholder="Napomena (opciono)"
                                            value={salaForma.napomena}
                                            onChange={(e) => setSalaForma({...salaForma, napomena: e.target.value})}
                                            style={{ flex: '1', minWidth: '150px' }}/>
                                        <select className="input-field"
                                            value={salaForma.tipSale.idTipSale}
                                            onChange={(e) => setSalaForma({...salaForma, tipSale: { idTipSale: parseInt(e.target.value) }})}
                                            required style={{ flex: '1', minWidth: '150px' }}>
                                            <option value="">Izaberi tip sale</option>
                                            {tipoviSale.map(tip => (
                                                <option key={tip.idTipSale} value={tip.idTipSale}>
                                                    {tip.nazivTipa} ({tip.kapacitet} mesta)
                                                </option>
                                            ))}
                                        </select>
                                        <button type="submit" className="btn-dodaj">{izmeniSalu ? 'Sačuvaj' : 'Dodaj'}</button>
                                        {izmeniSalu && (
                                            <button type="button" className="btn-odustani-mali"
                                                onClick={() => { setIzmeniSalu(null); setSalaForma({ nazivSale: '', napomena: '', tipSale: { idTipSale: '' } }); }}>
                                                Odustani
                                            </button>
                                        )}
                                    </form>
                                </div>

                                <SearchInput value={searchSale} onChange={setSearchSale} placeholder="Pretraži po nazivu, napomeni, tipu sale..."/>

                                <div style={{
                                    backgroundColor: '#fff', borderRadius: '16px',
                                    border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', overflow: 'hidden'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                                <ThSort label="Naziv" kolona="naziv" sort={sortSale} onSort={(k) => handleSort(setSortSale, k)}/>
                                                <ThSort label="Napomena" kolona="napomena" sort={sortSale} onSort={(k) => handleSort(setSortSale, k)}/>
                                                <ThSort label="Tip sale" kolona="tip" sort={sortSale} onSort={(k) => handleSort(setSortSale, k)}/>
                                                <ThSort label="Kapacitet" kolona="kapacitet" sort={sortSale} onSort={(k) => handleSort(setSortSale, k)}/>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Akcije</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prikazaneSale.map(sala => (
                                                <tr key={sala.salaID} className="tabela-red">
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>{sala.nazivSale}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{sala.napomena || '—'}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{sala.tipSale?.nazivTipa || '—'}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{sala.tipSale?.kapacitet || '—'}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="action-btn btn-izmeni" onClick={() => handleIzmeniSalu(sala)}>Izmeni</button>
                                                            <button className="action-btn btn-obrisi" onClick={() => handleObrisiSalu(sala.salaID)}>Obriši</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {prikazaneSale.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>{searchSale ? 'Nema rezultata pretrage' : 'Nema sala'}</div>}
                                </div>
                            </div>
                        )}

                        {aktivniSaleTab === 'tipoviSale' && (
                            <div>
                                <div style={{
                                    backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
                                    border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', marginBottom: '16px'
                                }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: '0 0 14px' }}>
                                        {izmeniTipSale ? 'Izmeni tip sale' : 'Dodaj novi tip sale'}
                                    </h3>
                                    <form onSubmit={handleKreirajTipSale} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <input type="text" className="input-field" placeholder="Naziv tipa"
                                            value={tipSaleForma.nazivTipa}
                                            onChange={(e) => setTipSaleForma({...tipSaleForma, nazivTipa: e.target.value})}
                                            required style={{ flex: '1', minWidth: '150px' }}/>
                                        <input type="number" className="input-field" placeholder="Kapacitet"
                                            value={tipSaleForma.kapacitet}
                                            onChange={(e) => setTipSaleForma({...tipSaleForma, kapacitet: parseInt(e.target.value)})}
                                            required min={1} style={{ flex: '1', minWidth: '150px' }}/>
                                        <button type="submit" className="btn-dodaj">{izmeniTipSale ? 'Sačuvaj' : 'Dodaj'}</button>
                                        {izmeniTipSale && (
                                            <button type="button" className="btn-odustani-mali"
                                                onClick={() => { setIzmeniTipSale(null); setTipSaleForma({ nazivTipa: '', kapacitet: '' }); }}>
                                                Odustani
                                            </button>
                                        )}
                                    </form>
                                </div>

                                <SearchInput value={searchTipoviSale} onChange={setSearchTipoviSale} placeholder="Pretraži po nazivu ili kapacitetu..."/>

                                <div style={{
                                    backgroundColor: '#fff', borderRadius: '16px',
                                    border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', overflow: 'hidden'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                                <ThSort label="Naziv tipa" kolona="naziv" sort={sortTipoviSale} onSort={(k) => handleSort(setSortTipoviSale, k)}/>
                                                <ThSort label="Kapacitet" kolona="kapacitet" sort={sortTipoviSale} onSort={(k) => handleSort(setSortTipoviSale, k)}/>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Akcije</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prikazaniTipoviSale.map(tip => (
                                                <tr key={tip.idTipSale} className="tabela-red">
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>{tip.nazivTipa}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{tip.kapacitet}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="action-btn btn-izmeni" onClick={() => handleIzmeniTipSale(tip)}>Izmeni</button>
                                                            <button className="action-btn btn-obrisi" onClick={() => handleObrisiTipSale(tip.idTipSale)}>Obriši</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {prikazaniTipoviSale.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>{searchTipoviSale ? 'Nema rezultata pretrage' : 'Nema tipova sale'}</div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab — Rezervacije */}
                {aktivniTab === 'rezervacije' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <SearchInput value={searchRezervacije} onChange={setSearchRezervacije} placeholder="Pretraži po nazivu, datumu, sali, korisniku..."/>

                        <div style={{
                            backgroundColor: '#fff', borderRadius: '16px',
                            border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(30,41,59,0.05)', overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                        <ThSort label="Naziv" kolona="naziv" sort={sortRezervacije} onSort={(k) => handleSort(setSortRezervacije, k)}/>
                                        <ThSort label="Datum" kolona="datum" sort={sortRezervacije} onSort={(k) => handleSort(setSortRezervacije, k)}/>
                                        <ThSort label="Vreme" kolona="vreme" sort={sortRezervacije} onSort={(k) => handleSort(setSortRezervacije, k)}/>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sale</th>
                                        <ThSort label="Korisnik" kolona="korisnik" sort={sortRezervacije} onSort={(k) => handleSort(setSortRezervacije, k)}/>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prikazaneRezervacije.map(r => (
                                        <tr key={r.rezervacijaID} className="tabela-red">
                                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>{r.naziv}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{formatDatumPrikaz(r.datum)}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{formatVreme(r.vremeOd)} — {formatVreme(r.vremeDo)}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{r.sale?.map(s => s.nazivSale).join(', ')}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                                                {r.korisnik
                                                    ? `${r.korisnik.ime} ${r.korisnik.prezime}`
                                                    : r.administrator
                                                        ? `${r.administrator.ime} ${r.administrator.prezime} (admin)`
                                                        : '—'
                                                }
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button className="action-btn btn-obrisi" onClick={() => handleObrisiRezervaciju(r.rezervacijaID)}>Obriši</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {prikazaneRezervacije.length === 0 && (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                                    {searchRezervacije ? 'Nema rezultata pretrage' : 'Nema aktivnih rezervacija u budućnosti'}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal — Detalji zahteva */}
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
                                { label: 'Datum', value: formatDatumPrikaz(selektovaniZahtev.rezervacija?.datum) },
                                { label: 'Vreme', value: `${formatVreme(selektovaniZahtev.rezervacija?.vremeOd)} — ${formatVreme(selektovaniZahtev.rezervacija?.vremeDo)}` },
                                { label: 'Broj prisutnih', value: selektovaniZahtev.rezervacija?.brojPrisutnih },
                                { label: 'Sale', value: selektovaniZahtev.rezervacija?.sale?.map(s => s.nazivSale).join(', ') },
                                { label: 'Korisnik', value: selektovaniZahtev.rezervacija?.korisnik
                                    ? `${selektovaniZahtev.rezervacija?.korisnik?.ime} ${selektovaniZahtev.rezervacija?.korisnik?.prezime}`
                                    : selektovaniZahtev.rezervacija?.administrator
                                        ? `${selektovaniZahtev.rezervacija?.administrator?.ime} ${selektovaniZahtev.rezervacija?.administrator?.prezime} (admin)`
                                        : '—'
                                },
                                { label: 'Email', value: selektovaniZahtev.rezervacija?.korisnik?.email || '—' },
                                { label: 'Datum slanja', value: selektovaniZahtev.datumSlanja ? new Date(selektovaniZahtev.datumSlanja).toLocaleString('sr-RS') : '—' },
                                { label: 'Napomena', value: selektovaniZahtev.napomena || '—' },
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
                        </div>
                        {selektovaniZahtev.status === 'NA_CEKANJU' && (
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button className="action-btn btn-odobri" style={{ padding: '8px 16px', fontSize: '13px' }}
                                    onClick={() => setPotvrda({ zahtevID: selektovaniZahtev.zahtevID, status: 'ODOBRENO' })}>Odobri</button>
                                <button className="action-btn btn-odbij" style={{ padding: '8px 16px', fontSize: '13px' }}
                                    onClick={() => setPotvrda({ zahtevID: selektovaniZahtev.zahtevID, status: 'ODBIJENO' })}>Odbij</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal — Potvrda */}
            {potvrda && (
                <div className="modal-overlay" onClick={() => { setPotvrda(null); setNapomena(''); }}>
                    <div className="modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                                {potvrda.status === 'ODOBRENO' ? 'Odobravanje zahteva' : 'Odbijanje zahteva'}
                            </h3>
                            <button onClick={() => { setPotvrda(null); setNapomena(''); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                                {potvrda.status === 'ODOBRENO'
                                    ? 'Da li ste sigurni da želite da odobrite ovaj zahtev?'
                                    : 'Da li ste sigurni da želite da odbijete ovaj zahtev?'}
                            </p>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>
                                    Napomena <span style={{ color: '#94A3B8', fontWeight: '400' }}>(opciono)</span>
                                </label>
                                <textarea className="textarea-napomena" value={napomena}
                                    onChange={(e) => setNapomena(e.target.value)} rows={3}/>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn-odustani-mali" onClick={() => { setPotvrda(null); setNapomena(''); }}>Odustani</button>
                            <button
                                className={`action-btn ${potvrda.status === 'ODOBRENO' ? 'btn-odobri' : 'btn-odbij'}`}
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                                onClick={handleObradiZahtev}
                            >
                                {potvrda.status === 'ODOBRENO' ? 'Odobri' : 'Odbij'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;