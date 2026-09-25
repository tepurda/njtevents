import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import GantDijagram from './components/GantDijagram';
import RezervacijaForma from './components/RezervacijaForma';
import AdminPanel from './components/AdminPanel';
import MojiZahtevi from './components/MojiZahtevi';
import ZaboravljenaSifra from './components/ZaboravljenaSifra';
import ResetSifre from './components/ResetSifre';
import { istekTokena, sesijaVazeca, obrisiSesiju } from './services/sesija';



const PrivateRoute = ({ children }) => {
    if (sesijaVazeca()) return children;
    const imaoSesiju = !!localStorage.getItem('token');
    obrisiSesiju();
    return <Navigate to={imaoSesiju ? '/login?istekla=true' : '/login'} replace />;
};

const JAVNE_STRANE = ['/', '/login', '/zaboravljena-sifra', '/reset-sifre'];

// Odjavljuje korisnika tačno u trenutku isteka tokena, i kada ne šalje nikakve zahteve.
// Na javnim stranama (npr. reset šifre) samo tiho briše sesiju, bez preusmeravanja.
function SesijaTajmer() {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const tajmer = setTimeout(() => {
            obrisiSesiju();
            if (!JAVNE_STRANE.includes(pathname)) {
                navigate('/login?istekla=true', { replace: true });
            }
        }, Math.max(istekTokena(token) - Date.now(), 0));
        return () => clearTimeout(tajmer);
    }, [pathname, navigate]);

    return null;
}

function App() {
    return (
        <Router>
            <SesijaTajmer />
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/zaboravljena-sifra" element={<ZaboravljenaSifra />} />
                <Route path="/reset-sifre" element={<ResetSifre />} />
                <Route path="/gant" element={
                    <PrivateRoute>
                        <GantDijagram />
                    </PrivateRoute>
                } />
                <Route path="/rezervacija" element={
                    <PrivateRoute>
                        <RezervacijaForma />
                    </PrivateRoute>
                } />
                <Route path="/admin" element={
                    <PrivateRoute>
                        <AdminPanel />
                    </PrivateRoute>
                } />


                <Route path="/moji-zahtevi" element={
                    <PrivateRoute>
                        <MojiZahtevi />
                    </PrivateRoute>
                } />


            </Routes>




        </Router>
    );
}

export default App;