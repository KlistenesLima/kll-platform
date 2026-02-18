import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8083',
  realm: 'kll-platform',
  clientId: 'admin-web',
});

export default keycloak;
