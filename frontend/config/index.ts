export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_ROUTES = {
  files: {
    base: `${API_BASE_URL}/api/files`,
    upload: `${API_BASE_URL}/api/files/upload`,
    list: `${API_BASE_URL}/api/files/files`,
    delete: (id: string) => `${API_BASE_URL}/api/files/files/${id}`,
    get: (id: string) => `${API_BASE_URL}/api/files/files/${id}`,
  }
};