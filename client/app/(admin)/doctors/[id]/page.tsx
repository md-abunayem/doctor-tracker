"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import DashboardLayout from "../../../../components/layouts/dashboard-layout";

import { Card } from "../../../../components/ui/Card";
import { ErrorMessage } from "../../../../components/ui/ErrorMessage";
import { Loading } from "../../../../components/ui/Loading";
import { Modal } from "../../../../components/ui/Modal";
import { PageHeading } from "../../../../components/ui/PageHeading";
import { Pagination } from "../../../../components/ui/Pagination";

import {
  useDoctorQuery,
  useDoctorPatientsQuery,
  useAddPatientMutation,
  useDeletePatientMutation,
} from "@/lib/api";

function unwrap(value: any): any {
  let result = value?.data ?? value;
  if (result?.doctor) result = result.doctor;
  return result;
}

function listOf(value: any): any[] {
  const result = value?.data ?? value?.items ?? value?.results ?? value;
  return Array.isArray(result) ? result : (result?.patients ?? []);
}

export default function DoctorDetailsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DoctorDetailsContent />
    </Suspense>
  );
}

function DoctorDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Other",
    condition: "",
  });

  const doctorQuery = useDoctorQuery(id);
  const patientQuery = useDoctorPatientsQuery({
    doctorId: id,
    params: { page, limit: 10 },
  });

  const [addPatient, addState] = useAddPatientMutation();
  const [deletePatient] = useDeletePatientMutation();

  const doctor = unwrap(doctorQuery.data);
  const patients = listOf(patientQuery.data);
  const pagination =
    patientQuery.data?.data?.pagination ?? patientQuery.data?.pagination;

  const totalPages = Math.max(
    1,
    pagination?.totalPages ??
      Math.ceil((pagination?.total ?? patients.length) / 10),
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await addPatient({
        doctorId: id,
        body: {
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          condition: form.condition,
        },
      }).unwrap();

      setModal(false);
      setForm({ name: "", age: "", gender: "Other", condition: "" });
    } catch (err) {
      const result = err as { data?: { message?: string } };
      setError(result.data?.message ?? "Could not add patient.");
    }
  }

  async function removePatient(patient: any) {
    if (!window.confirm(`Remove patient "${patient.name}"?`)) return;

    try {
      await deletePatient(patient._id ?? patient.id).unwrap();
    } catch {
      window.alert("Could not remove patient.");
    }
  }

  return (
    <DashboardLayout>
      <Link
        href="/doctors"
        className="mb-5 inline-flex items-center gap-2 text-sm muted hover:opacity-70"
      >
        <ArrowLeft size={16} /> Back to doctors
      </Link>

      {doctorQuery.isLoading ? (
        <Loading />
      ) : doctorQuery.isError ? (
        <ErrorMessage>Could not load doctor details.</ErrorMessage>
      ) : (
        <>
          <PageHeading
            title={doctor?.name ?? "Doctor details"}
            description="Doctor information and assigned patient records."
            action={
              <button
                className="btn-primary"
                onClick={() => {
                  setError("");
                  setModal(true);
                }}
              >
                <Plus size={17} /> Add patient
              </button>
            }
          />

          <Card className="mb-6 p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                {doctor?.name?.slice(0, 1) ?? "D"}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold">{doctor?.name}</h2>
                <p className="mt-1 text-sm muted">
                  {doctor?.specialization || "Specialization not provided"}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs muted">
                  <span>{doctor?.hospital || "Hospital not provided"}</span>
                  <span>{doctor?.email || "No email"}</span>
                  <span>{doctor?.phone || "No phone"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div
              className="border-b p-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="font-bold">Patients</h2>
              <p className="mt-1 text-xs muted">
                Patients registered under this doctor
              </p>
            </div>

            {patientQuery.isLoading ? (
              <Loading />
            ) : patientQuery.isError ? (
              <div className="p-5">
                <ErrorMessage>
                  Could not load this doctor's patients.
                </ErrorMessage>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Condition</th>
                      <th>Date added</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient: any) => (
                      <tr key={patient._id ?? patient.id}>
                        <td className="font-semibold">{patient.name}</td>
                        <td>{patient.age ?? "—"}</td>
                        <td>{patient.gender ?? "—"}</td>
                        <td>{patient.condition ?? "—"}</td>
                        <td className="muted">
                          {patient.createdAt
                            ? new Date(patient.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <button
                            style={{ color: "var(--danger)" }}
                            title="Delete patient"
                            onClick={() => removePatient(patient)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!patients.length && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center muted">
                          No patients assigned to this doctor yet.
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
        </>
      )}

      {modal && (
        <Modal title="Add patient" onClose={() => setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs font-semibold">
              Patient name
              <input
                className="field mt-2"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label className="block text-xs font-semibold">
              Age
              <input
                className="field mt-2"
                type="number"
                min={0}
                required
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </label>

            <label className="block text-xs font-semibold">
              Gender
              <select
                className="field mt-2"
                required
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block text-xs font-semibold">
              Condition
              <input
                className="field mt-2"
                required
                value={form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value })
                }
                placeholder="Enter patient condition"
              />
            </label>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <button
              className="btn-primary w-full"
              disabled={addState.isLoading}
            >
              {addState.isLoading ? "Adding patient..." : "Add patient"}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
