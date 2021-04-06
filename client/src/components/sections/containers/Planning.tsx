// Icon Imports

// Main imports
import React, { Component } from "react";
import { TextField, Theme, withStyles } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import { Planning } from "../../utils/interfaces";
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
  planning: Planning;
}

interface State {
  
}

class PlanningContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {}

  }

  render() {
    const { classes, planning } = this.props;

    let planningString = `{reference}\n{descripton}\n{address}\n{decision} {decisionDate}\nreceived {receivedDate}`;
    const planningArray = planningString.split("\n");


    if(planning != null) {

      let matchedDecision = decisions.find(decision => {
        if(planning?.decision == null) return null;
        return decision.matches.includes(planning.decision.toLowerCase())
      });
      if(matchedDecision == null) {
        matchedDecision = decisions.find(decision => {
          if(planning?.status == null) return null;
          return decision.matches.includes(planning.status.toLowerCase())
        });
      }

      if(matchedDecision != null) {
        planningString = planningString.replace("{decision}", matchedDecision.decision);
      } else if(planning.decision != null) {
        planningString = planningString.replace("{decision}", planning.decision);
      }
      
      if(planning.reference != null)
        planningString = planningString.replace("{reference}", planning.reference);
      if(planning.descripton != null)
        planningString = planningString.replace("{descripton}", planning.descripton);
      if(planning.address != null)
        planningString = planningString.replace("{address}", planning.address);

      const decisionMadeDate = planning.decisionMadeDate;
      const decisionIssuedDate = planning.decisionIssuedDate;
      const applicationReceivedDate = planning.applicationReceivedDate;

      if(decisionMadeDate != null && !isNaN(decisionMadeDate as number)) {
        planningString = planningString.replace("{decisionDate}",
          moment(new Date(decisionMadeDate)).format("DD/MM/YYYY")
        );
      } else if(decisionIssuedDate != null && !isNaN(decisionIssuedDate as number)) {
        planningString = planningString.replace("{decisionDate}",
          moment(new Date(decisionIssuedDate)).format("DD/MM/YYYY")
        );
      } else if(applicationReceivedDate != null && !isNaN(applicationReceivedDate as number)) {
        planningString = planningString.replace("{receivedDate}",
          moment(new Date(applicationReceivedDate)).format("DD/MM/YYYY")
        );
      }

      if(!planningString.includes("{decision} {decisionDate}"))
        planningString = planningString.replace("{decisionDate}", "");

    }

    if(planningString.includes("{decisionDate}") &&
      planningString.includes("{receivedDate}")) {
        planningString += "(no further details)"
      }

    for(const i in planningArray) {
      planningString = planningString.replace(planningArray[i], ""); 
    }
    planningString = planningString
      .split("\n")
      .filter(planningSubString => planningSubString.length > 0)
      .join("\n");


    return (
      <TextField
        value={planningString.toUpperCase()}
        className={classes.field}
        multiline={true}
        rows={5}
        variant="outlined"
      />
    )
  }
}

const decisions: { decision: string, matches: string[] }[] = [
  {
    decision: "APPROVED WITH CONDITIONS",
    matches: [
      "approved", "granted", "approve", "grant",
      "grant subject to conditions", "approve with conditions",
      "planning permission granted", "outline planning granted",
      "approval", "approval with conditions",
      "permit outline planning permission", "permit full planning permission",
      "grant permission", "permits", "x permits", "grant permission subject to condition"
    ]
  }, {
    decision: "REFUSED",
    matches: [
      "refused", "refuse",
      "planning permission refused",
      "refusal",
      "refuse full planning permission", "refuse outline planning permission"
    ]
  }, {
    decision: "WITHDRAWN",
    matches: [
      "withdrawn", "application withdrawn", "withdrawn by the applicant"
    ]
  }, {
    decision: "DISCHARGE OF CONDITIONS",
    matches: [
      "discharge of conditions", "approved discharge of conditions"
    ]
  }

  // 	PNH Prior Approval NOT required (West Lancs)
]

export default withStyles(styles, { withTheme: true })(PlanningContainer);