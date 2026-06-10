"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldMappingEditor } from "@/components/shared/FieldMappingEditor";
import { createMappingProfile } from "@/actions/mapping-profiles";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { FieldMapping } from "@/types";

interface MappingProfileFormProps {
  firmId: string;
}

const initialState = {
  success: false,
  message: "",
};

export function MappingProfileForm({ firmId }: MappingProfileFormProps) {
  const [state, formAction] = useActionState(createMappingProfile, initialState);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    // Add mappings to form data
    formData.set("mappings", JSON.stringify(mappings));
    setIsSubmitting(true);
    try {
      await formAction(formData);
      if (state.success) {
        setMappings([]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleFormAction} className="space-y-4">
      {state.message && (
        <Alert
          variant={state.success ? "default" : "destructive"}
          className={state.success ? "border-green-200 bg-green-50" : ""}
        >
          {state.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="font-medium">
          Profile Name *
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., Standard GST Mapping"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="e.g., Standard mapping for GST reconciliation"
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <FieldMappingEditor mappings={mappings} onChange={setMappings} />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Mapping Profile"}
      </Button>
    </form>
  );
}
