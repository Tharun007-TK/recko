"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { FieldMapping } from "@/types";

interface FieldMappingEditorProps {
  mappings: FieldMapping[];
  onChange: (mappings: FieldMapping[]) => void;
}

export function FieldMappingEditor({
  mappings,
  onChange,
}: FieldMappingEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addMapping = () => {
    onChange([
      ...mappings,
      { tally_column: "", gst_column: "", is_match_key: false },
    ]);
  };

  const updateMapping = (index: number, updates: Partial<FieldMapping>) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], ...updates };
    onChange(newMappings);
  };

  const removeMapping = (index: number) => {
    onChange(mappings.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Field Mappings</Label>
        <Button type="button" variant="outline" size="sm" onClick={addMapping}>
          + Add Mapping
        </Button>
      </div>

      {mappings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No mappings yet. Click "Add Mapping" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {mappings.map((mapping, index) => (
            <div key={index} className="border rounded-lg">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 flex items-center justify-between"
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <div className="flex items-center gap-3">
                  {expandedIndex === index ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {mapping.tally_column || "Tally Column"} →{" "}
                      {mapping.gst_column || "GST Column"}
                    </p>
                    {mapping.is_match_key && (
                      <p className="text-xs text-muted-foreground">Match Key</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMapping(index);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedIndex === index && (
                <div className="p-4 border-t space-y-4 bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor={`tally-${index}`} className="text-sm">
                      Tally Column Name
                    </Label>
                    <Input
                      id={`tally-${index}`}
                      value={mapping.tally_column}
                      onChange={(e) =>
                        updateMapping(index, {
                          tally_column: e.target.value,
                        })
                      }
                      placeholder="e.g., Ledger Name, Account"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`gst-${index}`} className="text-sm">
                      GST Column Name
                    </Label>
                    <Input
                      id={`gst-${index}`}
                      value={mapping.gst_column}
                      onChange={(e) =>
                        updateMapping(index, { gst_column: e.target.value })
                      }
                      placeholder="e.g., GSTIN, Party Name"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`match-key-${index}`}
                      checked={mapping.is_match_key}
                      onChange={(e) =>
                        updateMapping(index, {
                          is_match_key: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label
                      htmlFor={`match-key-${index}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Use as Match Key (record identifier)
                    </Label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
