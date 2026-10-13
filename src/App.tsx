import React, { useState } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Database, 
  Layers, 
  Lightbulb, 
  Rocket, 
  MessageSquare,
  Wand2
} from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [quickIdea, setQuickIdea] = useState<string>('');
  const [submittedIdea, setSubmittedIdea] = useState<string | null>(null);

  const categories = [
    { id: 'alle', name: 'Alles' },
    { id: 'dashboard', name: 'Dashboards & Beheer' },
    { id: 'productiviteit', name: 'Productiviteit & Taken' },
    { id: 'tools', name: 'Interactieve Tools' },
    { id: 'creatief', name: 'Creatief & Portfolio' },
  ];

  const projectIdeas = [
    {
      id: '1',
      title: 'Modern Dashboard & Analytics',
      desc: 'Realtime statistieken, visuele grafieken, tabellen en overzichtelijke KPI-kaarten.',
      category: 'dashboard',
      icon: LayoutDashboard,
      badge: 'Populair',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      id: '2',
      title: 'Takenbeheer & Kanban Board',
      desc: 'Projectplanner met drag & drop kolommen, deadlines, labels en filters.',
      category: 'productiviteit',
      icon: CheckCircle2,
      badge: 'Productief',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: '3',
      title: 'Slimme Formulier- of Rekentool',
      desc: 'Offertegenerator, budgetplanner of aangepaste berekeningen met directe export.',
      category: 'tools',
      icon: Code2,
      badge: 'Handig',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      id: '4',
      title: 'Database & Klantenoverzicht (CRM)',
      desc: 'Beheer contacten, statussen, notities en interacties in een soepele interface.',
      category: 'dashboard',
      icon: Database,
      badge: 'Zakelijk',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    {
      id: '5',
      title: 'Interactieve Showcase of Portfolio',
      desc: 'Visuele presentatie van projecten, galerij met filters en stijlvolle typografie.',
      category: 'creatief',
      icon: Wand2,
      badge: 'Design',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    },
    {
      id: '6',
      title: 'Geheugen & Studie / Flashcard Tool',
      desc: 'Interactieve quizzen, spaced repetition en voortgangsstatistieken.',
      category: 'productiviteit',
      icon: Lightbulb,
      badge: 'Leren',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    },
  ];

  const filteredIdeas = selectedCategory === 'alle' 
    ? projectIdeas 
    : projectIdeas.filter(idea => idea.category === selectedCategory);

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;
    setSubmittedIdea(quickIdea.trim());
    setQuickIdea('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block leading-tight">Mijn Studio App</span>
              <span className="text-xs text-slate-500 block">Klaar voor ontwikkeling</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Nederlands actief
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Welkom! Waar kunnen we je mee helpen?
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Hoi! Wat wil je vandaag <span className="text-blue-600">bouwen</span>?
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            De omgeving staat helemaal klaar in het Nederlands. Vertel me gerust wat voor applicatie, functionaliteit of ontwerp je wilt realiseren, dan ga ik direct voor je aan de slag.
          </p>
        </div>

        {/* Snelle prompt input box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-12">
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-base">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Beschrijf je idee of wens
          </div>
          <form onSubmit={handleSubmitIdea} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={quickIdea}
              onChange={(e) => setQuickIdea(e.target.value)}
              placeholder="Bijv. Maak een dashboard voor mijn urenregistratie met grafieken..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Idee vastleggen
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {submittedIdea && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Idee genoteerd in de app:</p>
                <p className="text-slate-700 mt-0.5">"{submittedIdea}"</p>
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  Typ dit gerust in de chat om het direct door te laten bouwen!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Suggesties & Categorieën */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Populaire voorbeelden & concepten</h2>
              <p className="text-sm text-slate-500">Klik op een categorie of kies een richting om te beginnen</p>
            </div>

            {/* Filter tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid van ideeën */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIdeas.map((idea) => {
              const Icon = idea.icon;
              return (
                <div
                  key={idea.id}
                  onClick={() => setQuickIdea(idea.title)}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${idea.color}`}>
                        {idea.badge}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 text-base">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {idea.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Gebruik dit startpunt</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature highlight bar */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Volledig op maat</h4>
              <p className="text-xs text-slate-500 mt-1">Elk onderdeel kan direct aangepast of uitgebreid worden.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Modern & Snel</h4>
              <p className="text-xs text-slate-500 mt-1">React 19, Tailwind CSS en soepele gebruikerservaring.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Direct operationeel</h4>
              <p className="text-xs text-slate-500 mt-1">Typ wat je nodig hebt en zie het meteen live.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
