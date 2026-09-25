import React from 'react';

/**
 * Zajednički izgled javnih strana (prijava, zaboravljena šifra, reset šifre):
 * pozadina, naslov aplikacije i kartica sa gradijent linijom.
 */
export function AuthLayout({ naslov, podnaslov, children }) {
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
                .auth-link {
                    background: none; border: none; padding: 0; cursor: pointer;
                    font-size: 13px; font-weight: 500; color: #0D7A5F; font-family: inherit;
                    text-decoration: none;
                }
                .auth-link:hover { text-decoration: underline; }
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
                        FONSale
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
                        {naslov}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 24px' }}>
                        {podnaslov}
                    </p>

                    {children}
                </div>
            </div>
        </div>
    );
}

const VARIJANTE = {
    greska:     { bg: '#FFF1F2', border: '#FFD1D8', ikona: '#F43F5E', tekst: '#E11D48' },
    upozorenje: { bg: '#FFFBEB', border: '#FCD34D', ikona: '#92400E', tekst: '#92400E' },
    uspeh:      { bg: '#ECFDF5', border: '#A7F3D0', ikona: '#059669', tekst: '#065F46' },
};

/** Obaveštenje u kartici (greška, upozorenje ili uspeh). */
export function Poruka({ tip = 'greska', children }) {
    const boje = VARIJANTE[tip];
    return (
        <div role={tip === 'greska' ? 'alert' : 'status'} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px',
            backgroundColor: boje.bg, border: `1px solid ${boje.border}`,
            marginBottom: '20px', animation: 'fadeIn 0.2s ease-out'
        }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={boje.ikona} strokeWidth="2" style={{ flexShrink: 0 }}>
                {tip === 'uspeh'
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>}
            </svg>
            <span style={{ fontSize: '13px', color: boje.tekst }}>{children}</span>
        </div>
    );
}

/** Polje forme sa labelom u stilu login strane. */
export function Polje({ label, ...inputProps }) {
    return (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
            {label}
            <input className="input-field" style={{ marginTop: '6px' }} required {...inputProps}/>
        </label>
    );
}

/** Dugme za slanje forme sa spinnerom tokom učitavanja. */
export function DugmeZaSlanje({ ucitavanje, tekst, tekstUcitavanja, disabled }) {
    return (
        <button type="submit" className="btn-login" disabled={ucitavanje || disabled}>
            {ucitavanje ? (<><div className="spinner"/>{tekstUcitavanja}</>) : tekst}
        </button>
    );
}
