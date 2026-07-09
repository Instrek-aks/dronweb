import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// ===== FAQ DATA =====
const FAQ_DATA = [
  { cat: 'basics', q: 'What is a drone?', a: 'A drone (UAV) is an unmanned aerial vehicle controlled remotely or autonomously. They range from $50 hobby toys to million-dollar military systems, carrying cameras, sensors, or cargo depending on their purpose.' },
  { cat: 'basics', q: 'What are the main types of drones?', a: 'Multi-rotor (most common, stable hover) / Fixed-wing (longer range, efficient) / VTOL (vertical takeoff, fixed-wing cruise) / FPV racing (ultra-fast, pilot-view) / Agricultural / Industrial inspection / Military and defence UAVs.' },
  { cat: 'basics', q: 'What are drones used for?', a: 'Aerial photography, agriculture (spraying, mapping), construction inspection, package delivery, search and rescue, environmental monitoring, military surveillance, film production, infrastructure inspection, and emergency response.' },
  { cat: 'basics', q: 'How do drones fly?', a: 'Multi-rotors spin opposite propeller pairs at varying speeds. The flight controller reads gyroscope and accelerometer data thousands of times per second and adjusts each motor to maintain stability. GPS holds position when hovering.' },
  { cat: 'basics', q: 'How far can a consumer drone fly?', a: 'Most consumer drones reach 5-12km. Regulations in almost every country limit you to visual line of sight (VLOS), typically 500m-1km in practice. Long-range FPV builds can exceed 40km in uncontrolled conditions.' },
  { cat: 'setup', q: 'How do I set up a drone for the first time?', a: 'Inspect for damage. Charge battery fully. Download the manufacturer app. Power on drone and remote. Pair them (binding). Register and activate. Calibrate compass and IMU. Update firmware. Pre-flight checklist: battery, props, GPS lock, no-fly zone check, wind conditions.' },
  { cat: 'setup', q: 'What is IMU calibration and why does it matter?', a: 'The IMU (Inertial Measurement Unit) detects orientation and acceleration. Calibration defines what level and still means. A bad calibration causes drifting or unstable flight. Calibrate on a flat surface, away from metal and interference sources.' },
  { cat: 'setup', q: 'What is compass calibration?', a: 'Compass calibration maps local magnetic north for accurate GPS flight. Rotate the drone in specific orientations while the controller records data. Do this in a new far location, after firmware updates, or if compass errors appear. Avoid calibrating near metal structures or power lines.' },
  { cat: 'setup', q: 'How do I bind a remote controller?', a: 'Power on drone first, then remote. In the app, go to Remote Controller settings and select Link Remote. The drone enters pairing mode (flashing LED). Confirm in app or press bind button. Both devices should show solid connection lights. Test stick inputs before flying.' },
  { cat: 'setup', q: 'What should I check before every flight?', a: 'Battery above 50%. Props tight, undamaged, correct CW/CCW positions. Remote charged. Minimum 8 GPS satellites. No app warnings. Wind within drone limits. Area clear. Return-to-Home altitude set above surrounding obstacles. Correct flight mode selected.' },
  { cat: 'setup', q: 'What flight modes do drones have?', a: 'GPS mode: Position-hold, stable, beginner-friendly. Attitude mode: No GPS assist, manual stability only. Sport mode: Higher speeds, reduced avoidance. ATTI/Manual: Full pilot control for FPV. Most apps also include Cinematic, Normal, and Tripod modes for photography.' },
  { cat: 'repair', q: "My drone won't take off. What do I check?", a: "Check motor/prop for obstruction or damage. Battery correctly seated and charged. App for IMU or compass errors (recalibrate if yes). All motors spin freely by hand. If one motor won't spin during startup, the ESC for that motor is likely faulty." },
  { cat: 'repair', q: 'How do I replace a broken motor?', a: "Order matching motor spec (KV rating, stator size). Remove prop. Unscrew motor from arm. Disconnect from ESC. Connect replacement matching original wire color code. Test spin direction in configurator. Reverse two wires if direction is wrong. Reattach prop and test fly carefully." },
  { cat: 'repair', q: 'What is an ESC and what does it do?', a: "ESC (Electronic Speed Controller) converts DC battery power into three-phase AC signals that control brushless motor speed and direction. Each motor has its own ESC. Inconsistent or non-spinning motors often indicate ESC failure. Always match amperage rating to or above the motor's peak draw." },
  { cat: 'repair', q: 'Why does my drone drift in one direction?', a: '1. Recalibrate IMU on a perfectly flat surface. 2. Recalibrate compass away from metal. 3. Check correct CW/CCW prop placement. 4. Check for bent or cracked prop blades. 5. Review PID tuning in Betaflight or your configurator. Some drift in wind is normal in non-GPS modes.' },
  { cat: 'repair', q: 'How often should I replace propellers?', a: 'Inspect after every crash and before every flight. Replace immediately on any crack, chip, deformation, wobble, or deep scratch. Even minor damage causes vibration that damages motors and ruins footage. Replace proactively every 20-30 flight hours under regular use.' },
  { cat: 'tech', q: 'How does obstacle avoidance work?', a: 'Sensors detect objects in the flight path: stereo vision cameras, infrared time-of-flight, LiDAR, or ultrasonic. The drone stops, reroutes, or alerts. High-end drones offer omnidirectional sensing. Entry-level may only have forward and downward sensors. Does not reliably detect thin wires or cables.' },
  { cat: 'tech', q: 'What is FPV flying?', a: 'First Person View - you fly through a live camera feed to goggles with 1-4ms latency, versus the 1-3 second delay on a phone screen. Used for racing, freestyle aerobatics, and cinematic proximity work. Popular systems: DJI O3, HDZero, Walksnail Avatar, and analog.' },
  { cat: 'tech', q: 'What is RTK GPS?', a: 'Real-Time Kinematic GPS provides centimeter-level accuracy vs the 2-5 meter accuracy of standard GPS. A ground base station sends atmospheric correction signals to the drone. Essential for precision agriculture, surveying, construction monitoring, and corridor mapping.' },
  { cat: 'tech', q: 'What is LiDAR on a drone?', a: 'LiDAR fires laser pulses and measures return time to build precise 3D point clouds. Used for topographic mapping, forestry, powerline inspection, and GPS-denied navigation. Penetrates vegetation better than cameras. Payloads typically cost $10,000-$100,000+.' },
  { cat: 'tech', q: 'What technology do leading companies use?', a: 'DJI: O3+ transmission, APAS 5.0 omnidirectional avoidance, ActiveTrack. Skydio: AI neural network 360-degree obstacle avoidance. Parrot: Open-source FreeFlight, EU military ecosystem. XAG: Precision variable-rate agricultural spraying. Zipline: Fixed-wing delivery at 160km range. Quantum Systems: VTOL hybrid for military ISR.' },
  { cat: 'tech', q: 'What is the difference between analog and digital FPV?', a: 'Analog FPV: cheap, sub-1ms latency, lower resolution with interference artifacts. Digital FPV (DJI O3, HDZero, Walksnail): HD or 4K, 4-40ms latency, more expensive. Analog dominates racing; digital is taking over cinematic FPV.' },
  { cat: 'regs', q: 'Do I need a license to fly a drone?', a: 'USA: Under 250g - registration only (no license) for recreation. Commercial requires FAA Part 107. India: All drones except nano require registration and UIN. Commercial needs RPAS Pilot Certificate. EU: Under 250g in Open A1 has minimal requirements. Above 250g requires EU drone pilot certificate.' },
  { cat: 'regs', q: 'What is a no-fly zone?', a: 'Airspace where drone flight is restricted: airport zones (typically 5km radius), military bases, national parks, prisons, nuclear facilities, crowd events, emergency areas. Most drone apps show geofenced zones and will warn or prevent entry. Flying in an NFZ without authorization is a criminal offence in most countries.' },
  { cat: 'regs', q: 'What is BVLOS and when is it allowed?', a: 'Beyond Visual Line of Sight - flying beyond unaided visual range. Required for delivery, pipeline inspection, and corridor surveys. Currently requires specific waivers from aviation authorities in most countries, plus sense-and-avoid systems and ATC integration. Regulations are evolving rapidly globally.' },
  { cat: 'regs', q: 'Do drones need insurance?', a: 'EU: Third-party liability insurance mandatory above 250g. India: Required for commercial RPAS operators. USA: No federal mandate but strongly recommended. Drone-specific insurance offered by Coverdrone, SkyWatch, and Flock. For commercial operations anywhere, insurance is essential.' },
  { cat: 'regs', q: 'Can I fly a drone at night?', a: 'Night flying rules vary by country. USA: FAA Part 107 allows night flying with anti-collision lighting visible 3 statute miles. India: Night BVLOS generally restricted. EU: Night flight in Open category requires specific anti-collision lights. Always verify with your local aviation authority.' },
  { cat: 'pricing', q: 'How much does a drone cost?', a: 'Under $200: Entry-level (Holy Stone, Tello). $200-800: Mid-range (DJI Mini 3, Autel Nano) - excellent for beginners. $800-3,000: Prosumer (DJI Air 3, Mavic 3 Classic) - cinema quality. $3,000-20,000: Professional (DJI Inspire 3, Matrice series). $20,000+: Industrial, agricultural, and defence systems.' },
  { cat: 'pricing', q: 'What is the best drone for a beginner?', a: 'DJI Mini 3 or Mini 4 Pro - under 249g (fewer regulatory requirements in most countries), GPS, obstacle avoidance, excellent camera, straightforward app. Budget option: DJI Mini 2 SE. For pure learning before investing in a quality drone, a cheap practice quad under $50 is worth considering.' },
  { cat: 'pricing', q: 'DJI or another brand?', a: 'DJI holds roughly 70% of the global market for good reason. Alternatives: Autel Robotics (USA-based, no geofencing). Skydio (best autonomous AI avoidance, strong US government use). Parrot (France, EU defence and enterprise). For government and defence, non-DJI platforms are increasingly required for data security reasons.' },
  { cat: 'advanced', q: 'What is waypoint mission planning?', a: 'Pre-programmed flight paths executed autonomously. Set waypoints on a map with altitude, speed, camera actions, and heading. The drone follows the mission without manual input. Used for repeatable surveying, inspection, and monitoring. Platforms include DJI FlightHub 2, DJI Pilot 2, Pix4Dcapture, and DroneDeploy.' },
  { cat: 'advanced', q: 'How does drone photogrammetry work?', a: 'Hundreds of overlapping images are processed by computer vision algorithms to reconstruct accurate 3D models and 2D orthomosaic maps. The drone flies a grid pattern with 70-80% image overlap. Software (Pix4D, DroneDeploy, Metashape, WebODM) stitches images into point clouds and DEMs. Used in construction, mining, archaeology, and surveying.' },
  { cat: 'advanced', q: 'What is a drone swarm?', a: 'A coordinated fleet of drones under centralized or decentralized AI control. Applications: synchronized light shows, area search operations, and military distributed engagement. Requires mesh communication networks and collision-avoidance algorithms. One of the most active frontiers in drone R&D.' },
  { cat: 'advanced', q: 'What is geofencing?', a: 'Geofencing uses GPS coordinates to create virtual boundaries restricting where a drone can fly. Manufacturers embed NFZ geofence data so drones slow or stop near restricted airspace. Commercial operators can apply for temporary geofence unlocks for legitimate operations in restricted zones.' },
  { cat: 'advanced', q: 'What is return-to-home (RTH)?', a: 'RTH automatically flies the drone back to its takeoff point when battery is critically low, signal is lost, or the pilot triggers it manually. Set RTH altitude well above all surrounding obstacles before each flight. Always verify the home point is correctly set after powering on.' },
];

const CAT_LABELS = {
  basics: 'Drone Basics',
  setup: 'Setup and First Flight',
  repair: 'Repair and Maintenance',
  tech: 'Technology',
  regs: 'Regulations',
  pricing: 'Pricing and Buying',
  advanced: 'Advanced Operations'
};

const WEBSITE_CONTEXT = `
ABOUT DRONES.HELP:
Global Drone Intelligence Hub. The world's most comprehensive drone learning and intelligence platform. Built for everyone from first-time flyers to defence engineers.
Stats: 1,400+ Drone models catalogued, 320+ Step-by-step tutorials, 80+ Manufacturers covered, 46 Countries Covered.

SERVICES OFFERED:
- Setup Tutorials: Guided setup for 500+ models. Remote binding, IMU calibration, flight mode configuration.
- Repair and Diagnostics: Fix motor failures, replace ESCs, resolder boards, troubleshoot crashes.
- Technology Deep Dives: Obstacle avoidance, LiDAR, FPV signal stacks, autopilot firmware.
- Drone Model Encyclopaedia: Spec sheets, sensor payloads, competitor comparisons for 1,400+ drones.
- Company and Tech Intelligence: In-depth profiles on 80+ manufacturers.
- Regulations by Country: Regulations, licensing, no-fly zones for 46 countries.
- Certification Prep: Courses aligned to FAA Part 107, DGCA India, EU A1/A2/A3, and BVLOS.
- Custom Build Guides: Component selection, BOMs for FPV freestyle, long-range.
- Expert Q&A Community: Verified answers from certified drone engineers.

DRONE CATEGORIES COVERED:
- Consumer Quadcopters (DJI Mini, Autel Evo Nano, Holy Stone)
- Professional Cinema Drones (DJI Inspire, Freefly Alta)
- Agricultural Drones (DJI Agras, XAG P100, Hylio AG-272)
- FPV and Racing Drones (Custom 5-inch, TinyWhoops)
- Fixed-Wing and VTOL (WingtraOne, SenseFly eBee)
- Defence and Surveillance UAVs (Military-grade UAVs, loitering munitions)
- Cargo and Delivery Drones (Wing, Zipline, Manna Aero)
- Industrial Inspection Drones (Thermal, LiDAR, gas-sensor)

KEY COMPANIES AND TECHNOLOGIES PROFILED:
- DJI (China): OcuSync O3+, APAS 5.0, ActiveTrack, 4K Gimbal
- Autel Robotics (USA): SkyLink Transmission, LiDAR Avoidance, HDR Imaging
- Skydio (USA): AI Autonomy Engine, 360 Obstacle Avoidance, Keyframe
- Parrot Group (France): FreeFlight 7, ANAFI Thermal, Pix4D Integration
- senseFly (Trimble) (Switzerland): Fixed-Wing Autopilot, PPK RTK GPS, eMotion Software
- Zipline (USA): Fixed-Wing Delivery, Autonomous Dispatch, Platform 2 Droid
- XAG (China): RealTerra 3D Mapping, Precision Spraying, 5G RTK
- Quantum Systems (Germany): Vector VTOL, AI Sensor Fusion, BVLOS Certified
- Percepto (Israel): Drone-in-a-Box, AIM Platform, Thermal Analytics

PRICING PLANS (Start free. Upgrade anytime.):
- Free ($0): 50 setup tutorials, basic encyclopaedia, community forum, regulations (10 countries).
- Pro ($19/month billed annually): All 320+ tutorials, full encyclopaedia, repair library, full regulations (46 countries), build guides, certification prep, priority Q&A.
- Enterprise ($79/month, up to 10 seats): Everything in Pro + team management dashboard, custom training, API access, dedicated account manager.
`;

const SYSTEM_PROMPT = `You are the drones.help AI Assistant - knowledgeable, friendly, and professional.

Your roles:
1. Answer drone questions accurately and concisely
2. Understand what the visitor wants to accomplish
3. Guide them to the right resource on drones.help (tutorials, encyclopaedia, certification courses, regulations hub, pricing)
4. Capture lead information naturally - never all at once
5. Escalate to human for: complaints, enterprise pricing, legal specifics, safety incidents

CRITICAL INSTRUCTION:
You MUST ONLY answer questions using the information provided in the Website Knowledge Base below. Do NOT use outside knowledge to answer questions. If a question cannot be answered using the Knowledge Base, politely say you do not have that information and suggest they check the community forums or contact a human expert.

Website Knowledge Base (General Info & Services):
${WEBSITE_CONTEXT}

Website Knowledge Base (FAQ):
${FAQ_DATA.map(item => `Q: ${item.q}\nA: ${item.a}`).join('\n\n')}

Personality: Direct and warm. No filler phrases like "Great question!" - get to the answer. Short sentences. Real information.

Lead qualification - weave in naturally across the conversation:
- Flying recreationally or commercially?
- Experience level?
- Which drone model (for setup/repair)?
- Primary goal?
- Email only if they express strong buying intent or want follow-up

Keep answers concise (3-5 sentences for simple questions; structured lists for complex ones). Reference drones.help sections when relevant. Be honest when something needs a human expert.

Escalation script: "This one deserves a proper answer from our team. What is the best email to reach you?"`;

export default function App() {
  // Navigation state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // FAQ states
  const [activeCat, setActiveCat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openQuestion, setOpenQuestion] = useState(null);

  // Chatbot states
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hi there! I am the drones.help assistant.\n\nSetup help, repair advice, drone comparisons, regulations - ask me anything and I will point you in the right direction."
    }
  ]);
  const [quickReplies, setQuickReplies] = useState([
    "What is the best drone for a beginner?",
    "My drone won't take off. What do I check?",
    "Do I need a license to fly a drone?",
    "How do I set up a drone for the first time?"
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Refs for Chat
  const chatMessagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      const container = chatMessagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isTyping]);

  // Handle FAQ Toggling (Only one open at a time, matches original logic)
  const toggleFAQ = (qText) => {
    if (openQuestion === qText) {
      setOpenQuestion(null);
    } else {
      setOpenQuestion(qText);
    }
  };

  // Filter FAQs based on active category and search text
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat = activeCat === 'all' || item.cat === activeCat;
      const matchesSearch = !searchTerm || 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.a.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCat, searchTerm]);

  // Group FAQs by category (for "All" tab)
  const groupedFAQs = useMemo(() => {
    const groups = {};
    filteredFAQs.forEach((item) => {
      if (!groups[item.cat]) {
        groups[item.cat] = [];
      }
      groups[item.cat].push(item);
    });
    return groups;
  }, [filteredFAQs]);

  // Send message function
  const handleSendMessage = async (overrideText) => {
    const text = (overrideText || chatInput).trim();
    if (!text || isTyping) return;

    if (!overrideText) {
      setChatInput('');
    }
    setQuickReplies([]);

    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Check if the user query matches any FAQ locally to avoid API calls
    const getWords = (s) => {
      let normalized = s.toLowerCase()
        .replace(/licence/g, 'license')
        .replace(/defence/g, 'defense')
        .replace(/uav/g, 'drone')
        .replace(/quadcopter/g, 'drone')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return normalized.split(' ').filter(w => w.length > 0);
    };

    const stemWord = (w) => {
      if (w.startsWith('calibr')) return 'calibr';
      if (w.startsWith('regul')) return 'regul';
      if (w.startsWith('replac')) return 'replac';
      if (w.startsWith('begin')) return 'begin';
      if (w.startsWith('fly') || w.startsWith('flie') || w.startsWith('flight')) return 'fly';
      if (w.startsWith('motor')) return 'motor';
      if (w.startsWith('prop')) return 'prop';
      if (w.startsWith('avoid')) return 'avoid';
      if (w.startsWith('insur')) return 'insur';
      if (w.startsWith('licens')) return 'license';
      return w;
    };

    const queryWords = getWords(text);
    const stemmedQueryWords = queryWords.map(stemWord);
    const cleanedText = queryWords.join(' ');

    let matchedFAQ = null;

    if (queryWords.length > 0) {
      // 1. Try exact/substring match first
      matchedFAQ = FAQ_DATA.find((item) => {
        const qWords = getWords(item.q);
        const cleanedQ = qWords.join(' ');
        if (cleanedQ === cleanedText) return true;
        if (cleanedText.length >= 6) {
          if (cleanedQ.includes(cleanedText) || cleanedText.includes(cleanedQ)) return true;
        }
        return false;
      });

      // 2. If no exact/substring match, try token overlap matching
      if (!matchedFAQ) {
        let bestScore = 0;
        let bestMatch = null;

        if (queryWords.length >= 2) {
          FAQ_DATA.forEach((item) => {
            const qWords = getWords(item.q);
            const stemmedQWords = qWords.map(stemWord);
            
            // Count overlap of stemmed words
            let overlap = 0;
            stemmedQueryWords.forEach(w => {
              if (stemmedQWords.includes(w)) overlap++;
            });

            // Calculate score based on overlap and ratio
            const queryCoverage = overlap / stemmedQueryWords.length;
            const faqCoverage = overlap / stemmedQWords.length;
            const score = queryCoverage + faqCoverage;

            // We want at least a solid overlap (e.g. at least 2 words or 50% coverage)
            if (overlap >= 2 && queryCoverage >= 0.5) {
              if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
              }
            }
          });

          if (bestMatch && bestScore > 0.8) {
            matchedFAQ = bestMatch;
          }
        }
      }
    }

    if (matchedFAQ) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bot', content: matchedFAQ.a }]);
        setIsTyping(false);

        const lower = text.toLowerCase();
        let newQRs = [];
        if (lower.includes('beginn') || lower.includes('first') || lower.includes('start') || matchedFAQ.cat === 'setup' || matchedFAQ.cat === 'basics') {
          newQRs = ['What is the best drone for a beginner?', 'How do I set up a drone for the first time?', 'Do I need a license to fly a drone?'];
        } else if (lower.includes('repair') || lower.includes('fix') || lower.includes('broken') || matchedFAQ.cat === 'repair') {
          newQRs = ["My drone won't take off. What do I check?", 'Why does my drone drift in one direction?', 'How often should I replace propellers?'];
        } else if (lower.includes('regulat') || lower.includes('law') || lower.includes('licens') || matchedFAQ.cat === 'regs' || matchedFAQ.cat === 'advanced') {
          newQRs = ['Do I need a license to fly a drone?', 'What is a no-fly zone?', 'Do drones need insurance?'];
        } else if (lower.includes('buy') || lower.includes('price') || lower.includes('cost') || matchedFAQ.cat === 'pricing') {
          newQRs = ['How much does a drone cost?', 'What is the best drone for a beginner?', 'DJI or another brand?'];
        } else {
          newQRs = ['How do I set up a drone for the first time?', 'Why does my drone drift in one direction?', 'Do I need a license to fly a drone?', 'How much does a drone cost?'];
        }
        setQuickReplies(newQRs);
      }, 600);
      return;
    }

    try {
      // Map local roles ('user'/'bot') to API expectations ('user'/'assistant')
      // We slice(1) to skip the initial bot greeting because the Anthropic Messages API 
      // strictly requires the first message in the array to be from the 'user'.
      const apiMessages = updatedMessages.slice(1).map((msg) => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      }));

      let reply = '';
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (apiKey) {
        // Format messages for Gemini API
        const geminiMessages = apiMessages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: geminiMessages,
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API Error (Status ${response.status}):`, errorText);
          throw new Error(`Error from Gemini API: ${response.statusText}`);
        }

        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';
      } else {
        // Use Netlify function in production, fallback to local server in development
        const apiEndpoint = import.meta.env.PROD 
          ? '/.netlify/functions/chat' 
          : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/chat');
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system: SYSTEM_PROMPT,
            messages: apiMessages
          })
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error('The AI is receiving too many requests right now. Please wait a minute and try again.');
          }
          throw new Error('Having trouble connecting right now. Please try again in a moment.');
        }

        const data = await res.json();
        reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please try again.';
      }
      
      setMessages((prev) => [...prev, { role: 'bot', content: reply }]);

      // Dynamically define QR replies based on text keyword matches
      const lower = text.toLowerCase();
      let newQRs = [];
      if (lower.includes('beginn') || lower.includes('first') || lower.includes('start')) {
        newQRs = ['What is the best drone for a beginner?', 'How do I set up a drone for the first time?', 'Do I need a license to fly a drone?'];
      } else if (lower.includes('repair') || lower.includes('fix') || lower.includes('broken')) {
        newQRs = ["My drone won't take off. What do I check?", 'Why does my drone drift in one direction?', 'How often should I replace propellers?'];
      } else if (lower.includes('regulat') || lower.includes('law') || lower.includes('licens')) {
        newQRs = ['Do I need a license to fly a drone?', 'What is a no-fly zone?', 'Do drones need insurance?'];
      } else if (lower.includes('buy') || lower.includes('price') || lower.includes('cost')) {
        newQRs = ['How much does a drone cost?', 'What is the best drone for a beginner?', 'DJI or another brand?'];
      } else {
        newQRs = ['How do I set up a drone for the first time?', 'Why does my drone drift in one direction?', 'Do I need a license to fly a drone?', 'How much does a drone cost?'];
      }
      setQuickReplies(newQRs);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: e.message || 'Having trouble connecting right now. Please try again in a moment.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Follow-up question integration: scroll, focus input and trigger message
  const sendToChat = (q) => {
    const faqEl = document.getElementById('faq');
    if (faqEl) {
      faqEl.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      handleSendMessage(q);
    }, 400);
  };

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="#" className="logo">
          drones<span>.help</span>
        </a>
        <button 
          className={`nav-toggle ${isMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li><a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a></li>
          <li><a href="#drone-types" onClick={() => setIsMenuOpen(false)}>Drone Types</a></li>
          <li><a href="#tech" onClick={() => setIsMenuOpen(false)}>Companies</a></li>
          <li><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a></li>
          <li><a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a></li>
          <li><a href="#" className="nav-cta" onClick={() => setIsMenuOpen(false)}>Get Started Free</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Global Drone Intelligence Hub</div>
          <h1>
            Your complete guide to <em>every drone</em> on earth
          </h1>
          <p className="hero-sub">
            Setup tutorials, repair guides, technology deep-dives, and an encyclopaedia of every drone model and manufacturer - plus an AI assistant that answers instantly.
          </p>
          <div className="hero-actions">
            <a href="#services" className="btn-primary">Explore Tutorials</a>
            <a href="#faq" className="btn-secondary">Ask the AI</a>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/Drones.help/Main_banner.webp" alt="Drones.help Main Banner" className="hero-img" />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-strip">
        <div>
          <div className="stat-num">1,400+</div>
          <div className="stat-label">Drone models catalogued</div>
        </div>
        <div>
          <div className="stat-num">320+</div>
          <div className="stat-label">Step-by-step tutorials</div>
        </div>
        <div>
          <div className="stat-num">80+</div>
          <div className="stat-label">Manufacturers covered</div>
        </div>
        <div>
          <div className="stat-num">46</div>
          <div className="stat-label">Countries Covered</div>
        </div>
      </div>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="section-label">What we offer</div>
        <h2 className="section-title">Everything you need to know about drones</h2>
        <p className="section-sub">
          From first-time setup to advanced electronics repair, expert-authored content for every stage of your drone journey.
        </p>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon bg-blue">
              <img src="/Drones.help/What we offer/Setup Tutorials.webp" alt="Setup Tutorials" className="service-icon-img" />
            </div>
            <h3>Setup Tutorials</h3>
            <p>Guided setup for 500+ models. Remote binding, IMU calibration, flight mode configuration, and maiden-flight checklists.</p>
            <span className="service-tag">Beginner Friendly</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-orange">
              <img src="/Drones.help/What we offer/Repair and Diagnostics.webp" alt="Repair and Diagnostics" className="service-icon-img" />
            </div>
            <h3>Repair and Diagnostics</h3>
            <p>Fix motor failures, replace ESCs, resolder boards, troubleshoot firmware crashes, and repair cracked frames - video and written guides.</p>
            <span className="service-tag">Intermediate</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-green">
              <img src="/Drones.help/What we offer/Technology Deep Dives.webp" alt="Technology Deep Dives" className="service-icon-img" />
            </div>
            <h3>Technology Deep Dives</h3>
            <p>How obstacle avoidance, LiDAR, FPV signal stacks, and autopilot firmware work - explained for pilots and engineers alike.</p>
            <span className="service-tag">Technical</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-purple">
              <img src="/Drones.help/What we offer/Drone Model Encyclopaedia.webp" alt="Drone Model Encyclopaedia" className="service-icon-img" />
            </div>
            <h3>Drone Model Encyclopaedia</h3>
            <p>Spec sheets, sensor payloads, endurance ratings, and competitor comparisons for 1,400+ consumer, commercial, and military drones.</p>
            <span className="service-tag">Reference</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-yellow">
              <img src="/Drones.help/What we offer/Company and Tech Intelligence.webp" alt="Company and Tech Intelligence" className="service-icon-img" />
            </div>
            <h3>Company and Tech Intelligence</h3>
            <p>In-depth profiles on 80+ manufacturers: flagship technologies, IP portfolios, funding history, and market positioning.</p>
            <span className="service-tag">Industry</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-pink">
              <img src="/Drones.help/What we offer/Regulations by Country.webp" alt="Regulations by Country" className="service-icon-img" />
            </div>
            <h3>Regulations by Country</h3>
            <p>Drone regulations, licensing requirements, no-fly zones, and import restrictions for 46 countries - updated quarterly.</p>
            <span className="service-tag">Compliance</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-blue">
              <img src="/Drones.help/What we offer/Certification Prep.webp" alt="Certification Prep" className="service-icon-img" />
            </div>
            <h3>Certification Prep</h3>
            <p>Courses aligned to FAA Part 107, DGCA India, EU A1/A2/A3, and BVLOS operator certifications.</p>
            <span className="service-tag">Career</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-green">
              <img src="/Drones.help/What we offer/Custom Build Guides.webp" alt="Custom Build Guides" className="service-icon-img" />
            </div>
            <h3>Custom Build Guides</h3>
            <p>Component selection, motor-prop pairing calculators, and full BOMs for FPV freestyle, long-range, and commercial builds.</p>
            <span className="service-tag">Advanced</span>
          </div>
          <div className="service-card">
            <div className="service-icon bg-orange">
              <img src="/Drones.help/What we offer/Expert Q&A Community.webp" alt="Expert Q&amp;A Community" className="service-icon-img" />
            </div>
            <h3>Expert Q&amp;A Community</h3>
            <p>Ask certified drone engineers and veteran pilots - verified answers, searchable archive, and weekly live AMA sessions.</p>
            <span className="service-tag">Community</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how">
        <div className="section-label">How it works</div>
        <h2 className="section-title">From zero to flying in four steps</h2>
        <p className="section-sub">Structured learning paths from unboxing to becoming a certified pilot - without the overwhelm.</p>
        <div className="steps-grid">
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-num">01</div>
            <h4>Choose Your Drone</h4>
            <p>Search our encyclopaedia by model, category, budget, or use case.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h4>Follow Setup Guide</h4>
            <p>Step-by-step photo and video tutorials built for your exact model.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h4>Learn the Tech</h4>
            <p>Understand every component - sensors, firmware, protocols, and flight physics.</p>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <h4>Fly and Grow</h4>
            <p>Advanced tutorials, repair guides, and certification paths as your skills develop.</p>
          </div>
        </div>
      </section>

      {/* DRONE TYPES */}
      <section className="drone-types" id="drone-types">
        <div className="section-label">Drone categories</div>
        <h2 className="section-title">Every class of drone, covered</h2>
        <p className="section-sub">Tutorials and encyclopaedia entries spanning every major drone category in the global market today.</p>
        <div className="types-grid">
          <div className="type-card">
            <div className="type-img bg-blue">
              <img src="/Drones.help/Drone categories/Consumer Quadcopters.webp" alt="Consumer Quadcopters" className="type-card-img" />
            </div>
            <div>
              <h3>Consumer Quadcopters</h3>
              <p>DJI Mini series, Autel Evo Nano, Holy Stone - setup, calibration, and photography guides.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-orange">
              <img src="/Drones.help/Drone categories/Professional Cinema Drones.webp" alt="Professional Cinema Drones" className="type-card-img" />
            </div>
            <div>
              <h3>Professional Cinema Drones</h3>
              <p>DJI Inspire, Freefly Alta, and heavy-lift cinema platforms. Gimbal and payload integration.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-green">
              <img src="/Drones.help/Drone categories/Agricultural Drones.webp" alt="Agricultural Drones" className="type-card-img" />
            </div>
            <div>
              <h3>Agricultural Drones</h3>
              <p>DJI Agras, XAG P100, Hylio AG-272 - spraying, multispectral imaging, and precision agriculture.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-purple">
              <img src="/Drones.help/Drone categories/FPV and Racing Drones.webp" alt="FPV and Racing Drones" className="type-card-img" />
            </div>
            <div>
              <h3>FPV and Racing Drones</h3>
              <p>Custom 5-inch freestyle builds, TinyWhoops, long-range FPV, and Betaflight tuning guides.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-yellow">
              <img src="/Drones.help/Drone categories/Fixed-Wing and VTOL.webp" alt="Fixed-Wing and VTOL" className="type-card-img" />
            </div>
            <div>
              <h3>Fixed-Wing and VTOL</h3>
              <p>WingtraOne, SenseFly eBee, and BVLOS survey platforms. Autopilot and mission planning.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-pink">
              <img src="/Drones.help/Drone categories/Defence and Surveillance UAVs.webp" alt="Defence and Surveillance UAVs" className="type-card-img" />
            </div>
            <div>
              <h3>Defence and Surveillance UAVs</h3>
              <p>Technology profiles of military-grade UAVs, loitering munitions, swarm systems, and counter-drone tech.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-blue">
              <img src="/Drones.help/Drone categories/Cargo and Delivery Drones.webp" alt="Cargo and Delivery Drones" className="type-card-img" />
            </div>
            <div>
              <h3>Cargo and Delivery Drones</h3>
              <p>Wing, Zipline, Manna Aero - payload systems, route planning, and UTM integration.</p>
            </div>
          </div>
          <div className="type-card">
            <div className="type-img bg-green">
              <img src="/Drones.help/Drone categories/Industrial Inspection Drones.webp" alt="Industrial Inspection Drones" className="type-card-img" />
            </div>
            <div>
              <h3>Industrial Inspection Drones</h3>
              <p>Thermal, LiDAR, and gas-sensor platforms for infrastructure, power lines, and pipeline inspection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TECH COMPANIES */}
      <section className="tech-section" id="tech">
        <div className="section-label">Companies and technologies</div>
        <h2 className="section-title">Who is building the future of drones</h2>
        <p className="section-sub">Profiles of the world's leading drone manufacturers and what sets their core technology apart.</p>
        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-company-name">DJI</div>
            <div className="tech-country">China - Consumer and Professional</div>
            <div className="tech-tags">
              <span className="tech-tag">OcuSync O3+</span>
              <span className="tech-tag">APAS 5.0 Avoidance</span>
              <span className="tech-tag">ActiveTrack</span>
              <span className="tech-tag">4K Gimbal</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">Autel Robotics</div>
            <div className="tech-country">USA - Consumer</div>
            <div className="tech-tags">
              <span className="tech-tag">SkyLink Transmission</span>
              <span className="tech-tag">LiDAR Avoidance</span>
              <span className="tech-tag">HDR Imaging</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">Skydio</div>
            <div className="tech-country">USA - AI Autonomy</div>
            <div className="tech-tags">
              <span className="tech-tag">AI Autonomy Engine</span>
              <span className="tech-tag">360 Obstacle Avoidance</span>
              <span className="tech-tag">Keyframe</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">Parrot Group</div>
            <div className="tech-country">France - Enterprise</div>
            <div className="tech-tags">
              <span className="tech-tag">FreeFlight 7</span>
              <span className="tech-tag">ANAFI Thermal</span>
              <span className="tech-tag">Pix4D Integration</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">senseFly (Trimble)</div>
            <div className="tech-country">Switzerland - Surveying</div>
            <div className="tech-tags">
              <span className="tech-tag">Fixed-Wing Autopilot</span>
              <span className="tech-tag">PPK RTK GPS</span>
              <span className="tech-tag">eMotion Software</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">Zipline</div>
            <div className="tech-country">USA - Delivery Logistics</div>
            <div className="tech-tags">
              <span className="tech-tag">Fixed-Wing Delivery</span>
              <span className="tech-tag">Autonomous Dispatch</span>
              <span className="tech-tag">Platform 2 Droid</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">XAG</div>
            <div className="tech-country">China - Agriculture</div>
            <div className="tech-tags">
              <span className="tech-tag">RealTerra 3D Mapping</span>
              <span className="tech-tag">Precision Spraying</span>
              <span className="tech-tag">5G RTK</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">Quantum Systems</div>
            <div className="tech-country">Germany - Defence VTOL</div>
            <div className="tech-tags">
              <span className="tech-tag">Vector VTOL</span>
              <span className="tech-tag">AI Sensor Fusion</span>
              <span className="tech-tag">BVLOS Certified</span>
            </div>
          </div>
          <div className="tech-card">
            <div className="tech-company-name">Percepto</div>
            <div className="tech-country">Israel - Autonomous Inspection</div>
            <div className="tech-tags">
              <span className="tech-tag">Drone-in-a-Box</span>
              <span className="tech-tag">AIM Platform</span>
              <span className="tech-tag">Thermal Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="section-label">Membership plans</div>
        <h2 className="section-title">Start free. Upgrade anytime.</h2>
        <p className="section-sub">
          Hundreds of free tutorials from day one. Unlock the full library, certifications, and expert support with a Premium plan.
        </p>
        <div className="plans-grid">
          <div className="plan-card">
            <div className="plan-name">Free</div>
            <div className="plan-price"><sup>$</sup>0</div>
            <div className="plan-period">Forever free</div>
            <ul className="plan-features">
              <li>50 setup tutorials</li>
              <li>Basic model encyclopaedia</li>
              <li>Company profiles (partial)</li>
              <li>Community forum access</li>
              <li>Regulations: 10 countries</li>
            </ul>
            <a href="#" className="btn-primary">Get Started</a>
          </div>
          <div className="plan-card featured">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price"><sup>$</sup>19</div>
            <div className="plan-period">per month, billed annually</div>
            <ul className="plan-features">
              <li>All 320+ tutorials</li>
              <li>Full model encyclopaedia</li>
              <li>Repair and diagnostics library</li>
              <li>Full regulations: 46 countries</li>
              <li>Custom build guides and BOMs</li>
              <li>Certification prep courses</li>
              <li>Priority expert Q&amp;A</li>
            </ul>
            <a href="#" className="btn-primary">Start Pro</a>
          </div>
          <div className="plan-card">
            <div className="plan-name">Enterprise</div>
            <div className="plan-price"><sup>$</sup>79</div>
            <div className="plan-period">per month, up to 10 seats</div>
            <ul className="plan-features">
              <li>Everything in Pro</li>
              <li>Team management dashboard</li>
              <li>Custom training paths</li>
              <li>White-label course builder</li>
              <li>API access to drone database</li>
              <li>Quarterly regulatory updates</li>
              <li>Dedicated account manager</li>
            </ul>
            <a href="#" className="btn-primary">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* FAQ + CHATBOT */}
      <section className="faq-chatbot-section" id="faq">
        <div className="section-label">FAQ + AI Assistant</div>
        <h2 className="section-title">35 expert answers. And an AI that goes deeper.</h2>
        <p className="section-sub">
          Search our drone FAQ instantly or ask the AI assistant anything - it answers in seconds, qualifies your needs, and connects you with the right resource.
        </p>

        <div className="faq-chat-layout">
          {/* FAQ PANEL */}
          <div className="faq-panel">
            <div className="faq-panel-header">
              <h2>Drone FAQ - 35 Expert Answers</h2>
              <span className="faq-count">7 Categories</span>
            </div>
            <div className="faq-search-wrap">
              <div className="search-wrap-inner">
                <span className="search-icon">🔍</span>
                <input
                  className="faq-search"
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="faq-cats">
              {['all', 'basics', 'setup', 'repair', 'tech', 'regs', 'pricing', 'advanced'].map((catKey) => (
                <div
                  key={catKey}
                  className={`cat-tab ${activeCat === catKey ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCat(catKey);
                  }}
                >
                  {catKey.charAt(0).toUpperCase() + catKey.slice(1)}
                </div>
              ))}
            </div>
            <div className="faq-list">
              {filteredFAQs.length === 0 ? (
                <div className="no-results">No matching questions. Try the AI assistant.</div>
              ) : activeCat === 'all' ? (
                Object.keys(groupedFAQs).map((catKey) => (
                  <React.Fragment key={catKey}>
                    <div className="faq-category-label">{CAT_LABELS[catKey]}</div>
                    {groupedFAQs[catKey].map((item) => (
                      <div
                        key={item.q}
                        className={`faq-item ${openQuestion === item.q ? 'open' : ''}`}
                      >
                        <div className="faq-q" onClick={() => toggleFAQ(item.q)}>
                          <span className="faq-q-text">{item.q}</span>
                          <span className="faq-chevron">▾</span>
                        </div>
                        <div className="faq-a" style={{ display: openQuestion === item.q ? 'block' : 'none' }}>
                          <div className="faq-a-inner">
                            {item.a}
                            <br />
                            <button className="ask-chat-btn" onClick={() => sendToChat(item.q)}>
                              💬 Ask follow-up in AI chat →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                filteredFAQs.map((item) => (
                  <div
                    key={item.q}
                    className={`faq-item ${openQuestion === item.q ? 'open' : ''}`}
                  >
                    <div className="faq-q" onClick={() => toggleFAQ(item.q)}>
                      <span className="faq-q-text">{item.q}</span>
                      <span className="faq-chevron">▾</span>
                    </div>
                    <div className="faq-a" style={{ display: openQuestion === item.q ? 'block' : 'none' }}>
                      <div className="faq-a-inner">
                        {item.a}
                        <br />
                        <button className="ask-chat-btn" onClick={() => sendToChat(item.q)}>
                          💬 Ask follow-up in AI chat →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CHAT PANEL */}
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-info">
                <h3>Drone Assistant</h3>
                <p>drones.help AI - replies instantly</p>
              </div>
              <div className="online-dot"></div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`msg ${msg.role}`}>
                  <div className="msg-avatar">
                    {msg.role === 'bot' ? '🤖' : 'You'}
                  </div>
                  <div className="msg-bubble">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="msg bot">
                  <div className="msg-avatar">🤖</div>
                  <div className="msg-bubble typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              {/* Dummy element for scrolling anchor */}
              <div ref={chatMessagesEndRef} />
            </div>

            <div className="quick-replies">
              {quickReplies.map((replyText, idx) => (
                <button
                  key={idx}
                  className="qr-btn"
                  onClick={() => {
                    handleSendMessage(replyText);
                  }}
                >
                  {replyText}
                </button>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                type="text"
                placeholder="Ask anything about drones..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="send-btn"
                onClick={() => {
                  handleSendMessage();
                }}
              >
                <svg viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>
          Ready to master <span>every drone</span> on earth?
        </h2>
        <p>Join 40,000 pilots, engineers, and enthusiasts who learn with drones.help every month.</p>
        <div className="cta-actions">
          <a href="#" className="btn-accent">Start for Free</a>
          <a href="#faq" className="btn-outline-white">Ask the AI Now</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          <a href="#" className="logo">
            drones<span style={{ color: 'var(--accent)' }}>.help</span>
          </a>
          <p>
            The world's most comprehensive drone learning and intelligence platform. Built for everyone from first-time flyers to defence engineers.
          </p>
        </div>
        <div>
          <h5>Learn</h5>
          <ul>
            <li><a href="#">Setup Tutorials</a></li>
            <li><a href="#">Repair Guides</a></li>
            <li><a href="#">Custom Builds</a></li>
            <li><a href="#">Certification Prep</a></li>
            <li><a href="#">Technology Explainers</a></li>
          </ul>
        </div>
        <div>
          <h5>Explore</h5>
          <ul>
            <li><a href="#">Drone Encyclopaedia</a></li>
            <li><a href="#">Company Profiles</a></li>
            <li><a href="#">Regulations Hub</a></li>
            <li><a href="#">Comparison Tool</a></li>
            <li><a href="#">Community Forum</a></li>
          </ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>
      </footer>
      <div className="footer-bottom">
        <span>2025 drones.help. All rights reserved.</span>
        <a href="https://www.drones.help">www.drones.help</a>
      </div>
    </>
  );
}
