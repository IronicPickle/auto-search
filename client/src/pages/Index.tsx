import React, { Component } from "react";
import { withStyles, Theme, Container, Typography, Paper, Toolbar, Grid, Button, Grow, Divider, TextField, Checkbox, FormControlLabel, Select, MenuItem, ButtonBase } from "@material-ui/core";
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
    padding: theme.spacing(1)
  },

  fieldContainer: {
    width: "100%"
  },

  checkboxContainer: {
    marginLeft: theme.spacing(2)
  },

  logBreak: {
    marginTop: theme.spacing(1)
  },
});

export interface Address {
  [key: string]: any;
  house?: string;
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
  [key: string]: any;
  log: LogEntry[];
  council: string;
  address: Address;
  strict: boolean;
  errors?: any;
}

class Index extends Component<Props, State> {
  socket?: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {
      log: [],
      council: "none",
      address: {},
      strict: false
    }

    this.setupSocket = this.setupSocket.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.logAppend = this.logAppend.bind(this);

    this.changeAddress = this.changeAddress.bind(this);
    this.toggleStrictMode = this.toggleStrictMode.bind(this);
    this.changeCouncil = this.changeCouncil.bind(this);
  }

  componentDidMount() {
    this.socket = socketIo("/search");
    this.setupSocket();
  }

  componentWillUnmount() {
    this.socket?.disconnect();
  }

  changeAddress(field: string, value: string) {
    const { address } = this.state;
    address[field] = value;
    this.setState({ address });
  }

  toggleStrictMode() {
    this.setState({ strict: !this.state.strict });
  }

  changeCouncil(council: string) {
    this.setState({ council });
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

    socket.on("errors SEARCH_DETAILS", (errors: any) => {
      this.setState({ errors });
    });
  }

  startSearch() {
    const { strict, council, address } = this.state;
    this.socket?.emit("completeSearch", { strict, council, address });
    this.setState({ log: [] });
  }

  render() {
    const { classes } = this.props;
    const { log, council, address, strict, errors } = this.state;

    document.title = "Auto Search - Home";

    return (
      <>
        <Container className={classes.mainContainer}>
          <Paper elevation={2} className={classes.titleContainer}>
            <Toolbar>
              <SearchIcon fontSize="large" />
              <Typography
                variant="h5"
                component="h1"
                className={classes.title}
              >Search Builder</Typography>
            </Toolbar>
          </Paper>
          <Paper elevation={2} className={classes.contentContainer}>
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
                  <Grid container direction="column" spacing={4} alignItems="center">
                    <Grid item className={classes.fieldContainer}>
                      <Select
                        value={council}
                        onChange={event => this.changeCouncil(event.target.value as string)}
                        fullWidth
                      >
                        <MenuItem value="none" dense>None</MenuItem>
                        <MenuItem value="stockport" dense>Stockport</MenuItem>
                      </Select>
                    </Grid>
                    <Grid item className={classes.fieldContainer}>
                      <Grid container spacing={4}>
                        <Grid item xs={4}>
                          <TextField
                            label="House"
                            value={address.house}
                            fullWidth
                            onChange={event => this.changeAddress("house", event.target.value as string)}
                            className={classes.houseField}
                            error={errors?.address?.house != null}
                            helperText={errors?.address?.house}
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <TextField
                            label="Street"
                            value={address.street}
                            fullWidth
                            onChange={event => this.changeAddress("street", event.target.value as string)}
                            className={classes.streetField}
                            error={errors?.address?.street != null}
                            helperText={errors?.address?.street}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item className={classes.fieldContainer}>
                      <TextField
                        label="Region / Locality"
                        value={address.addressLine2}
                        fullWidth
                        onChange={event => this.changeAddress("addressLine2", event.target.value as string)}
                        className={classes.field}
                        error={errors?.address?.addressLine2 != null}
                        helperText={errors?.address?.addressLine2}
                      />
                    </Grid>
                    <Grid item className={classes.fieldContainer}>
                      <TextField
                        label="Post Code"
                        value={address.postCode}
                        fullWidth
                        onChange={event => this.changeAddress("postCode", event.target.value as string)}
                        className={classes.field}
                        error={errors?.address?.postCode != null}
                        helperText={errors?.address?.postCode}
                      />
                    </Grid>
                    <Grid item style={{ width: "100%" }}>
                      <Toolbar disableGutters>
                        <Grid container />
                        <Grid container justify="center">
                          <Button
                            size="medium"
                            variant="contained"
                            color="primary"
                            onClick={this.startSearch}
                            disabled={council === "none"}
                          >Run Search</Button>
                        </Grid>
                        <Grid container className={classes.checkboxContainer}>
                          <FormControlLabel
                            control={
                              <Checkbox checked={strict} onChange={() => this.toggleStrictMode()} />
                            }
                            label="Strict Mode"
                          />
                        </Grid>
                      </Toolbar>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
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