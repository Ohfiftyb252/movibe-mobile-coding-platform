import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderGit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import type { Project } from '@shared/types';
import { useProjectStore } from '@/stores/project-store';
import { Toaster, toast } from '@/components/ui/sonner';
export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const createProject = useProjectStore((s) => s.createProject);
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true);
        const projectsData = await api<{ items: Project[] }>('/api/projects');
        setProjects(projectsData.items);
      } catch (error) {
        toast.error('Failed to load projects.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.warning('Please enter a project name.');
      return;
    }
    setIsCreating(true);
    try {
      const newProjectId = await createProject(newProjectName.trim());
      if (newProjectId) {
        toast.success(`Project "${newProjectName.trim()}" created!`);
        setIsDialogOpen(false);
        setNewProjectName('');
        navigate(`/project/${newProjectId}`);
      } else {
        throw new Error('Project creation failed.');
      }
    } catch (error) {
      toast.error('Failed to create project.');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-8 md:py-10 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Movibe Projects</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Give your new project a name. Click create when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="name"
                  placeholder="My Awesome App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  disabled={isCreating}
                />
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateProject} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>
        <main className="py-8 md:py-10 lg:py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <Link to={`/project/${project.id}`} key={project.id}>
                  <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <FolderGit2 className="h-6 w-6 text-indigo-500" />
                        <CardTitle className="truncate">{project.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription>
                        Contains {Object.keys(project.files).length} files.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold text-foreground">No Projects Yet</h2>
              <p className="text-muted-foreground mt-2">
                Get started by creating your first project.
              </p>
              <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          )}
        </main>
      </div>
      <footer className="text-center py-6 text-sm text-muted-foreground">
        Built with ❤️ at Cloudflare
      </footer>
      <Toaster richColors />
    </div>
  );
}