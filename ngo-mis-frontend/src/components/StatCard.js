import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const StatCard = ({ title, value, icon, description }) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {React.cloneElement(icon, { className: "absolute right-4 top-4 h-12 w-12 text-muted-foreground opacity-10" })}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-lg" /> {/* Emerald Green underline */}
  </Card>
);

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </CardContent>
  </Card>
);

export { StatCard, StatCardSkeleton };
