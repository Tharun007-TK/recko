"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { deleteMappingProfile } from "@/actions/mapping-profiles";
import { useState } from "react";
import type { MappingProfile } from "@/types";

interface MappingProfilesListProps {
  initialProfiles: MappingProfile[];
  firmId: string;
}

export function MappingProfilesList({
  initialProfiles,
  firmId,
}: MappingProfilesListProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    setDeleting(profileId);
    try {
      const result = await deleteMappingProfile(profileId);
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
          No mapping profiles yet. Create one to get started.
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
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {profile.mappings.length} mapping
                {profile.mappings.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-1">
                {profile.mappings.slice(0, 3).map((mapping, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {mapping.tally_column} → {mapping.gst_column}
                    {mapping.is_match_key && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        Match Key
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {profile.mappings.length > 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{profile.mappings.length - 3} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
