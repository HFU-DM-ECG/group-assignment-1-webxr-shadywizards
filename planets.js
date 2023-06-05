/// Planet positioning tools
const M = 1.989 * 10^30; // mass of the sun in kilograms
const G = 9.81; // Gravitationskonstante in N / kg
// dictionary for necessary planet data
const Planets = {
  "Mercury" : {semiMajorAxis : 0.3871, orbitalPeriodInYears : 0.2408},
  "Venus" : {semiMajorAxis : 0.7233, orbitalPeriodInYears : 0.6152},
  "Earth" : {semiMajorAxis : 1, orbitalPeriodInYears : 1},
  "Mars" : {semiMajorAxis : 1.5273, orbitalPeriodInYears : 1.8809},
  "Jupiter" : {semiMajorAxis : 5.2028, orbitalPeriodInYears : 11.862},
  "Saturn" : {semiMajorAxis : 9.5388, orbitalPeriodInYears : 29.458},
  "Uranus" : {semiMajorAxis : 19.1914, orbitalPeriodInYears : 84.01},
  "Neptune" : {semiMajorAxis : 30.0611, orbitalPeriodInYears : 164.79},
  "Pluto" : {semiMajorAxis : 39.5294, orbitalPeriodInYears : 248.54},
};
// sMA definiert die Größe der Umlaufbahn
// große Halbachsen jedes Planetens sind in AU gegeben. 
// "One AU is the average distance from the Sun's center to the Earth's center. It is equal to 149,597,871 km (92,955,807 miles)."
// Source: https://www.windows2universe.org/our_solar_system/planets_orbits_table.html

// this equals the amount of planets stored in the dict, which can be a useful value to use when generating the cans
export const amount = Object.keys(Planets).length;

// berechnung der Planetenpositionen auf Basis der kepler'schen Gesetze mithilfe der obigen Daten
function calculatePlanetPosition(time, planet) { // 
	const omega = (2 * Math.PI) / planet.orbitalPeriodInYears; // Winkelgeschwindigkeit -> Winkel, den planet pro zeiteinheit durchläuft
  const scaleFactor = 5;
	const x = planet.semiMajorAxis * Math.cos(omega * time) * scaleFactor;
	const y = planet.semiMajorAxis * Math.sin(omega * time) * scaleFactor;

	return {x, y};
}

export function getAllPlanetPositions(time) {
  const coordinates = [];

  for (const key in Planets) {
    var position = calculatePlanetPosition(time, Planets[key]);
    coordinates.push({ x: position.x, y: 0, z: position.y });
  }
  console.log(coordinates[0].x);
  return coordinates;
}

// idea: add a slider to change the time speed -> from realistic (basically still) to sped up
