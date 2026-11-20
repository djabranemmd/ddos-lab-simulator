
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const initialData = {
  simulation: null,
  history: [],
  alerts: [],
  monitoring: null,
  mitigation: null,
  mitigationAnalysis: null,
};

function useDashboardData(refreshInterval = 1000) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    const endpoints = [
      ["simulation", "/simulation/status"],
      ["history", "/simulation/history?limit=30"],
      ["alerts", "/detection/alerts?limit=10"],
      ["monitoring", "/detection/monitoring/status"],
      ["mitigation", "/mitigation/status"],
      ["mitigationAnalysis", "/mitigation/analysis"],
    ];

    const results = await Promise.allSettled(
      endpoints.map(([, url]) => api.get(url))
    );

    const nextData = {};
    const failedEndpoints = [];

    results.forEach((result, index) => {
      const [key, url] = endpoints[index];

      if (result.status === "fulfilled") {
        const responseData = result.value.data?.data;

        if (key === "history") {
          nextData[key] = responseData?.samples ?? [];
        } else if (key === "alerts") {
          nextData[key] = responseData?.alerts ?? [];
        } else {
          nextData[key] = responseData ?? null;
        }
      } else {
        nextData[key] = undefined;
        failedEndpoints.push(url);
      }
    });

    setData((previousData) => {
      const mergedData = { ...previousData };

      Object.entries(nextData).forEach(([key, value]) => {
        if (value !== undefined) {
          mergedData[key] = value;
        }
      });

      return mergedData;
    });

    if (failedEndpoints.length === endpoints.length) {
      setError("Unable to connect to the backend API.");
    } else if (failedEndpoints.length > 0) {
      setError(
        `Some API endpoints failed: ${failedEndpoints.join(", ")}`
      );
    } else {
      setError(null);
    }

    setLastUpdated(new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refresh();
    }, 0);

    const intervalId = setInterval(refresh, refreshInterval);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [refresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}

export default useDashboardData;
