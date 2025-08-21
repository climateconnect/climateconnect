import { useState, useEffect } from "react";

type DevlinkComponentType = React.ComponentType<any> | null;

async function loadDevlinkComponent(componentName: string, locale: string) {
  try {
    const currentPrefix = componentName.startsWith("En") ? "En" : "De";
    const desiredPrefix = locale === "en" ? "En" : "De";

    if (currentPrefix !== desiredPrefix) {
      componentName = componentName.replace(new RegExp(`^${currentPrefix}`), desiredPrefix);
    }

    const mod = await import("../../../devlink");
    if (mod[componentName]) {
      return mod[componentName];
    } else {
      console.warn(`Component ${componentName} not found in devlink.`);
      return null;
    }
  } catch (error) {
    console.error("Error loading devlink component:", error);
    return null;
  }
}

export function useDevlinkComponent(
  hubData: object | null,
  componentName: string | undefined,
  locale: string
) {
  const [DevlinkComponent, setDevlinkComponent] = useState<DevlinkComponentType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadComponent = async () => {
      if (!hubData || !componentName) {
        setIsLoading(false);
        return;
      }

      const component = await loadDevlinkComponent(componentName, locale);
      setDevlinkComponent(() => component);
      setIsLoading(false);
    };

    loadComponent();
  }, [locale, hubData]);
  return { DevlinkComponent, isLoading };
}
