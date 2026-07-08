import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRef, useState } from "react";

import { bulkUploadOffenders } from "@/api/offenders";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { BulkUploadResult } from "@/types";

const TEMPLATE_COLUMNS = [
  "name",
  "aliases",
  "date_of_birth",
  "mobile_no",
  "present_address",
  "date_of_last_arrest",
  "district",
  "police_station",
  "latitude",
  "longitude",
  "parole_status",
  "case_number",
  "gps_monitor_enabled",
  "height",
  "weight",
  "eye_color",
  "employer_name",
  "conviction_summary",
  "sentence_years",
  "years_served",
  "parole_granted_date",
  "parole_end_date",
];

const TEMPLATE_EXAMPLE_ROW = [
  "John Doe",
  "Johnny",
  "1985-04-12",
  "+1-555-0100",
  "123 Main St, Springfield",
  "2024-01-15",
  "Springfield District",
  "Springfield Central",
  "39.7817",
  "-89.6501",
  "active",
  "P-10234",
  "false",
  `5' 10"`,
  "180 lbs",
  "brown",
  "Acme Corp",
  "Aggravated Assault (Felony Class B)",
  "5",
  "2",
  "2024-02-01",
  "2029-02-01",
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadTemplate() {
  const csv = [TEMPLATE_COLUMNS, TEMPLATE_EXAMPLE_ROW]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "offenders-bulk-upload-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: bulkUploadOffenders,
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      if (data.created > 0) {
        queryClient.invalidateQueries({ queryKey: ["offenders"] });
      }
    },
    onError: (err) => {
      const detail =
        isAxiosError<{ detail?: string }>(err) && err.response?.data?.detail
          ? err.response.data.detail
          : "Upload failed. Please check the file and try again.";
      setError(detail);
    },
  });

  function handleUpload() {
    if (!file) return;
    setError(null);
    uploadMutation.mutate(file);
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Modal title="Bulk upload offenders" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Upload a CSV file to register multiple offenders at once. Each row is validated
          independently, so a mistake in one row won't block the rest from being imported.
        </p>

        <div className="flex items-center justify-between rounded border border-outline-variant bg-surface-container-low px-4 py-3">
          <div>
            <p className="text-sm font-medium text-on-surface">Need the column format?</p>
            <p className="text-xs text-on-surface-variant">
              Download a template with the expected columns and an example row.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={downloadTemplate}>
            Download template
          </Button>
        </div>

        {!result && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-on-primary hover:file:opacity-90"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" disabled={!file || uploadMutation.isPending} onClick={handleUpload}>
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="rounded border border-outline-variant bg-surface-container-low px-4 py-3">
              <p className="text-sm font-medium text-on-surface">
                {result.created} of {result.total_rows} row{result.total_rows === 1 ? "" : "s"} imported
                successfully.
              </p>
              {result.errors.length > 0 && (
                <p className="mt-1 text-sm text-error">
                  {result.errors.length} row{result.errors.length === 1 ? "" : "s"} could not be imported.
                </p>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-64 overflow-y-auto rounded border border-outline-variant">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface-container-low">
                    <tr>
                      <th className="px-3 py-2 text-label-md text-on-surface-variant">Row</th>
                      <th className="px-3 py-2 text-label-md text-on-surface-variant">Field</th>
                      <th className="px-3 py-2 text-label-md text-on-surface-variant">Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.flatMap((rowError) =>
                      Object.entries(rowError.errors).map(([field, messages]) => (
                        <tr key={`${rowError.row}-${field}`} className="border-t border-outline-variant">
                          <td className="px-3 py-2 font-data text-on-surface">{rowError.row}</td>
                          <td className="px-3 py-2 capitalize text-on-surface">{field.replace(/_/g, " ")}</td>
                          <td className="px-3 py-2 text-on-surface-variant">{messages.join(" ")}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={reset}>
                Upload another file
              </Button>
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
