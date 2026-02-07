
import { GeoLocation, RiskLevel, LocationReport, Language } from './types';

export const INDIA_CENTER: GeoLocation = { lat: 22.5937, lng: 82.9629 };
export const DEFAULT_ZOOM = 5;

const SAFETY_CONTENT_EN = {
  flood: {
    title: "Flood Safety",
    dos: ["Move to higher ground immediately", "Switch off electrical/gas supply", "Keep emergency kit ready", "Drink boiled/filtered water"],
    donts: ["Don't walk through moving water", "Don't drive through flooded areas", "Don't touch electrical wires", "Don't ignore official warnings"]
  },
  cyclone: {
    title: "Cyclone Safety",
    dos: ["Stay indoors until officially clear", "Secure loose house items", "Store essential food and medicine", "Keep your phone fully charged"],
    donts: ["Don't go out during the eye of storm", "Don't touch fallen poles/wires", "Don't believe in rumors", "Don't leave cattle tied up"]
  },
  fire: {
    title: "Fire Safety",
    dos: ["Stay low and crawl under smoke", "Use stairs, not elevators", "Alert everyone nearby", "Check doors for heat before opening"],
    donts: ["Don't panic", "Don't stop to collect valuables", "Don't hide under beds/closets", "Don't use water on electrical fires"]
  },
  heatwave: {
    title: "Heatwave Safety",
    dos: ["Drink plenty of water often", "Wear light-colored cotton clothes", "Stay in shade or indoors", "Use hats or umbrellas"],
    donts: ["Don't go out between 12 PM - 3 PM", "Don't drink caffeinated beverages", "Don't leave pets in vehicles", "Don't overexert yourself"]
  }
};

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    appTitle: "Predictive Sky-X",
    subtitle: "National Disaster Response Grid",
    searchPlaceholder: "Search (e.g. Imphal, Delhi)...",
    liveStream: "LIVE STREAM",
    sectorAnalysis: "Live Sector Analysis",
    riskScore: "RISK SCORE",
    safe: "Safe",
    watch: "Watch",
    emergency: "Emergency",
    temp: "TEMP",
    wind: "WIND",
    rain: "RAIN",
    humidity: "HUMIDITY",
    visualInspection: "Visual Inspection",
    geminiAnalysis: "Gemini AI Analysis",
    settings: "Application Settings",
    profile: "My Profile",
    database: "System Database",
    about: "About Platform",
    signOut: "Sign Out",
    language: "Language",
    theme: "Theme",
    satInputs: "Satellite Data Inputs",
    safetyGuide: "Safety Protocols",
    emergencyMeasures: "Emergency Measures",
    emergencyContacts: "Emergency Contacts",
    sosNumbers: { police: "100", fire: "101", ambulance: "108", disaster: "1078" },
    safetyContent: SAFETY_CONTENT_EN
  },
  hi: {
    appTitle: "प्रेडिक्टिव स्काई-X",
    subtitle: "राष्ट्रीय आपदा प्रतिक्रिया ग्रिड",
    searchPlaceholder: "खोजें (जैसे इंफाल, दिल्ली)...",
    liveStream: "लाइव स्ट्रीम",
    sectorAnalysis: "लाइव सेक्टर विश्लेषण",
    riskScore: "जोखिम स्कोर",
    safe: "सुरक्षित",
    watch: "निगरानी",
    emergency: "आपातकालीन",
    temp: "तापमान",
    wind: "हवा",
    rain: "बारिश",
    humidity: "नमी",
    visualInspection: "दृश्य निरीक्षण",
    geminiAnalysis: "जेमिनी एआई विश्लेषण",
    settings: "एप्लिकेशन सेटिंग",
    profile: "मेरी प्रोफ़ाइल",
    database: "सिस्टम डेटाबेस",
    about: "प्लेटफ़ॉर्म के बारे में",
    signOut: "साइन आउट",
    language: "भाषा",
    theme: "थीम",
    satInputs: "सैटेलाइट डेटा इनपुट",
    safetyGuide: "सुरक्षा प्रोटोकॉल",
    emergencyMeasures: "आपातकालीन उपाय",
    emergencyContacts: "आपातकालीन संपर्क",
    sosNumbers: { police: "100", fire: "101", ambulance: "108", disaster: "1078" },
    safetyContent: {
      flood: {
        title: "बाढ़ सुरक्षा",
        dos: ["तुरंत ऊंचे स्थानों पर जाएं", "बिजली और गैस की आपूर्ति बंद करें", "आपातकालीन किट तैयार रखें", "उबला हुआ या छना हुआ पानी पिएं"],
        donts: ["बहते पानी में न चलें", "बाढ़ वाले क्षेत्रों में गाड़ी न चलाएं", "बिजली के तारों को न छुएं", "आधिकारिक चेतावनियों को अनदेखा न करें"]
      },
      cyclone: {
        title: "चक्रवात सुरक्षा",
        dos: ["आधिकारिक तौर पर साफ होने तक अंदर रहें", "घर की ढीली वस्तुओं को सुरक्षित करें", "आवश्यक भोजन और दवा का भंडारण करें", "फोन को फुल चार्ज रखें"],
        donts: ["तूफान की 'आंख' के दौरान बाहर न निकलें", "गिरे हुए खंभों/तारों को न छुएं", "अफवाहों पर विश्वास न करें", "पशुओं को बांधकर न छोड़ें"]
      },
      fire: {
        title: "अग्नि सुरक्षा",
        dos: ["झुककर चलें और धुएं के नीचे रहें", "सीढ़ियों का उपयोग करें, लिफ्ट का नहीं", "आस-पास के सभी को सचेत करें", "खोलने से पहले दरवाजे की गर्मी की जांच करें"],
        donts: ["घबराएं नहीं", "कीमती सामान इकट्ठा करने के लिए न रुकें", "बिस्तरों/कोठरी के नीचे न छिपें", "बिजली की आग पर पानी का उपयोग न करें"]
      },
      heatwave: {
        title: "लू से सुरक्षा",
        dos: ["अक्सर खूब पानी पिएं", "हल्के रंग के सूती कपड़े पहनें", "छाया में या घर के अंदर रहें", "टोपी या छतरी का उपयोग करें"],
        donts: ["दोपहर 12 से 3 बजे के बीच बाहर न निकलें", "कैफीनयुक्त पेय न पिएं", "पालतू जानवरों को वाहनों में न छोड़ें", "ज्यादा थका देने वाला काम न करें"]
      }
    }
  },
  ta: {
    appTitle: "பிரடிக்டிவ் ஸ்கை-எக்ஸ்",
    subtitle: "தேசிய பேரிடர் மீட்பு கட்டம்",
    searchPlaceholder: "தேடு (எ.கா. டெல்லி)...",
    liveStream: "நேரடி ஒளிபரப்பு",
    sectorAnalysis: "நேரடி துறை பகுப்பாய்வு",
    riskScore: "ஆபத்து மதிப்பெண்",
    safe: "பாதுகாப்பானது",
    watch: "கண்காணிப்பு",
    emergency: "அவசரம்",
    temp: "வெப்பநிலை",
    wind: "காற்று",
    rain: "மழை",
    humidity: "ஈரப்பதம்",
    visualInspection: "காட்சி ஆய்வு",
    geminiAnalysis: "ஜெமினி AI பகுப்பாய்வு",
    settings: "பயன்பாட்டு அமைப்புகள்",
    profile: "எனது சுயவிவரம்",
    database: "தரவுத்தளம்",
    about: "தளம் பற்றி",
    signOut: "வெளியேறு",
    language: "மொழி",
    theme: "தீம்",
    satInputs: "செயற்கைக்கோள் தரவு",
    safetyGuide: "பாதுகாப்பு நெறிமுறைகள்",
    emergencyMeasures: "அவசரகால நடவடிக்கைகள்",
    emergencyContacts: "அவசரகால தொடர்புகள்",
    sosNumbers: { police: "100", fire: "101", ambulance: "108", disaster: "1078" },
    safetyContent: {
      flood: {
        title: "வெள்ள பாதுகாப்பு",
        dos: ["உடனடியாக உயரமான இடங்களுக்குச் செல்லுங்கள்", "மின்சாரம் மற்றும் எரிவாயுவை அணைக்கவும்", "அவசரகால கிட்டைத் தயாராக வைத்திருங்கள்", "காய்ச்சிய நீரை அருந்துங்கள்"],
        donts: ["ஓடும் நீரில் நடக்க வேண்டாம்", "வெள்ளம் சூழ்ந்த பகுதிகளில் வாகனம் ஓட்ட வேண்டாம்", "மின்சார கம்பிகளைத் தொடாதீர்கள்", "அதிகாரப்பூர்வ எச்சரிக்கைகளை அலட்சியப்படுத்தாதீர்கள்"]
      },
      cyclone: {
        title: "புயல் பாதுகாப்பு",
        dos: ["அதிகாரப்பூர்வ அறிவிப்பு வரும் வரை உள்ளே இருங்கள்", "வீட்டுப் பொருட்களைப் பாதுகாப்பாக வைக்கவும்", "உணவு மற்றும் மருந்துகளைச் சேமிக்கவும்", "தொலைபேசியை முழுமையாக மின்னூட்டம் செய்யுங்கள்"],
        donts: ["புயலின் போது வெளியே செல்ல வேண்டாம்", "விழுந்த கம்பிகள்/மின் கம்பங்களைத் தொடாதீர்கள்", "வதந்திகளை நம்பாதீர்கள்", "கால்நடைகளைக் கட்டிப் போடாதீர்கள்"]
      },
      fire: {
        title: "தீ பாதுகாப்பு",
        dos: ["குனிந்து புகைக்கு அடியில் தவழ்ந்து செல்லுங்கள்", "மின்தூக்கியைத் தவிர்க்கவும், படிக்கட்டுகளைப் பயன்படுத்தவும்", "அருகிலுள்ளவர்களை எச்சரிக்கவும்", "கதவைத் திறப்பதற்கு முன் வெப்பத்தைச் சரிபார்க்கவும்"],
        donts: ["பதற்றமடையாதீர்கள்", "விலை உயர்ந்த பொருட்களை எடுக்கத் தாமதிக்காதீர்கள்", "கட்டிலுக்கு அடியில் ஒளிய வேண்டாம்", "மின்சாரத் தீயில் தண்ணீரை ஊற்றாதீர்கள்"]
      },
      heatwave: {
        title: "வெப்ப அலை பாதுகாப்பு",
        dos: ["அடிக்கடி நிறையத் தண்ணீர் குடிக்கவும்", "வெளிர் நிற பருத்தி ஆடைகளை அணியுங்கள்", "நிழலில் அல்லது வீட்டிற்குள் இருங்கள்", "குடை அல்லது தொப்பியைப் பயன்படுத்துங்கள்"],
        donts: ["மதியம் 12 முதல் 3 மணி வரை வெளியே செல்ல வேண்டாம்", "காஃபின் பானங்களைத் தவிர்க்கவும்", "செல்லப்பிராணிகளை வாகனங்களில் விடாதீர்கள்", "கடுமையான வேலைகளைத் தவிர்க்கவும்"]
      }
    }
  },
  gu: {
    appTitle: "પ્રિડિક્ટિવ સ્કાય-X",
    subtitle: "રાષ્ટ્રીય આપત્તિ પ્રતિભાવ ગ્રીડ",
    searchPlaceholder: "શોધો (દા.ત. દિલ્હી)...",
    liveStream: "લાઇવ સ્ટ્રીમ",
    sectorAnalysis: "લાઇવ સેક્ટર વિશ્લેષણ",
    riskScore: "જોખમ સ્કોર",
    safe: "સુરક્ષિત",
    watch: "વોચ",
    emergency: "કટોકટી",
    temp: "તાપમાન",
    wind: "પવન",
    rain: "વરસાદ",
    humidity: "ભેજ",
    visualInspection: "દ્રશ્ય નિરીક્ષણ",
    geminiAnalysis: "જેમિની AI વિશ્લેષણ",
    settings: "એપ્લિકેશન સેટિંગ્સ",
    profile: "મારી પ્રોફાઇલ",
    database: "સિસ્ટમ ડેટાબેઝ",
    about: "પ્લેટફોર્મ વિશે",
    signOut: "સાઇન આઉટ",
    language: "ભાષા",
    theme: "થીમ",
    satInputs: "સેટેલાઇટ ડેટા",
    safetyGuide: "સુરક્ષા પ્રોટોકોલ",
    emergencyMeasures: "કટોકટીના પગલાં",
    emergencyContacts: "કટોકટી સંપર્ક",
    sosNumbers: { police: "100", fire: "101", ambulance: "108", disaster: "1078" },
    safetyContent: {
      flood: {
        title: "પૂર સુરક્ષા",
        dos: ["તરત જ ઊંચા સ્થળોએ જાઓ", "વીજળી અને ગેસ સપ્લાય બંધ કરો", "ઇમરજન્સી કિટ તૈયાર રાખો", "ઉકાળેલું પાણી પીવો"],
        donts: ["વહેતા પાણીમાં ચાલશો નહીં", "પૂરગ્રસ્ત વિસ્તારોમાં વાહન ચલાવશો નહીં", "વીજળીના તારને અડશો નહીં", "સત્તાવાર ચેતવણીઓને અવગણશો નહીં"]
      },
      cyclone: {
        title: "ચક્રવાત સુરક્ષા",
        dos: ["સત્તાવાર મંજૂરી ન મળે ત્યાં સુધી અંદર રહો", "ઘરની છૂટી વસ્તુઓ સુરક્ષિત કરો", "જરૂરી ખોરાક અને દવા સંગ્રહ કરો", "ફોન ચાર્જ રાખો"],
        donts: ["વાવાઝોડા દરમિયાન બહાર ન નીકળો", "પડેલા થાંભલા/તારને અડશો નહીં", "અફવાઓ પર વિશ્વાસ ન કરો", "પશુઓને બાંધીને ન છોડો"]
      },
      fire: {
        title: "અગ્નિ સુરક્ષા",
        dos: ["નીચે નમીને ધુમાડાની નીચે ચાલો", "સીડીનો ઉપયોગ કરો, લિફ્ટનો નહીં", "આસપાસના લોકોને જાણ કરો", "દરવાજો ખોલતા પહેલા ગરમી તપાસો"],
        donts: ["ગભરાશો નહીં", "કિંમતી સામાન લેવા માટે ઉભા ન રહો", "પલંગ/કબાટ નીચે ન છુપાવો", "વીજળીની આગ પર પાણીનો ઉપયોગ ન કરો"]
      },
      heatwave: {
        title: "લૂથી સુરક્ષા",
        dos: ["વારંવાર પુષ્કળ પાણી પીવો", "હળવા રંગના સુતરાઉ કપડાં પહેરો", "છાંયડામાં કે ઘરની અંદર રહો", "ટોપી કે છત્રીનો ઉપયોગ કરો"],
        donts: ["બપોરે 12 થી 3 વચ્ચે બહાર ન નીકળો", "કેફીનયુક્ત પીણાં ન પીવો", "પાલતુ પ્રાણીઓને વાહનમાં ન છોડો", "વધુ પડતો શ્રમ ન કરો"]
      }
    }
  }
};

export const generateMockReport = (lat: number, lng: number, name?: string): LocationReport => {
  const isHighRiskZone = lat < 25 && lat > 15 && lng > 80;
  const baseScore = Math.random();
  const score = isHighRiskZone ? Math.min(0.95, baseScore + 0.3) : baseScore * 0.6;
  
  let riskLevel = RiskLevel.SAFE;
  if (score > 0.6) riskLevel = RiskLevel.EMERGENCY;
  else if (score > 0.3) riskLevel = RiskLevel.WATCH;

  const disasterType = score > 0.6 
    ? (Math.random() > 0.5 ? 'Cyclone' : 'Flood') 
    : (score > 0.3 ? 'Heatwave' : 'None');

  const windSpeed = Math.floor(5 + Math.random() * 40);
  const currentTemp = Math.floor(25 + Math.random() * 15);

  return {
    id: `${lat}-${lng}-${Date.now()}`,
    location: { lat, lng, name: name || `Sector ${lat.toFixed(2)}, ${lng.toFixed(2)}` },
    currentWeather: {
      temp: currentTemp,
      humidity: Math.floor(40 + Math.random() * 50),
      windSpeed: windSpeed,
      windGust: Math.floor(windSpeed * (1.2 + Math.random() * 0.5)),
      rainfall: Math.floor(Math.random() * 120),
      cloudCover: Math.floor(Math.random() * 100),
      pressure: Math.floor(990 + Math.random() * 20),
      timestamp: new Date().toISOString(),
    },
    risk: {
      score: parseFloat(score.toFixed(2)),
      level: riskLevel,
      type: disasterType,
      predictionTimeframe: 'Simulated Forecast'
    },
    satellite: {
      satelliteId: 'INSAT-3D',
      acquisitionTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      band: 'TIR-1',
      imageUrl: `https://picsum.photos/400/300?grayscale&blur=1&random=${Math.random()}`,
    },
    // Updated timeline data to show variation (sin wave for temp) instead of flat line
    timelineData: Array.from({ length: 12 }, (_, i) => ({
      time: `${(new Date().getHours() + i) % 24}:00`,
      rain: Math.max(0, Math.floor(Math.random() * 20 + (score * 40) - 10)),
      temp: parseFloat((currentTemp + Math.sin(i * 0.5) * 3).toFixed(1)),
      probability: Math.floor(Math.random() * 100)
    })),
  };
};

export const HOTSPOTS: {name: string; lat: number; lng: number}[] = [
  // Major Metros
  { name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  
  // North East India (Strategic Inclusion)
  { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { name: "Shillong", lat: 25.5788, lng: 91.8933 },
  { name: "Imphal", lat: 24.8170, lng: 93.9368 },
  { name: "Aizawl", lat: 23.7271, lng: 92.7176 },
  { name: "Itanagar", lat: 27.0844, lng: 93.6053 },
  { name: "Kohima", lat: 25.6751, lng: 94.1086 },
  { name: "Agartala", lat: 23.8315, lng: 91.2868 },
  { name: "Gangtok", lat: 27.3389, lng: 88.6065 },

  // Key Strategic Locations
  { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { name: "Cochin", lat: 9.9312, lng: 76.2673 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
];
