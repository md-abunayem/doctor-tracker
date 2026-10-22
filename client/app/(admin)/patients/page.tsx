"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "../../../components/layouts/dashboard-layout"

import { Card } from "../../../components/ui/Card"
import { ErrorMessage } from "../../../components/ui/ErrorMessage"
import { Loading } from "../../../components/ui/Loading"
import { Modal } from "../../../components/ui/Modal"
import { PageHeading } from "../../../components/ui/PageHeading"
import { Pagination } from "../../../components/ui/Pagination"
import { SearchBox } from "../../../components/ui/SearchBox"
import {
  usePatientsQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} from "@/lib/api";

function listOf(response: any): any[] {
  const value = response?.data ?? response?.items ?? response?.results ?? response;
  return Array.isArray(value) ? value : value?.patients ?? [];
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState("");

  const { data, isLoading, isError } = usePatientsQuery({
    search,
    condition,
    page,
    limit: 10,
  });

  const [updatePatient, updateState] = useUpdatePatientMutation();
  const [deletePatient] = useDeletePatientMutation();

  const patients = listOf(data);
  const pagination = data?.data?.pagination ?? data?.pagination;
  const totalPages = Math.max(
    1,
    pagination?.totalPages ??
      Math.ceil((pagination?.total ?? patients.length) / 10)
  );

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await updatePatient({
        id: editing._id ?? editing.id,
        body: {
          name: editing.name,
          age: Number(editing.age),
          condition: editing.condition,
        },
      }).unwrap();

      setEditing(null);
    } catch (err) {
      const result = err as { data?: { message?: string } };
      setError(result.data?.message ?? "Could not update patient.");
    }
  }

  async function remove(patient: any) {
    if (!window.confirm(`Delete patient "${patient.name}"?`)) return;

    try {
      await deletePatient(patient._id ?? patient.id).unwrap();
    } catch {
      window.alert("Could not delete patient.");
    }
  }

  return (
    <DashboardLayout>
      <PageHeading
        title="Patients"
        description="View and manage all patient records."
      />

      <Card>
        <div className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search patients..."
          />
          <select
            className="field"
            value={condition}
            onChange={(event) => {
              setCondition(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All conditions</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Asthma">Asthma</option>
            <option value="Heart Disease">Heart Disease</option>
          </select>
        </div>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="p-5">
            <ErrorMessage>Unable to load patients from the API.</ErrorMessage>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Condition</th>
                  <th>Doctor</th>
                  <th>Date added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient: any) => (
                  <tr key={patient._id ?? patient.id}>
                    <td>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="mt-1 text-xs muted">
                        ID: {String(patient._id ?? patient.id).slice(-8)}
                      </p>
                    </td>
                    <td>{patient.age ?? "—"}</td>
                    <td>
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          color: "var(--primary)",
                          background: "var(--primary-soft)",
                        }}
                      >
                        {patient.condition || "Unspecified"}
                      </span>
                    </td>
                    <td>
                      {typeof patient.doctor === "object"
                        ? patient.doctor?.name
                        : patient.doctorName || patient.doctor || "—"}
                    </td>
                    <td className="muted">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button
                          title="Edit patient"
                          onClick={() => {
                            setEditing({ ...patient });
                            setError("");
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Delete patient"
                          style={{ color: "var(--danger)" }}
                          onClick={() => remove(patient)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!patients.length && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center muted">
                      No patients match your search.
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

      {editing && (
        <Modal
          title="Edit patient"
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="space-y-4">
            <label className="block text-xs font-semibold">
              Patient name
              <input
                className="field mt-2"
                required
                value={editing.name ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>

            <label className="block text-xs font-semibold">
              Age
              <input
                className="field mt-2"
                required
                type="number"
                min={0}
                value={editing.age ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, age: e.target.value })
                }
              />
            </label>

            <label className="block text-xs font-semibold">
              Condition
              <input
                className="field mt-2"
                required
                value={editing.condition ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, condition: e.target.value })
                }
              />
            </label>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <button
              className="btn-primary w-full"
              disabled={updateState.isLoading}
            >
              {updateState.isLoading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}