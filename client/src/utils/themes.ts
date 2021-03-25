import { createMuiTheme, Theme, ThemeOptions } from "@material-ui/core";

const shared: ThemeOptions = {

}

/*
Dark Black  | #1f1d08 | rgba(31,29,8,1)     | Dark Text
Pale        | #ebebeb | rgba(235,235,235,1) | Light Text
Navy Blue   | #243754 | rgba(36,55,84,1)    | Primary (NavBar)
Light Green | #94ae3f | rgba(148,174,63,1)  | Secondary (Accent)
Dark Blue   | #101321 | rgba(16,19,33,1)    | Background (Paper)
*/

export const lightTheme: Theme = createMuiTheme({
  palette: {
    type: "light",
    common: {
      black: "rgba(31,29,8,1)",
      white: "rgba(235,235,235,1)"
    },
    primary: {
      main: "rgba(235,235,235,1)",
      dark: "rgba(235,235,235,0.9)",
      contrastText: "rgba(16,19,33,1)"
    },
    secondary: {
      main: "rgba(16,19,33,1)",
      contrastText: "rgba(31,29,8,1)"
    },
    divider: "rgba(16,19,33,1)",
    action: {
      active: "rgba(31,29,8,0.9)",
      hover: "rgba(31,29,8,0.25)",
      selected: "rgba(31,29,8,0.25)",
      disabled: "rgba(31,29,8,0.55)",
      disabledBackground: "rgba(31,29,8,0.55)",
      focus: "rgba(31,29,8,0.25)"
    },
    background: {
      paper: "rgba(235,235,235,1)",
      default: "rgba(31,29,8,1)"
    },
    text: {
      primary: "rgba(31,29,8,1)",
      secondary: "rgba(16,19,33,1)"
    }
  }
}, shared);

export const darkTheme: Theme = createMuiTheme({
  palette: {
    type: "dark",
    common: {
      black: "rgba(31,29,8,1)",
      white: "rgba(235,235,235,1)"
    },
    primary: {
      main: "rgba(36,55,84,1)",
      contrastText: "rgba(235,235,235,1)"
    },
    secondary: {
      main: "rgba(148,174,63,1)",
      contrastText: "rgba(31,29,8,1)"
    },
    divider: "rgba(148,174,63,1)",
    action: {
      active: "rgba(148,174,63,0.9)",
      hover: "rgba(148,174,63,1)",
      selected: "rgba(148,174,63,1)",
      disabled: "rgba(148,174,63,0.55)",
      disabledBackground: "rgba(148,174,63,0.55)",
      focus: "rgba(148,174,63,1)"
    },
    background: {
      paper: "rgba(16,19,33,1)",
      default: "rgba(31,29,8,1)"
    },
    text: {
      primary: "rgba(235,235,235,1)",
      secondary: "rgba(148,174,63,1)"
    }
  }
}, shared);