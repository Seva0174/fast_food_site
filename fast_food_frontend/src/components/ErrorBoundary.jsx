import { Component } from 'react';

export class ErreurBoundary extends Component {
  state = { erreur: null };

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  render() {
    if (this.state.erreur) {
      return (
        <div className="p-8 text-center text-red-600">
          Une erreur est survenue dans cette partie de la page.
        </div>
      );
    }
    return this.props.children;
  }
}