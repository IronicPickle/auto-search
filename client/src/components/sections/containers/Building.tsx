// Icon Imports

// Main imports
import React, { Component } from "react";
import { Container, Grid, TextField, Theme, Typography, withStyles } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import { Building } from "../../utils/interfaces";
import moment from "moment";

const styles = (theme: Theme) => ({
  mainContainer: {
    paddingRight: 0,
    paddingLeft: 0,
    minWidth: theme.spacing(48),
    height: 252
  },
  field: {
    margin: theme.spacing(2),
    width: theme.spacing(64)
  },
  divider: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(8),
    marginLeft: theme.spacing(8),
    marginBottom: theme.spacing(2)
  }
});

interface Props {
  classes: ClassNameMap;
  building: Building;
}

interface State {
  
}

class BuildingContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {}

  }

  render() {
    const { classes, building } = this.props;

    let buildingString = `{reference}\n{descripton}\n{address}\n{extra} {extraDate}\n{decision} {decisionDate}\nreceived {receivedDate}`;
    const buildingArray = buildingString.split("\n");

    if(building != null) {

      if(building.reference != null)
        buildingString = buildingString.replace("{reference}", building.reference);
      if(building.descripton != null)
        buildingString = buildingString.replace("{descripton}", building.descripton);
      if(building.address != null)
        buildingString = buildingString.replace("{address}", building.address);
      
      if(building.extra != null && building.extraDate != null) {
        
        buildingString = buildingString.replace("{extra}", building.extra);
        buildingString = buildingString.replace("{extraDate}",
          moment(new Date(building.extraDate)).format("DD/MM/YYYY")
        );
      }
      if(building.decision != null &&
        building.decision !== "Not Available" &&
        building.decisionDate != null) {
        
        buildingString = buildingString.replace("{decision}", building.decision);
        buildingString = buildingString.replace("{decisionDate}",
          moment(new Date(building.decisionDate)).format("DD/MM/YYYY")
        );
      } else if(building.applicationReceivedDate != null) {

        buildingString = buildingString.replace("{receivedDate}",
          moment(new Date(building.applicationReceivedDate)).format("DD/MM/YYYY")
        );
      }

    }

    if(buildingString.includes("{decisionDate}") && buildingString.includes("{receivedDate}")) {
      buildingString += "(no further details)"
    }
    if(buildingString.includes("{extra} {extraDate}")) {
      buildingString = buildingString.replace("\n{extra} {extraDate}", "");
    }

    for(const i in buildingArray) {
      buildingString = buildingString.replace(buildingArray[i], ""); 
    }
    buildingString = buildingString
      .split("\n")
      .filter(buildingSubString => buildingSubString.length > 0)
      .join("\n");

    return (
      <TextField
        value={buildingString.toUpperCase()}
        className={classes.field}
        multiline={true}
        rows={5}
        variant="outlined"
      />
    )
  }
}

export default withStyles(styles, { withTheme: true })(BuildingContainer);