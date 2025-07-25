import { Fab } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import AddIcon from "@mui/icons-material/Add";

type ShareProjectMakeStyleProps = {
  isCustomHub: boolean;
};

const shareProjectFabStyle = makeStyles<Theme, ShareProjectMakeStyleProps>((theme) => ({
  fabShareProject: (props: ShareProjectMakeStyleProps) => ({
    position: "fixed",
    background: props.isCustomHub
      ? theme.palette.background.default_contrastText
      : theme.palette.primary.light,
    color: props.isCustomHub ? theme.palette.background.default : "default",
    // bottom: theme.spacing(5),
    right: theme.spacing(3),
  }),
}));

interface FabShareButtonProps {
  locale: string;
  hubAmbassador?: any;
  isCustomHub: boolean;
  hubUrl?: string;
}

export const FabShareButton = ({
  locale,
  hubAmbassador,
  isCustomHub,
  hubUrl,
}: FabShareButtonProps) => {
  const fabClass = shareProjectFabStyle({ isCustomHub: isCustomHub });
  const queryString = hubUrl ? `?hub=${hubUrl}` : "";
  return (
    <Fab
      className={fabClass.fabShareProject}
      size="medium"
      color="primary"
      href={`${getLocalePrefix(locale)}/share${queryString}`}
      sx={{ bottom: (theme) => (hubAmbassador ? theme.spacing(11.5) : theme.spacing(5)) }}
    >
      <AddIcon />
    </Fab>
  );
};
