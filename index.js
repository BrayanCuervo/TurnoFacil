import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Si algo falla, mostramos el error en pantalla en vez de cerrar la app.
let showError = null;
let pendingError = null;
const prevHandler = global.ErrorUtils?.getGlobalHandler?.();
global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
  if (isFatal) {
    if (showError) showError(error);
    else pendingError = error;
    return;
  }
  prevHandler?.(error, isFatal);
});

function ErrorScreen({ error }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#141414' }} contentContainerStyle={{ padding: 24, paddingTop: 70 }}>
      <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: 'bold' }}>TurnoFácil tuvo un error</Text>
      <Text style={{ color: '#ccc', marginTop: 8 }}>Toma captura de esta pantalla y envíala al desarrollador.</Text>
      <Text selectable style={{ color: '#E5534B', marginTop: 18, fontFamily: 'monospace' }}>
        {String(error?.message || error)}
      </Text>
      <Text selectable style={{ color: '#777', marginTop: 12, fontSize: 11, fontFamily: 'monospace' }}>
        {String(error?.stack || '').slice(0, 1500)}
      </Text>
    </ScrollView>
  );
}

class Root extends React.Component {
  state = { error: pendingError };
  componentDidMount() {
    showError = (error) => this.setState({ error });
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) return <ErrorScreen error={this.state.error} />;
    return <App />;
  }
}

registerRootComponent(Root);
