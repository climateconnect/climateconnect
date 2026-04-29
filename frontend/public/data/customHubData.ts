import { CustomHubConfig } from "./customHubtypes";
import { prio1Config } from "./customHubConfig/prio1";
import { scottConfig } from "./customHubConfig/scott";

type CustomHubDataParams = {
  path_to_redirect?: string;
  texts?: Record<string, string>;
  isAuthUnificationEnabled?: boolean;
};

export default function customHubData({
  path_to_redirect = "",
  texts = {},
  isAuthUnificationEnabled,
}: CustomHubDataParams = {}): CustomHubConfig {
  return {
    prio1: prio1Config(path_to_redirect, texts, isAuthUnificationEnabled),
    perth: scottConfig(path_to_redirect, texts, isAuthUnificationEnabled),
  };
}

type GetCustomHubDataParams = {
  hubUrl: keyof CustomHubConfig;
  texts?: Record<string, string>;
  path_to_redirect?: string;
  isAuthUnificationEnabled?: boolean;
};

export const getCustomHubData = ({
  hubUrl,
  texts,
  path_to_redirect,
  isAuthUnificationEnabled,
}: GetCustomHubDataParams) => {
  return customHubData({ path_to_redirect, texts, isAuthUnificationEnabled })[hubUrl];
};
