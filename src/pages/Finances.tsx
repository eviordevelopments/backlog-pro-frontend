import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialCalculators from "@/components/finances/FinancialCalculators";
import TransactionManager from "@/components/finances/TransactionManager";
import FinancialOverview from "@/components/finances/FinancialOverview";
import ProjectFinanceView from "@/components/finances/ProjectFinanceView";

export default function Finances() {
  const { currentProject } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Finances</h1>
        <p className="text-muted-foreground mt-2">
          {currentProject 
            ? `Financial management for ${currentProject.name}` 
            : "Manage your financial data and metrics"}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="calculators">Calculators</TabsTrigger>
          <TabsTrigger value="project">Project Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionManager />
        </TabsContent>

        <TabsContent value="calculators" className="space-y-6">
          <FinancialCalculators />
        </TabsContent>

        <TabsContent value="project" className="space-y-6">
          <ProjectFinanceView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
