import { useState, useEffect } from 'react';
import Head from 'next/head';
import TextPanel from '../src/components/feature/TextPanel';
import ResultHeader from '../src/components/layout/ResultHeader';
import ResultFooter from '../src/components/layout/ResultFooter';
import DiffViewer from '../src/components/feature/DiffViewer';
import { polishText } from '../lib/llm-service';
import { PacmanLoader } from 'react-spinners';

export default function Result() {
  const [originalText, setOriginalText] = useState('');
  const [polishedText, setPolishedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResultData = async (event, data) => {
      const text = data.originalText || '';
      setOriginalText(text);
      if (text) {
        setIsLoading(true);
        setError(null);
        try {
          const polished = await polishText(text);
          setPolishedText(polished);
        } catch (err) {
          setError(err.message);
          alert(`文本润色失败: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onResultData(handleResultData);
    }

    return () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.removeAllListeners('result-data');
      }
    };
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <Head>
        <title>转录结果 - Vocal Write</title>
        <meta name="description" content="语音转文字结果" />
      </Head>

      <main className="w-full max-w-6xl mx-auto flex flex-col flex-grow">
        <ResultHeader copied={copied} />

        <div className="flex-grow flex flex-col gap-6">
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <PacmanLoader color="#4F46E5" />
              <p className="ml-4 text-lg font-semibold text-gray-600">润色中...</p>
            </div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center text-red-500">
              <p>{error}</p>
            </div>
          ) : polishedText ? (
            <DiffViewer oldText={originalText} newText={polishedText} />
          ) : (
            <TextPanel
              title="原始文本"
              text={originalText}
              setText={setOriginalText}
              onCopy={() => copyToClipboard(originalText)}
              placeholder="原始转录文本将显示在这里..."
              disabled={!originalText}
            />
          )}
        </div>

        <ResultFooter
          originalTextLength={originalText.length}
          polishedTextLength={polishedText.length}
        />
      </main>
    </div>
  )
}
