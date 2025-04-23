import { useState, useEffect } from "react";
import { AllHubsType } from "../../types";
import { getAllHubs } from "../../../public/lib/hubOperations";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";

export default function LocationHubFromAllHubs({ locale, hubUrl }) {
  const [allHubs, setAllHubs] = useState<AllHubsType[]>([]);
  useEffect(() => {
    (async () => {
      const allHubs = await getAllHubs(locale);
      setAllHubs(allHubs);
    })();
  }, []);
  const currentHub = allHubs.find((hub) => hub.url_slug === hubUrl);
  const isLocationHub = currentHub && isLocationHubLikeHub(currentHub.hub_type);

  return isLocationHub;
}
