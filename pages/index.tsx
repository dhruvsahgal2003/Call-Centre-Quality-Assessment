import { useState } from 'react';
import Head from 'next/head';

interface AnalysisResult {
  agentSentiment: string;
  customerSentiment: string;
  overallTone: string;
}

interface ApiResponse {
  transcript: string;
  analysis: AnalysisResult;
  report: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      const base64Audio = await fileToBase64(file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: ApiResponse = await response.json();

      setTranscript(result.transcript);
      setAnalysis(result.analysis);
      setReport(result.report);
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="container mx-auto p-4 bg-black text-white min-h-screen flex flex-col">
      <Head>
        <title>Call Analysis App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow">
        <h1 className="text-4xl font-bold mb-8">Call Analysis App</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="file"
            onChange={handleFileChange}
            accept="audio/*"
            className="mb-4 text-black"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-white text-black px-4 py-2 rounded"
          >
            {loading ? 'Processing...' : 'Analyze Call'}
          </button>
        </form>

        {transcript && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Transcript</h2>
            <pre className="bg-gray-800 p-4 rounded whitespace-normal overflow-auto">
              {transcript}
            </pre>
          </section>
        )}

        {analysis && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Sentiment and Tone Analysis</h2>
            <ul className="list-disc list-inside">
              <li>Agent Sentiment: {analysis.agentSentiment}</li>
              <li>Customer Sentiment: {analysis.customerSentiment}</li>
              <li>Overall Tone: {analysis.overallTone}</li>
            </ul>
          </section>
        )}

        {report && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Quality Assessment Report</h2>
            <p className="whitespace-normal">{report}</p>
          </section>
        )}
      </main>

      <footer className="text-center mt-8">
        <p>Made with ❤️ by Dhruv Sehgal</p>
      </footer>
    </div>
  );
}
