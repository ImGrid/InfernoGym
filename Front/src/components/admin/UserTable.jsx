import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../../service/api';
import UserDetailsModal from './UserDetailsModal';
import './UserTable.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function UserTable() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [orderRecent, setOrderRecent] = useState(true);
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        nombre: true, apellido: true, rol: false, estado: true,
        pago: false, tipo: false, fecha_registro: false, fecha_caducidad: true
    });
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const loadUsers = async () => {
            const usersData = await fetchUsers();
            const filteredUsers = usersData.filter(user => user.rol === 'usuario');
            filteredUsers.sort((a, b) => orderRecent ? new Date(b.fecha_registro) - new Date(a.fecha_registro) : new Date(a.fecha_registro) - new Date(b.fecha_registro));
            setUsers(filteredUsers.map(user => ({
                ...user,
                estado: new Date(user.fecha_caducidad) < new Date() ? 'Inactivo' : 'Activo'
            })));
        };
        loadUsers();
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [orderRecent]);

    const handleFilterChange = (field) => {
        setSelectedFilters(prevFilters => ({
            ...prevFilters,
            [field]: !prevFilters[field]
        }));
    };
    const handleDetailsClick = (user) => {
        setSelectedUser(user);
    };
    const renderDateTime = () => dateTime.toLocaleString();

    const downloadPdf = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [["N°", "Nombre", "Apellido", "Rol", "Estado", "Pago", "Tipo", "Fecha de Registro", "Fecha de Caducidad"]],
            body: users.map((user, index) => ([
                index + 1,
                user.nombre,
                user.apellido,
                user.rol,
                user.estado,
                user.pago,
                user.tipo,
                user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : '',
                user.fecha_caducidad ? new Date(user.fecha_caducidad).toLocaleDateString() : ''
            ]))
        });
        doc.save("lista_usuarios.pdf");
    };

    return (
        <div className="user-table-container">
            <div className="user-table-header">Lista de Usuarios</div>
            <div className="date-time">Fecha y hora: {new Date().toLocaleString()}</div>
            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                <button className="download-button" onClick={downloadPdf}>Descargar lista</button>
                <button className="download-button" onClick={() => setOrderRecent(!orderRecent)}>
                    {orderRecent ? "Ver últimos" : "Ver más recientes"}
                </button>
                <button className="download-button" onClick={() => setShowFilterOptions(!showFilterOptions)}>
                    Filtrar
                </button>
            </div>
            {showFilterOptions && (
                <div className="filter-options">
                    {Object.keys(selectedFilters).map(field => (
                        <label key={field}>
                            <input type="checkbox" checked={selectedFilters[field]} onChange={() => handleFilterChange(field)} />
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                    ))}
                </div>
            )}
            <div className="container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th className="number-column">N°</th>
                            {Object.keys(selectedFilters).filter(field => selectedFilters[field]).map(field => (
                                <th key={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</th> // Capitalize column headers
                            ))}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user, index) => (
                            <tr key={user._id}>
                                <td className="number-column">{index + 1 + (currentPage - 1) * usersPerPage}</td>
                                {Object.keys(selectedFilters).filter(field => selectedFilters[field]).map(field => (
                                    <td key={field}>{user[field]}</td>
                                ))}
                                <td>
                                    <button onClick={() => handleDetailsClick(user)}>Detalles</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>Anterior</button>
                    <button onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(users.length / usersPerPage)))}>Siguiente</button>
                </div>
            </div>
            {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
}

export default UserTable;