describe('Auth Flow - English Pro', () => {
  const loginUrl = '/'; // O la ruta de tu login

  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('Debería mostrar error con credenciales inválidas', () => {
    cy.get('input[type="email"]').type('usuario_fake@test.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    
    // Verificamos que aparezca un mensaje de error (ajusta el texto según tu app)
    cy.contains(/error|incorrecto|inválido/i).should('be.visible');
  });

  it('Debería entrar al Dashboard con credenciales válidas', () => {
    // Usamos variables de entorno para no exponer tu clave real
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PW'));
    cy.get('button[type="submit"]').click();

    // Verificamos que redirija al estudio o dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(/bienvenido|estudio/i).should('be.visible');
  });
});