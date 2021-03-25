import { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import React from "react";
import { Location } from "history";

type Props = {
  handleRouteChange: Function;
} & RouteComponentProps;

class RouteListener extends Component<Props> {
  unlisten: Function;

  constructor(props: Props) {
    super(props)

    this.unlisten = () => {};
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen((location: Location) => {
      this.props.handleRouteChange(location.pathname);
    });
  }
  componentWillUnmount() {
    this.unlisten();
  }
  render() {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}

export default withRouter(RouteListener);