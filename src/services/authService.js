export const loginApi = async (data) => {
  try {
    // Calling the relative /api/login endpoint routes the request
    // through the Vite Dev Server proxy, which completely avoids CORS blocks!
    const res = await fetch("/api/login", {
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

