import React, { Component } from "react";
import { withStyles, Theme, Container, Typography, Paper, Toolbar, Grid, Button, Grow, TextField, Checkbox, FormControlLabel, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Tooltip } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import socketIo from "socket.io-client";
import SearchIcon from "@material-ui/icons/Search";
import { Alert } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Building, Planning } from "../components/utils/interfaces";
import PlanningContainer from "../components/sections/containers/Planning";
import BuildingContainer from "../components/sections/containers/Building";

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
  inputsContainer: {
    margin: theme.spacing(1),
    padding: theme.spacing(4)
  },
  dataContainer: {
    margin: theme.spacing(1),
    padding: theme.spacing(2)
  },

  fieldContainer: {
    width: "100%"
  },

  checkboxContainer: {
    marginLeft: theme.spacing(2)
  },
  searchLoading: {
    marginRight: theme.spacing(2)
  },

  logChunk: {
    margin: theme.spacing(1)
  },

  logEntry: {
    width: "100%",
  },
  logBreak: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
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

  searchState: boolean;

  log: LogEntry[][];
  chunkStates: boolean[];

  council: string;
  address: Address;
  strict: boolean;

  errors?: any;

  planningApps: Planning[],
  buildingRegs: Building[]
}

class Index extends Component<Props, State> {
  socket?: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {
      searchState: false,

      log: [],
      chunkStates: [],

      council: "none",
      address: {},
      strict: false,

      planningApps: [],
      buildingRegs: []
    }

    this.setupSocket = this.setupSocket.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.toggleChunk = this.toggleChunk.bind(this);
    this.logAppend = this.logAppend.bind(this);
    this.logChunk = this.logChunk.bind(this);

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

  toggleChunk(index: number) {
    return (event: React.ChangeEvent<{}>, expanded: boolean) => {
      const chunkStates = this.state.chunkStates;
      chunkStates[index] = expanded;
      this.setState({ chunkStates });
    }
  }

  logChunk(entry: LogEntry) {
    const { log, chunkStates } = this.state;
    log.push([ entry ]);
    chunkStates[chunkStates.length - 1] = false;
    chunkStates.push(true);
    this.setState({ log, chunkStates });
  }

  logAppend(entry: LogEntry) {
    const log = this.state.log;
    log[log.length - 1].push(entry);
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

    socket.on("break", (msg: string) => {
      this.setState({ errors: null });
      this.logChunk({ type: "break", msg });
    });

    socket.on("success", (msg: string) => {
      this.setState({ errors: null });
      this.logAppend({ type: "success", msg });
    });

    socket.on("info", (msg: string) => {
      this.logAppend({ type: "info", msg });
    });

    socket.on("error", (msg: string) => {
      this.logAppend({ type: "error", msg });
    });
    
    socket.on("planning", (data: any) => {
      this.setState({ searchState: false, planningApps: data });
    });
    
    socket.on("building", (data: any) => {
      this.setState({ searchState: false, buildingRegs: data });
    });

    socket.on("errors SEARCH_DETAILS", (errors: any) => {
      this.setState({ errors, searchState: false });
      this.logAppend({ type: "error", msg: "Something Went Wrong" })
    });
  }

  startSearch() {
    const { strict, council, address } = this.state;
    this.socket?.emit("completeSearch", { strict, council, address });
    this.setState({
      searchState: true,
      log: [ [ { type: "break", msg: "Starting Search" } ] ],
      chunkStates: [ true ],
      planningApps: [],
      buildingRegs: []
    });
  }

  render() {
    const { classes } = this.props;
    const { log, chunkStates, council, address, strict, errors, searchState, planningApps, buildingRegs } = this.state;

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
                  <Paper variant="outlined" className={classes.inputsContainer}>
                    <Grid container direction="column" spacing={4} alignItems="center">
                      <Grid item className={classes.fieldContainer}>
                        <Select
                          value={council}
                          onChange={event => this.changeCouncil(event.target.value as string)}
                          fullWidth
                          error={errors?.council != null}
                          disabled={searchState}
                        >
                          <MenuItem value="none" dense>None</MenuItem>
                          <MenuItem value="stockport" dense>Stockport</MenuItem>
                          <MenuItem value="bolton" dense>Bolton</MenuItem>
                          <MenuItem value="rochdale" dense>Rochdale</MenuItem>
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
                              disabled={searchState}
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
                              disabled={searchState}
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
                          disabled={searchState || !strict}
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
                          disabled={searchState}
                        />
                      </Grid>
                      <Grid item style={{ width: "100%" }}>
                        <Toolbar disableGutters style={{ minHeight: 0 }}>
                          <Grid container justify="center">
                            {searchState &&
                              <Toolbar disableGutters style={{ minHeight: 0 }}>
                                <CircularProgress color="secondary" className={classes.searchLoading} />
                                <Typography
                                  variant="body2"
                                  component="p"
                                  noWrap
                                ><b>Searching</b></Typography>
                              </Toolbar>
                            }
                          </Grid>
                          <Grid container justify="center">
                            <Button
                              size="medium"
                              variant="contained"
                              color="primary"
                              onClick={this.startSearch}
                              disabled={council === "none" || searchState}
                            >Run Search</Button>
                          </Grid>
                          <Grid container className={classes.checkboxContainer}>
                            <Tooltip title="Forces at least the Region / Locality or Post Code to Match">
                              <FormControlLabel
                                control={
                                  <Checkbox checked={strict} onChange={() => this.toggleStrictMode()} />
                                }
                                label="Strict Mode"
                                disabled={searchState}
                              />
                            </Tooltip>
                          </Grid>
                        </Toolbar>
                      </Grid>
                    </Grid>
                  </Paper>
                  <Paper
                    variant="outlined"
                    hidden={planningApps.length === 0 && buildingRegs.length === 0}
                    className={classes.dataContainer}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      hidden={planningApps.length === 0}
                    >Planning</Typography>
                    { planningApps.map(planningApp => <PlanningContainer planning={planningApp} /> ) }
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      hidden={buildingRegs.length === 0}
                    >Building</Typography>
                    { buildingRegs.map(buildingReg => <BuildingContainer building={buildingReg} /> ) }
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  { log.map((chunk, i) => (
                      <Accordion
                        variant="outlined"
                        expanded={chunkStates[i]}
                        onChange={this.toggleChunk(i)}
                        className={classes.logChunk}
                      >
                        { chunk.map(entry => (
                            <Grow in={true} timeout={1000}>
                              {
                                entry.type === "break" ?
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Alert severity="info" className={`${classes.logEntry} ${classes.logBreak}`}>{entry.msg}</Alert>
                                  </AccordionSummary>
                                : <AccordionDetails>
                                    <Alert severity={entry.type} className={classes.logEntry}>{entry.msg}</Alert>
                                  </AccordionDetails>
                              }
                            </Grow>
                          ))
                        }
                      </Accordion>
                    ))
                  }
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