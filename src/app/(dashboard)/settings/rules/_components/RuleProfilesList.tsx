"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { deleteRuleProfile } from "@/actions/rule-profiles";
import { useState } from "react";
import type { RuleProfile } from "@/types";

interface RuleProfilesListProps {
  initialProfiles: RuleProfile[];
  firmId: string;
}

export function RuleProfilesList({
  initialProfiles,
  firmId,
}: RuleProfilesListProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    setDeleting(profileId);
    try {
      const result = await deleteRuleProfile(profileId);
      if (result.success) {
        setProfiles(profiles.filter((p) => p.id !== profileId));
      }
    } finally {
      setDeleting(null);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No rule profiles yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                {profile.description && (
                  <CardDescription className="mt-1">
                    {profile.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting === profile.id}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(profile.id)}
                  disabled={deleting === profile.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Trim Spaces */}
                <div className="flex items-center gap-2">
                  {profile.rules.trim_spaces ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Trim Spaces</span>
                </div>

                {/* Ignore Case */}
                <div className="flex items-center gap-2">
                  {profile.rules.ignore_case ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Ignore Case</span>
                </div>

                {/* Normalize Dates */}
                <div className="flex items-center gap-2">
                  {profile.rules.normalize_dates ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Normalize Dates</span>
                </div>

                {/* Remove Separators */}
                <div className="flex items-center gap-2">
                  {profile.rules.remove_separators ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Remove Separators</span>
                </div>
              </div>

              {/* Numeric Rounding */}
              {profile.rules.numeric_rounding !== null && (
                <div className="text-sm">
                  <Badge variant="secondary">
                    Numeric Rounding: {profile.rules.numeric_rounding} decimal
                    places
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
