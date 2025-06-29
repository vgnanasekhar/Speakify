import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  Copy,
  RotateCcw,
  FileText,
  Headphones,
  Globe,
  Users,
  CheckCircle,
  Mic2,
  Languages,
  Sparkles
} from 'lucide-react';

interface Voice {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  country: string;
  flag: string;
  gender: string;
}

interface VoiceGroup {
  country: string;
  flag: string;
  voices: Voice[];
}

function App() {
  const [text, setText] = useState('Welcome to Speakify! This is an advanced text-to-speech converter. Type or paste your text here and listen to it with natural voices from around the world.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceGroups, setVoiceGroups] = useState<VoiceGroup[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  
  const synth = window.speechSynthesis;
  let utterance: SpeechSynthesisUtterance | null = null;

  // Enhanced country and language mapping
  const getCountryInfo = (lang: string, voiceName: string) => {
    const langCode = lang.toLowerCase();
    const name = voiceName.toLowerCase();
    
    const countryMap: { [key: string]: { country: string; flag: string } } = {
      'en-us': { country: 'United States', flag: '🇺🇸' },
      'en-gb': { country: 'United Kingdom', flag: '🇬🇧' },
      'en-au': { country: 'Australia', flag: '🇦🇺' },
      'en-ca': { country: 'Canada', flag: '🇨🇦' },
      'en-in': { country: 'India (English)', flag: '🇮🇳' },
      'en-ie': { country: 'Ireland', flag: '🇮🇪' },
      'en-za': { country: 'South Africa', flag: '🇿🇦' },
      'es-es': { country: 'Spain', flag: '🇪🇸' },
      'es-mx': { country: 'Mexico', flag: '🇲🇽' },
      'es-ar': { country: 'Argentina', flag: '🇦🇷' },
      'es-us': { country: 'United States (Spanish)', flag: '🇺🇸' },
      'fr-fr': { country: 'France', flag: '🇫🇷' },
      'fr-ca': { country: 'Canada (French)', flag: '🇨🇦' },
      'fr-be': { country: 'Belgium (French)', flag: '🇧🇪' },
      'de-de': { country: 'Germany', flag: '🇩🇪' },
      'de-at': { country: 'Austria', flag: '🇦🇹' },
      'de-ch': { country: 'Switzerland (German)', flag: '🇨🇭' },
      'it-it': { country: 'Italy', flag: '🇮🇹' },
      'pt-br': { country: 'Brazil', flag: '🇧🇷' },
      'pt-pt': { country: 'Portugal', flag: '🇵🇹' },
      'ru-ru': { country: 'Russia', flag: '🇷🇺' },
      'ja-jp': { country: 'Japan', flag: '🇯🇵' },
      'ko-kr': { country: 'South Korea', flag: '🇰🇷' },
      'zh-cn': { country: 'China', flag: '🇨🇳' },
      'zh-tw': { country: 'Taiwan', flag: '🇹🇼' },
      'zh-hk': { country: 'Hong Kong', flag: '🇭🇰' },
      'ar-sa': { country: 'Saudi Arabia', flag: '🇸🇦' },
      'ar-eg': { country: 'Egypt', flag: '🇪🇬' },
      'hi-in': { country: 'India (Hindi)', flag: '🇮🇳' },
      'ta-in': { country: 'India (Tamil)', flag: '🇮🇳' },
      'bn-in': { country: 'India (Bengali)', flag: '🇮🇳' },
      'gu-in': { country: 'India (Gujarati)', flag: '🇮🇳' },
      'kn-in': { country: 'India (Kannada)', flag: '🇮🇳' },
      'ml-in': { country: 'India (Malayalam)', flag: '🇮🇳' },
      'mr-in': { country: 'India (Marathi)', flag: '🇮🇳' },
      'pa-in': { country: 'India (Punjabi)', flag: '🇮🇳' },
      'ur-in': { country: 'India (Urdu)', flag: '🇮🇳' },
      'th-th': { country: 'Thailand', flag: '🇹🇭' },
      'vi-vn': { country: 'Vietnam', flag: '🇻🇳' },
      'tr-tr': { country: 'Turkey', flag: '🇹🇷' },
      'pl-pl': { country: 'Poland', flag: '🇵🇱' },
      'nl-nl': { country: 'Netherlands', flag: '🇳🇱' },
      'nl-be': { country: 'Belgium (Dutch)', flag: '🇧🇪' },
      'sv-se': { country: 'Sweden', flag: '🇸🇪' },
      'da-dk': { country: 'Denmark', flag: '🇩🇰' },
      'no-no': { country: 'Norway', flag: '🇳🇴' },
      'fi-fi': { country: 'Finland', flag: '🇫🇮' },
      'cs-cz': { country: 'Czech Republic', flag: '🇨🇿' },
      'sk-sk': { country: 'Slovakia', flag: '🇸🇰' },
      'hu-hu': { country: 'Hungary', flag: '🇭🇺' },
      'ro-ro': { country: 'Romania', flag: '🇷🇴' },
      'bg-bg': { country: 'Bulgaria', flag: '🇧🇬' },
      'hr-hr': { country: 'Croatia', flag: '🇭🇷' },
      'el-gr': { country: 'Greece', flag: '🇬🇷' },
      'he-il': { country: 'Israel', flag: '🇮🇱' },
      'id-id': { country: 'Indonesia', flag: '🇮🇩' },
      'ms-my': { country: 'Malaysia', flag: '🇲🇾' },
      'tl-ph': { country: 'Philippines', flag: '🇵🇭' },
      'uk-ua': { country: 'Ukraine', flag: '🇺🇦' },
    };

    // Try exact match first
    if (countryMap[langCode]) {
      return countryMap[langCode];
    }

    // Try language prefix match
    const langPrefix = langCode.split('-')[0];
    const fallbackMap: { [key: string]: { country: string; flag: string } } = {
      'en': { country: 'English', flag: '🌍' },
      'es': { country: 'Spanish', flag: '🌍' },
      'fr': { country: 'French', flag: '🌍' },
      'de': { country: 'German', flag: '🌍' },
      'it': { country: 'Italian', flag: '🌍' },
      'pt': { country: 'Portuguese', flag: '🌍' },
      'ru': { country: 'Russian', flag: '🌍' },
      'ja': { country: 'Japanese', flag: '🌍' },
      'ko': { country: 'Korean', flag: '🌍' },
      'zh': { country: 'Chinese', flag: '🌍' },
      'ar': { country: 'Arabic', flag: '🌍' },
      'hi': { country: 'Hindi', flag: '🇮🇳' },
      'ta': { country: 'Tamil', flag: '🇮🇳' },
      'bn': { country: 'Bengali', flag: '🇮🇳' },
      'gu': { country: 'Gujarati', flag: '🇮🇳' },
      'kn': { country: 'Kannada', flag: '🇮🇳' },
      'ml': { country: 'Malayalam', flag: '🇮🇳' },
      'mr': { country: 'Marathi', flag: '🇮🇳' },
      'pa': { country: 'Punjabi', flag: '🇮🇳' },
      'ur': { country: 'Urdu', flag: '🇮🇳' },
      'th': { country: 'Thai', flag: '🌍' },
      'vi': { country: 'Vietnamese', flag: '🌍' },
      'tr': { country: 'Turkish', flag: '🌍' },
      'pl': { country: 'Polish', flag: '🌍' },
      'nl': { country: 'Dutch', flag: '🌍' },
      'sv': { country: 'Swedish', flag: '🌍' },
      'da': { country: 'Danish', flag: '🌍' },
      'no': { country: 'Norwegian', flag: '🌍' },
      'fi': { country: 'Finnish', flag: '🌍' },
      'cs': { country: 'Czech', flag: '🌍' },
      'sk': { country: 'Slovak', flag: '🌍' },
      'hu': { country: 'Hungarian', flag: '🌍' },
      'ro': { country: 'Romanian', flag: '🌍' },
      'bg': { country: 'Bulgarian', flag: '🌍' },
      'hr': { country: 'Croatian', flag: '🌍' },
      'el': { country: 'Greek', flag: '🌍' },
      'he': { country: 'Hebrew', flag: '🌍' },
      'id': { country: 'Indonesian', flag: '🌍' },
      'ms': { country: 'Malay', flag: '🌍' },
      'tl': { country: 'Filipino', flag: '🌍' },
      'uk': { country: 'Ukrainian', flag: '🌍' },
    };

    return fallbackMap[langPrefix] || { country: 'Other', flag: '🌐' };
  };

  const getGender = (voiceName: string) => {
    const name = voiceName.toLowerCase();
    const femaleKeywords = ['female', 'woman', 'girl', 'samantha', 'victoria', 'alex', 'allison', 'ava', 'susan', 'karen', 'moira', 'tessa', 'veena', 'fiona', 'kate', 'serena', 'zoe', 'amelie', 'anna', 'carmit', 'damayanti', 'ioana', 'joana', 'kanya', 'kyoko', 'laura', 'lekha', 'luciana', 'mariska', 'mei-jia', 'melina', 'milena', 'monica', 'nora', 'paulina', 'rishi', 'sara', 'satu', 'sin-ji', 'tian-tian', 'ting-ting', 'yuna', 'zosia', 'zuzana', 'priya', 'kavya', 'shreya'];
    const maleKeywords = ['male', 'man', 'boy', 'daniel', 'tom', 'fred', 'ralph', 'diego', 'jorge', 'juan', 'carlos', 'thomas', 'yannick', 'markus', 'stefan', 'luca', 'felipe', 'francisco', 'otoya', 'hattori', 'ichiro', 'hideaki', 'hiroshi', 'kenji', 'osamu', 'show', 'takeshi', 'takuya', 'tetsuya', 'yuki', 'aaron', 'albert', 'ravi', 'arjun', 'vikram', 'raj'];
    
    if (femaleKeywords.some(keyword => name.includes(keyword))) {
      return 'Female';
    } else if (maleKeywords.some(keyword => name.includes(keyword))) {
      return 'Male';
    }
    return 'Neutral';
  };

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      const voiceList = availableVoices.map(voice => {
        const countryInfo = getCountryInfo(voice.lang, voice.name);
        return {
          voice,
          name: voice.name,
          lang: voice.lang,
          country: countryInfo.country,
          flag: countryInfo.flag,
          gender: getGender(voice.name)
        };
      });
      
      setVoices(voiceList);
      
      // Group voices by country
      const grouped = voiceList.reduce((acc, voice) => {
        const existingGroup = acc.find(group => group.country === voice.country);
        if (existingGroup) {
          existingGroup.voices.push(voice);
        } else {
          acc.push({
            country: voice.country,
            flag: voice.flag,
            voices: [voice]
          });
        }
        return acc;
      }, [] as VoiceGroup[]);
      
      // Sort groups by country name and voices within groups
      grouped.sort((a, b) => a.country.localeCompare(b.country));
      grouped.forEach(group => {
        group.voices.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      setVoiceGroups(grouped);
      
      // Set default voice (prefer English US voices)
      const defaultVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en-US') && voice.localService
      ) || availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || availableVoices[0];
      
      setSelectedVoice(defaultVoice);
      
      if (defaultVoice) {
        const defaultCountryInfo = getCountryInfo(defaultVoice.lang, defaultVoice.name);
        setSelectedCountry(defaultCountryInfo.country);
      }
    };

    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = () => {
    if (!text.trim()) return;

    // Cancel any ongoing speech
    synth.cancel();

    utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setTotalLength(text.length);
      setCurrentPosition(0);
    };

    utterance.onboundary = (event) => {
      setCurrentPosition(event.charIndex);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    };

    synth.speak(utterance);
  };

  const pause = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const clearText = () => {
    setText('');
    stop();
  };

  const handleVoiceChange = (voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName)?.voice;
    setSelectedVoice(voice || null);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    // Auto-select first voice from the selected country
    const countryGroup = voiceGroups.find(group => group.country === country);
    if (countryGroup && countryGroup.voices.length > 0) {
      setSelectedVoice(countryGroup.voices[0].voice);
    }
  };

  const getFilteredVoices = () => {
    if (!selectedCountry) return voices;
    return voices.filter(voice => voice.country === selectedCountry);
  };

  const sampleTexts = [
    {
      lang: 'English',
      text: 'The quick brown fox jumps over the lazy dog. This is a comprehensive text-to-speech converter.'
    },
    {
      lang: 'Spanish',
      text: 'Hola, bienvenido a nuestro convertidor de texto a voz avanzado con múltiples idiomas.'
    },
    {
      lang: 'French',
      text: 'Bonjour! Bienvenue dans notre convertisseur texte-parole avancé avec support multilingue.'
    },
    {
      lang: 'German',
      text: 'Hallo! Willkommen zu unserem fortschrittlichen Text-zu-Sprache-Konverter mit mehrsprachiger Unterstützung.'
    },
    {
      lang: 'Italian',
      text: 'Ciao! Benvenuto nel nostro convertitore avanzato da testo a voce con supporto multilingue.'
    },
    {
      lang: 'Portuguese',
      text: 'Olá! Bem-vindo ao nosso conversor avançado de texto para fala com suporte multilíngue.'
    }
  ];

  const getProgressPercentage = () => {
    if (totalLength === 0) return 0;
    return (currentPosition / totalLength) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 via-yellow-50 via-emerald-50 via-cyan-50 via-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-rose-500 via-pink-500 via-purple-500 via-indigo-500 via-blue-500 via-cyan-500 via-teal-500 via-emerald-500 via-green-500 via-lime-500 via-yellow-500 via-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-xl animate-pulse">
                  <Volume2 className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white animate-bounce"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 via-purple-600 via-indigo-600 via-blue-600 via-cyan-600 via-teal-600 via-emerald-600 via-green-600 via-lime-600 via-yellow-600 via-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse">
                  Speakify
                </h1>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <Languages className="h-4 w-4 text-purple-500" />
                  <span>Advanced Multilingual Speech Synthesis</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-4 py-2 rounded-full border-2 border-green-300 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-green-700">Live & Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Enhanced Text Input */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-rose-200 via-pink-200 via-purple-200 via-indigo-200 via-blue-200 via-cyan-200 via-teal-200 via-emerald-200 via-green-200 via-lime-200 via-yellow-200 via-amber-200 via-orange-200 to-red-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-rose-100 via-pink-100 via-purple-100 via-indigo-100 via-blue-100 via-cyan-100 via-teal-100 via-emerald-100 via-green-100 via-lime-100 via-yellow-100 via-amber-100 via-orange-100 to-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-400 via-red-400 via-pink-400 via-purple-400 via-indigo-400 via-blue-400 via-cyan-400 via-teal-400 via-emerald-400 via-green-400 via-lime-400 via-yellow-400 via-amber-400 to-orange-400 rounded-xl shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 via-pink-600 via-purple-600 via-indigo-600 via-blue-600 via-cyan-600 via-teal-600 via-emerald-600 via-green-600 via-lime-600 via-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">Text Editor</h2>
                      <p className="text-sm text-gray-600">Enter your text in any language</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyText}
                      className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                        copySuccess 
                          ? 'text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-200' 
                          : 'text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-200'
                      }`}
                      title="Copy text"
                    >
                      {copySuccess ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={clearText}
                      className="p-3 text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-red-200"
                      title="Clear text"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text here..."
                  className="w-full h-80 p-6 border-3 border-gradient-to-r from-rose-300 via-pink-300 via-purple-300 via-indigo-300 via-blue-300 via-cyan-300 via-teal-300 via-emerald-300 via-green-300 via-lime-300 via-yellow-300 via-amber-300 via-orange-300 to-red-300 rounded-2xl resize-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 text-gray-700 leading-relaxed text-lg placeholder-gray-400 bg-gradient-to-br from-white via-gray-50 to-white"
                />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
                      <span className="font-bold text-blue-600">{text.length}</span>
                      <span>characters</span>
                    </span>
                    {copySuccess && (
                      <div className="flex items-center space-x-1 text-white bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied!</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 font-bold">Sample texts:</span>
                    <select
                      onChange={(e) => setText(e.target.value)}
                      className="text-sm border-3 border-gradient-to-r from-cyan-300 to-blue-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300 bg-gradient-to-r from-white to-cyan-50 font-medium"
                    >
                      <option value="">Choose sample...</option>
                      {sampleTexts.map((sample, index) => (
                        <option key={index} value={sample.text}>
                          {sample.lang} Sample
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Voice Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-cyan-200 via-blue-200 via-indigo-200 via-purple-200 via-pink-200 via-rose-200 to-red-200 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-gradient-to-r from-cyan-400 via-blue-400 via-indigo-400 via-purple-400 via-pink-400 via-rose-400 to-red-400 rounded-xl shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 via-indigo-600 via-purple-600 via-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Voice Selection</h2>
                  <p className="text-sm text-gray-600">Choose from global voices</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Country Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 bg-gradient-to-r from-teal-100 to-cyan-100 px-3 py-1 rounded-full inline-block">
                    Select Country/Language
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full border-3 border-gradient-to-r from-teal-300 to-cyan-300 rounded-xl px-4 py-4 focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm bg-gradient-to-r from-white to-cyan-50 transition-all duration-300 font-medium shadow-lg"
                  >
                    <option value="">🌍 All Countries</option>
                    {voiceGroups.map((group) => (
                      <option key={group.country} value={group.country}>
                        {group.flag} {group.country} ({group.voices.length} voices)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full inline-block">
                    Select Voice
                  </label>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="w-full border-3 border-gradient-to-r from-purple-300 to-pink-300 rounded-xl px-4 py-4 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-sm bg-gradient-to-r from-white to-purple-50 transition-all duration-300 font-medium shadow-lg"
                  >
                    {getFilteredVoices().map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.flag} {voice.name} ({voice.gender}) - {voice.lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enhanced Current Voice Info */}
              {selectedVoice && (
                <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 via-blue-50 via-indigo-50 via-purple-50 via-pink-50 via-rose-50 to-red-50 rounded-2xl border-3 border-gradient-to-r from-cyan-200 via-blue-200 via-indigo-200 via-purple-200 via-pink-200 via-rose-200 to-red-200 shadow-xl">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl animate-bounce">
                      {voices.find(v => v.voice === selectedVoice)?.flag}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {selectedVoice.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-sm font-bold shadow-md">
                          {voices.find(v => v.voice === selectedVoice)?.country}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-bold shadow-md">
                          {voices.find(v => v.voice === selectedVoice)?.gender}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold shadow-md">
                          {selectedVoice.lang}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-md ${
                          selectedVoice.localService 
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700' 
                            : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                        }`}>
                          {selectedVoice.localService ? '🔒 Local' : '🌐 Network'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-green-200 via-emerald-200 via-teal-200 via-cyan-200 via-blue-200 via-indigo-200 via-purple-200 via-pink-200 via-rose-200 to-red-200 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-gradient-to-r from-green-400 via-emerald-400 via-teal-400 via-cyan-400 via-blue-400 via-indigo-400 via-purple-400 via-pink-400 via-rose-400 to-red-400 rounded-xl shadow-lg">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 via-teal-600 via-cyan-600 via-blue-600 via-indigo-600 via-purple-600 via-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Playback Controls</h2>
                  <p className="text-sm text-gray-600">Control your speech synthesis</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  {!isPlaying ? (
                    <button
                      onClick={speak}
                      disabled={!text.trim()}
                      className="flex items-center space-x-3 bg-gradient-to-r from-rose-500 via-pink-500 via-purple-500 via-indigo-500 via-blue-500 via-cyan-500 via-teal-500 via-emerald-500 via-green-500 via-lime-500 via-yellow-500 via-amber-500 via-orange-500 to-red-500 text-white px-10 py-5 rounded-2xl font-bold hover:from-rose-600 hover:via-pink-600 hover:via-purple-600 hover:via-indigo-600 hover:via-blue-600 hover:via-cyan-600 hover:via-teal-600 hover:via-emerald-600 hover:via-green-600 hover:via-lime-600 hover:via-yellow-600 hover:via-amber-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 text-lg animate-pulse"
                    >
                      <Play className="h-6 w-6" />
                      <span>Play Speech</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-4">
                      {isPaused ? (
                        <button
                          onClick={resume}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-xl transform hover:scale-110"
                        >
                          <Play className="h-5 w-5" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={pause}
                          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 transition-all duration-300 shadow-xl transform hover:scale-110"
                        >
                          <Pause className="h-5 w-5" />
                          <span>Pause</span>
                        </button>
                      )}
                      <button
                        onClick={stop}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:from-red-600 hover:via-rose-600 hover:to-pink-600 transition-all duration-300 shadow-xl transform hover:scale-110"
                      >
                        <Square className="h-5 w-5" />
                        <span>Stop</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {isPlaying && (
                  <div className="w-full max-w-md space-y-3">
                    <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 text-purple-600 px-6 py-3 rounded-full border-2 border-purple-300 shadow-lg">
                      <Mic2 className="h-5 w-5 animate-pulse" />
                      <span className="font-bold">
                        {isPaused ? 'Paused' : 'Speaking...'}
                      </span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-4 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-rose-500 via-pink-500 via-purple-500 via-indigo-500 via-blue-500 via-cyan-500 via-teal-500 via-emerald-500 via-green-500 via-lime-500 via-yellow-500 via-amber-500 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-300 shadow-lg animate-pulse"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {Math.round(getProgressPercentage())}% complete
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Settings Panel */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-violet-200 via-purple-200 via-fuchsia-200 to-pink-200">
              <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-violet-100 via-purple-100 via-fuchsia-100 to-pink-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-violet-400 via-purple-400 via-fuchsia-400 to-pink-400 rounded-xl shadow-lg">
                    <Volume2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">Voice Settings</h2>
                    <p className="text-sm text-gray-600">Fine-tune your experience</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Rate Control */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full inline-block">
                    Speed: {rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-4 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider shadow-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                    <span>🐌 Slow</span>
                    <span>⚡ Fast</span>
                  </div>
                </div>

                {/* Pitch Control */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 bg-gradient-to-r from-pink-100 to-rose-100 px-3 py-1 rounded-full inline-block">
                    Pitch: {pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-4 bg-gradient-to-r from-pink-200 via-rose-200 to-red-200 rounded-lg appearance-none cursor-pointer slider shadow-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                    <span>🔽 Low</span>
                    <span>🔼 High</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 bg-gradient-to-r from-green-100 to-teal-100 px-3 py-1 rounded-full inline-block">
                    Volume: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-4 bg-gradient-to-r from-green-200 via-teal-200 to-cyan-200 rounded-lg appearance-none cursor-pointer slider shadow-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <VolumeX className="h-4 w-4" />
                    <Volume2 className="h-4 w-4" />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setRate(1);
                    setPitch(1);
                    setVolume(1);
                  }}
                  className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 text-gray-700 py-3 px-4 rounded-xl hover:from-gray-300 hover:via-gray-400 hover:to-gray-500 transition-all duration-300 font-bold transform hover:scale-105 shadow-lg"
                >
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Enhanced Voice Statistics */}
            <div className="bg-gradient-to-br from-cyan-100 via-blue-100 via-indigo-100 via-purple-100 via-pink-100 via-rose-100 to-red-100 rounded-3xl p-6 border-3 border-gradient-to-r from-cyan-300 via-blue-300 via-indigo-300 via-purple-300 via-pink-300 via-rose-300 to-red-300 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-cyan-400 via-blue-400 via-indigo-400 via-purple-400 via-pink-400 via-rose-400 to-red-400 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 via-blue-600 via-indigo-600 via-purple-600 via-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Voice Statistics</h3>
                  <p className="text-sm text-gray-600">Global voice availability</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-4 bg-white/80 rounded-xl border-2 border-cyan-300 shadow-lg">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{voiceGroups.length}</div>
                  <div className="text-gray-600 font-bold">Countries</div>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-xl border-2 border-blue-300 shadow-lg">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{voices.length}</div>
                  <div className="text-gray-600 font-bold">Total Voices</div>
                </div>
              </div>
            </div>

            {/* Enhanced Features Info */}
            <div className="bg-gradient-to-br from-emerald-100 via-teal-100 via-cyan-100 via-blue-100 via-indigo-100 via-purple-100 via-pink-100 via-rose-100 to-red-100 rounded-3xl p-6 border-3 border-gradient-to-r from-emerald-300 via-teal-300 via-cyan-300 via-blue-300 via-indigo-300 via-purple-300 via-pink-300 via-rose-300 to-red-300 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-400 via-teal-400 via-cyan-400 via-blue-400 via-indigo-400 via-purple-400 via-pink-400 via-rose-400 to-red-400 rounded-xl shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-600 via-cyan-600 via-blue-600 via-indigo-600 via-purple-600 via-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Premium Features</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🌍 Global voice selection</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🎭 Gender identification</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🔧 Advanced voice controls</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">📊 Real-time progress tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">📋 Enhanced copy functionality</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🎨 Colorful modern interface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t-2 border-gradient-to-r from-rose-200 via-pink-200 via-purple-200 via-indigo-200 via-blue-200 via-cyan-200 via-teal-200 via-emerald-200 via-green-200 via-lime-200 via-yellow-200 via-amber-200 via-orange-200 to-red-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Volume2 className="h-5 w-5 text-purple-600 animate-pulse" />
              <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Speakify</span>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto font-medium">
              
            </p>
            <p className="text-sm text-gray-500">
              Experience natural-sounding text-to-speech conversion with voices from around the world
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;