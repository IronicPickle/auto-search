import React, { Component } from "react";
import { withStyles, Theme, Container, Typography, Paper } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    paddingBottom: theme.spacing(8),
    maxWidth: theme.spacing(200)
  }
});

interface Props {
  classes: ClassNameMap;
}

class Index extends Component<Props> {  

  render() {
    const { classes } = this.props;

    document.title = "Lykos - Home";

    return (
      <>
        <Container className={classes.mainContainer}>
          <Paper>
            <Typography
              variant="h5"
              component="div"
            >
              Test
            </Typography>
          </Paper>
        </Container>
      </>
    );
  }
}

export default withStyles(styles)(Index);