export function getProjectTypeDateOptions(texts) {
  return {
    project: {
      startDateLabel: texts?.start_date,
      enableStartDate: true,
      enableEndDate: false,
      enableTime: false,
      endDateLabel: "",
    },
    event: {
      startDateLabel: texts?.event_start_date,
      endDateLabel: texts?.event_finish_date,
      enableStartDate: true,
      enableEndDate: true,
      enableTime: true,
    },
    idea: {
      startDateLabel: texts?.start_date,
      enableStartDate: false,
      enableEndDate: false,
      enableTime: false,
      endDateLabel: "",
    },
  };
}
