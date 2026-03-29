"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EntityCardProps {
  title: string;
  subtitle?: string;
  status?: "active" | "archived" | "inactive";
  countLabel?: string;
  count?: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntityCard({
  title,
  subtitle,
  status = "active",
  countLabel,
  count,
  onClick,
  onEdit,
  onDelete,
}: EntityCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden"
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
      
      <CardHeader className="pb-3 pt-5 pl-5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
            {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
          </div>
          {status === 'active' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pl-5 pb-4">
        <div className="flex items-center justify-between mt-2">
          {countLabel !== undefined && count !== undefined ? (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{count}</span> {countLabel}
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-2 h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
