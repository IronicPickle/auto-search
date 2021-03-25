import { Component } from "react";
import { withStyles, Theme } from "@material-ui/core";

const styles = (theme: Theme) => ({
  "@global": {
    "*::-webkit-scrollbar": {
      width: "0.4em",
      height: "0.4em"
    },
    "*::-webkit-scrollbar-track": {
      "-webkit-box-shadow": `inset 0 0 6px ${theme.palette.primary.main}`
    },
    "*::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.dark,
      outline: `1px solid ${theme.palette.primary.dark}`
    },
    pre: {
      whiteSpace: "pre-wrap"
    }
  }
});

class GlobalCSS extends Component {
  render() {
    return null;
  }
}

export default withStyles(styles)(GlobalCSS);