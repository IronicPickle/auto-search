import React, { Component, SyntheticEvent } from "react";
import { Snackbar, SnackbarCloseReason } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Notification } from "../../../utils/contexts";

interface Props {
  state: boolean;
  data: Notification;
  onClose: (event: SyntheticEvent, reason: SnackbarCloseReason) => void;
}

class NotificationContainer extends Component<Props> {

  render() {
    const { state, data, onClose } = this.props;
    const { type, message, hideDelay } = data;

    return (
      <>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={state}
          autoHideDuration={hideDelay || 2000}
          onClose={onClose}
        >
          <Alert elevation={6} variant="filled" severity={type}>
            {message || ""}
          </Alert>
        </Snackbar>
      </>
    );
  }
}

export default NotificationContainer;