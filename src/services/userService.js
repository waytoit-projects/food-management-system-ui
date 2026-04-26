export const createUser = async (userData) => {
  try {
    const res = await fetch("/api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(userData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};

export const getUsers = async (data) => {
  try {
    const res = await fetch("/api/getUsers", {
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
    console.error("Error fetching users:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};

export const updateUser = async (userData) => {
  try {
    const res = await fetch("/api/updateUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(userData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};
export const deleteUser = async (data) => {
  try {
    const res = await fetch("/api/deleteUser", {
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
    console.error("Error deleting user:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};
