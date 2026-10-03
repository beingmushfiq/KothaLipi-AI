import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EngineProvider } from './context/EngineContext';
import { EngineStatusBanner } from './components/EngineStatusBanner';
import { Navbar } from './components/Navbar';
import { OcrWorkspace } from './components/OcrWorkspace';
import { WritingAssistant } from './components/WritingAssistant';
import { VoiceWorkspace } from './components/VoiceWorkspace';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ActiveTab, HistoryItem, OcrResult, ProofreadResult, TranscriptionResult } from './types';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY = 'bangla_ai_toolkit_history_v1';

function getInitialTab(): ActiveTab {
  if (typeof window === 'undefined') return 'ocr';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.toLowerCase().replace(/^#+/, '');
  const target = path || hash;

  if (target === 'writer' || target === 'writing-assistant' || target === 'writing') return 'writer';
  if (target === 'voice' || target === 'voice-to-text' || target === 'speech') return 'voice';
  if (target === 'history' || target === 'archive') return 'history';
  return 'ocr';
}

function AppContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab);
  const [writerInitialText, setWriterInitialText] = useState<string>('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync browser back/forward and hash changes with active workspace tab
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Update browser URL pathname when user switches workspaces
  useEffect(() => {
    const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    const expectedPath = activeTab === 'ocr' ? '' : activeTab;
    if (
      path !== expectedPath &&
      path !== `vision-${activeTab}` &&
      path !== `${activeTab}-assistant` &&
      path !== `${activeTab}-to-text`
    ) {
      const newUrl = expectedPath ? `/${expectedPath}` : '/';
      window.history.replaceState({ tab: activeTab }, '', newUrl + window.location.search);
    }
  }, [activeTab]);

  // Load / sync history from Firestore (if user signed in) or LocalStorage
  useEffect(() => {
    if (user) {
      const historyCol = collection(db, 'users', user.uid, 'history');
      const q = query(historyCol, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const cloudItems: HistoryItem[] = snapshot.docs.map(
            (docSnap) => docSnap.data() as HistoryItem
          );

          // Sync any offline local items into cloud
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
              const localItems: HistoryItem[] = JSON.parse(raw);
              const cloudIds = new Set(cloudItems.map((c) => c.id));
              const missingInCloud = localItems.filter((l) => !cloudIds.has(l.id));

              if (missingInCloud.length > 0) {
                for (const item of missingInCloud) {
                  await setDoc(doc(db, 'users', user.uid, 'history', item.id), item);
                }
              }
            }
          } catch (e) {
            console.warn('Syncing offline items to cloud warning:', e);
          }

          setHistoryItems(cloudItems);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudItems));
          } catch {
            // ignore
          }
        },
        (error) => {
          console.warn('Firestore history listener warning:', error);
        }
      );

      return () => unsubscribe();
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setHistoryItems(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse history from storage:', e);
      }
    }
  }, [user]);

  const saveToHistory = async (
    type: 'ocr' | 'writer' | 'voice',
    title: string,
    preview: string,
    data: OcrResult | ProofreadResult | TranscriptionResult
  ) => {
    const newItem: HistoryItem = {
      id: `${type}-${Date.now()}`,
      timestamp: Date.now(),
      type,
      title,
      preview,
      data,
    };

    setHistoryItems((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.id !== newItem.id).slice(0, 99)];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history to storage:', e);
      }
      return updated;
    });

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'history', newItem.id), newItem);
        showToast(
          language === 'en'
            ? 'Saved with full outcomes to your Google account'
            : 'আপনার গুগল অ্যাকাউন্টে সম্পূর্ণ ফলাফলসহ সেভ হয়েছে'
        );
      } catch (err) {
        console.warn('Failed to save to Firestore:', err);
      }
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    setHistoryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'history', id));
      } catch (err) {
        console.warn('Failed to delete history item in Firestore:', err);
      }
    }

    showToast(t.historyItemDeleted);
  };

  const handleClearHistory = async () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }

    if (user) {
      try {
        const historyCol = collection(db, 'users', user.uid, 'history');
        const snap = await getDocs(historyCol);
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.warn('Failed to clear Firestore history:', err);
      }
    }

    showToast(t.toastHistoryCleared);
  };

  const handleSendToWriter = (text: string) => {
    setWriterInitialText(text);
    setActiveTab('writer');
    showToast(t.toastSentToWriter);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.type === 'ocr') {
      setActiveTab('ocr');
    } else if (item.type === 'writer') {
      const pData = item.data as ProofreadResult;
      setWriterInitialText(pData.improvedText || pData.originalText);
      setActiveTab('writer');
    } else if (item.type === 'voice') {
      const vData = item.data as TranscriptionResult;
      setWriterInitialText(vData.normalizedTranscript || vData.fullTranscript);
      setActiveTab('writer');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#f6f5f0] dark:bg-[#07090e] text-[#0f172a] dark:text-[#f1f5f9] flex flex-col antialiased transition-colors duration-300">
      {/* Top Bar Contract with Animated Language & Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyItems.length}
      />

      {/* Main Viewport Container with Mobile Bottom Nav Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-12">
        {/* Cloud ⇄ On-device engine status */}
        <EngineStatusBanner />

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-white/95 dark:bg-[#0d111a]/95 backdrop-blur-xl border border-teal-600/30 dark:border-teal-500/40 text-teal-800 dark:text-teal-300 rounded-xl shadow-xl dark:shadow-2xl shadow-stone-900/10 dark:shadow-black/60 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Viewport Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {activeTab === 'ocr' && (
              <OcrWorkspace
                onSendToWriter={handleSendToWriter}
                onSaveHistory={(title, preview, data) =>
                  saveToHistory('ocr', title, preview, data)
                }
              />
            )}

            {activeTab === 'writer' && (
              <WritingAssistant
                key={writerInitialText}
                initialText={writerInitialText}
                onSaveHistory={(title, preview, data) =>
                  saveToHistory('writer', title, preview, data)
                }
              />
            )}

            {activeTab === 'voice' && (
              <VoiceWorkspace
                onSendToWriter={handleSendToWriter}
                onSaveHistory={(title, preview, data) =>
                  saveToHistory('voice', title, preview, data)
                }
              />
            )}

            {activeTab === 'history' && (
              <HistoryDrawer
                items={historyItems}
                onClear={handleClearHistory}
                onSelect={handleSelectHistoryItem}
                onDeleteItem={handleDeleteHistoryItem}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Comprehensive High-Grade Footer with DevCenterPoint Branding */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Native-Feel Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyItems.length}
      />

      {/* Floating In-App Install Prompt Banner */}
      <PWAInstallButton />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <EngineProvider>
            <AppContent />
          </EngineProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
