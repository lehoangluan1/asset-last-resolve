import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, HttpError } from '@/lib/api';
import { Search, SearchX } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const resultsQuery = useQuery({
    queryKey: ['global-search', query],
    queryFn: () => api.search.global(query),
    enabled: query.length > 0,
  });

  const title = query ? `Results for "${query}"` : 'Global Search';
  const description = query
    ? `${resultsQuery.data?.totalResults ?? 0} matching records across the modules you can access`
    : 'Use the top search bar to look across assets, users, workflows, and verification records.';

  return (
    <div>
      <PageHeader title="Search Results" description={description} />
      <div className="p-6">
        {!query ? (
          <EmptyState
            icon={<Search className="h-8 w-8 text-muted-foreground" />}
            title="Start with the top search bar"
            description="Enter a keyword such as an asset code, user name, borrow purpose, or campaign code to search across the modules available to your role."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {title}. {resultsQuery.isLoading
                ? `Searching for "${query}"...`
                : `${resultsQuery.data?.totalResults ?? 0} result(s) loaded with backend access control.`}
            </div>
            {resultsQuery.isLoading ? (
              <div className="rounded-xl border bg-card p-10 text-sm text-muted-foreground">Searching for "{query}"...</div>
            ) : resultsQuery.isError ? (
              <EmptyState
                icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
                title="Search is unavailable"
                description={resultsQuery.error instanceof HttpError ? resultsQuery.error.message : 'Unable to load search results right now.'}
              />
            ) : resultsQuery.data && resultsQuery.data.totalResults === 0 ? (
              <EmptyState
                icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
                title={`No matches for "${query}"`}
                description="Try a broader keyword or search by asset code, person name, or workflow identifier. Results are automatically scoped to what your account is allowed to view."
              />
            ) : (
              resultsQuery.data?.sections.map(section => (
                <Card key={section.key} className="rounded-xl shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div>
                      <CardTitle className="text-lg">{section.label}</CardTitle>
                      <CardDescription>
                        {section.totalItems} matching {section.totalItems === 1 ? 'record' : 'records'}
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={section.href}>Open module</Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.items.map(item => (
                      <Link
                        key={`${section.key}-${item.id}`}
                        to={item.href}
                        className="block rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          </div>
                          {item.status && <StatusBadge status={item.status} />}
                        </div>
                      </Link>
                    ))}
                    {section.totalItems > section.items.length && (
                      <p className="text-xs text-muted-foreground">
                        Showing the first {section.items.length} of {section.totalItems} matches in {section.label.toLowerCase()}.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
