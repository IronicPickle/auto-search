import { createMuiTheme, Theme, ThemeOptions } from "@material-ui/core";

const shared: ThemeOptions = {

}

/*
Dark Black  | #0B0908 | rgba(11,9,8,1)      |
Pale        | #ebebeb | rgba(235,235,235,1) |
Navy Blue   | #243754 | rgba(36,55,84,1)    |
Light Green | #94ae3f | rgba(148,174,63,1)  |
Dark Blue   | #101321 | rgba(16,19,33,1)    |
*/

export const lightTheme: Theme = createMuiTheme({
  palette: {
    type: "light",
    common: {
      black: "rgba(11,9,8,1)",
      white: "rgba(235,235,235,1)"
    },
    primary: {
      main: "rgba(36,55,84,1)",
      dark: "rgba(36,55,84,0.9)",
      contrastText: "rgba(235,235,235,1)"
    },
    secondary: {
      main: "rgba(148,174,63,1)",
      contrastText: "rgba(235,235,235,1)"
    },
    divider: "rgba(148,174,63,1)",
    action: {
      active: "rgba(36,55,84,0.9)",
      hover: "rgba(36,55,84,0.25)",
      selected: "rgba(36,55,84,0.30)",
      disabled: "rgba(235,235,235,1)",
      disabledBackground: "rgba(36,55,84,0.65)",
      focus: "rgba(36,55,84,0.25)"
    },
    background: {
      paper: "rgba(253,253,253,1)",
      default: "rgba(36,55,84,1)"
    },
    text: {
      primary: "rgba(16,19,33,1)",
      secondary: "rgba(36,55,84,1)"
    }
  }
}, shared);

export const darkTheme: Theme = createMuiTheme({
  palette: {
    type: "dark",
    common: {
      black: "rgba(11,9,8,1)",
      white: "rgba(235,235,235,1)"
    },
    primary: {
      main: "rgba(66,125,154,1)",
      contrastText: "rgba(235,235,235,1)"
    },
    secondary: {
      main: "rgba(235,235,235,1)",
      contrastText: "rgba(11,9,8,1)"
    },
    divider: "rgba(235,235,235,1)",
    action: {
      active: "rgba(36,55,84,0.9)",
      hover: "rgba(36,55,84,0.25)",
      selected: "rgba(36,55,84,0.30)",
      disabled: "rgba(235,235,235,1)",
      disabledBackground: "rgba(36,55,84,0.65)",
      focus: "rgba(36,55,84,0.25)"
    },
    background: {
      paper: "rgba(16,19,33,1)",
      default: "rgba(11,9,8,1)"
    },
    text: {
      primary: "rgba(235,235,235,1)",
      secondary: "rgba(66,135,164,1)"
    }
  }
}, shared);