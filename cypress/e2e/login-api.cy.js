describe('Auditoría API & Backend Auth - Login English Pro', () => {
  // Ajusta la ruta si tu componente Login está en '/login' o directamente en '/'
  const loginUrl = 'http://127.0.0.1:5173/';

  it('Caso 1: Interceptación en vivo de la API de Firebase Auth al intentar iniciar sesión', () => {
    // 1. Preparamos el espía (interceptor) sobre la API REST oficial de Firebase Auth
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword*').as('firebaseLoginApi');

    cy.visit(loginUrl);

    // 2. Interactuamos usando tus selectores data-test reales
    cy.get('[data-test="email-input"]').type('auditoria.qaupve@ejemplo.com');
    cy.get('[data-test="password-input"]').type('ClavePrueba123');
    cy.get('[data-test="auth-submit"]').click();

    // 3. Esperamos la respuesta real del servidor de Google/Firebase y auditamos el backend
    cy.wait('@firebaseLoginApi').then((interception) => {
      // Verificamos que el payload enviado desde React llevó los datos correctos
      expect(interception.request.body).to.have.property('email', 'auditoria.qaupve@ejemplo.com');
      expect(interception.request.body).to.have.property('returnSecureToken', true);

      // Verificamos que el servidor de Firebase rechazó las credenciales inválidas con 400 Bad Request
      expect(interception.response.statusCode).to.eq(400);
      expect(interception.response.body.error).to.have.property('message');
    });

    // 4. Confirmamos que la interfaz mostró el mensaje de error manejado por tu bloque catch
    cy.get('[data-test="auth-error-msg"]')
      .should('be.visible')
      .and('contain', 'Error de acceso. Revisa tus datos.');
  });

  it('Caso 2: Prueba directa de Backend (Bypass de UI con payload vacío)', () => {
    cy.request({
      method: 'POST',
      url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
      body: {
        email: '',
        password: '',
      },
      failOnStatusCode: false,
    }).then((response) => {
      // Validamos que el backend bloquee la petición no autorizada/vacía (403 Forbidden o 400 Bad Request)
      expect(response.status).to.be.oneOf([400, 403]);
      expect(response.body).to.not.have.property('idToken');
      expect(response.body).to.have.property('error');
    });
  });
});