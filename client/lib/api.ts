"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = `${process.env.NEXT_API_BASE_URL}/api/v1`;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders(headers) {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Doctor", "Patient", "Dashboard", "Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<unknown, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    me: builder.query<any, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<unknown, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    dashboard: builder.query<any, void>({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),

    doctors: builder.query<any, Record<string, string | number | undefined>>({
      query: (params) => ({ url: "/doctors", params }),
      providesTags: ["Doctor"],
    }),

    doctor: builder.query<any, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: ["Doctor"],
    }),

    createDoctor: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/doctors",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Doctor", "Dashboard"],
    }),

    updateDoctor: builder.mutation<
      any,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/doctors/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Doctor", "Dashboard"],
    }),

    deleteDoctor: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Doctor", "Patient", "Dashboard"],
    }),

    doctorPatients: builder.query<
      any,
      { doctorId: string; params?: Record<string, string | number | undefined> }
    >({
      query: ({ doctorId, params }) => ({
        url: `/doctors/${doctorId}/patients`,
        params,
      }),
      providesTags: ["Patient"],
    }),

    addPatient: builder.mutation<
      any,
      { doctorId: string; body: Record<string, unknown> }
    >({
      query: ({ doctorId, body }) => ({
        url: `/doctors/${doctorId}/patients`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Patient", "Doctor", "Dashboard"],
    }),

    patients: builder.query<any, Record<string, string | number | undefined>>({
      query: (params) => ({ url: "/patients", params }),
      providesTags: ["Patient"],
    }),

    updatePatient: builder.mutation<
      any,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/patients/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Patient", "Doctor", "Dashboard"],
    }),

    deletePatient: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Patient", "Doctor", "Dashboard"],
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useDashboardQuery,
  useDoctorsQuery,
  useDoctorQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useDoctorPatientsQuery,
  useAddPatientMutation,
  usePatientsQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = api;
