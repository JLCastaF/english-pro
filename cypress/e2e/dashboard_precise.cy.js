describe('Pruebas de Dashboard - English Pro', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('genius.ice@gmail.com');
    // Asegúrate de poner tu clave real aquí para que el login ocurra
    cy.get('input[type="password"]').type('jorge123'); 
    cy.get('button[type="submit"]').click();
    
    // 1. ESPERA CRÍTICA: Esperamos a que la URL cambie a /dashboard
    cy.url().should('include', '/dashboard', { timeout: 15000 });

    // 2. ESPERA DEL LOADER: Tu código muestra "Cargando Datos..." mientras busca en Firestore
    // Esperamos a que ese mensaje desaparezca de la pantalla
    cy.contains('Cargando Datos...', { timeout: 15000 }).should('not.exist');
  });

  it('Debería mostrar la interfaz exacta del Dashboard una vez cargado', () => {
    // 3. Verificamos que el elemento h2 sea visible antes de pedirle el texto
    cy.get('h2', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Bienvenido,');
    
    // Validar el nombre del usuario (que viene de Firebase)
    // Según tu código: user.displayName || user.email.split('@')[0]
    cy.get('h2 span').should('not.be.empty');

    // Validar el botón de lecciones
    cy.contains('button', 'Ir a las lecciones').should('be.visible');

    // Validar racha (streak) que vimos en tu captura de Firebase que era 5
    cy.contains('span', 'Racha Nube').should('be.visible');
    cy.contains('span', '5 aciertos').should('be.visible');
  });

  it('Debería poder cerrar sesión correctamente', () => {
    // Esperamos a que cargue todo para poder hacer click en salir
    cy.get('button').contains('Salir').click({ force: true });
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});