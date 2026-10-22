"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "../../../components/layouts/dashboard-layout";
import { Card } from "../../../components/ui/Card"
import { ErrorMessage } from "../../../components/ui/ErrorMessage"
import { Loading } from "../../../components/ui/Loading"
import { Modal } from "../../../components/ui/Modal"
import { PageHeading } from "../../../components/ui/PageHeading"
import { Pagination } from "../../../components/ui/Pagination"
import { SearchBox } from "../../../components/ui/SearchBox"


import {
  useDoctorsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} from "@/lib/api";

const emptyDoctor = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

function listOf(response: any): any[] {
  const value = response?.data ?? response?.items ?? response?.results ?? response;
  return Array.isArray(value) ? value : value?.doctors ?? [];
}

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyDoctor);
  const [error, setError] = useState("");

  const params = {
    ...(search && { search }),
    ...(specialization && { specialization }),
    ...(hospital && { hospital }),
    ...(from && { from }),
    ...(to && { to }),
    page,
    limit: 10,
  };
  const { data, isLoading, isError } = useDoctorsQuery(params);
  const { data: filterOptionsData } = useDoctorsQuery({ page: 1, limit: 100 });
  const [createDoctor, createState] = useCreateDoctorMutation();
  const [updateDoctor, updateState] = useUpdateDoctorMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();

  const doctors = listOf(data);
  const specializations = Array.from(
    new Set(
      listOf(filterOptionsData)
        .map((doctor: any) => doctor.specialization)
        .filter(Boolean),
    ),
  );
  const hospitals = Array.from(
    new Set(
      listOf(filterOptionsData)
        .map((doctor: any) => doctor.hospital)
        .filter(Boolean),
    ),
  );
  if (specialization && !specializations.includes(specialization)) {
    specializations.push(specialization);
  }
  if (hospital && !hospitals.includes(hospital)) {
    hospitals.push(hospital);
  }
  const pagination = data?.data?.pagination ?? data?.pagination;
  const totalPages = Math.max(
    1,
    pagination?.totalPages ??
      Math.ceil((pagination?.total ?? doctors.length) / 10)
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyDoctor);
    setError("");
    setModal(true);
  }

  function openEdit(doctor: any) {
    setEditing(doctor);
    setForm({
      name: doctor.name ?? "",
      specialization: doctor.specialization ?? "",
      hospital: doctor.hospital ?? "",
      phone: doctor.phone ?? "",
      email: doctor.email ?? "",
    });
    setError("");
    setModal(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    try {
      if (editing) {
        await updateDoctor({
          id: editing._id ?? editing.id,
          body: form,
        }).unwrap();
      } else {
        await createDoctor(form).unwrap();
      }
      setModal(false);
    } catch (err) {
      const result = err as { data?: { message?: string } };
      setError(result.data?.message ?? "Could not save doctor.");
    }
  }

  async function removeDoctor(doctor: any) {
    const confirmed = window.confirm(
      `Delete Dr. ${doctor.name} and all patients belonging to this doctor?`
    );
    if (!confirmed) return;

    try {
      await deleteDoctor(doctor._id ?? doctor.id).unwrap();
    } catch {
      window.alert("Could not delete doctor. Please try again.");
    }
  }

  return (
    <DashboardLayout>
      <PageHeading
        title="Doctors"
        description="Manage your doctors and their patient records."
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={17} /> Add doctor
          </button>
        }
      />

      <Card className="mb-5">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by name, specialization"
          />
          <select
            className="field"
            value={specialization}
            onChange={(event) => {
              setSpecialization(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by specialization"
          >
            <option value="">All specializations</option>
            {specializations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={hospital}
            onChange={(event) => {
              setHospital(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by hospital"
          >
            <option value="">All hospitals</option>
            {hospitals.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="field"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            aria-label="Added from date"
          />
          <input
            className="field"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            aria-label="Added to date"
          />
        </div>
      </Card>

      <Card>
        <div className="border-b px-4 py-3 text-xs muted" style={{ borderColor: "var(--border)" }}>
          {pagination?.total ?? doctors.length} doctors
        </div>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="p-5">
            <ErrorMessage>Could not load doctors. Check the API.</ErrorMessage>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Hospital</th>
                  <th>Contact</th>
                  <th>Patients</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor: any) => (
                  <tr key={doctor._id ?? doctor.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                          {doctor.name?.slice(0, 1) ?? "D"}
                        </div>
                        <div>
                          <p className="font-semibold">{doctor.name}</p>
                          <p className="mt-1 text-xs muted">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{doctor.specialization || "—"}</td>
                    <td>{doctor.hospital || "—"}</td>
                    <td>{doctor.phone || "—"}</td>
                    <td>{doctor.patientsCount ?? doctor.patientCount ?? "—"}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link
                          title="View doctor and patients"
                          href={`/doctors/${doctor._id ?? doctor.id}`}
                          style={{ color: "var(--primary)" }}
                        >
                          <Eye size={17} />
                        </Link>
                        <button
                          title="Edit doctor"
                          onClick={() => openEdit(doctor)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Delete doctor"
                          style={{ color: "var(--danger)" }}
                          onClick={() => removeDoctor(doctor)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!doctors.length && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center muted">
                      No doctors found. Add your first doctor to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
        />
      </Card>

      {modal && (
        <Modal
          title={editing ? "Edit doctor" : "Add a doctor"}
          onClose={() => setModal(false)}
        >
          <form onSubmit={submit} className="space-y-4">
            {(
              [
                ["name", "Full name"],
                ["specialization", "Specialization"],
                ["hospital", "Hospital"],
                ["phone", "Phone number"],
                ["email", "Email address"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-xs font-semibold">
                  {label}
                </label>
                <input
                  className="field"
                  required
                  type={key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              </div>
            ))}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <button
              className="btn-primary w-full"
              disabled={createState.isLoading || updateState.isLoading}
            >
              {createState.isLoading || updateState.isLoading
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create doctor"}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}