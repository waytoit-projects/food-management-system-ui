import API_BASE_URL from '../config/api';

export const getMenuItems = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/menu-item`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
          credentials: "include"
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch menu items');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Menu Service Error:", error);
    throw error;
  }
};
