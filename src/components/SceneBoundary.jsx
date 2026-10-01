import { Component } from 'react';

// If WebGL is unavailable the page still works; the scene just disappears.
export class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
