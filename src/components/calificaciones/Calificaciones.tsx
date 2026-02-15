import { useEffect, useState, useMemo } from 'react';
import { useCursos, useCalificaciones, useAuth } from '@/hooks/useStore';
import type { Evaluacion, NotaActividad, Grupo } from '@/types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Plus, Users, Sparkles, Brain, Settings, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { StudentCalificaciones } from './StudentCalificaciones';
import { supabase } from '@/lib/supabase';
import { gruposMock } from '@/data/mockData';
import { format } from 'date-fns';

export default function Calificaciones() {
  const { cursos, cursoSeleccionado, setCursoSeleccionado, fetchEstudiantesPorCurso } = useCursos();
  const {
    calificaciones, fetchCalificaciones, saveCalificacion,
    evaluaciones, fetchEvaluaciones, addEvaluacion, deleteEvaluacion,
    notasActividades, saveNotaActividad
  } = useCalificaciones();
  const { usuario } = useAuth();

  const [activeCorte, setActiveCorte] = useState<1 | 2 | 3>(1);
  const [modoGrupal, setModoGrupal] = useState(false);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedActivityForGroup, setSelectedActivityForGroup] = useState<string>('');

  // New Assessment Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvaName, setNewEvaName] = useState('');
  const [newEvaPercent, setNewEvaPercent] = useState(0);
  const [newEvaIsGroup, setNewEvaIsGroup] = useState(false);
  const [newEvaDate, setNewEvaDate] = useState<string>('');

  // Group Creation State
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('manual');

  // AI Logic
  const handleGenerateAI = async () => {
    if (!aiApiKey) {
      setShowApiKeyInput(true);
      return;
    }
    if (!aiPrompt.trim()) return;

    setAiGenerating(true);
    try {
      const prompt = `Actúa como un profesor experto. Genera un examen/quiz estructurado en formato JSON basado en las siguientes instrucciones: 
        "${aiPrompt}"
        
        El JSON debe tener esta estructura exacta (sin markdown, solo JSON):
        {
            "titulo": "Título de la actividad",
            "descripcion": "Breve descripción",
            "preguntas": [
                {
                    "id": 1,
                    "texto": "¿Pregunta?",
                    "opciones": ["A", "B", "C", "D"],
                    "respuestaCorrecta": "Índice (0-3) o texto de la respuesta"
                }
            ]
        }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${aiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
        const cleanJson = jsonMatch[1] || text;

        try {
          const parsed = JSON.parse(cleanJson);
          setNewEvaName(parsed.titulo || "Nota Generada por IA");
          setGeneratedContent(parsed);
          setActiveTab('manual'); // Switch back to manual to review/save
          alert("¡Contenido generado! Revisa el título y guarda la actividad.");
        } catch (e) {
          console.error("Error parsing JSON", e);
          alert("La IA generó texto pero no era JSON válido. Intenta ser más específico.");
        }
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      alert(`Error al generar con IA: ${error.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const saveApiKey = (key: string) => {
    setAiApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeyInput(false);
  };

  // Initial Data Load
  useEffect(() => {
    if (cursoSeleccionado) {
      fetchEstudiantesPorCurso(cursoSeleccionado.id);
      fetchCalificaciones(cursoSeleccionado.id);
      fetchEvaluaciones(cursoSeleccionado.id);
      fetchGrupos(cursoSeleccionado.id);
    }
  }, [cursoSeleccionado]);

  // Fetch Groups
  const fetchGrupos = async (cursoId: string) => {
    try {
      const { data, error } = await supabase.from('grupos').select('*').eq('curso_id', cursoId);
      if (data) {
        // Map DB group string[] to Grupo interface
        const mapped: Grupo[] = data.map((g: any) => ({
          id: g.id,
          cursoId: g.curso_id,
          nombre: g.nombre,
          descripcion: g.descripcion,
          integrantes: g.integrantes || [],
          fechaCreacion: new Date(g.fecha_creacion)
        }));
        setGrupos(mapped);
      } else {
        // Fallback to mock if DB empty
        const mocks = gruposMock.filter(g => g.cursoId === cursoId);
        setGrupos(mocks);
      }
    } catch (e) {
      console.error("Error fetching groups", e);
      // Fallback
      setGrupos(gruposMock.filter(g => g.cursoId === cursoId));
    }
  };

  // Filter Evaluations by active Corte
  const currentEvaluations = useMemo(() =>
    evaluaciones.filter(e => e.corte === activeCorte),
    [evaluaciones, activeCorte]);

  // Validate Percentage Sum
  const totalPercentage = currentEvaluations.reduce((acc, curr) => acc + curr.porcentaje, 0);
  const remainingPercentage = 100 - totalPercentage;

  if (usuario?.rol === 'estudiante') {
    return <StudentCalificaciones />;
  }

  // Handlers
  const handleCreateEvaluacion = async () => {
    if (!cursoSeleccionado) return;
    if (newEvaPercent > remainingPercentage) {
      alert(`El porcentaje excede el límite disponible (${remainingPercentage}%)`);
      return;
    }

    try {
      await addEvaluacion({
        id: '', // Generated by DB
        cursoId: cursoSeleccionado.id,
        corte: activeCorte,
        nombre: newEvaName,
        porcentaje: newEvaPercent,
        esGrupal: newEvaIsGroup,
        fecha: newEvaDate ? new Date(newEvaDate) : undefined,
        contenido: generatedContent,
        instruccionesAi: aiPrompt,
        tipoGeneracion: generatedContent ? 'ia' : 'manual'
      });

      setIsDialogOpen(false);
      setNewEvaName('');
      setNewEvaPercent(0);
      setNewEvaIsGroup(false);
      setNewEvaDate('');
    } catch (error: any) {
      console.error("Error creating evaluation:", error);
      alert("Error creando actividad: " + (error.message || "Unknown error"));
    }
  };

  const handleCreateGroup = async () => {
    if (!cursoSeleccionado || !newGroupName || newGroupMembers.length === 0) {
      alert("Completa el nombre y selecciona al menos un estudiante.");
      return;
    }

    try {
      const { data, error } = await supabase.from('grupos').insert({
        id: `grp-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID gen until DB sequence/uuid is confirmed
        curso_id: cursoSeleccionado.id,
        nombre: newGroupName,
        integrantes: newGroupMembers,
        fecha_creacion: new Date()
      }).select().single();

      if (error) throw error;

      if (data) {
        setGrupos(prev => [...prev, {
          id: data.id,
          cursoId: data.curso_id,
          nombre: data.nombre,
          integrantes: data.integrantes || [],
          fechaCreacion: new Date(data.fecha_creacion)
        }]);
        setIsGroupDialogOpen(false);
        setNewGroupName('');
        setNewGroupMembers([]);
      }
    } catch (e: any) {
      console.error("Error creating group", e);
      alert("Error creando grupo: " + e.message);
    }
  };

  const handleGradeChange = (estudianteId: string, evaluacionId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 5) return;

    const nota: NotaActividad = {
      id: `temp-${estudianteId}-${evaluacionId}`, // ID logic handled in hook
      evaluacionId,
      estudianteId,
      valor: num,
      updatedAt: new Date()
    };

    saveNotaActividad(nota);
  };

  const handleGroupGradeChange = (grupoId: string, value: string) => {
    if (!selectedActivityForGroup) return;

    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 5) return;

    const grupo = grupos.find(g => g.id === grupoId);
    if (grupo) {
      grupo.integrantes.forEach(studentId => {
        handleGradeChange(studentId, selectedActivityForGroup, value);
      });
    }
  };

  const toggleGroupMember = (studentId: string) => {
    setNewGroupMembers(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Calculate Final Grade for a Student in the current Corte
  const calculateCorteGrade = (estudianteId: string) => {
    let total = 0;
    currentEvaluations.forEach(eva => {
      const nota = notasActividades.find(n => n.evaluacionId === eva.id && n.estudianteId === estudianteId);
      if (nota) {
        total += (nota.valor * (eva.porcentaje / 100));
      }
    });
    return total.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Calificaciones</h2>
          <p className="text-muted-foreground">Administra actividades, pesos y notas por corte académico.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={(v) => setCursoSeleccionado(cursos.find(c => c.id === v) || null)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder={cursoSeleccionado ? cursoSeleccionado.nombre : "Seleccionar curso..."} />
            </SelectTrigger>
            <SelectContent>
              {cursos.map(curso => (
                <SelectItem key={curso.id} value={curso.id}>{curso.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!cursoSeleccionado ? (
        <Card className="border-dashed py-10 text-center">
          <div className="flex justify-center mb-4">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">Selecciona un curso</h3>
          <p className="text-muted-foreground">Para comenzar a gestionar las calificaciones.</p>
        </Card>
      ) : (
        <>
          {/* Corte Selection Tabs */}
          <Tabs defaultValue="1" onValueChange={(v) => setActiveCorte(parseInt(v) as 1 | 2 | 3)} className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="1">Corte 1 (30%)</TabsTrigger>
                <TabsTrigger value="2">Corte 2 (30%)</TabsTrigger>
                <TabsTrigger value="3">Corte 3 (40%)</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border">
                <Users className={`h-4 w-4 ${modoGrupal ? 'text-blue-600' : 'text-slate-400'}`} />
                <Label htmlFor="mode-grupal" className="text-sm font-medium cursor-pointer">Modo Grupal</Label>
                <Switch id="mode-grupal" checked={modoGrupal} onCheckedChange={setModoGrupal} />
              </div>
            </div>

            {/* Content for the active tab (Corte) */}
            <TabsContent value={activeCorte.toString()} className="space-y-4">

              {/* Controls Bar: Add Activity & Stats */}
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Peso Total Asignado</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${totalPercentage > 100 ? 'text-red-500' : totalPercentage === 100 ? 'text-green-600' : 'text-orange-500'}`}>
                        {totalPercentage}%
                      </span>
                      <span className="text-xs text-muted-foreground">de 100%</span>
                    </div>
                  </div>
                  {totalPercentage < 100 && (
                    <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">
                      Falta asignar {remainingPercentage}%
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={totalPercentage >= 100}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Actividad
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Actividad - Corte {activeCorte}</DialogTitle>
                        <DialogDescription>
                          Define el nombre y porcentaje de la actividad.
                        </DialogDescription>
                      </DialogHeader>


                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="manual">Manual</TabsTrigger>
                          <TabsTrigger value="ai" className="gap-2"><Sparkles className="w-3 h-3 text-purple-500" /> Asistente IA</TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="space-y-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" value={newEvaName} onChange={e => setNewEvaName(e.target.value)} className="col-span-3" placeholder="Ej: Quiz 1" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="percent" className="text-right">Porcentaje</Label>
                            <div className="col-span-3 flex items-center gap-2">
                              <Input
                                id="percent"
                                type="number"
                                max={remainingPercentage}
                                value={newEvaPercent}
                                onChange={e => setNewEvaPercent(parseFloat(e.target.value))}
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Fecha</Label>
                            <div className="col-span-3 flex items-center gap-2">
                              <Input
                                id="date"
                                type="date"
                                value={newEvaDate}
                                onChange={e => setNewEvaDate(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="isGroup" className="text-right">Grupal</Label>
                            <div className="flex items-center space-x-2 col-span-3">
                              <Switch id="isGroup" checked={newEvaIsGroup} onCheckedChange={setNewEvaIsGroup} />
                              <span className="text-sm text-muted-foreground">Esta actividad se califica por grupos</span>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="ai" className="space-y-4 py-4">
                          {!aiApiKey ? (
                            <div className="text-center p-6 border-2 border-dashed rounded-lg bg-slate-50">
                              <Brain className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                              <h3 className="font-semibold text-slate-700">Configura tu IA</h3>
                              <p className="text-sm text-muted-foreground mb-4">Necesitas una API Key de Google Gemini para usar esta función.</p>
                              <Button variant="outline" onClick={() => setShowApiKeyInput(true)}>
                                <Settings className="w-4 h-4 mr-2" /> Configurar API Key
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <Label>Instrucciones</Label>
                                <Button variant="ghost" size="sm" onClick={() => setShowApiKeyInput(true)} className="h-6 px-2 text-xs">
                                  <Settings className="w-3 h-3 mr-1" /> Cambiar Key
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Ej: Genera un quiz de 5 preguntas sobre React Hooks básicos (useState, useEffect) con opciones múltiples."
                                className="min-h-[120px]"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                              />
                              <div className="text-xs text-muted-foreground bg-purple-50 text-purple-700 p-2 rounded flex gap-2">
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>La IA generará el título, descripción y preguntas automáticamente. Luego podrás revisar y guardar.</span>
                              </div>
                              <Button
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                onClick={handleGenerateAI}
                                disabled={aiGenerating || !aiPrompt.trim()}
                              >
                                {aiGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="w-4 h-4 mr-2" /> Generar Quiz
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>

                      {/* API Key Dialog */}
                      <Dialog open={showApiKeyInput} onOpenChange={setShowApiKeyInput}>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Configurar Gemini API</DialogTitle>
                            <DialogDescription>
                              Ingresa tu API Key de Google Gemini (AI Studio). Se guardará localmente en tu navegador.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid items-center gap-4">
                              <Input
                                type="password"
                                placeholder="AIzaVy..."
                                value={aiApiKey}
                                onChange={(e) => setAiApiKey(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Puedes obtenerla gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline text-blue-600">Google AI Studio</a>.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => saveApiKey(aiApiKey)}>Guardar Key</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateEvaluacion}>Crear Actividad</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Group Creation Dialog */}
                  {modoGrupal && (
                    <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary">
                          <Users className="mr-2 h-4 w-4" /> Nuevo Grupo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                          <DialogDescription>Asigna un nombre y selecciona los estudiantes.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gname" className="text-right">Nombre</Label>
                            <Input id="gname" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="col-span-3" placeholder="Ej: Grupo 1" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Integrantes ({newGroupMembers.length})</Label>
                            <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
                              {cursoSeleccionado?.estudiantes && cursoSeleccionado.estudiantes.length > 0 ? (
                                cursoSeleccionado.estudiantes.map(est => (
                                  <div key={est.estudianteId} className="flex items-center space-x-2 hover:bg-slate-50 p-1 rounded">
                                    <input
                                      type="checkbox"
                                      id={`st-${est.estudianteId}`}
                                      checked={newGroupMembers.includes(est.estudianteId)}
                                      onChange={() => toggleGroupMember(est.estudianteId)}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`st-${est.estudianteId}`} className="text-sm cursor-pointer w-full">
                                      {est.nombre} {est.apellido}
                                    </label>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-muted-foreground p-4">No hay estudiantes en este curso.</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateGroup}>Guardar Grupo</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {/* Main Grading Area */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>Planilla de Notas</CardTitle>
                    {modoGrupal && (
                      <Select value={selectedActivityForGroup} onValueChange={setSelectedActivityForGroup}>
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Seleccionar Actividad Grupal" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentEvaluations.filter(e => e.esGrupal).map(eva => (
                            <SelectItem key={eva.id} value={eva.id}>{eva.nombre} ({eva.porcentaje}%)</SelectItem>
                          ))}
                          {currentEvaluations.filter(e => e.esGrupal).length === 0 && (
                            <SelectItem value="none" disabled>No hay actividades grupales</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Logic Switch: Student Table vs Group Input */}
                  {!modoGrupal ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px] sticky left-0 bg-white z-10">Estudiante</TableHead>
                            {currentEvaluations.map(eva => (
                              <TableHead key={eva.id} className="text-center min-w-[100px]">
                                <div className="flex flex-col items-center group relative">
                                  <span className="font-medium">{eva.nombre}</span>
                                  <div className="flex flex-col text-[10px] text-muted-foreground leading-tight">
                                    <span>{eva.porcentaje}%</span>
                                    {eva.fecha && <span>{new Date(eva.fecha).toLocaleDateString()}</span>}
                                  </div>
                                  {eva.esGrupal && <Users className="h-3 w-3 text-blue-500 absolute top-0 right-0" />}
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Eliminar actividad? Se borrarán las notas asociadas.')) deleteEvaluacion(eva.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-all"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="text-center font-bold bg-slate-50 text-slate-900 w-[100px]">Total Corte</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cursoSeleccionado.estudiantes.map(est => (
                            <TableRow key={est.estudianteId}>
                              <TableCell className="sticky left-0 bg-white z-10 font-medium">
                                <div className="flex flex-col">
                                  <span>{est.nombre || 'Estudiante'} {est.apellido}</span>
                                  <span className="text-xs text-muted-foreground">{est.codigo}</span>
                                </div>
                              </TableCell>
                              {currentEvaluations.map(eva => {
                                const nota = notasActividades.find(n => n.evaluacionId === eva.id && n.estudianteId === est.estudianteId);
                                return (
                                  <TableCell key={eva.id} className="text-center p-1">
                                    <Input
                                      className="w-16 mx-auto text-center h-8"
                                      type="number"
                                      step="0.1" min="0" max="5"
                                      defaultValue={nota?.valor}
                                      onBlur={(e) => handleGradeChange(est.estudianteId, eva.id, e.target.value)}
                                    />
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center font-bold bg-slate-50">
                                {calculateCorteGrade(est.estudianteId)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {cursoSeleccionado.estudiantes.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={currentEvaluations.length + 2} className="text-center py-8 text-muted-foreground">
                                No hay estudiantes inscritos
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    // Group View
                    <div className="space-y-4">
                      {!selectedActivityForGroup ? (
                        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>Selecciona una actividad grupal arriba para comenzar a calificar.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {grupos.map(grupo => (
                            <Card key={grupo.id} className="border shadow-sm">
                              <CardHeader className="p-4 pb-2 bg-slate-50 rounded-t-lg">
                                <CardTitle className="text-base font-bold flex justify-between">
                                  {grupo.nombre}
                                  <Badge variant="secondary">ID: {grupo.id.slice(0, 6)}</Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">Integrantes:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {grupo.integrantes.map(id => {
                                      const st = cursoSeleccionado.estudiantes.find(e => e.estudianteId === id);
                                      return (
                                        <Badge key={id} variant="outline" className="text-xs bg-white">
                                          {st ? `${st.nombre?.split(' ')[0]} ${st.apellido?.split(' ')[0]}` : id}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="pt-2 border-t mt-2">
                                  <Label className="text-xs mb-1.5 block">Nota del Grupo</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      step="0.1" max="5" min="0"
                                      placeholder="0.0"
                                      className="font-bold text-center text-lg h-10"
                                      onBlur={(e) => handleGroupGradeChange(grupo.id, e.target.value)}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Se aplicará a {grupo.integrantes.length} estudiantes.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Footer Info */}
              <div className="flex items-center text-sm text-muted-foreground bg-blue-50 p-3 rounded text-blue-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                Tip: Los cambios en las notas se guardan automáticamente al salir del campo (perder el foco).
              </div>
            </TabsContent>
          </Tabs>
        </>
      )
      }
    </div >
  );
}
