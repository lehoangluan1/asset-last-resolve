import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { categories, departments, locations } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  return (
    <div>
      <PageHeader title="Admin / Reference Data" description="Manage categories, departments, locations, and other reference data" />
      <div className="p-6">
        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Asset Categories</CardTitle>
                <Button size="sm" onClick={() => toast.info('Add category')}><Plus className="h-4 w-4 mr-1.5" />Add</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                <TableBody>
                  {categories.map(c => <TableRow key={c.id}><TableCell className="font-mono text-xs">{c.code}</TableCell><TableCell className="font-medium">{c.name}</TableCell><TableCell className="text-sm text-muted-foreground">{c.description}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Departments</CardTitle>
                <Button size="sm" onClick={() => toast.info('Add department')}><Plus className="h-4 w-4 mr-1.5" />Add</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Employees</TableHead></TableRow></TableHeader>
                <TableBody>
                  {departments.map(d => <TableRow key={d.id}><TableCell className="font-mono text-xs">{d.code}</TableCell><TableCell className="font-medium">{d.name}</TableCell><TableCell className="text-sm">{d.location}</TableCell><TableCell className="text-sm">{d.employeeCount}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <Card className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Locations</CardTitle>
                <Button size="sm" onClick={() => toast.info('Add location')}><Plus className="h-4 w-4 mr-1.5" />Add</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Building</TableHead><TableHead>Floor</TableHead><TableHead>Room</TableHead></TableRow></TableHeader>
                <TableBody>
                  {locations.map(l => <TableRow key={l.id}><TableCell className="font-medium">{l.name}</TableCell><TableCell className="text-sm">{l.building}</TableCell><TableCell className="text-sm">{l.floor}</TableCell><TableCell className="text-sm">{l.room || '—'}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
