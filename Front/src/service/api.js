const API_URL_login = 'http://localhost:5000/api';
const API_URL = 'http://localhost:5000/api/users';
const API_URL_VIDEOS = 'http://localhost:5000/api/videos';
const API_URL_REPORTES = 'http://localhost:5000/api/reportes';

export const getToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

export const loginUser = async (nombre, apellido, password) => {
  try {
    const response = await fetch(`${API_URL_login}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre,
        apellido,
        password
      })
    });
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Login failed: ${response.status} ${errMsg}`);
    }
    const data = await response.json();
    localStorage.setItem('user', JSON.stringify({
      userId: data.userId,
      nombre: `${nombre} ${apellido}`,
      role: data.rol,
      token: data.access_token
    }));
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`, // Utiliza getToken para obtener el token JWT
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Failed to fetch users: ${response.status} ${errMsg}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch users error:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Failed to create user: ${response.status} ${errMsg}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`, // Utiliza getToken para obtener el token JWT
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Failed to delete user: ${response.status} ${errMsg}`);
    }
    return await response.json(); // Devuelve la respuesta del servidor
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/update/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Failed to update user: ${response.status} ${errMsg}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

export const tokenHasExpired = () => {
    const token = getToken();
    if (!token) return true;

    const { exp } = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return exp < currentTime;
};

export const uploadVideo = async (fileData, title, description) => {
    if (tokenHasExpired()) {
        throw new Error("Session expired. Please login again.");
    }

    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('titulo', title);
    formData.append('descripcion', description);

    try {
        const response = await fetch(`${API_URL_VIDEOS}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Upload video error:", error);
        throw error;
    }
};

export const fetchVideosByUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL_VIDEOS}/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to fetch videos: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch videos error:", error);
        throw error;
    }
};

export const deleteVideo = async (videoId) => {
    try {
        const response = await fetch(`${API_URL_VIDEOS}/delete/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to delete video: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Delete video error:", error);
        throw error;
    }
};

export const updateVideo = async (videoId, updateData) => {
    try {
        const response = await fetch(`${API_URL_VIDEOS}/update/${videoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to update video: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Update video error:", error);
        throw error;
    }
};
export const getVideoById = async (videoId, type = 'original') => {
    try {
        const response = await fetch(`${API_URL_VIDEOS}/${videoId}?tipo=${type}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Failed to retrieve video: ${response.status} ${errMsg}`);
        }

        return `${API_URL_VIDEOS}/${videoId}?tipo=${type}`;
    } catch (error) {
        console.error("Retrieve video error:", error);
        throw error;
    }
};

export const crearReporte = async (videoId, repeticiones, porcentajePosicion, comentarios) => {
    try {
        const response = await fetch(`${API_URL_REPORTES}/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                video_id: videoId,
                repeticiones: repeticiones,
                porcentaje_posicion: porcentajePosicion,
                comentarios: comentarios
            })
        });
        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Error al crear reporte: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en crearReporte:", error);
        throw error;
    }
};

export const obtenerReportePorVideo = async (videoId) => {
    try {

        const response = await fetch(`${API_URL_REPORTES}/${videoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Error al obtener reporte: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en obtenerReportePorVideo:", error);
        throw error;
    }
};
export const actualizarReportePorVideo = async (videoId, cambios) => {
    try {
        const response = await fetch(`${API_URL_REPORTES}/actualizar/${videoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(cambios)
        });
        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Error al actualizar reporte: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en actualizarReportePorVideo:", error);
        throw error;
    }
};

export const eliminarReporte = async (reporteId) => {
    try {
        const response = await fetch(`${API_URL_REPORTES}/eliminar/${reporteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Error al eliminar reporte: ${response.status} ${errMsg}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en eliminarReporte:", error);
        throw error;
    }
};

export const processCameraFrame = async (imageData) => {
    try {
        const response = await fetch(`${API_URL_VIDEOS}/process_frame`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Frame processing failed: ${response.status} ${errMsg}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Frame processing error:", error);
        throw error;
    }
};