import { useEffect, useState } from "react";

export function useAppName(API_URL, token) {
  const [appName, setAppName] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/system-settings/app-name`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAppName(data.value))
      .catch(() => setAppName(""));
  }, [API_URL, token]);

  return appName;
}