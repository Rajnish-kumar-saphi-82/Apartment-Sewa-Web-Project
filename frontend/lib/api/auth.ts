import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";

export const registerUser = async (data: any) => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/register`,
    data
  );
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/login`,
    data
  );
  return response.data;
};