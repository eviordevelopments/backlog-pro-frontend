interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  skills?: string[];
  availability?: number;
}

const API_URL = 'http://localhost:3001';

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const { email, password } = data;

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function registerUser(email: string, password: string, name: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function logoutUser() {
  localStorage.removeItem('auth_session');
}
