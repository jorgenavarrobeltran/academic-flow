
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Folder,
    FileText,
    Award,
    Link as LinkIcon,
    ExternalLink,
    Plus,
    Github,
    Youtube,
    Image as ImageIcon
} from 'lucide-react';

interface Proyecto {
    id: string;
    titulo: string;
    descripcion: string;
    tags: string[];
    fecha: Date;
    imagenUrl?: string;
    links: { tipo: 'github' | 'youtube' | 'web' | 'otro', url: string }[];
}

interface Logro {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: Date;
    icono: string;
    color: string;
}

const mockProyectos: Proyecto[] = [
    {
        id: 'p1',
        titulo: 'Sistema de Gestión de Biblioteca',
        descripcion: 'Aplicación web desarrollada con React y Node.js para administrar el inventario de una biblioteca escolar.',
        tags: ['React', 'Node.js', 'PostgreSQL'],
        fecha: new Date('2024-11-15'),
        imagenUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        links: [
            { tipo: 'github', url: 'https://github.com/student/library-app' },
            { tipo: 'web', url: 'https://library-demo.netlify.app' }
        ]
    },
    {
        id: 'p2',
        titulo: 'Análisis de Datos Climáticos',
        descripcion: 'Script de Python para procesar grandes volúmenes de datos meteorológicos y generar visualizaciones.',
        tags: ['Python', 'Pandas', 'Matplotlib'],
        fecha: new Date('2025-02-01'),
        links: [
            { tipo: 'github', url: 'https://github.com/student/climate-analysis' }
        ]
    }
];

const mockLogros: Logro[] = [
    {
        id: 'l1',
        titulo: 'Mejor Promedio Semestral',
        descripcion: 'Obtuviste un promedio de 4.8 en el periodo 2024-2.',
        fecha: new Date('2024-12-20'),
        icono: 'award',
        color: 'bg-yellow-500'
    },
    {
        id: 'l2',
        titulo: 'Participación Hackathon',
        descripcion: 'Finalista en la Hackathon Regional 2024.',
        fecha: new Date('2024-10-10'),
        icono: 'code',
        color: 'bg-blue-500'
    }
];

export default function Portafolio() {


    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Portafolio Digital
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Exhibe tus proyectos académicos y logros destacados
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proyecto
                </Button>
            </div>

            <Tabs defaultValue="proyectos" className="w-full">
                <TabsList>
                    <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
                    <TabsTrigger value="logros">Logros y Certificados</TabsTrigger>
                    <TabsTrigger value="cv">Hoja de Vida</TabsTrigger>
                </TabsList>

                <TabsContent value="proyectos" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockProyectos.map(proyecto => (
                            <Card key={proyecto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                {proyecto.imagenUrl ? (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={proyecto.imagenUrl}
                                            alt={proyecto.titulo}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-slate-100 flex items-center justify-center">
                                        <ImageIcon className="h-12 w-12 text-slate-300" />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle>{proyecto.titulo}</CardTitle>
                                    <CardDescription className="line-clamp-3">
                                        {proyecto.descripcion}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {proyecto.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 p-4 flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                        {proyecto.fecha.toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                        {proyecto.links.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                                title={link.tipo}
                                            >
                                                {link.tipo === 'github' && <Github className="h-4 w-4" />}
                                                {link.tipo === 'youtube' && <Youtube className="h-4 w-4 text-red-500" />}
                                                {link.tipo === 'web' && <ExternalLink className="h-4 w-4 text-blue-500" />}
                                                {link.tipo === 'otro' && <LinkIcon className="h-4 w-4" />}
                                            </a>
                                        ))}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="logros" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockLogros.map(logro => (
                            <Card key={logro.id} className="flex items-center p-4 gap-4">
                                <div className={`p-4 rounded-full ${logro.color} text-white shadow-lg`}>
                                    <Award className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{logro.titulo}</h3>
                                    <p className="text-muted-foreground">{logro.descripcion}</p>
                                    <span className="text-xs text-slate-400 mt-1 block">
                                        {logro.fecha.toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="cv" className="mt-6">
                    <Card className="p-8 text-center border-dashed">
                        <div className="mx-auto bg-slate-50 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                            <FileText className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium">Hoja de Vida no cargada</h3>
                        <p className="text-muted-foreground mb-4">Sube tu CV en formato PDF para que las empresas lo vean.</p>
                        <Button variant="outline">
                            <Folder className="mr-2 h-4 w-4" />
                            Subir Archivo
                        </Button>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
