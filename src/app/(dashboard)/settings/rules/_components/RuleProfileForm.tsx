"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRuleProfile } from "@/actions/rule-profiles";
import { useFormState } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import type { RuleSet } from "@/types";

interface RuleProfileFormProps {
  firmId: string;
}

const initialState = {
  success: false,
  message: "",
};

const RULE_DESCRIPTIONS: Record<keyof RuleSet, string> = {
  trim_spaces: "Remove leading and trailing whitespace from values",
  ignore_case: "Treat uppercase and lowercase as equivalent",
  normalize_dates: "Convert dates to standard format (YYYY-MM-DD)",
  remove_separators: "Remove separators like commas, hyphens, and slashes",
  numeric_rounding: "Round numeric values to N decimal places",
};

export function RuleProfileForm({ firmId }: RuleProfileFormProps) {
  const [state, formAction] = useFormState(createRuleProfile, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
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
          placeholder="e.g., Strict Matching"
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
          placeholder="e.g., Rules for strict GST reconciliation matching"
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      {/* Rules */}
      <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
        <p className="text-sm font-medium">Normalization Rules</p>

        {/* Trim Spaces */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="trim_spaces"
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 mt-1"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">Trim Spaces</p>
            <p className="text-xs text-muted-foreground">
              {RULE_DESCRIPTIONS.trim_spaces}
            </p>
          </div>
        </label>

        {/* Ignore Case */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="ignore_case"
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 mt-1"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">Ignore Case</p>
            <p className="text-xs text-muted-foreground">
              {RULE_DESCRIPTIONS.ignore_case}
            </p>
          </div>
        </label>

        {/* Normalize Dates */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="normalize_dates"
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 mt-1"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">Normalize Dates</p>
            <p className="text-xs text-muted-foreground">
              {RULE_DESCRIPTIONS.normalize_dates}
            </p>
          </div>
        </label>

        {/* Remove Separators */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="remove_separators"
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 mt-1"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">Remove Separators</p>
            <p className="text-xs text-muted-foreground">
              {RULE_DESCRIPTIONS.remove_separators}
            </p>
          </div>
        </label>

        {/* Numeric Rounding */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="numeric-rounding-check"
              disabled={isSubmitting}
              onChange={(e) => {
                const input = document.getElementById(
                  "numeric-rounding-input",
                ) as HTMLInputElement;
                if (input) {
                  input.disabled = !e.target.checked;
                }
              }}
              className="h-4 w-4 rounded border-gray-300 mt-1"
            />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">Numeric Rounding</p>
              <p className="text-xs text-muted-foreground">
                {RULE_DESCRIPTIONS.numeric_rounding}
              </p>
            </div>
          </label>
          <Input
            id="numeric-rounding-input"
            type="number"
            name="numeric_rounding"
            placeholder="e.g., 2"
            min="0"
            max="10"
            disabled={true}
            className="ml-7"
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Rule Profile"}
      </Button>
    </form>
  );
}
