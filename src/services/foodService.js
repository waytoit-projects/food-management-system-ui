import API_BASE_URL from '../config/api';

export const createFoodItem = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/food-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating food item:", error);
    return { success: false, message: "Network error or server unreachable. Please check if your backend is running." };
  }
};

export const updateFoodItem = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/update-food-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating food item:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};

export const deleteFoodItem = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/delete-food-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting food item:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};

