import { ComponentType } from "react";
import { componentRegistry } from "../../devlink/componentRegistry";

const EN_PREFIX = "En";
const DE_PREFIX = "De";

function getLocalePrefix(locale: string): string | null {
  if (locale === "en") return EN_PREFIX;
  if (locale === "de") return DE_PREFIX;
  return null;
}

export function getDevlinkComponent(
  name: string | null | undefined,
  locale: string
): ComponentType<any> | undefined {
  if (!name) return undefined;

  const storedPrefix = name.slice(0, 2);
  const hasRecognizedPrefix = storedPrefix === EN_PREFIX || storedPrefix === DE_PREFIX;

  if (!hasRecognizedPrefix) {
    const component = componentRegistry[name];
    if (!component) {
      console.warn(`[devlink] Component "${name}" not found in registry (locale: ${locale}).`);
    }
    return component;
  }

  const desiredPrefix = getLocalePrefix(locale);
  if (!desiredPrefix) {
    const component = componentRegistry[name];
    if (!component) {
      console.warn(`[devlink] Component "${name}" not found in registry (locale: ${locale}).`);
    }
    return component;
  }

  if (storedPrefix !== desiredPrefix) {
    const swappedName = desiredPrefix + name.slice(2);
    const component = componentRegistry[swappedName];
    if (!component) {
      console.warn(
        `[devlink] Component "${swappedName}" not found in registry (locale: ${locale}).`
      );
      return undefined;
    }
    return component;
  }

  const component = componentRegistry[name];
  if (!component) {
    console.warn(`[devlink] Component "${name}" not found in registry (locale: ${locale}).`);
  }
  return component;
}
