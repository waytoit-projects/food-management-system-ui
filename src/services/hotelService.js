export const getHotels = async () => {
  try {
    const res = await fetch("/api/getHotel", {
      method: "GET",
      headers: {
        "accept": "*/*"
      },
      credentials: "include"
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    const data = await res.json();
    // Assuming the response structure provided: { data: { ... }, success: true, message: "..." }
    // If it returns a single hotel, we might need an array. 
    // If the API returns multiple, we'll use it.
    // Based on user's sample, it's a single hotel under 'data'. 
    // But for a table, we usually expect an array. 
    // I'll wrap it in an array if it's a single object for the UI to work.
    const hotels = Array.isArray(data.data) ? data.data : [data.data];
    return { success: true, data: hotels };
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return { success: false, message: "Network error. Please check your connection." };
  }
};

export const createHotel = async (hotelData) => {
  try {
    const res = await fetch("/api/createHotel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(hotelData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating hotel:", error);
    return { success: false, message: "Network error." };
  }
};

export const updateHotel = async (hotelData) => {
  try {
    const res = await fetch("/api/updateHotel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(hotelData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating hotel:", error);
    return { success: false, message: "Network error." };
  }
};

export const deleteHotel = async (hotelId) => {
  try {
    const res = await fetch("/api/deleteHotel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ hotelId })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return { success: false, message: "Network error." };
  }
};
