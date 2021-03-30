import React, { Component } from "react";
import { withStyles, Theme, Container, Typography, Paper, Toolbar, Grid, Button, Grow, Divider } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import socketIo from "socket.io-client";
import SearchIcon from "@material-ui/icons/Search";
import { Alert } from "@material-ui/lab";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    paddingBottom: theme.spacing(8),
    maxWidth: theme.spacing(200)
  },
  title: {
    marginLeft: theme.spacing(2)
  },
  contentContainer: {
    marginTop: theme.spacing(2)
  },
  contentTitle: {
    width: "100%"
  },
  optionsContainer: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.dark
  },
  logBreak: {
    marginTop: theme.spacing(1)
  }
});

export interface Address {
  [key: string]: any;
  companyName?: string;
  flatNumber?: string;
  houseName?: string;
  houseNumber?: string;
  street?: string;
  addressLine2?: string;
  postCode?: string;
}

type LogType = "success" | "info" | "warning" | "error" | "break";
type LogEntry = {
  type: LogType;
  msg: string;
}

interface Props {
  classes: ClassNameMap;
}

interface State {
  council: string;
  address: Address;
  log: LogEntry[];
}

class Index extends Component<Props, State> {
  socket?: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {
      log: [],
      council: "",
      address: {}
    }

    this.setupSocket = this.setupSocket.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.logAppend = this.logAppend.bind(this);
  }

  componentDidMount() {
    this.socket = socketIo("/search");
    this.setupSocket();
  }

  componentWillUnmount() {
    this.socket?.disconnect();
  }

  logAppend(entry: LogEntry) {
    const log = this.state.log;
    log.push(entry);
    this.setState({ log });
  }

  setupSocket() {
    const socket = this.socket;
    if(socket == null) throw Error("Cannot setup socket - No socket established");

    socket.on("connect", () => {
      console.log("[Socket.IO] Socket Connected");
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Socket Disconnected");
    });

    socket.on("success", (msg: string) => {
      this.logAppend({ type: "success", msg });
    });

    socket.on("info", (msg: string) => {
      this.logAppend({ type: "info", msg });
    });

    socket.on("error", (msg: string) => {
      this.logAppend({ type: "error", msg });
    });

    socket.on("break", (msg: string) => {
      this.logAppend({ type: "break", msg });
    });
    
    socket.on("planning", (data: any) => {
      console.log(data);
    });
  }

  startSearch() {
    const { council, address } = this.state;
    this.socket?.emit("completeSearch", { council, address });
    this.setState({ log: [] });
  }

  render() {
    const { classes } = this.props;
    const { log } = this.state;

    console.log(log)

    document.title = "Auto Search - Home";

    return (
      <>
        <Container className={classes.mainContainer}>
          <Paper className={classes.titleContainer}>
            <Toolbar>
              <SearchIcon fontSize="large" />
              <Typography
                variant="h5"
                component="h1"
                className={classes.title}
              >Search Builder</Typography>
            </Toolbar>
          </Paper>
          <Paper className={classes.contentContainer}>
            <Toolbar>
              <Typography
                variant="h5"
                component="h1"
                align="center"
                className={classes.contentTitle}
              >Options</Typography>
            </Toolbar>

            <Container>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Paper elevation={12} className={classes.optionsContainer}>
                    <Toolbar>
                      <Button
                        size="medium"
                        variant="contained"
                        color="primary"
                        onClick={this.startSearch}
                      >Run Search</Button>
                    </Toolbar>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={12} className={classes.optionsContainer}>
                    <Grid container spacing={1} direction="column">
                      { log.map((entry, i) => (
                          <Grid item key={i}>
                            <Grow in={true} timeout={1000}>
                              {
                                entry.type === "break" ?
                                  <div className={classes.logBreak}>
                                    <Alert severity="info" className={classes.logEntry}>{entry.msg}</Alert>
                                    <Divider />
                                  </div>
                                : <Alert severity={entry.type} className={classes.logEntry}>{entry.msg}</Alert>
                              }
                            </Grow>
                          </Grid>
                        ))
                      }
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Paper>
        </Container>
      </>
    );
  }
}

export default withStyles(styles)(Index);