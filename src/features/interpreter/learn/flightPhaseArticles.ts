import { LearnArticle } from "./types";

export const flightPhaseArticles: LearnArticle[] = [
  {
    id: "takeoff",
    category: "flight_phases",
    title: "What happens during takeoff?",
    readTimeMinutes: 2,
    whatIsHappening: "The aircraft speeds up, lifts away from the runway, and begins the journey.",
    whyDoesItHappen: "This first part needs more energy so the aircraft can leave the ground and settle into flight.",
    isItNormal: "Yes. Takeoff often feels more active than the rest of the journey.",
    whatMightINotice: "You may feel acceleration, engine sound, vibration, and a clear upward movement."
  },
  {
    id: "climb",
    category: "flight_phases",
    title: "What happens during climb?",
    readTimeMinutes: 2,
    whatIsHappening: "The aircraft continues gaining height after takeoff.",
    whyDoesItHappen: "It is moving from the busy airport area into the quieter part of the route.",
    isItNormal: "Yes. Climb can feel active, but it is a routine part of every flight.",
    whatMightINotice: "You may hear power changes, feel turns, or notice the angle of the aircraft changing."
  },
  {
    id: "cruise",
    category: "flight_phases",
    title: "What happens during cruise?",
    readTimeMinutes: 2,
    whatIsHappening: "The aircraft is settled into the main part of the journey.",
    whyDoesItHappen: "This is where the flight spends most of its time moving steadily toward the destination.",
    isItNormal: "Yes. Cruise is usually the calmest and most predictable part of a flight.",
    whatMightINotice: "You may notice fewer changes, a steadier sound, and long periods where nothing much happens."
  },
  {
    id: "descent",
    category: "flight_phases",
    title: "What happens during descent?",
    readTimeMinutes: 2,
    whatIsHappening: "The aircraft begins moving toward the destination area.",
    whyDoesItHappen: "As the journey gets closer to arrival, the flight gradually changes from steady travel to arrival preparation.",
    isItNormal: "Yes. Descent is a normal transition before landing.",
    whatMightINotice: "You may hear engine changes, feel gentle lowering, or notice the cabin becoming more active."
  },
  {
    id: "approach",
    category: "flight_phases",
    title: "What happens during approach?",
    readTimeMinutes: 2,
    whatIsHappening: "The aircraft is lining up for the final part of the journey.",
    whyDoesItHappen: "The flight needs to follow a prepared path toward the runway area.",
    isItNormal: "Yes. Approach can feel busier, but it is expected.",
    whatMightINotice: "You may feel more turns, hear more sounds, or notice changes happening closer together."
  },
  {
    id: "landing",
    category: "flight_phases",
    title: "What happens during landing?",
    readTimeMinutes: 2,
    whatIsHappening: "The aircraft returns to the ground and slows down on the runway.",
    whyDoesItHappen: "This is the final step of the journey, moving from flight back to ground travel.",
    isItNormal: "Yes. Landing can feel firm or noisy and still be completely routine.",
    whatMightINotice: "You may feel a bump, braking, vibration, and changes in engine sound."
  }
];
