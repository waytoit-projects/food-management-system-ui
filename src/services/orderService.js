import API_BASE_URL from '../config/api';

export const saveOrderHistory = async (orderData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/save-order-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
            credentials: "include",
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Server error: ${res.status}` };
    }

    const data = await res.text();
    let parsedData = {};
    try {
      parsedData = data ? JSON.parse(data) : {};
    } catch (e) {
      parsedData = { message: data };
    }

    return { success: true, data: parsedData };
  } catch (error) {
    console.error("Error saving order:", error);
    return { success: false, message: "Network error while saving order." };
  }
};

export const getPendingOrders = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/get-pending-orders`);
    if (!res.ok) {
      throw new Error(`Failed to fetch pending orders: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus, itemId = "%") => {
  try {
    const res = await fetch(`${API_BASE_URL}/update-pending-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, orderStatus: newStatus, itemId })
    });
    
    if (!res.ok) throw new Error("Failed to update status");
    return await res.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
};

export const getCompletedOrders = async (date) => {
  try {
    const res = await fetch(`${API_BASE_URL}/get-completed-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch completed orders: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    throw error;
  }
};

export const getCancelledOrders = async (date) => {
  try {
    const res = await fetch(`${API_BASE_URL}/get-cancelled-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch cancelled orders: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
    throw error;
  }
};

export const getTakeawayOrders = async (date) => {
  try {
    const res = await fetch(`${API_BASE_URL}/get-takeway-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch takeaway orders: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching takeaway orders:", error);
    throw error;
  }
};

export const getAllOrders = async (date) => {
  try {
    const res = await fetch(`${API_BASE_URL}/get-all-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch all orders: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};
