'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Mic, MicOff, Calendar, Sparkles, Save, Trash2, Share2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { createDream, getUserDreams, deleteDream, updateDream, type DreamWithMoods } from '@/lib/services/dreams'
import { getAllMoods, type Mood } from '@/lib/services/moods'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const [dreamText, setDreamText] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMoodIds, setSelectedMoodIds] = useState<string[]>([])
  const [hours, setHours] = useState('')
  const [interpretation, setInterpretation] = useState<any>(null)
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [dreamToDelete, setDreamToDelete] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const [dreamToShare, setDreamToShare] = useState<string | null>(null)

  // Dream View/Edit Modal State
  const [viewDream, setViewDream] = useState<DreamWithMoods | null>(null)
  const [isEditingDream, setIsEditingDream] = useState(false)
  const [editDreamTitle, setEditDreamTitle] = useState('')
  const [editDreamContent, setEditDreamContent] = useState('')
  const [isReinterpreting, setIsReinterpreting] = useState(false)

  // Use React Query to fetch data (only when user is authenticated)
  const { data: dreams = [], isLoading: dreamsLoading } = useQuery({
    queryKey: ['user-dreams'],
    queryFn: getUserDreams,
    enabled: !!user,
  })

  const { data: availableMoods = [], isLoading: moodsLoading } = useQuery({
    queryKey: ['moods'],
    queryFn: getAllMoods,
  })

  // Fallback moods if database is empty
  const defaultMoods: Mood[] = [
    { id: 'calm', name: 'Calm', emoji: '😌', color: 'violet', description: 'Peaceful and relaxed' },
    { id: 'anxious', name: 'Anxious', emoji: '😰', color: 'slate', description: 'Worried or nervous' },
    { id: 'inspired', name: 'Inspired', emoji: '✨', color: 'purple', description: 'Creative and motivated' },
    { id: 'curious', name: 'Curious', emoji: '🤔', color: 'indigo', description: 'Inquisitive and wondering' },
    { id: 'joyful', name: 'Joyful', emoji: '😊', color: 'amber', description: 'Happy and content' },
    { id: 'uneasy', name: 'Uneasy', emoji: '😟', color: 'slate', description: 'Uncomfortable or uncertain' },
    { id: 'grateful', name: 'Grateful', emoji: '🙏', color: 'emerald', description: 'Thankful and appreciative' },
  ]

  const moods = availableMoods.length > 0 ? availableMoods : defaultMoods

  const loading = user ? (dreamsLoading || moodsLoading) : moodsLoading

  // Check for pending dream data after login and auto-save it
  useEffect(() => {
    if (user && !authLoading) {
      const pendingDream = localStorage.getItem('pendingDream')
      if (pendingDream) {
        try {
          const dreamData = JSON.parse(pendingDream)
          // Restore the dream data to the form
          setDreamText(dreamData.dreamText || '')
          setSelectedDate(dreamData.selectedDate || new Date().toISOString().split('T')[0])
          setSelectedMoodIds(dreamData.selectedMoodIds || [])
          setHours(dreamData.hours || '')
          setInterpretation(dreamData.interpretation || '')

          // Auto-save the dream
          const title = dreamData.dreamText.split(' ').slice(0, 5).join(' ') || 'Untitled Dream'
          createDreamMutation.mutate({
            title,
            content: dreamData.dreamText,
            dreamDate: dreamData.selectedDate,
            moodIds: dreamData.selectedMoodIds,
            hoursSlept: dreamData.hours ? parseFloat(dreamData.hours) : undefined,
            interpretation: dreamData.interpretation,
          })

          // Clear pending dream data
          localStorage.removeItem('pendingDream')
        } catch (error) {
          console.error('Error processing pending dream:', error)
          localStorage.removeItem('pendingDream')
        }
      }
    }
  }, [user, authLoading])

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true // Allow continuous dictation
      rec.interimResults = true // Show interim results
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsRecording(true)
      }

      rec.onresult = (event: any) => {
        // Only process final results to avoid duplicating text
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript
            setDreamText(prev => {
              const newText = prev + (prev ? ' ' : '') + transcript
              return newText.replace(/\s+/g, ' ').trim()
            })
          }
        }
      }

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        // Don't stop on 'no-speech' error, just keep listening if continuous
        if (event.error !== 'no-speech') {
          setIsRecording(false)
        }
      }

      rec.onend = () => {
        setIsRecording(false)
      }

      setRecognition(rec)
    }
  }, [])

  const renderInterpretation = (interpretation: any) => {
    if (!interpretation) return <span className="italic text-slate-400">No interpretation available yet.</span>;

    let data = interpretation;
    if (typeof interpretation === 'string') {
      try {
        data = JSON.parse(interpretation);
      } catch (e) {
        // Not JSON, just display as text
      }
    }

    if (typeof data === 'object' && data !== null && data.opening) {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div>
            <h4 className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">The Omen</h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-100 font-medium">
              <ReactMarkdown 
                components={{
                  p: ({node, ...props}) => <span {...props} />
                }}
              >
                {data.opening}
              </ReactMarkdown>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">Key Symbols</h4>
            <ul className="space-y-2">
              {data.bullets?.map((bullet: string, idx: number) => (
                <li key={idx} className="flex gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-violet-400 mt-1">•</span>
                  <span className="flex-1">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <span {...props} />
                      }}
                    >
                      {bullet}
                    </ReactMarkdown>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-3 border-t border-violet-100 dark:border-violet-900/40">
            <h4 className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">Guidance</h4>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-100 italic">
              <ReactMarkdown 
                components={{
                  p: ({node, ...props}) => <span {...props} />
                }}
              >
                {data.closing}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-100">
        <ReactMarkdown>{interpretation}</ReactMarkdown>
      </div>
    );
  };

  const toggleMood = (moodId: string) => {
    if (selectedMoodIds.includes(moodId)) {
      setSelectedMoodIds(selectedMoodIds.filter(id => id !== moodId))
    } else if (selectedMoodIds.length < 3) {
      setSelectedMoodIds([...selectedMoodIds, moodId])
    }
  }

  const toggleVoiceRecording = () => {
    if (!recognition) {
      alert('Voice dictation is not supported in this browser. Please use Chrome or Safari.')
      return
    }

    try {
      if (isRecording) {
        recognition.stop()
      } else {
        recognition.start()
      }
    } catch (err) {
      console.error('Error toggling voice recording:', err)
      setIsRecording(false)
    }
  }

  const handleInterpret = async () => {
    if (!dreamText.trim()) return

    setIsInterpreting(true)
    setInterpretation(null)

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText }),
      })

      const data = await response.json()

      if (!response.ok) {
        setInterpretation(data.error || 'The interpreter is temporarily unavailable. Please try again.')
        return
      }

      setInterpretation(data.interpretation || 'Unable to generate interpretation')
    } catch (error) {
      console.error('Interpretation error:', error)
      setInterpretation('Network error. Please check your connection and try again.')
    } finally {
      setIsInterpreting(false)
    }
  }

  const canSave = dreamText.trim() && selectedDate && selectedMoodIds.length > 0 && interpretation

  // Mutation for creating a dream
  const createDreamMutation = useMutation({
    mutationFn: createDream,
    onSuccess: (newDream) => {
      // Update the cache with the new dream
      queryClient.setQueryData(['user-dreams'], (old: DreamWithMoods[] = []) => [newDream, ...old])

      // Reset form
      setDreamText('')
      setSelectedMoodIds([])
      setHours('')
      setInterpretation('')
      setSelectedDate(new Date().toISOString().split('T')[0])
    },
    onError: (error) => {
      console.error('Error saving dream:', error)
      alert('Failed to save dream. Please try again.')
    },
  })

  // Mutation for deleting a dream
  const deleteDreamMutation = useMutation({
    mutationFn: deleteDream,
    onSuccess: (_, dreamId) => {
      // Remove from cache
      queryClient.setQueryData(['user-dreams'], (old: DreamWithMoods[] = []) =>
        old.filter(d => d.id !== dreamId)
      )
      if (viewDream?.id === dreamId) {
        setViewDream(null)
      }
    },
    onError: (error) => {
      console.error('Error deleting dream:', error)
      alert('Failed to delete dream. Please try again.')
    },
  })

  // Mutation for updating a dream
  const updateDreamMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => updateDream(id, updates),
    onSuccess: (updatedDream) => {
      // Update cache
      queryClient.setQueryData(['user-dreams'], (old: DreamWithMoods[] = []) =>
        old.map(d => d.id === updatedDream.id ? updatedDream : d)
      )

      // Update local view state if open
      if (viewDream?.id === updatedDream.id) {
        setViewDream(updatedDream)
      }

      setIsEditingDream(false)
    },
    onError: (error) => {
      console.error('Error updating dream:', error)
      alert('Failed to update dream. Please try again.')
    },
  })

  const handleSaveDream = async () => {
    if (!canSave) return

    // Check if user is authenticated
    if (!user) {
      // Store dream data in localStorage
      const dreamData = {
        dreamText,
        selectedDate,
        selectedMoodIds,
        hours,
        interpretation,
      }
      localStorage.setItem('pendingDream', JSON.stringify(dreamData))

      // Redirect to login with return URL
      router.push('/auth/login?returnTo=/journal&pendingDream=true')
      return
    }

    const title = dreamText.split(' ').slice(0, 5).join(' ') || 'Untitled Dream'

    createDreamMutation.mutate({
      title,
      content: dreamText,
      dreamDate: selectedDate,
      moodIds: selectedMoodIds,
      hoursSlept: hours ? parseFloat(hours) : undefined,
      interpretation,
    })
  }

  const handleDeleteDream = async (dreamId: string) => {
    setDreamToDelete(dreamId)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (dreamToDelete) {
      deleteDreamMutation.mutate(dreamToDelete)
      setDeleteModalOpen(false)
      setDreamToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setDreamToDelete(null)
  }

  const handleShareDream = async (dreamId: string) => {
    setDreamToShare(dreamId)
    setShareModalOpen(true)
  }

  const confirmShare = async () => {
    if (!dreamToShare) return

    try {
      // Update the dream to mark it as shared
      const response = await fetch(`/api/dreams/${dreamToShare}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_shared: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to share dream')
      }

      setShareModalOpen(false)
      setDreamToShare(null)

      // Redirect to DreamSpace
      router.push('/dreamspace')
    } catch (error) {
      console.error('Error sharing dream:', error)
      alert('Failed to share dream. Please try again.')
    }
  }

  const cancelShare = () => {
    setShareModalOpen(false)
    setDreamToShare(null)
  }

  const handleOpenDream = (dream: DreamWithMoods) => {
    setViewDream(dream)
    setEditDreamTitle(dream.title)
    setEditDreamContent(dream.content)
    setIsEditingDream(false)
  }

  const handleSaveDreamUpdate = () => {
    if (!viewDream) return

    updateDreamMutation.mutate({
      id: viewDream.id,
      updates: {
        title: editDreamTitle,
        content: editDreamContent,
      }
    })
  }

  const handleReinterpretDream = async () => {
    if (!viewDream) return

    setIsReinterpreting(true)
    try {
      // Use the *current* content (edited or original) for re-interpretation
      const contentToInterpret = isEditingDream ? editDreamContent : viewDream.content

      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText: contentToInterpret }),
      })

      const data = await response.json()
      const newInterpretation = data.interpretation

      if (newInterpretation) {
        updateDreamMutation.mutate({
          id: viewDream.id,
          updates: {
            interpretation: newInterpretation
          }
        })
      }
    } catch (error) {
      console.error('Re-interpretation error:', error)
      alert('Failed to regenerate interpretation.')
    } finally {
      setIsReinterpreting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-12 journal-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50">Journal</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Capture your dreams, moods, and sleep—then invite an angelic AI to gently interpret what's stirring beneath.</p>
          </div>
          <div className="mt-10 mr-[10px] text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>{new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-violet-400"></span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 dark:text-emerald-300">●</span> Private by default
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left: Dream Notes Input */}
          <section className="dream-border-glow">
            <div className="dream-border-inner p-5 sm:p-6">

              {/* Header with Date and Voice */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dream Notes</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Describe what you remember, in your own words.</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="group flex items-center gap-2 cursor-pointer bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-full px-3 py-1 hover:border-violet-300 transition-colors">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</span>
                    <input
                      type="date"
                      className="bg-transparent text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none w-20 cursor-pointer font-medium"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </label>
                  <button
                    onClick={toggleVoiceRecording}
                    className={`flex items-center gap-1.5 rounded-full p-2 sm:px-3 sm:py-1 transition-colors border ${isRecording
                      ? 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'
                      : 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                      }`}
                    title="Voice Input"
                  >
                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                    <span className="text-[10px] font-medium hidden sm:inline">{isRecording ? 'Listening…' : 'Voice input'}</span>
                  </button>
                </div>
              </div>

              {/* Dream Text Input */}
              <div className="rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400/20 transition-all duration-300 overflow-hidden mb-5 shadow-inner">
                <textarea
                  className="w-full bg-transparent text-sm leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-400/70 px-4 py-4 min-h-[180px] focus:outline-none resize-none"
                  placeholder="I was walking through a forest, but the trees were made of crystal..."
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                />
              </div>

              {/* Moods and Sleep Hours */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moods</span>
                  <div className="flex flex-wrap gap-2">
                    {moodsLoading ? (
                      <div className="text-xs text-slate-400">Loading moods...</div>
                    ) : moods.length > 0 ? (
                      moods.map(mood => {
                        const isSelected = selectedMoodIds.includes(mood.id);
                        // Define colors for each mood
                        const getMoodStyle = (moodName: string) => {
                          const styles: Record<string, { unselected: string; selected: string }> = {
                            'Calm': {
                              unselected: 'bg-violet-100/80 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200',
                              selected: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                            },
                            'Anxious': {
                              unselected: 'bg-slate-200/80 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200',
                              selected: 'bg-slate-500 text-white shadow-lg shadow-slate-500/30'
                            },
                            'Inspired': {
                              unselected: 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200',
                              selected: 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                            },
                            'Curious': {
                              unselected: 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200',
                              selected: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                            },
                            'Joyful': {
                              unselected: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200',
                              selected: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                            },
                            'Uneasy': {
                              unselected: 'bg-slate-200/80 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200',
                              selected: 'bg-slate-600 text-white shadow-lg shadow-slate-600/30'
                            },
                            'Grateful': {
                              unselected: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200',
                              selected: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            },
                          };
                          return styles[moodName] || {
                            unselected: 'bg-slate-100/80 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200',
                            selected: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                          };
                        };

                        const style = getMoodStyle(mood.name);

                        return (
                          <button
                            key={mood.id}
                            onClick={() => toggleMood(mood.id)}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 backdrop-blur-sm ${isSelected ? style.selected : `${style.unselected} hover:scale-105`
                              }`}
                          >
                            {mood.emoji} {mood.name}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-400">No moods available. Please check your database connection.</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="hoursSleep">Sleep Hours</label>
                  <div className="relative">
                    <input
                      id="hoursSleep"
                      type="number"
                      min="0"
                      max="16"
                      step="0.5"
                      value={hours}
                      placeholder="--"
                      className="w-20 bg-white/50 dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 focus:outline-none focus:border-violet-400 transition-colors text-center placeholder:text-slate-300"
                      onChange={(e) => setHours(e.target.value)}
                    />
                    <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">h</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Right: Interpretation */}
          <section className="dream-border-glow h-full">
            <div className="dream-border-inner p-5 sm:p-6 flex flex-col h-full bg-gradient-to-br from-violet-50/30 via-transparent to-transparent dark:from-slate-900/40">

              {/* Header with Interpret Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Interpreter
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-normal">Angel Model</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Tuned to positive, human-centered insights.</span>
                </div>
                <button
                  onClick={handleInterpret}
                  disabled={!dreamText.trim() || isInterpreting}
                  className="glow-button px-4 py-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
                >
                  <span className="flex items-center gap-1.5">
                    Interpret
                    <span>➜</span>
                  </span>
                </button>
              </div>

              {/* Interpretation Display */}
              <div className="flex-1 rounded-2xl bg-violet-50/40 dark:bg-slate-900/60 border border-violet-100 dark:border-slate-700/50 p-4 overflow-y-auto min-h-[180px] shadow-sm">
                {isInterpreting ? (
                  <div className="h-full flex flex-col gap-3 justify-center items-center py-8">
                    <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin"></div>
                    <p className="text-[10px] text-violet-500 font-medium animate-pulse uppercase tracking-widest">Consulting the Oracle...</p>
                  </div>
                ) : interpretation ? (
                  renderInterpretation(interpretation)
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                      <Sparkles className="text-violet-500" size={20} />
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      Your angelic dream interpreter will appear here with a soft, human-centered reflection once you click <span className="text-violet-500 dark:text-violet-300 font-medium">Interpret</span>.
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button and Info */}
              <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  <span>Securely stored · Stripe-ready limits</span>
                </div>
                <button
                  onClick={handleSaveDream}
                  disabled={!canSave || createDreamMutation.isPending}
                  className="glow-button px-4 py-2 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  <span className="flex items-center gap-1.5">
                    {createDreamMutation.isPending ? 'Saving...' : 'Save Dream'}
                  </span>
                </button>
              </div>

            </div>
          </section>
        </div>

        {/* Saved Dreams List */}
        {dreams.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                Saved dreams
                <span className="text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{dreams.length}</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dreams.map(dream => (
                <article
                  key={dream.id}
                  onClick={() => handleOpenDream(dream)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/80 p-3 flex flex-col gap-1 text-xs hover:border-violet-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50 truncate">{dream.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShareDream(dream.id)
                        }}
                        className="text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                        aria-label="Share to DreamSpace"
                        title="Share to DreamSpace"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDream(dream.id)
                        }}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete dream"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(dream.dream_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{dream.snippet}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      {dream.dream_moods?.map(({ mood }) => (
                        <span key={mood.id} className="px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-400/30">
                          {mood.emoji} {mood.name}
                        </span>
                      ))}
                    </div>
                    {dream.hours_slept && <span>{dream.hours_slept}h sleep</span>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Delete Dream?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to delete this dream? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteDreamMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteDreamMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Confirmation Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-4">
                <Share2 className="text-violet-600 dark:text-violet-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Share Dream to DreamSpace?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your dream will be shared publicly in DreamSpace where others can react and comment. Only your dream text will be shared (interpretation will remain private).
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelShare}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmShare}
                className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dream Detail/Edit Modal */}
      {viewDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewDream(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex-1 min-w-0 pr-4">
                {isEditingDream ? (
                  <input
                    type="text"
                    value={editDreamTitle}
                    onChange={(e) => setEditDreamTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Dream Title"
                  />
                ) : (
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                    {viewDream.title}
                  </h3>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(viewDream.dream_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {viewDream.hours_slept && (
                    <>
                      <span>•</span>
                      <span>{viewDream.hours_slept}h sleep</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewDream(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">

              {/* Moods */}
              <div className="flex flex-wrap gap-2">
                {viewDream.dream_moods?.map(({ mood }) => (
                  <span key={mood.id} className="px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-500/30 text-xs font-medium flex items-center gap-1.5">
                    {mood.emoji} {mood.name}
                  </span>
                ))}
              </div>

              {/* Dream Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dream Notes</span>
                  {!isEditingDream && (
                    <button
                      onClick={() => setIsEditingDream(true)}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Edit Text
                    </button>
                  )}
                </div>
                {isEditingDream ? (
                  <textarea
                    value={editDreamContent}
                    onChange={(e) => setEditDreamContent(e.target.value)}
                    className="w-full min-h-[200px] bg-slate-50 dark:bg-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl p-4 focus:outline-none focus:border-violet-500 resize-y"
                    placeholder="Describe your dream..."
                  />
                ) : (
                  <div className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {viewDream.content}
                  </div>
                )}
              </div>

              {/* Interpretation */}
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-white dark:from-slate-900 dark:to-slate-900 border border-violet-100 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-violet-100/50 dark:bg-slate-800/50 border-b border-violet-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500" />
                    <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Interpretation</span>
                  </div>
                  <button
                    onClick={handleReinterpretDream}
                    disabled={isReinterpreting || updateDreamMutation.isPending}
                    className="text-[10px] bg-white dark:bg-slate-800 border border-violet-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 text-violet-600 dark:text-violet-400 px-2 py-1 rounded-md transition-all shadow-sm flex items-center gap-1"
                  >
                    {isReinterpreting ? (
                      <span className="animate-pulse">Interpreting...</span>
                    ) : (
                      <>
                        <span>↻</span> Re-interpret
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  {renderInterpretation(viewDream.interpretation)}
                </div>
              </div>

            </div>

            {/* Modal Footer (only in Edit Mode) */}
            {isEditingDream && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditingDream(false)
                    setEditDreamTitle(viewDream.title)
                    setEditDreamContent(viewDream.content)
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDreamUpdate}
                  disabled={updateDreamMutation.isPending}
                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-slate-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 disabled:opacity-70"
                >
                  <span className="relative px-4 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent leading-5 w-full">
                    {updateDreamMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
