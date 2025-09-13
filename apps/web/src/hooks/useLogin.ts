import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import axios from 'axios';

export type LoginPayload = {
  email: string;
};

export async function login(payload: LoginPayload) {
  // Using signup endpoint to issue magic sign-in link via email
  const { data } = await api.post(`/auth/signup`, payload);
  // const { data } = await axios.post(
  //   `http://localhost:4000/api/v1/auth/signup`,
  //   payload
  // );
  return data;
}

export function useLogin() {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}
