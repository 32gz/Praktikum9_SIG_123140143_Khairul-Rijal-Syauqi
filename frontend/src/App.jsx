import React, { useState, useEffect, createContext, useContext } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const res = await api.post('/token', params);
    localStorage.setItem('token', res.data.access_token);
    setToken(res.data.access_token);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


function WebGIS() {
  const { token, login, logout } = useContext(AuthContext);
  const [geoData, setGeoData] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [formData, setFormData] = useState({ id: null, nama: '', lat: '', lon: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/facilities/geojson');
      setGeoData(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCRUD = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await api.put(`/facilities/${formData.id}`, formData);
      else await api.post('/facilities', formData);
      setFormData({ id: null, nama: '', lat: '', lon: '' });
      setIsEditing(false);
      fetchData();
    } catch (e) { alert("Gagal menyimpan data. Pastikan Anda sudah login."); }
  };

  const deleteData = async (id) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      await api.delete(`/facilities/${id}`);
      fetchData();
    } catch (e) { alert("Gagal menghapus."); }
  };

  function MapClick() {
    useMapEvents({
      click(e) {
        if (token) setFormData({ ...formData, lat: e.latlng.lat, lon: e.latlng.lng, id: null });
      },
    });
    return null;
  }

 
  window.triggerEdit = (id, nama, lat, lon) => {
    setFormData({ id, nama, lat, lon });
    setIsEditing(true);
  };
  window.triggerDelete = (id) => deleteData(id);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">WebGIS ITERA - Praktikum 9</h1>
        {!token ? (
          <div className="flex gap-2">
            <input className="text-black p-1 rounded text-sm w-32" placeholder="Username" onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            <input className="text-black p-1 rounded text-sm w-32" type="password" placeholder="Password" onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <button className="bg-green-600 px-4 py-1 rounded text-sm font-bold" onClick={() => login(authForm.username, authForm.password)}>Login</button>
          </div>
        ) : (
          <button className="bg-red-600 px-4 py-1 rounded text-sm font-bold" onClick={logout}>Logout</button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {token && (
          <aside className="w-80 bg-white p-6 border-r shadow-inner z-10">
            <h2 className="text-lg font-bold mb-4">{isEditing ? '📝 Edit' : '➕ Tambah'} Data Spasial</h2>
            <form onSubmit={handleCRUD} className="flex flex-col gap-4">
              <input className="border p-2 rounded" placeholder="Nama Fasilitas" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required />
              <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                Lat: {formData.lat || 'Belum dipilih'}<br/>
                Lon: {formData.lon || 'Belum dipilih'}
              </div>
              <button className="bg-indigo-600 text-white p-2 rounded font-bold hover:bg-indigo-700">SIMPAN</button>
              <p className="text-[10px] text-gray-400 italic text-center">*Klik pada peta untuk menentukan lokasi</p>
            </form>
          </aside>
        )}

        <main className="flex-1">
          <MapContainer center={[-5.357, 105.314]} zoom={15} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClick />
            {geoData && (
              <GeoJSON 
                data={geoData} 
                pointToLayer={(f, l) => L.circleMarker(l, { radius: 8, fillColor: "red", color: "#fff", weight: 1, fillOpacity: 0.8 })}
                onEachFeature={(f, layer) => layer.bindPopup(`
                  <div class="p-1">
                    <b class="text-sm">${f.properties.nama}</b><br/>
                    <div class="mt-2 flex gap-1">
                      <button class="bg-gray-200 px-2 py-1 rounded text-[10px]" onclick="window.triggerEdit(${f.id}, '${f.properties.nama}', ${f.geometry.coordinates[1]}, ${f.geometry.coordinates[0]})">Edit</button>
                      <button class="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px]" onclick="window.triggerDelete(${f.id})">Hapus</button>
                    </div>
                  </div>
                `)}
                key={JSON.stringify(geoData)}
              />
            )}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebGIS />
    </AuthProvider>
  );
}