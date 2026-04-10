const getApiUrl = () => {
  const host = window.location.hostname;

  // Laptop (localhost)
  if (host === "localhost") {
    return "http://localhost:3000";
  }

  // Wi-Fi LAN (192.168.x.x)
  if (host.startsWith("192.168.")) {
    return `http://${host}:3000`;
  }

  // USB tether (192.168.42.x or 172.x.x.x)
  if (host.startsWith("192.168.42.") || host.startsWith("172.")) {
    return `http://${host}:3000`;
  }

  // Default fallback
  return "http://localhost:3000";
};

export const API_URL = getApiUrl();