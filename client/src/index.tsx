import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Route, BrowserRouter as Router, RouteComponentProps } from "react-router-dom";
import { Container, createMuiTheme, withStyles } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { globalContext, Notification } from "./utils/contexts";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

import Layout from "./components/sections/Layout";
import RouteListener from "./components/utils/RouteListener";
import Index from "./pages/Index";
import { lightTheme, darkTheme } from "./utils/themes";
import GlobalCSS from "./utils/GlobalCSS";
import NotificationContainer from "./components/sections/containers/Notification";

type Props = {
  classes: Classes;
} & RouteComponentProps;

interface State {
  loggedIn: boolean;
  selectedTheme: "light" | "dark";
  csrfToken?: string;
  loading: boolean;
  currentRoute: string;

  clipboardValue: string;

  notificationState: boolean;
  notificationData?: Notification;
}

class index extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const cookies = this.parseCookies(document.cookie);
    this.state = {
      loggedIn: false,
      loading: false,
      selectedTheme: cookies.theme || "dark",
      currentRoute: window.location.pathname,
      clipboardValue: "",

      notificationState: false
    }

    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.toggleLoader = this.toggleLoader.bind(this);
    this.toggleNotification = this.toggleNotification.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
  }

  handleRouteChange(route: string) {
    this.setState({currentRoute: route});
    this.toggleLoader(false);
  }

  toggleLoader(state: boolean) {
    this.setState({loading: state});
  }

  toggleNotification(state: boolean, data?: Notification) {
    this.setState({ notificationState: state, notificationData: data });
  }

  copyToClipboard(string: string) {
    const clipboardInput = document.getElementById("clipboardInput") as HTMLInputElement;
    clipboardInput.style.display = "block";
    this.setState({ clipboardValue: string }, () => {
      clipboardInput.focus();
      clipboardInput.select();
      clipboardInput.setSelectionRange(0, 99999);
      document.execCommand("copy");
      clipboardInput.style.display = "none";
    });
  }

  toggleTheme(theme?: "light" | "dark") {
    const oldTheme = this.state.selectedTheme;
    if(theme == null) theme = (oldTheme === "light") ? "dark" : "light";
    this.setState({ selectedTheme: theme });
    const cookies = this.parseCookies(document.cookie);
    cookies.theme = theme;
    document.cookie = this.stringifyCookies(cookies);
  }

  parseCookies(cookie: string) {
    if(cookie.length === 0) return {};
    const cookiesArray = cookie.split("; ");
    const cookies: { [key: string]: any } = {}
    for(const i in cookiesArray) {
      const [ key, value ] = cookiesArray[i].split("=");
      cookies[key] = value;
    }
    return cookies;
  }

  stringifyCookies(cookies: { [key: string]: any }) {
    let cookiesArray = [];
    for(const i in cookies) {
      cookiesArray.push(`${i}=${cookies[i]}`);
    }
    return cookiesArray.join("; ");
  }

  render() {
    const {
      loggedIn, selectedTheme,
      notificationState, notificationData, clipboardValue
    } = this.state;

    const theme = createMuiTheme((selectedTheme === "light") ? lightTheme : darkTheme);

    return (
      <>
        <input
          id="clipboardInput"
          type="text"
          value={clipboardValue}
          readOnly={true}
          style={{ display: "none", position: "fixed" }}
        />
        <NotificationContainer
          state={notificationState}
          data={notificationData || {}}
          onClose={() => this.setState({ notificationState: false })}
        />
        
        <Router>
          <ThemeProvider theme={theme} >
            <GlobalCSS />
            <globalContext.Provider value={{
              selectedTheme: selectedTheme,
              toggleTheme: this.toggleTheme,
              toggleLoader: this.toggleLoader,
              toggleNotification: this.toggleNotification,
              copyToClipboard: this.copyToClipboard
            }}>
              <Layout currentRoute={this.state.currentRoute} loading={this.state.loading}>
                <div style={{ position: "absolute" as "absolute", width: "100%", height: "100%" }}>
                  <RouteListener handleRouteChange={this.handleRouteChange}>
                    <Route path="/" exact component={Index} />
                  </RouteListener>
                </div>
              </Layout>
            </globalContext.Provider>
          </ThemeProvider>
        </Router>
      </>
    )
  }
}

ReactDOM.render(
  React.createElement(
    withStyles({}, { withTheme: true }) (index)
  ), document.getElementById("root")
);

serviceWorker.unregister();