import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import GantDijagram from './components/GantDijagram';
import RezervacijaForma from './components/RezervacijaForma';
import AdminPanel from './components/AdminPanel';
import MojiZahtevi from './components/MojiZahtevi';



const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
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