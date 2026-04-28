import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function FinanceBlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'How to Build an Emergency Fund',
      excerpt: 'Learn the importance of having an emergency fund and how to start building one today.',
      date: 'December 20, 2025',
      category: 'Savings',
    },
    {
      id: 2,
      title: 'Understanding Investment Basics',
      excerpt: 'A beginner-friendly guide to understanding different investment options and strategies.',
      date: 'December 18, 2025',
      category: 'Investment',
    },
    {
      id: 3,
      title: 'Smart Budgeting Tips for 2025',
      excerpt: 'Practical tips and strategies to help you budget effectively in the new year.',
      date: 'December 15, 2025',
      category: 'Budgeting',
    },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Finance Blog</h1>
        <p className="text-muted-foreground">Learn about personal finance, investing, and money management.</p>
      </div>

      {/* Blog Posts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Card key={post.id} className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">{post.category}</span>
              </div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="text-xs text-muted-foreground">{post.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
