import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export async function signup(payload: SignupPayload) {
  const { data } = await api.post(`/auth/signup`, payload);
  return data;
}

export function useSignup() {
  return useMutation({
    mutationKey: ['signup'],
    mutationFn: (payload: SignupPayload) => signup(payload),
  });
}
