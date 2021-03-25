import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Theme, Tabs, Tab, Grid, IconButton, Tooltip, Avatar, Divider, LinearProgress } from "@material-ui/core";
import { Link } from "react-router-dom";
import { GlobalContext, globalContext } from "../../utils/contexts";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import NoMeetingRoomIcon from "@material-ui/icons/NoMeetingRoom";
import Brightness5Icon from "@material-ui/icons/Brightness5";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  title: {
    textDecoration: "none",
    marginRight: 24,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }, logo: {
    height: theme.spacing(6)
  }, divider: {
    height: theme.spacing(5)
  }, discordName: {
    maxWidth: theme.spacing(32),
    overflow: "hidden" as "hidden",
    whiteSpace: "nowrap" as "nowrap",
    textOverflow: "ellipsis"
  }
});

interface Props {
  classes: ClassNameMap;
  theme: Theme;
  currentRoute: string;
  loading: boolean;
}  

class Layout extends Component<Props> {
  static contextType = globalContext;

  checkRouteExists(route: string): boolean {
    for(var i in tabRoutes) {
      if(tabRoutes[i].path === route) return true
    }
    return false;
  }

  render() {
    const { classes, theme, loading } = this.props;
    const { selectedTheme, toggleTheme } = this.context as GlobalContext;

    return (
      <>
        <>
          <AppBar>
            <div style={{ position: "absolute" as "absolute", width: "100%" }}>
              <LinearProgress variant="query" hidden={!loading} color="secondary" />
            </div>
            <Toolbar>
              <Grid container justify="flex-start">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    <Link to="/">
                      <img src="/images/logo.png" alt="Logo" className={classes.logo} />
                    </Link>
                    <Link to="/">
                      <Typography
                        variant="h5"
                        component="h5"
                        className={classes.title}
                      >Auto Search</Typography>
                    </Link>
                  </Toolbar>
                </Grid>
              </Grid>
              <Grid container justify="center">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    <Tabs value={this.checkRouteExists(this.props.currentRoute) ? this.props.currentRoute : false}>
                      {
                        tabRoutes.map(route => {
                          return <Tab
                            component={Link}
                            to={route.path}
                            key={route.path}
                            value={route.path}
                            label={route.name}
                          />
                        })
                      }
                    </Tabs>
                  </Toolbar>
                </Grid>
              </Grid>
              <Grid container justify="flex-end">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    <Tooltip
                      title={(selectedTheme === "light") ? "Make it Dark" : "Turn the Lights on"}
                      placement="bottom"
                      PopperProps={{ disablePortal: true }}
                    >
                      <IconButton onClick={() => toggleTheme()}>
                        { (selectedTheme === "light") ?
                          <Brightness4Icon /> : <Brightness5Icon />
                        }
                      </IconButton>
                    </Tooltip>
                  </Toolbar>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
        </>

        {this.props.children}
      </>
    )
  }
}

const tabRoutes = [
  {path: "/", name: "Home"}
]

export default withStyles(styles, { withTheme: true })(Layout);