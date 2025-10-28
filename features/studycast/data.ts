export type StudyGuide = {
  id: string;
  title: string;
  icon: string;
  description: string;
  examBoards: string[];
  levels: ("Foundation" | "Higher")[];
  topics: Topic[];
};

export type Topic = {
  id: string;
  title: string;
  summary: string;
};

export const STUDY_GUIDES: StudyGuide[] = [
  {
    id: "chemistry",
    title: "GCSE Chemistry",
    icon: "🧪",
    description:
      "Covers the full GCSE syllabus including required practicals and key chemical principles.",
    examBoards: ["AQA", "Edexcel", "OCR"],
    levels: ["Foundation", "Higher"],
    topics: [
      {
        id: "atomic-structure",
        title: "Atomic Structure",
        summary:
          "Explore subatomic particles, isotopes, and how electron configurations impact chemical behavior.",
      },
      {
        id: "periodic-table",
        title: "The Periodic Table",
        summary:
          "Understand trends, groups, and the history behind the modern periodic table layout.",
      },
      {
        id: "bonding",
        title: "Bonding, Structure, and Properties",
        summary:
          "Compare ionic, covalent, and metallic bonding with real-world material examples.",
      },
      {
        id: "energy-changes",
        title: "Energy Changes",
        summary:
          "Calculate endothermic and exothermic reactions and interpret energy profile diagrams.",
      },
      {
        id: "rates",
        title: "Rate and Extent of Chemical Change",
        summary:
          "Investigate collision theory, catalysts, and reversible reactions with Le Chatelier's principle.",
      },
      {
        id: "organic",
        title: "Organic Chemistry",
        summary:
          "Follow hydrocarbons from crude oil to polymers, including alcohols and carboxylic acids.",
      },
      {
        id: "analysis",
        title: "Chemical Analysis",
        summary:
          "Master chromatograms, flame tests, and gas tests needed for required practicals.",
      },
      {
        id: "using-resources",
        title: "Using Resources",
        summary:
          "Evaluate sustainable development, water treatment, and lifecycle assessments of materials.",
      },
    ],
  },
  {
    id: "biology",
    title: "GCSE Biology",
    icon: "🧬",
    description:
      "From cell biology to ecology, tackle every specification point with examiner tips.",
    examBoards: ["AQA", "Edexcel", "OCR"],
    levels: ["Foundation", "Higher"],
    topics: [
      {
        id: "cell-biology",
        title: "Cell Biology",
        summary:
          "Review cell structure, microscopy techniques, and transport across membranes.",
      },
      {
        id: "organisation",
        title: "Organisation",
        summary:
          "Trace the digestive, circulatory, and respiratory systems with exam-style case studies.",
      },
      {
        id: "infection",
        title: "Infection and Response",
        summary:
          "Understand pathogens, immune responses, and the impact of vaccines and antibiotics.",
      },
      {
        id: "bioenergetics",
        title: "Bioenergetics",
        summary:
          "Compare photosynthesis and respiration, including limiting factors experiments.",
      },
      {
        id: "homeostasis",
        title: "Homeostasis and Response",
        summary:
          "Balance hormone control, nervous coordination, and practical reflex investigations.",
      },
      {
        id: "inheritance",
        title: "Inheritance, Variation and Evolution",
        summary:
          "Decode DNA, genetics diagrams, and Darwin's theory with contemporary examples.",
      },
      {
        id: "ecology",
        title: "Ecology",
        summary:
          "Analyse ecosystems, trophic levels, and fieldwork sampling techniques for 6-mark answers.",
      },
    ],
  },
  {
    id: "physics",
    title: "GCSE Physics",
    icon: "⚡",
    description:
      "Master calculations, required practicals, and the language of the examiners.",
    examBoards: ["AQA", "Edexcel", "OCR"],
    levels: ["Foundation", "Higher"],
    topics: [
      {
        id: "energy",
        title: "Energy",
        summary:
          "Cover energy stores, efficiency calculations, and national energy resources.",
      },
      {
        id: "electricity",
        title: "Electricity",
        summary:
          "Revise circuit symbols, resistance investigations, and the mains electricity supply.",
      },
      {
        id: "particles",
        title: "Particle Model of Matter",
        summary:
          "Link density, states of matter, and specific latent heat to real-life contexts.",
      },
      {
        id: "atomic-structure-phys",
        title: "Atomic Structure",
        summary:
          "Chart the nuclear model, radioactive decay, and half-life calculations.",
      },
      {
        id: "forces",
        title: "Forces",
        summary:
          "Analyse vector diagrams, motion graphs, and momentum with exam-style questions.",
      },
      {
        id: "waves",
        title: "Waves",
        summary:
          "Study wave properties, the electromagnetic spectrum, and required practicals.",
      },
      {
        id: "space",
        title: "Space Physics",
        summary:
          "Journey from our solar system to cosmology with the life cycle of stars.",
      },
    ],
  },
  {
    id: "english",
    title: "GCSE English Literature",
    icon: "📖",
    description:
      "Literary analysis, contextual insights, and comparative essay planning tools.",
    examBoards: ["AQA", "Edexcel"],
    levels: ["Foundation", "Higher"],
    topics: [
      {
        id: "macbeth",
        title: "Macbeth",
        summary:
          "Dissect key scenes, character arcs, and critical interpretations with examiner favourites.",
      },
      {
        id: "jekyll-hyde",
        title: "Jekyll and Hyde",
        summary:
          "Explore duality, Victorian context, and quote banks for quick revision.",
      },
      {
        id: "an-inspector-calls",
        title: "An Inspector Calls",
        summary:
          "Track stage directions, social responsibility themes, and high-level evaluation lines.",
      },
      {
        id: "power-conflict",
        title: "Power and Conflict Poetry",
        summary:
          "Compare anthology poems with smart comparative phrases and structural insights.",
      },
      {
        id: "unseen-poetry",
        title: "Unseen Poetry",
        summary:
          "Learn a step-by-step approach for decoding unseen poems under timed conditions.",
      },
      {
        id: "modern-text",
        title: "Modern Text Options",
        summary:
          "From 'Blood Brothers' to 'Lord of the Flies', tailor your revision to the set text.",
      },
    ],
  },
  {
    id: "geography",
    title: "GCSE Geography",
    icon: "🌍",
    description:
      "Case studies, fieldwork mastery, and synoptic links across physical and human topics.",
    examBoards: ["AQA", "Edexcel", "OCR"],
    levels: ["Foundation", "Higher"],
    topics: [
      {
        id: "natural-hazards",
        title: "Natural Hazards",
        summary:
          "Investigate tectonic events, weather hazards, and climate change adaptation.",
      },
      {
        id: "ecosystems",
        title: "Ecosystems and Biomes",
        summary:
          "Compare tropical rainforests, hot deserts, and UK ecosystems using case studies.",
      },
      {
        id: "uk-landscapes",
        title: "UK Landscapes",
        summary:
          "Analyse coastal and river processes with OS map skills and fieldwork data.",
      },
      {
        id: "urban-issues",
        title: "Urban Issues",
        summary:
          "Evaluate megacity growth, urban regeneration, and sustainability strategies.",
      },
      {
        id: "economic-world",
        title: "The Changing Economic World",
        summary:
          "Understand development indicators, globalisation, and transnational corporations.",
      },
      {
        id: "resource-management",
        title: "Resource Management",
        summary:
          "Cover food, water, and energy security challenges with real exam data.",
      },
    ],
  },
  {
    id: "business",
    title: "GCSE Business",
    icon: "📊",
    description:
      "Bring business theory to life with startup stories, finance drills, and strategy maps.",
    examBoards: ["AQA", "Edexcel", "OCR"],
    levels: ["Foundation", "Higher"],
    topics: [
      {
        id: "enterprise",
        title: "Enterprise and Entrepreneurship",
        summary:
          "Explore business aims, risk, and reward with mini case study breakdowns.",
      },
      {
        id: "marketing",
        title: "Marketing",
        summary:
          "Master segmentation, the marketing mix, and product life cycles with revision grids.",
      },
      {
        id: "finance",
        title: "Finance",
        summary:
          "Calculate break-even, cash flow forecasts, and profitability ratios confidently.",
      },
      {
        id: "operations",
        title: "Operations",
        summary:
          "Compare quality assurance, supply chain design, and lean production strategies.",
      },
      {
        id: "human-resources",
        title: "Human Resources",
        summary:
          "Understand recruitment, motivation theories, and organisational structures.",
      },
      {
        id: "influences",
        title: "Influences on Business",
        summary:
          "Assess ethical, environmental, and economic influences with up-to-date examples.",
      },
    ],
  },
];
