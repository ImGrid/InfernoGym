import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../../service/api';
import UserDetailsModal from './UserDetailsModal';
import './UserTable.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './UserTable.css';

function UserTable() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [orderRecent, setOrderRecent] = useState(true);
    const [columnData, setColumnData] = useState({
        col1: 'nombre',
        col2: 'apellido',
        col3: 'estado',
        col4: 'fecha_caducidad'
    });
    const [showDropdown, setShowDropdown] = useState({ col1: false, col2: false, col3: false, col4: false });
    const [dateTime, setDateTime] = useState(new Date());
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const usersData = await fetchUsers();
                let filteredUsers = usersData.filter(user => user.rol === 'usuario');
                // Ordenar inicialmente por fecha de registro
                filteredUsers.sort((a, b) => orderRecent ? new Date(b.fecha_registro) - new Date(a.fecha_registro) : new Date(a.fecha_registro) - new Date(b.fecha_registro));
                setUsers(filteredUsers.map(user => ({
                    ...user,
                    estado: new Date(user.fecha_caducidad) < new Date() ? 'Inactivo' : 'Activo'
                })));
            } catch (error) {
                console.error("Error loading users:", error);
            }
        };

        loadUsers();

        // Configurar intervalo para actualizar la fecha y hora cada segundo
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(timer);
    }, [dateTime, orderRecent]);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const nextPage = () => {
        if (currentPage * usersPerPage < users.length) {
            setCurrentPage(prev => prev + 1);
        }
    };
    const handleRecentClick = () => {
        // Invertir el orden de los usuarios al hacer clic
        setUsers(prevUsers => [...prevUsers].reverse());
        setCurrentPage(1); // Regresar a la primera página tras invertir el orden
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };
    const handleDetailsClick = (user) => {
        setSelectedUser(user);
    };

    const toggleDropdown = (col) => {
        setShowDropdown(prev => ({
            ...prev,
            [col]: !prev[col]
        }));
    };
    const toggleOrder = () => {
        setOrderRecent(!orderRecent);  // Cambia el estado de orderRecent al opuesto del actual
    };
    const handleColumnChange = (col, field) => {
        setColumnData(prev => ({
            ...prev,
            [col]: field
        }));
        setShowDropdown({ col1: false, col2: false, col3: false, col4: false });
    };

    const resetColumn = (col) => {
        setColumnData(prev => ({
            ...prev,
            [col]: ''
        }));
    };

    const getAvailableFields = (currentColumn) => {
        const allFields = ['nombre', 'apellido', 'rol', 'estado', 'pago', 'tipo', 'fecha_registro', 'fecha_caducidad'];
        const usedFields = Object.values(columnData);
        return allFields.filter(field => !usedFields.includes(field) || field === columnData[currentColumn]);
    };
    // Renderizar la fecha y hora en un formato legible
    const renderDateTime = () => {
        return dateTime.toLocaleString();
    };

    const downloadPdf = () => {
    const doc = new jsPDF();

    // Definir todas las columnas que deseas incluir en el PDF
    const tableColumn = [
        "N°",
        "Nombre",
        "Apellido",
        "Rol",
        "Estado",
        "Pago",
        "Tipo",
        "Fecha de Registro",
        "Fecha de Caducidad"
    ];

    const tableRows = [];

    users.forEach((user, index) => {
        const userData = [
            index + 1, // N°
            user.nombre,  // Nombre
            user.apellido,  // Apellido
            user.rol,  // Rol
            user.estado,  // Estado
            user.pago,  // Pago
            user.tipo,  // Tipo de entrenamiento
            user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : '',  // Fecha de Registro
            user.fecha_caducidad ? new Date(user.fecha_caducidad).toLocaleDateString() : ''  // Fecha de Caducidad
        ];
        tableRows.push(userData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Lista de Usuarios", 14, 15);
    doc.save("lista_usuarios_completa.pdf");


};
    return (
        <div>
            <div className="user-table-header">Lista de Usuarios</div>
            <div className="date-time">Fecha y hora: {renderDateTime()}</div>
            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                <button className="download-button" onClick={downloadPdf}>Descargar lista</button>
                <button className="download-button" onClick={toggleOrder} style={{ marginLeft: '10px' }}>
                    {orderRecent ? "Ver últimos" : "Ver más recientes"}
                </button>

            </div>
            <div className="container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th className="number-column">N°</th>
                            {Object.keys(columnData).map((key) => (
                                <th key={key}>
                                    {columnData[key]} <button onClick={() => toggleDropdown(key)}>▼</button>
                                    <button onClick={() => resetColumn(key)}>🔄</button>
                                    {showDropdown[key] && (
                                        <div className="dropdown-content">
                                            {getAvailableFields(key).map(field => (
                                                <button key={field} onClick={() => handleColumnChange(key, field)}>{field}</button>
                                            ))}
                                        </div>
                                    )}
                                </th>
                            ))}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user._id}>
                                <td className="number-column">{index + 1}</td>
                                <td>{user[columnData.col1]}</td>
                                <td>{user[columnData.col2]}</td>
                                <td>{user[columnData.col3]}</td>
                                <td>{user[columnData.col4]}</td>
                                <td>
                                    <button onClick={() => handleDetailsClick(user)}>Detalles</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <button onClick={prevPage}>Anterior</button>
                    <button onClick={nextPage}>Siguiente</button>
                </div>
                {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
            </div>
        </div>
    );
}

export default UserTable;
