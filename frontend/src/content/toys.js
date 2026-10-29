import {
  GiCanoe, GiGuitar, GiHiking, GiPoolTriangle, GiRaft, GiScubaMask, GiTennisRacket, GiWeightLiftingUp,
  GiMountains, GiSoccerBall, GiRunningShoe, GiBookCover, GiCoffeeCup, GiMusicalNotes,
} from 'react-icons/gi';

// First keyword that appears in an interest's name picks its icon.
const ICONS = [
  [['guitar'], GiGuitar],
  [['music', 'piano', 'sing'], GiMusicalNotes],
  [['gym', 'lift', 'weights', 'fitness'], GiWeightLiftingUp],
  [['hik', 'walk'], GiHiking],
  [['climb', 'mountain'], GiMountains],
  [['squash', 'tennis', 'padel', 'badminton'], GiTennisRacket],
  [['scuba', 'diving', 'snorkel'], GiScubaMask],
  [['canoe', 'kayak', 'paddl'], GiCanoe],
  [['raft'], GiRaft],
  [['pool', 'billiard', 'snooker'], GiPoolTriangle],
  [['soccer', 'football'], GiSoccerBall],
  [['run'], GiRunningShoe],
  [['read', 'book'], GiBookCover],
  [['coffee'], GiCoffeeCup],
];

export const iconFor = (name) => {
  const n = String(name).toLowerCase();
  return ICONS.find(([keys]) => keys.some(k => n.includes(k)))?.[1] ?? null;
};
