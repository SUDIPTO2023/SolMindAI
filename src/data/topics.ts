import type { KnowledgeGraph, Topic } from "@/types/learning";

// The 11 topics used in the demo knowledge graph.
// Layout values place each topic on the 2D concept map (percent).
export const TOPICS: Topic[] = [
  { id: "vectors", title: "Vectors", shortTitle: "Vectors", summary: "Quantities with both size and direction, and how to combine them.", layout: { x: 20, y: 8 } },
  { id: "mass", title: "Mass and Inertia", shortTitle: "Mass", summary: "How strongly an object resists a change in its motion.", layout: { x: 88, y: 8 } },
  { id: "force", title: "Force", shortTitle: "Force", summary: "A push or pull with a size and a direction.", layout: { x: 40, y: 30 } },
  { id: "friction", title: "Friction", shortTitle: "Friction", summary: "A force that opposes sliding between two surfaces.", layout: { x: 14, y: 52 } },
  { id: "fbd", title: "Free Body Diagram", shortTitle: "FBD", summary: "A sketch of every force acting on one object.", layout: { x: 40, y: 52 } },
  { id: "first-law", title: "Newton's First Law", shortTitle: "1st law", summary: "An object keeps its state of motion unless a net force acts on it.", layout: { x: 62, y: 52 } },
  { id: "third-law", title: "Newton's Third Law", shortTitle: "3rd law", summary: "Forces always come in equal and opposite pairs.", layout: { x: 88, y: 52 } },
  { id: "net-force", title: "Net Force", shortTitle: "Net force", summary: "The single force left after every force on an object is combined.", layout: { x: 30, y: 74 } },
  { id: "algebra", title: "Basic Algebra", shortTitle: "Algebra", summary: "Rearranging and solving simple equations.", layout: { x: 70, y: 74 } },
  { id: "acceleration", title: "Acceleration", shortTitle: "Accel.", summary: "How quickly velocity changes over time.", layout: { x: 90, y: 74 } },
  { id: "second-law", title: "Newton's Second Law", shortTitle: "2nd law", summary: "Acceleration equals net force divided by mass.", layout: { x: 50, y: 94 } },
];

/**
 * Direct prerequisite relationships (from -> to). Indirect links are left out,
 * so the map stays readable. These edges are a proposal: the Physics content
 * lead must review them before the demo.
 */
export const KNOWLEDGE_GRAPH: KnowledgeGraph = {
  topics: TOPICS,
  targetTopicId: "second-law",
  edges: [
    { from: "vectors", to: "force" },
    { from: "mass", to: "first-law" },
    { from: "force", to: "friction" },
    { from: "force", to: "fbd" },
    { from: "force", to: "first-law" },
    { from: "force", to: "third-law" },
    { from: "friction", to: "net-force" },
    { from: "fbd", to: "net-force" },
    { from: "net-force", to: "second-law" },
    { from: "first-law", to: "second-law" },
    { from: "algebra", to: "second-law" },
    { from: "acceleration", to: "second-law" },
  ],
};

/** All 15 concepts in the chapter scope. The demo map uses 11 of them. */
export const CHAPTER_CONCEPTS = [
  "Basic Algebra",
  "Vectors",
  "Motion",
  "Velocity and Acceleration",
  "Force",
  "Mass and Inertia",
  "Newton's First Law",
  "Net Force",
  "Newton's Second Law",
  "Newton's Third Law",
  "Free Body Diagrams",
  "Weight and Normal Reaction",
  "Tension",
  "Friction",
  "Inclined Plane",
];
