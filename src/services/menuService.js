export const getMenuItems = async () => {
  try {
    // Using relative /api path to utilize Vite dev server proxy configured earlier.
    // This perfectly routes to http://localhost:8080/menu-item while bypassing browser CORS blocks.
    const res = await fetch("/api/menu-item", {
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
