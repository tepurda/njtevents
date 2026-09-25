// Rad sa sesijom na klijentu: čitanje isteka JWT tokena i odjava.

/** Vreme isteka tokena u milisekundama (polje "exp" iz JWT-a), ili 0 ako token nije ispravan. */
export function istekTokena(token) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(payload)).exp * 1000;
    } catch {
        return 0;
    }
}

/** Da li postoji token koji još nije istekao. */
export function sesijaVazeca() {
    const token = localStorage.getItem('token');
    return !!token && istekTokena(token) > Date.now();
}

export function obrisiSesiju() {
    localStorage.removeItem('token');
    localStorage.removeItem('rola');
    localStorage.removeItem('ime');
    localStorage.removeItem('id');
}
