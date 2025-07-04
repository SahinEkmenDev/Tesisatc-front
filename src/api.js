export const API_BASE_URL = "https://localhost:7130";

export async function apiGet(endpoint) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("API isteği başarısız oldu");
  }
  return response.json();
}

export async function apiPost(endpoint, data) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("API isteği başarısız oldu");
  }
  return response.json();
}
