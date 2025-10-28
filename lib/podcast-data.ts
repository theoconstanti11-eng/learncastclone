export type ExamBoard = "AQA" | "Edexcel" | "OCR";
export type Level = "Foundation" | "Higher";

export interface Podcast {
  id: string;
  title: string;
  subject: string;
  category: string;
  examBoard: ExamBoard;
  level: Level;
  duration: string;
  audioUrl: string;
  description: string;
  transcript: string;
  thumbnailColor?: string;
}

export const SUBJECT_DETAILS: Record<
  string,
  { icon: string; gradient: string; accent: string }
> = {
  Chemistry: {
    icon: "🔬",
    gradient: "from-sky-400/80 via-blue-500/70 to-indigo-500/70",
    accent: "text-sky-500",
  },
  Physics: {
    icon: "⚡",
    gradient: "from-amber-300/80 via-orange-400/70 to-rose-400/70",
    accent: "text-amber-500",
  },
  Biology: {
    icon: "🌿",
    gradient: "from-emerald-300/80 via-green-400/70 to-teal-400/70",
    accent: "text-emerald-500",
  },
  Maths: {
    icon: "📊",
    gradient: "from-indigo-300/80 via-purple-400/70 to-violet-500/70",
    accent: "text-indigo-500",
  },
  "English Literature": {
    icon: "📖",
    gradient: "from-pink-300/80 via-rose-400/70 to-fuchsia-500/70",
    accent: "text-rose-500",
  },
  Geography: {
    icon: "🌍",
    gradient: "from-teal-300/80 via-cyan-400/70 to-blue-400/70",
    accent: "text-teal-500",
  },
  Business: {
    icon: "💼",
    gradient: "from-yellow-300/80 via-amber-400/70 to-orange-500/70",
    accent: "text-amber-500",
  },
  French: {
    icon: "🗣️",
    gradient: "from-blue-300/80 via-white/60 to-red-400/70",
    accent: "text-blue-500",
  },
};

const PODCAST_LIBRARY: Podcast[] = [
  {
    id: "chem-atomic-structure",
    title: "Atomic Structure Essentials",
    subject: "Chemistry",
    category: "Atomic Structure",
    examBoard: "AQA",
    level: "Foundation",
    duration: "8m 12s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/10/09/audio_99d115f6e4.mp3?filename=calm-meditation-114475.mp3",
    description:
      "Review the make-up of the atom, sub-atomic particles, and how isotopes influence chemical properties with clear exam-ready examples.",
    transcript:
      "In this StudyCast we walk through the basic model of the atom: protons, neutrons and electrons. You'll hear how Rutherford's gold foil experiment reshaped the model, why isotopes exist and how they are represented, and we finish with sample exam questions that highlight mass number and atomic number calculations.",
  },
  {
    id: "chem-bonding",
    title: "Chemical Bonding Deep Dive",
    subject: "Chemistry",
    category: "Bonding & Structure",
    examBoard: "Edexcel",
    level: "Higher",
    duration: "9m 05s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_67d5bbd7f7.mp3?filename=ambient-background-11157.mp3",
    description:
      "Ionic, covalent and metallic bonding unpacked with visual imagery and strong analogies so you can remember properties and uses.",
    transcript:
      "We'll begin with ionic bonding: how positive and negative ions arrange into giant lattices, and what this means for melting points and electrical conductivity. Then we'll compare that with covalent bonding in simple molecules versus giant networks like diamond and graphite. Finally we explore metallic bonding and link everything back to exam-style questions.",
  },
  {
    id: "chem-electrolysis",
    title: "Mastering Electrolysis",
    subject: "Chemistry",
    category: "Chemical Changes",
    examBoard: "OCR",
    level: "Higher",
    duration: "7m 24s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2021/11/22/audio_9d0f1adb48.mp3?filename=calm-ambient-110624.mp3",
    description:
      "A calm explanation of electrolysis with key examples, ionic half equations, and how to answer six-mark questions.",
    transcript:
      "This episode breaks down the process of electrolysis from molten ionic compounds through to electroplating. You'll hear how to predict the products at the anode and cathode, practise writing half-equations, and pick up revision tips for memorising the extraction of aluminium from bauxite.",
  },
  {
    id: "bio-cell-biology",
    title: "Cell Biology Foundations",
    subject: "Biology",
    category: "Cell Biology",
    examBoard: "AQA",
    level: "Foundation",
    duration: "6m 58s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/03/24/audio_885fdac114.mp3?filename=ambient-piano-11236.mp3",
    description:
      "Journey inside the cell and explore organelles, microscopy, and specialised cells with memory hooks for exams.",
    transcript:
      "We describe prokaryotic versus eukaryotic cells, explore the magnification equation, and cover specialised cells like sperm and nerve cells. The podcast ends with guidance on required practicals and common pitfalls examiners report.",
  },
  {
    id: "bio-infection-response",
    title: "Infection and Response Toolkit",
    subject: "Biology",
    category: "Disease & Defence",
    examBoard: "Edexcel",
    level: "Higher",
    duration: "10m 11s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2021/10/25/audio_67e040523a.mp3?filename=inspiring-uplifting-ambient-10092.mp3",
    description:
      "Understand pathogens, the immune system, and vaccination strategies with case studies from past papers.",
    transcript:
      "The episode compares bacterial, viral and fungal pathogens, looks at how the body defends itself through barriers and the immune response, and evaluates the benefits and limitations of vaccination. You'll also revise monoclonal antibodies and how they are used in pregnancy tests and cancer therapy.",
  },
  {
    id: "physics-forces",
    title: "Forces In Balance",
    subject: "Physics",
    category: "Mechanics",
    examBoard: "AQA",
    level: "Foundation",
    duration: "8m 43s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2021/11/23/audio_467262e749.mp3?filename=calm-and-light-110631.mp3",
    description:
      "Analyse contact and non-contact forces, resultant force diagrams, and Newton's laws with scaffolded worked examples.",
    transcript:
      "We'll revisit vector diagrams, calculate resultant forces, and apply Newton's first, second, and third laws to everyday contexts. Revision prompts guide you through inertia, weight versus mass, and resolving forces on slopes.",
  },
  {
    id: "physics-electricity",
    title: "Circuit Masterclass",
    subject: "Physics",
    category: "Electricity",
    examBoard: "OCR",
    level: "Higher",
    duration: "9m 30s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/02/23/audio_2ce906a196.mp3?filename=future-ambient-11120.mp3",
    description:
      "Build confidence with series and parallel circuits, ohmic conductors, and practical tips for required practicals.",
    transcript:
      "We cover charge, current, potential difference and resistance, then work through calculations using V = IR. You'll hear exam-focused reminders for circuit symbols, resistors in parallel, and practical advice for using ammeters and voltmeters accurately.",
  },
  {
    id: "englit-macbeth",
    title: "Macbeth Quotes & Analysis",
    subject: "English Literature",
    category: "Shakespeare",
    examBoard: "AQA",
    level: "Higher",
    duration: "12m 02s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/05/16/audio_5fb8d03b5b.mp3?filename=ambient-11436.mp3",
    description:
      "Unlock the key quotations for Macbeth with context, analysis, and top-grade examiner insights on structure and themes.",
    transcript:
      "We move chronologically through Macbeth, unpacking quotations linked to ambition, guilt, and the supernatural. Each quotation is paired with analysis of language techniques and structural choices, plus examiner-style commentary on how to develop interpretations.",
  },
  {
    id: "englit-jekyll-hyde",
    title: "Jekyll and Hyde Themes",
    subject: "English Literature",
    category: "19th Century Novel",
    examBoard: "Edexcel",
    level: "Foundation",
    duration: "7m 55s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2021/12/07/audio_677a51fc68.mp3?filename=calm-motivational-ambient-11340.mp3",
    description:
      "Summarise the duality of man, secrecy, and science versus religion with quotes you can remember under timed conditions.",
    transcript:
      "This StudyCast explores the dual nature of Victorian society through Stevenson’s characters. We highlight key quotations, consider form and narrative voice, and practise building comparative responses for the exam.",
  },
  {
    id: "geog-tectonic-hazards",
    title: "Tectonic Hazards Case Studies",
    subject: "Geography",
    category: "Natural Hazards",
    examBoard: "OCR",
    level: "Higher",
    duration: "11m 18s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/02/11/audio_b5f710c0ff.mp3?filename=ambient-cinematic-11102.mp3",
    description:
      "Compare the impacts and responses to Haiti 2010 and Japan 2011 with structured revision for 6 and 9 mark questions.",
    transcript:
      "We outline plate tectonic theory, describe primary and secondary impacts of two contrasting earthquakes, and evaluate the effectiveness of short and long term responses. Listen out for revision mnemonics to remember key data.",
  },
  {
    id: "business-marketing-mix",
    title: "Marketing Mix in Action",
    subject: "Business",
    category: "Marketing",
    examBoard: "AQA",
    level: "Foundation",
    duration: "6m 41s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/02/14/audio_76006e88db.mp3?filename=ambient-corporate-11078.mp3",
    description:
      "Understand the 4Ps with relatable GCSE case studies and exam-style application questions.",
    transcript:
      "We recap product, price, place and promotion, linking each to small business case studies. The StudyCast shows you how to develop 9-mark answers by evaluating which element is most important in different scenarios.",
  },
  {
    id: "maths-algebraic-fractions",
    title: "Algebraic Fractions Workout",
    subject: "Maths",
    category: "Algebra",
    examBoard: "Edexcel",
    level: "Higher",
    duration: "8m 27s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3b5c59a2ee.mp3?filename=ambient-dub-11153.mp3",
    description:
      "Step-by-step guidance on simplifying, adding and solving equations with algebraic fractions, including exam pitfalls.",
    transcript:
      "We begin with factorising denominators, then work through example questions involving addition, subtraction and solving equations. Each step is narrated slowly with reminders about restrictions on values and how to check solutions.",
  },
  {
    id: "french-healthy-living",
    title: "French: Healthy Living Speaking Boost",
    subject: "French",
    category: "Speaking Practice",
    examBoard: "AQA",
    level: "Foundation",
    duration: "5m 36s",
    audioUrl:
      "https://cdn.pixabay.com/download/audio/2022/04/13/audio_1f7466d10d.mp3?filename=calm-inspiring-piano-11313.mp3",
    description:
      "Practise describing healthy lifestyles with model answers, sentence starters, and pronunciation tips.",
    transcript:
      "This audio guide offers ready-to-use phrases for discussing diet, exercise and well-being in French. You will hear model responses with key GCSE structures such as 'il faut' and 'je devrais', alongside advice for sounding confident in the speaking exam.",
  },
];

export async function getPodcastLibrary(): Promise<Podcast[]> {
  // Simulate a small network delay for a smoother loading transition
  await new Promise((resolve) => setTimeout(resolve, 450));
  return PODCAST_LIBRARY;
}

export function getRecommendedPodcasts(count = 4): Podcast[] {
  const shuffled = [...PODCAST_LIBRARY].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
