describe('Pruebas Robustas de Autenticación (v3.0.1)', () => {
  beforeEach(() => {
    cy.visit('/login'); 
  });

  it('Debería validar la estructura inicial del Login', () => {
    // Usamos selectores data-test en lugar de etiquetas HTML puras
    cy.get('[data-test="auth-title"]').should('contain', 'English Pro');
    cy.get('[data-test="email-input"]').should('be.visible');
    cy.get('[data-test="password-input"]').should('be.visible');
    cy.get('[data-test="auth-submit"]').should('exist');
  });

  it('Debería validar la longitud de la contraseña en tiempo real', () => {
    cy.get('[data-test="password-input"]').type('123');
    // Buscamos el error por su identificador de prueba, no por el texto exacto
    cy.get('[data-test="auth-error"]')
      .should('be.visible')
      .and('contain', '6 o más caracteres');
  });

  it('Debería alternar entre modos Login y Registro sin romperse', () => {
    // No dependemos del texto largo del botón, sino de su función
    cy.get('[data-test="auth-toggle"]').click();
    
    cy.get('[data-test="auth-title"]').should('contain', 'Únete Pro');
    cy.get('[data-test="auth-submit"]').should('contain', 'Crear Cuenta');
    
    // Volver a login
    cy.get('[data-test="auth-toggle"]').click();
    cy.get('[data-test="auth-title"]').should('contain', 'English Pro');
  });

  it('Debería realizar Login con éxito y navegar al dashboard', () => {
    // Estos datos ahora son más seguros de testear
    cy.get('[data-test="email-input"]').type('genius.ice@gmail.com');
    cy.get('[data-test="password-input"]').type('jorge123'); 
    cy.get('[data-test="auth-submit"]').click();

    // Verificación de éxito
    cy.url().should('include', '/dashboard');
  });
});