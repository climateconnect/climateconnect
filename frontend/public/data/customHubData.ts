import { CustomHubConfig } from "./customHubtypes";
import { prio1Config } from "./customHubConfig/prio1";
import { scottConfig } from "./customHubConfig/scott";

type CustomHubDataParams = {
  path_to_redirect?: string;
  texts?: Record<string, string>;
};

export default function customHubData({
  path_to_redirect = "",
  texts = {},
}: CustomHubDataParams = {}): CustomHubConfig {
  return {
    prio1: prio1Config(path_to_redirect, texts),
    perth: scottConfig(path_to_redirect, texts),
  };
}

type GetCustomHubDataParams = {
  hubUrl: keyof CustomHubConfig;
  texts?: Record<string, string>;
  path_to_redirect?: string;
};

export const getCustomHubData = ({ hubUrl, texts, path_to_redirect }: GetCustomHubDataParams) => {
  return customHubData({ path_to_redirect, texts })[hubUrl];
};
