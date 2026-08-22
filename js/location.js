/* =========================================================
   LOCATION INTELLIGENCE & NEARBY DISCOVERY MODULE (OSM)
   ========================================================= */

/**
 * Prompts user for current position via Geolocation API
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      error => {
        let msg = "Location access failed.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied. Please allow location access to discover nearby businesses.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable. Check GPS/network.";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out. Please try again.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Calculates distance in kilometers between two GPS points using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Map Overpass tag values to friendly category
 */
export function categorizeOsmPlace(tags = {}) {
  const amenity = tags.amenity || "";
  const tourism = tags.tourism || "";
  const shop = tags.shop || "";
  const office = tags.office || "";
  const building = tags.building || "";
  const craft = tags.craft || "";

  if (["hotel", "motel", "hostel", "guest_house"].includes(tourism) || ["hotel"].includes(building)) {
    return "Hotels";
  }
  if (["hospital", "clinic", "doctors", "pharmacy", "dentist"].includes(amenity)) {
    return "Hospitals";
  }
  if (["school", "college", "university", "kindergarten"].includes(amenity) || ["school", "university"].includes(building)) {
    return "Schools";
  }
  if (["apartments", "residential"].includes(building) || ["apartment"].includes(tags.residential)) {
    return "Apartments";
  }
  if (
    ["supermarket", "mall", "department_store", "clothes", "electronics", "convenience"].includes(shop) ||
    ["bank", "atm", "restaurant", "cafe", "fast_food", "fuel"].includes(amenity) ||
    ["commercial"].includes(building)
  ) {
    return "Commercial";
  }
  if (["industrial", "warehouse", "factory"].includes(building) || ["industrial", "warehouse"].includes(craft) || tags.industrial) {
    return "Industrial";
  }

  return "Other";
}

/**
 * Fetch nearby places from OpenStreetMap Overpass API
 */
export async function fetchNearbyPlacesOSM(lat, lon, radiusKm = 3) {
  const radiusMeters = radiusKm * 1000;

  // Overpass QL Query for relevant security prospect establishments
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"~"hospital|school|college|university|bank|restaurant|hotel|fuel"](around:${radiusMeters},${lat},${lon});
      node["tourism"~"hotel|motel|hostel|guest_house"](around:${radiusMeters},${lat},${lon});
      node["shop"~"supermarket|mall|department_store"](around:${radiusMeters},${lat},${lon});
      node["office"](around:${radiusMeters},${lat},${lon});
      way["building"~"commercial|hospital|school|university|apartments|hotel|industrial|warehouse"](around:${radiusMeters},${lat},${lon});
      way["shop"~"mall|supermarket"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"hospital|school|college|university"](around:${radiusMeters},${lat},${lon});
    );
    out center 60;
  `;

  const overpassUrl = "https://overpass-api.de/api/interpreter";

  const response = await fetch(overpassUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "data=" + encodeURIComponent(query)
  });

  if (!response.ok) {
    throw new Error(`Map data server responded with status ${response.status}`);
  }

  const result = await response.json();
  const elements = result.elements || [];

  const places = [];
  const seenNames = new Set();

  elements.forEach(item => {
    const tags = item.tags || {};
    const name = tags.name || tags["name:en"] || tags.brand;
    if (!name) return; // Ignore unnamed nodes

    const nameKey = name.trim().toLowerCase();
    if (seenNames.has(nameKey)) return;
    seenNames.add(nameKey);

    const placeLat = item.lat || (item.center && item.center.lat);
    const placeLon = item.lon || (item.center && item.center.lon);
    if (!placeLat || !placeLon) return;

    const distKm = calculateDistanceKm(lat, lon, placeLat, placeLon);
    const category = categorizeOsmPlace(tags);

    // Format location / address string
    let locationStr = tags["addr:street"] || tags["addr:suburb"] || tags["addr:city"] || tags["addr:full"] || "";
    if (tags["addr:housenumber"]) {
      locationStr = `${tags["addr:housenumber"]} ${locationStr}`.trim();
    }
    if (!locationStr) {
      locationStr = "Kakinada Region";
    }

    places.push({
      id: `osm_${item.type}_${item.id}`,
      name: name.trim(),
      category: category,
      lat: placeLat,
      lon: placeLon,
      distanceKm: distKm,
      location: locationStr,
      rawTags: tags
    });
  });

  // Sort by distance ascending
  places.sort((a, b) => a.distanceKm - b.distanceKm);

  return places;
}

/**
 * Generate standard Google Maps search link
 */
export function getMapLink(lat, lon, name = "") {
  if (name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " Kakinada")}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

/**
 * Duplicate detection logic checking existing leads by name or location
 */
export function findDuplicateLead(placeName, placeLocation, existingLeads = []) {
  if (!placeName) return null;
  const pName = placeName.toLowerCase().trim();
  const pLoc = (placeLocation || "").toLowerCase().trim();

  return existingLeads.find(lead => {
    const lName = (lead.name || "").toLowerCase().trim();
    const lLoc = (lead.location || "").toLowerCase().trim();

    if (!lName) return false;

    // Direct name match or substring match
    if (lName === pName || lName.includes(pName) || pName.includes(lName)) {
      return true;
    }

    // Location match if both have detailed location
    if (pLoc && lLoc && pLoc.length > 5 && lLoc.length > 5 && (lLoc.includes(pLoc) || pLoc.includes(lLoc))) {
      return true;
    }

    return false;
  });
}
