import { Component } from "react";
import { withStyles, Theme, Container, Typography, Paper, Toolbar, Grid, Button } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import socketIo from "socket.io-client";
import SearchIcon from "@material-ui/icons/Search";

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
    backgroundColor: theme.palette.primary.dark
  }
});

interface Props {
  classes: ClassNameMap;
}

interface State {

}

class Index extends Component<Props, State> {
  socket?: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.state = {

    }

    this.setupSocket = this.setupSocket.bind(this);
    this.startSearch = this.startSearch.bind(this);
  }

  componentDidMount() {
    this.socket = socketIo("/search");
    this.setupSocket();
  }

  componentWillUnmount() {
    this.socket?.disconnect();
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

    socket.on("info", (data: any) => {
      console.log(data);
    });

    socket.on("error", (data: any) => {
      console.log(data);
    });
    
    socket.on("planning", (data: any) => {
      console.log(data);
    });
  }

  startSearch() {
    this.socket?.emit("search", { council: "stockport" });
  }

  render() {
    const { classes } = this.props;

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