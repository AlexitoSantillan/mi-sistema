// función base para hacer peticiones
export async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(`/api${url}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error en API:", error);
    throw error;
  }
}

// 🔍 probar backend
export async function testBackend() {
  return await apiFetch("/test");
}

// 🔐 login
export async function login(username, password) {
  return await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}