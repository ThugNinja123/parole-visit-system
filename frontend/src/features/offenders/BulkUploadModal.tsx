import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColDef } from "ag-grid-community";
import { isAxiosError } from "axios";
import { useMemo, useRef, useState } from "react";

import { bulkUploadOffenders } from "@/api/offenders";
import { DataGrid } from "@/components/DataGrid";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  BULK_UPLOAD_DATE_FIELDS,
  BULK_UPLOAD_DATE_FORMAT,
  TEMPLATE_COLUMNS,
  TEMPLATE_EXAMPLE_ROW,
} from "@/features/offenders/bulkUploadRules";
import type { BulkUploadResult } from "@/types";

interface BulkUploadErrorRow {
  id: string;
  row: number;
  field: string;
  issue: string;
}

function flattenUploadErrors(errors: BulkUploadResult["errors"]): BulkUploadErrorRow[] {
  return errors.flatMap((rowError) =>
    Object.entries(rowError.errors).map(([field, messages]) => ({
      id: `${rowError.row}-${field}`,
      row: rowError.row,
      field,
      issue: messages.join(" "),
    })),
  );
}

const errorColumnDefs: ColDef<BulkUploadErrorRow>[] = [
  {
    headerName: "Row",
    field: "row",
    width: 72,
    sortable: true,
    cellClass: "font-data text-on-surface",
  },
  {
    headerName: "Field",
    field: "field",
    width: 140,
    sortable: true,
    valueFormatter: ({ value }) => String(value).replace(/_/g, " "),
    cellClass: "capitalize text-on-surface",
  },
  {
    headerName: "Issue",
    field: "issue",
    flex: 1,
    minWidth: 200,
    wrapText: true,
    autoHeight: true,
    cellClass: "text-on-surface-variant",
  },
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

  const errorRows = useMemo(
    () => (result ? flattenUploadErrors(result.errors) : []),
    [result],
  );

  return (
    <Modal
      title="Bulk upload offenders"
      onClose={onClose}
      wide
      footer={
        result ? (
          <>
            <Button type="button" variant="secondary" onClick={reset}>
              Upload another file
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" disabled={!file || uploadMutation.isPending} onClick={handleUpload}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Upload a CSV file to register multiple offenders at once. Each row is validated
          independently, so a mistake in one row won't block the rest from being imported.
          Date fields ({BULK_UPLOAD_DATE_FIELDS.map((f) => f.replace(/_/g, " ")).join(", ")}) must use{" "}
          {BULK_UPLOAD_DATE_FORMAT}.
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
              <div className="max-h-64 overflow-hidden rounded border border-outline-variant">
                <DataGrid<BulkUploadErrorRow>
                  rowData={errorRows}
                  columnDefs={errorColumnDefs}
                  domLayout="normal"
                  className="app-data-grid h-64 w-full"
                  getRowId={(params) => params.data.id}
                  rowHeight={40}
                  headerHeight={36}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
