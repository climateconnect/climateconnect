const climateMatchStyles = (theme) => ({
  possibleAnswerChip: {
    background: theme.palette.primary.light,
    color: "white",
    fontWeight: 600,
    fontSize: 18,
    height: 40,
    borderRadius: 20,
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      background: "#89d9d2",
    },
    "&:focus": {
      background: theme.palette.primary.light,
    },
    ["@media (max-width: 760px)"]: {
      fontSize: 16,
      marginRight: theme.spacing(0.5),
    },
  },
});

export default climateMatchStyles;
