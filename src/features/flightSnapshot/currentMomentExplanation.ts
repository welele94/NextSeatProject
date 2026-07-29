import type { FlightSnapshot } from "./types";

export type CurrentMomentExplanationCard = {
  title: string;
  body: string;
};

export type CurrentMomentExplanation = {
  eyebrow: string;
  title: string;
  body: string;
  cards: CurrentMomentExplanationCard[];
  closingReassurance: string;
};

const TAKEOFF_COPY_MINUTES = 5;

const preFlightExplanation: CurrentMomentExplanation = {
  eyebrow: "What is happening now",
  title: "The flight is being prepared",
  body:
    "This moment can feel slower or more formal, but it is simply the aircraft, crew, airport and passengers getting ready for the same departure.",
  cards: [
    {
      title: "In the cabin",
      body:
        "The cabin crew prepares the cabin so the aircraft can depart in an organized way. You may see seats, bags, seatbelts, tray tables and the aisle being checked before everyone settles for departure."
    },
    {
      title: "In the cockpit",
      body:
        "The pilots are preparing the flight plan, aircraft setup and departure sequence. This stage often includes routine confirmations before the aircraft leaves the gate or runway."
    },
    {
      title: "With air traffic control",
      body:
        "The aircraft is part of an organized airport flow. Ground and tower controllers coordinate movement around the airport so each aircraft moves at the right time."
    },
    {
      title: "What you may notice",
      body:
        "Boarding calls, short announcements, small timing changes and crew movement can all happen here. These are normal signs of preparation, not signs that something is wrong."
    }
  ],
  closingReassurance: "This is preparation and timing, not improvisation."
};

const takeoffExplanation: CurrentMomentExplanation = {
  eyebrow: "What is happening now",
  title: "Takeoff is carefully prepared",
  body:
    "This part can feel powerful, but it is not improvised. While you feel the aircraft accelerating, several teams are following a coordinated sequence.",
  cards: [
    {
      title: "In the cabin",
      body:
        "Before takeoff, the cabin may feel more serious and focused. The cabin crew may move quickly, speak more directly, or seem busy. This usually happens because everyone is preparing the aircraft to leave on time and follow the planned departure sequence.\n\nYou may notice bags being checked, seatbelts being confirmed, seats upright, tray tables closed, and the aisle kept clear.\n\nWhen the crew sits down and the cabin becomes quieter, it usually means the cabin is ready for takeoff.\n\nYou may feel some tension during this moment, but this does not mean something is wrong. What you are seeing is attention, timing, and routine."
    },
    {
      title: "In the cockpit",
      body:
        "The pilots are following a prepared takeoff sequence. They confirm the aircraft configuration, monitor the instruments, and begin takeoff only when the aircraft is cleared. The stronger engine sound and acceleration are expected parts of this sequence."
    },
    {
      title: "With air traffic control",
      body:
        "Air traffic control manages aircraft movement around the runway. Before takeoff, the aircraft receives clearance to use the runway. After takeoff, controllers continue guiding the flight as it climbs away from the airport."
    },
    {
      title: "What you may feel",
      body:
        "You may feel firm acceleration, louder engines, pressure against your seat, the nose lifting, and small turns after departure. These sensations can feel intense, but they are expected during takeoff."
    }
  ],
  closingReassurance: "It can feel intense, but it is highly coordinated."
};

const climbExplanation: CurrentMomentExplanation = {
  eyebrow: "What is happening now",
  title: "The aircraft may still be climbing",
  body:
    "After takeoff, the aircraft continues leaving the lower part of the route. This can still feel active before the flight settles into a steadier middle section.",
  cards: [
    {
      title: "In the cabin",
      body:
        "The cabin may stay seated and quiet for a bit after departure. The crew may wait before moving around because the aircraft is still in the early part of the route."
    },
    {
      title: "In the cockpit",
      body:
        "The pilots continue following the departure path, managing speed and climb, and monitoring the aircraft as it settles after takeoff."
    },
    {
      title: "With air traffic control",
      body:
        "Air traffic control continues guiding the aircraft away from the departure area. Turns, small level-offs, or route instructions can happen as part of normal traffic flow."
    },
    {
      title: "What you may feel",
      body:
        "You may notice engine sound changing, the aircraft turning, the angle changing, or the climb feeling less constant. These changes are normal after departure."
    }
  ],
  closingReassurance: "This is still an early part of the route, not a sign that something is wrong."
};

const cruiseExplanation: CurrentMomentExplanation = {
  eyebrow: "What is happening now",
  title: "The flight is in its steadier middle part",
  body:
    "Cruise is usually the calmer part of the journey. Small changes in sound, direction or seatbelt signs can still happen as the flight follows its route.",
  cards: [
    {
      title: "In the cabin",
      body:
        "The cabin crew may move around, serve passengers, collect items, or sit down if the seatbelt sign is on. Their movements usually follow the normal rhythm of the flight."
    },
    {
      title: "In the cockpit",
      body:
        "The pilots continue monitoring the aircraft, route, weather information and communication with air traffic control. This is a steady, managed part of the journey."
    },
    {
      title: "With air traffic control",
      body:
        "Air traffic control continues coordinating the flight with other aircraft in the airspace. The aircraft may receive small route or altitude adjustments as part of normal traffic flow."
    },
    {
      title: "What you may feel",
      body:
        "You may notice gentle turns, small engine sound changes, light bumps or the seatbelt sign switching on. These can be normal during cruise."
    }
  ],
  closingReassurance: "Small changes do not mean the flight is no longer normal."
};

const descentExplanation: CurrentMomentExplanation = {
  eyebrow: "What is happening now",
  title: "The aircraft is preparing for arrival",
  body:
    "The final part of a flight can feel busier because the aircraft is gradually moving from cruise toward landing.",
  cards: [
    {
      title: "In the cabin",
      body:
        "The cabin crew may collect items, check the cabin again, ask for seats upright, and prepare everyone for landing. This can feel more structured because the flight is entering its final sequence."
    },
    {
      title: "In the cockpit",
      body:
        "The pilots prepare the descent and approach, monitor the aircraft, and follow instructions for the arrival path. This is a planned transition from cruising to landing."
    },
    {
      title: "With air traffic control",
      body:
        "Air traffic control coordinates arriving aircraft so each one joins the landing flow in the correct order. Turns, speed changes or short level-offs can be part of that flow."
    },
    {
      title: "What you may feel",
      body:
        "You may feel the aircraft gradually descend, engines become quieter or louder, turns, pressure in your ears, or more activity in the cabin. These are expected arrival preparations."
    }
  ],
  closingReassurance: "The flight can feel busier here because it is becoming more organized for landing."
};

const afterFlightExplanation: CurrentMomentExplanation = {
  eyebrow: "What is happening now",
  title: "The flight has arrived",
  body:
    "The flying part is complete. The aircraft is now moving through the final airport steps before passengers leave the aircraft.",
  cards: [
    {
      title: "In the cabin",
      body:
        "Passengers may stand, collect bags, and wait for the doors to open. The crew may ask people to stay seated until the aircraft is parked and the seatbelt sign is off."
    },
    {
      title: "At the airport",
      body:
        "The aircraft may wait briefly for a stand, jet bridge, buses, or ground staff. This is part of normal airport handling after landing."
    },
    {
      title: "Baggage",
      body:
        "If you checked luggage, follow the airport signs for baggage reclaim. The arrivals screens will show the correct belt, and this information can change after landing."
    },
    {
      title: "What happens next",
      body:
        "You can take your time leaving the aircraft, following signs, and moving through the airport. The journey can now be ended whenever you are ready."
    }
  ],
  closingReassurance: "The flight is complete. The remaining steps are airport routine."
};

export function buildCurrentMomentExplanation(
  snapshot: FlightSnapshot
): CurrentMomentExplanation {
  switch (snapshot.status) {
    case "before_departure":
      return preFlightExplanation;
    case "early_flight":
      return snapshot.progress.elapsedMinutes > TAKEOFF_COPY_MINUTES
        ? climbExplanation
        : takeoffExplanation;
    case "cruise":
      return cruiseExplanation;
    case "late_flight":
    case "arrival_window":
      return descentExplanation;
    case "completed":
    default:
      return afterFlightExplanation;
  }
}
