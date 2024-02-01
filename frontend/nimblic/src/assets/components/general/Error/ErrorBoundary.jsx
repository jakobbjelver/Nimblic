import React from 'react';
import ErrorPage from './ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isDismissed: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
  }

  handleDismiss = () => {
    this.setState({ isDismissed: !this.state.isDismissed });
  };

  render() {
    if ((this.state.hasError || this.props.globalError) && !this.state.isDismissed) {
      const errorDetails = this.state.hasError ? this.state : this.props.globalError;
      return <ErrorPage error={errorDetails.error} errorInfo={errorDetails.errorInfo} onDismissed={this.handleDismiss} />;
    }

    return this.props.children;
  }
}


export default ErrorBoundary;
