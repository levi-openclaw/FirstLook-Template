'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, Check, Copy, X, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

interface CsvUploaderProps {
  onHandlesImported?: (handles: string[]) => void;
  onHandlesCleared?: () => void;
}

function parseCsv(text: string): ParsedCsv {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

export function CsvUploader({ onHandlesImported, onHandlesCleared }: CsvUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [outputJson, setOutputJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) return;

    setFileName(file.name);
    setSelectedColumn(null);
    setOutputJson('');
    setCopied(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCsv(text);
      setParsed(result);

      // Auto-select "handle" column if it exists
      const handleIdx = result.headers.findIndex(
        (h) => h.toLowerCase() === 'handle' || h.toLowerCase() === 'username'
      );
      if (handleIdx >= 0) {
        selectColumn(handleIdx, result);
      }
    };
    reader.readAsText(file);
  }, []);

  const selectColumn = useCallback((index: number, csv: ParsedCsv) => {
    setSelectedColumn(index);

    const values = csv.rows
      .map((row) => row[index])
      .filter((v) => v && v.trim() !== '');

    const looksLikeUrls = values.some((v) => v.startsWith('http'));
    const key = looksLikeUrls ? 'urls' : 'usernames';

    const json = JSON.stringify({ [key]: values }, null, 2);
    setOutputJson(json);
    setCopied(false);

    onHandlesImported?.(values);
  }, [onHandlesImported]);

  // Notify parent when handles are extracted
  useEffect(() => {
    if (selectedColumn !== null && parsed) {
      const values = parsed.rows
        .map((row) => row[selectedColumn])
        .filter((v) => v && v.trim() !== '');
      onHandlesImported?.(values);
    }
  }, [selectedColumn, parsed, onHandlesImported]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleColumnSelect = useCallback((index: number) => {
    if (!parsed) return;
    selectColumn(index, parsed);
  }, [parsed, selectColumn]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = outputJson;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputJson]);

  const handleReset = useCallback(() => {
    setParsed(null);
    setSelectedColumn(null);
    setOutputJson('');
    setFileName('');
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onHandlesCleared?.();
  }, [onHandlesCleared]);

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span className="t-sub">Import Account Handles</span>
          </div>
          {parsed && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X size={14} />
              Clear
            </Button>
          )}
        </div>

        <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
          Upload a CSV with the social media handles you want to scrape.
          The CSV should have a column with account usernames (without the @ symbol).
        </p>

        {!parsed && (
          <div
            className="flex items-start gap-2"
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <Info size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <span className="t-caption" style={{ fontWeight: 500 }}>Example CSV format:</span>
              <pre
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  lineHeight: 1.6,
                  margin: '4px 0 0',
                  color: 'var(--text-secondary)',
                }}
              >
                {`handle\nnatgeo\nfoodnetwork\nnike\nairbnb`}
              </pre>
            </div>
          </div>
        )}

        {!parsed ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: 'var(--space-6)',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'var(--bg-accent, rgba(var(--accent-rgb, 99, 102, 241), 0.05))' : 'var(--bg)',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={28} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }} />
            <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              Drop a CSV file here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* File info */}
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={14} style={{ color: 'var(--accent)' }} />
              <span className="t-caption" style={{ fontWeight: 500 }}>{fileName}</span>
              <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                ({parsed.rows.length} rows, {parsed.headers.length} columns)
              </span>
            </div>

            {/* Column selector */}
            <div>
              <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Which column contains the handles/URLs?
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {parsed.headers.map((header, i) => (
                  <button
                    key={i}
                    onClick={() => handleColumnSelect(i)}
                    className="chip"
                    style={{
                      background: selectedColumn === i ? 'var(--accent)' : undefined,
                      color: selectedColumn === i ? 'white' : undefined,
                      borderColor: selectedColumn === i ? 'var(--accent)' : undefined,
                    }}
                  >
                    {selectedColumn === i && <Check size={12} style={{ marginRight: 4 }} />}
                    {header || `Column ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div>
              <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Preview (first 5 rows)
              </span>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {parsed.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            background: selectedColumn === i ? 'var(--accent)' : undefined,
                            color: selectedColumn === i ? 'white' : undefined,
                          }}
                        >
                          {h || `Col ${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              background: selectedColumn === ci ? 'var(--bg-accent, rgba(var(--accent-rgb, 99, 102, 241), 0.05))' : undefined,
                              fontWeight: selectedColumn === ci ? 500 : undefined,
                            }}
                          >
                            <span className="t-caption">{cell}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Output JSON */}
            {outputJson && (
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                  <span className="t-label">Actor Input JSON</span>
                  <Button variant="default" size="sm" onClick={handleCopy}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                </div>
                <textarea
                  className="input"
                  rows={6}
                  value={outputJson}
                  readOnly
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    resize: 'vertical',
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
