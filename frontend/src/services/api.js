import axios from 'axios';
import { obrisiSesiju } from './sesija';

const BASE_URL = 'http://localhost:8081/api';

// Axios instanca
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatski dodaj token na svaki zahtev
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Automatsko izlogovanje kada token istekne.
// Zahtevi ka /auth/* (npr. pogrešna šifra na prijavi) se preskaču — tu 401 nije istekla sesija.
api.interceptors.response.use(
    response => response,
    error => {
        const authZahtev = error.config?.url?.startsWith('/auth/');
        if (error.response?.status === 401 && !authZahtev) {
            obrisiSesiju();
            window.location.href = '/login?istekla=true';
        }
        return Promise.reject(error);
    }
);

// AUTH
export const login = (email, sifra) =>
    api.post('/auth/login', { email, sifra });
export const zatraziResetSifre = (email) =>
    api.post('/auth/zaboravljena-sifra', { email });
export const proveriLinkZaReset = (token) =>
    api.get('/auth/reset-sifre/provera', { params: { token } });
export const resetujSifru = (token, novaSifra) =>
    api.post('/auth/reset-sifre', { token, novaSifra });

// KORISNICI
export const getSviKorisnici = () => api.get('/korisnici');
export const kreirajKorisnika = (data) => api.post('/korisnici', data);
export const obrisiKorisnika = (id) => api.delete(`/korisnici/${id}`);
export const azurirajKorisnika = (id, data) => api.put(`/korisnici/${id}`, data);
export const unaprediKorisnika = (id) => api.post(`/korisnici/${id}/unapredi`);
export const promeniSifru = (staraSifra, novaSifra) =>
    api.put('/korisnici/me/sifra', { staraSifra, novaSifra });

// SALE
export const getSveSale = () => api.get('/sale');
export const getSalaById = (id) => api.get(`/sale/${id}`);
export const kreirajSalu = (data) => api.post('/sale', data);
export const azurirajSalu = (id, data) => api.put(`/sale/${id}`, data);
export const obrisiSalu = (id) => api.delete(`/sale/${id}`);

// TIP SALE
export const getSviTipoviSale = () => api.get('/tipovisale');
export const azurirajTipSale = (id, data) => api.put(`/tipovisale/${id}`, data);
export const obrisiTipSale = (id) => api.delete(`/tipovisale/${id}`);
export const kreirajTipSale = (data) => api.post('/tipovisale', data);

// REZERVACIJE
export const getSveRezervacije = () => api.get('/rezervacije');
export const getRezervacijeByDatum = (datum) => api.get(`/rezervacije/datum?datum=${datum}`);
export const kreirajRezervaciju = (data) => api.post('/rezervacije', data);
export const kreirajRezervacijuAdmin = (data) => api.post('/rezervacije/admin', data);
export const obrisiRezervaciju = (id) => api.delete(`/rezervacije/${id}`);

// ZAHTEVI
export const getSviZahtevi = () => api.get('/zahtevi');
export const getMojiZahtevi = (korisnikID) => api.get(`/zahtevi/moji/${korisnikID}`);
export const getZahteviByStatus = (status) => api.get(`/zahtevi/status?status=${status}`);
export const obradiZahtev = (id, administratorID, status, napomena) =>
    api.put(`/zahtevi/${id}/obradi?administratorID=${administratorID}&status=${status}&napomena=${napomena}`);

export default api;