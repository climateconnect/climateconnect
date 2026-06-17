import { IconButton } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import React, { useContext, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { Project } from "../../types";
import AddToCalendarDialog from "./AddToCalendarDialog";

type Props = {
  className?: string;
  project: Project;
  isUserRegistered: boolean;
};

export default function ProjectAddToCalendarButton({
  className,
  project,
  isUserRegistered,
}: Props) {
  const { locale, user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const texts = getTexts({ locale, page: "project", project: project });

  const isEvent = project.project_type?.type_id === "event";

  if (!isEvent) return null;

  return (
    <>
      <div className={className}>
        <IconButton onClick={() => setOpen(true)} size="large">
          <CalendarTodayIcon />
        </IconButton>
      </div>
      <AddToCalendarDialog
        open={open}
        onClose={() => setOpen(false)}
        slug={project.url_slug}
        locale={locale}
        isEvent={isEvent}
        registrationConfig={project.registration_config}
        isUserRegistered={isUserRegistered}
        user={user}
        texts={texts}
      />
    </>
  );
}
