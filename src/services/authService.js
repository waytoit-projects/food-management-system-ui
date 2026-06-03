import API_BASE_URL from '../config/api';

export const loginApi = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
            credentials: "include",
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    
    return await res.json();
  } catch (error) {
    throw error;
  }
};

